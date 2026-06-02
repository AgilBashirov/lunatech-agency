/**
 * Public image proxy for private Vercel Blob images.
 *
 * GET /api/img?path=portfolio-images/xxx.jpg
 *
 * Fetches a private blob server-side (using BLOB_READ_WRITE_TOKEN) and streams
 * the content back to the browser. A redirect to `downloadUrl` does NOT work
 * for private blobs — they require an Authorization header which the browser
 * cannot supply on its own.
 *
 * Only image paths under allowed prefixes are served; content/*.json is blocked.
 */

import { get } from "@vercel/blob";
import type { NextRequest } from "next/server";

const ALLOWED_PREFIXES = ["portfolio-images/", "blog-images/"] as const;

export async function GET(req: NextRequest): Promise<Response> {
  const path = req.nextUrl.searchParams.get("path") ?? "";

  if (!path) {
    return new Response("Missing path", { status: 400 });
  }

  // Prevent path traversal and restrict to safe prefixes.
  if (
    path.includes("..") ||
    path.startsWith("/") ||
    !ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const result = await get(path, { access: "private", useCache: false });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType ?? "application/octet-stream",
        // Cache in the browser for 1 h; CDN must re-validate (private blob).
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
