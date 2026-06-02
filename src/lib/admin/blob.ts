/**
 * Generic Vercel Blob JSON helpers.
 *
 * All functions are async and treat `BLOB_READ_WRITE_TOKEN` as optional at
 * runtime so that local dev without the env var degrades gracefully — callers
 * (contentStore.ts) are responsible for deciding the fallback behaviour.
 *
 * Caching note: Next.js 16 does NOT cache arbitrary `fetch` calls by default
 * (the old force-cache default was removed). These helpers call the Vercel Blob
 * SDK which uses its own fetch internally — no Next.js cache layer is involved.
 * Content freshness is therefore determined by write frequency, not by a
 * revalidation strategy.
 */

import {
  put,
  get,
  head,
  list,
  del,
  BlobAccessError,
  BlobFileTooLargeError,
  BlobStoreSuspendedError,
  BlobStoreNotFoundError,
  BlobUnknownError,
} from "@vercel/blob";

// ---------------------------------------------------------------------------
// Storage constants & error types
// ---------------------------------------------------------------------------

export const BLOB_STORAGE_LIMIT_BYTES = 500 * 1024 * 1024; // 500 MB free tier

export type BlobErrorCode =
  | "storage_limit"
  | "file_too_large"
  | "token_invalid"
  | "network"
  | "unknown";

export class BlobWriteError extends Error {
  constructor(
    public readonly code: BlobErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BlobWriteError";
  }
}

const AZ_MESSAGES: Record<BlobErrorCode, string> = {
  storage_limit:
    "Yaddaş limiti dolubdur (500 MB). Köhnə faylları silərək yer açın.",
  file_too_large:
    "Fayl həddən böyükdür. Daha kiçik bir fayl seçin.",
  token_invalid:
    "Blob token etibarsızdır. Vercel-də token-i yeniləyin.",
  network:
    "Şəbəkə xətası. İnternet bağlantınızı yoxlayın və yenidən cəhd edin.",
  unknown:
    "Fayl yüklənmədi. Bir daha cəhd edin.",
};

export function getBlobErrorMessage(code: BlobErrorCode): string {
  return AZ_MESSAGES[code];
}

function classifyBlobError(err: unknown): BlobErrorCode {
  if (err instanceof BlobFileTooLargeError) return "file_too_large";
  if (err instanceof BlobAccessError) return "token_invalid";
  if (err instanceof BlobStoreSuspendedError) return "token_invalid";
  if (err instanceof BlobStoreNotFoundError) return "token_invalid";
  if (err instanceof BlobUnknownError) return "unknown";
  if (!(err instanceof Error)) return "unknown";
  const msg = err.message.toLowerCase();
  if (msg.includes("storage limit") || msg.includes("quota") || msg.includes("storage exceeded"))
    return "storage_limit";
  if (msg.includes("too large") || msg.includes("file length"))
    return "file_too_large";
  if (msg.includes("access denied") || msg.includes("unauthorized") || msg.includes("forbidden") || msg.includes("401") || msg.includes("403"))
    return "token_invalid";
  if (msg.includes("network") || msg.includes("econnrefused") || msg.includes("econnreset"))
    return "network";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Storage usage
// ---------------------------------------------------------------------------

export type StorageUsage = {
  usedBytes: number;
  totalBytes: number;
  usedMB: number;
  usedPercent: number;
  isWarning: boolean;  // > 70%
  isCritical: boolean; // > 90%
};

/**
 * Calculate total Vercel Blob storage usage by listing all blobs.
 * Returns null when the token is absent (local dev without credentials).
 */
export async function getStorageUsage(): Promise<StorageUsage | null> {
  if (!hasToken()) return null;

  try {
    let totalBytes = 0;
    let cursor: string | undefined;

    do {
      const result = await list({ cursor, limit: 1000 });
      for (const blob of result.blobs) {
        totalBytes += blob.size;
      }
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    const usedMB = totalBytes / (1024 * 1024);
    const usedPercent = (totalBytes / BLOB_STORAGE_LIMIT_BYTES) * 100;

    return {
      usedBytes: totalBytes,
      totalBytes: BLOB_STORAGE_LIMIT_BYTES,
      usedMB,
      usedPercent,
      isWarning: usedPercent > 70,
      isCritical: usedPercent > 90,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the runtime has a Blob token available.
 * Used to short-circuit calls that would always fail without credentials.
 */
function hasToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read a JSON file from Vercel Blob storage.
 *
 * @param path - Blob pathname, e.g. `content/blog.json`
 * @returns Parsed value of type `T`, or `null` if the file does not exist or
 *          the token is absent.
 */
export async function readJson<T>(path: string): Promise<T | null> {
  if (!hasToken()) return null;

  try {
    // Use get() which handles private-blob authentication internally via the
    // BLOB_READ_WRITE_TOKEN. Fetching the downloadUrl directly with plain
    // fetch() returns 403 for private blobs in server environments.
    const result = await get(path, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;

    // Convert the ReadableStream to text, then parse as JSON.
    const response = new Response(result.stream);
    return (await response.json()) as T;
  } catch {
    // get() throws BlobNotFoundError when absent → treat as absent.
    return null;
  }
}

/**
 * Write a value as a JSON file to Vercel Blob storage.
 *
 * Uses `put()` with `addRandomSuffix: false` so the pathname is deterministic
 * and subsequent writes overwrite the same key (upsert semantics).
 *
 * @param path - Blob pathname, e.g. `content/blog.json`
 * @param data - Value to serialise and store.
 */
export async function writeJson<T>(path: string, data: T): Promise<void> {
  if (!hasToken()) return;

  const body = JSON.stringify(data, null, 2);

  try {
    await put(path, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    console.error("[BlobWriteError] writeJson failed for path:", path, "| raw error:", rawMsg, err);
    const code = classifyBlobError(err);
    throw new BlobWriteError(code, `${getBlobErrorMessage(code)} [blob: ${rawMsg}]`);
  }
}

/**
 * Upload a binary file (image, pdf, etc.) to Vercel Blob.
 *
 * @param path   - Destination pathname, e.g. `blog-images/cover.jpg`
 * @param file   - File content as ArrayBuffer or Blob
 * @param mime   - MIME type, e.g. `image/jpeg`
 * @returns Public download URL of the uploaded file
 * @throws BlobWriteError with a user-friendly Azerbaijani message
 */
export async function uploadFile(
  path: string,
  file: ArrayBuffer | Blob,
  mime: string,
): Promise<string> {
  if (!hasToken()) {
    throw new BlobWriteError(
      "token_invalid",
      getBlobErrorMessage("token_invalid"),
    );
  }

  try {
    const result = await put(path, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: mime,
    });
    // Return the relative pathname so callers can route through /api/img proxy.
    return result.pathname;
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    console.error("[BlobWriteError] uploadFile failed for path:", path, "| raw error:", rawMsg, err);
    const code = classifyBlobError(err);
    throw new BlobWriteError(code, `${getBlobErrorMessage(code)} [blob: ${rawMsg}]`);
  }
}

/**
 * Delete a blob file from Vercel Blob storage. Best-effort: never throws.
 *
 * Accepts a relative pathname (`portfolio-images/xxx.jpg`) or a legacy full
 * private blob URL. External URLs (non-Vercel) are silently ignored.
 */
export async function deleteBlob(pathOrUrl: string): Promise<void> {
  if (!hasToken() || !pathOrUrl) return;

  try {
    let blobUrl: string;

    if (pathOrUrl.startsWith("http")) {
      // Only delete Vercel Blob URLs, not arbitrary external images.
      if (!pathOrUrl.includes("blob.vercel-storage.com")) return;
      blobUrl = pathOrUrl;
    } else {
      // Relative pathname — resolve the stable URL first.
      const meta = await head(pathOrUrl);
      blobUrl = meta.url;
    }

    await del(blobUrl);
  } catch {
    // Non-critical — log but do not propagate.
  }
}

/**
 * Check whether a blob exists at the given pathname.
 *
 * @param path - Blob pathname, e.g. `content/blog.json`
 * @returns `true` if the blob exists, `false` otherwise (including when the
 *          token is absent).
 */
export async function blobExists(path: string): Promise<boolean> {
  if (!hasToken()) return false;

  try {
    await head(path);
    return true;
  } catch {
    return false;
  }
}
