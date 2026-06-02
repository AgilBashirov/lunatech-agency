/**
 * Convert a stored `coverImage` value to a browser-loadable URL.
 *
 * New uploads store a relative pathname (e.g. `portfolio-images/xxx.jpg`).
 * Legacy entries may store the full private blob URL. Both are mapped to the
 * `/api/img` proxy route which signs the request server-side.
 *
 * External URLs (e.g. `https://example.com/img.jpg`) are returned as-is.
 */
export function blobImageUrl(value: string | undefined): string {
  if (!value) return "";

  // Already a proxy URL — leave it alone.
  if (value.startsWith("/api/img")) return value;

  // Relative blob path (new uploads).
  if (!value.startsWith("http")) {
    return `/api/img?path=${encodeURIComponent(value)}`;
  }

  // Legacy: full private blob URL — extract the pathname and proxy it.
  if (value.includes(".private.blob.vercel-storage.com")) {
    try {
      const url = new URL(value);
      const blobPath = url.pathname.slice(1); // strip leading "/"
      return `/api/img?path=${encodeURIComponent(blobPath)}`;
    } catch {
      return value;
    }
  }

  // External URL — serve directly.
  return value;
}
