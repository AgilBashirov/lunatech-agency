"use server";

/**
 * Admin server actions shared across the protected admin area.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { list, del } from "@vercel/blob";
import { getAdminSession } from "@/lib/admin/session";
import { getPortfolio } from "@/lib/admin/contentStore";
import { getBlogPosts } from "@/lib/admin/contentStore";

// ---------------------------------------------------------------------------
// Storage cleanup
// ---------------------------------------------------------------------------

/**
 * Delete all image blobs (portfolio-images/ and blog-images/) that are no
 * longer referenced by any portfolio item or blog post.
 *
 * Returns the number of deleted files.
 */
export async function cleanupOrphanedBlobs(): Promise<{ deleted: number }> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!process.env.BLOB_READ_WRITE_TOKEN) return { deleted: 0 };

  // Collect all cover image pathnames that are currently in use.
  const [portfolioItems, blogPosts] = await Promise.all([
    getPortfolio(),
    getBlogPosts(),
  ]);

  const referenced = new Set<string>();

  for (const item of [...portfolioItems, ...blogPosts]) {
    const raw = item.coverImage;
    if (!raw) continue;
    const path = blobPathFromStoredValue(raw);
    if (path) referenced.add(path);
  }

  // List every image blob in both prefixes.
  const toDelete: string[] = [];

  for (const prefix of ["portfolio-images/", "blog-images/"] as const) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      for (const blob of page.blobs) {
        // blob.pathname is the relative path, blob.url is the full URL.
        if (!referenced.has(blob.pathname)) {
          toDelete.push(blob.url);
        }
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  }

  if (toDelete.length > 0) {
    // del() accepts an array of URLs.
    await del(toDelete);
  }

  revalidatePath("/admin", "layout");

  return { deleted: toDelete.length };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the relative blob pathname from a stored `coverImage` value.
 * Returns null for external (non-blob) URLs.
 */
function blobPathFromStoredValue(value: string): string | null {
  if (!value) return null;

  // New format: relative pathname stored directly (e.g. "portfolio-images/xxx.jpg").
  if (!value.startsWith("http") && !value.startsWith("/api/img")) {
    return value;
  }

  // Proxy URL: /api/img?path=portfolio-images%2Fxxx.jpg
  if (value.startsWith("/api/img?path=")) {
    try {
      return decodeURIComponent(value.slice("/api/img?path=".length));
    } catch {
      return null;
    }
  }

  // Legacy full private blob URL.
  if (value.includes("blob.vercel-storage.com")) {
    try {
      return new URL(value).pathname.slice(1); // strip leading "/"
    } catch {
      return null;
    }
  }

  // External URL — not our blob.
  return null;
}
