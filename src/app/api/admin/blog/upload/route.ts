/**
 * Admin Route Handler — blog image upload.
 *
 * POST /api/admin/blog/upload
 *   Accepts multipart/form-data with a `file` field.
 *   Uploads the file to Vercel Blob under `blog-images/{id}-{timestamp}.ext`.
 *   Response: { ok: true; url: string }
 *
 * Requires a valid admin session cookie.
 */

import { getAdminSessionOrNull } from "@/lib/admin/session";
import { uploadFile } from "@/lib/admin/blob";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Allowed MIME types for blog cover images
// ---------------------------------------------------------------------------

const ALLOWED_MIME: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

// 5 MB limit
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// ---------------------------------------------------------------------------
// POST /api/admin/blog/upload
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json(
      { ok: false, error: "Request must be multipart/form-data." },
      { status: 400 },
    );
  }

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return Response.json(
      { ok: false, error: 'Multipart field "file" is required.' },
      { status: 422 },
    );
  }

  const mime = fileEntry.type;
  if (!ALLOWED_MIME.has(mime)) {
    return Response.json(
      {
        ok: false,
        error: `Fayl tipi dəstəklənmir: ${mime}. İcazə verilən tiplər: ${[...ALLOWED_MIME].join(", ")}.`,
      },
      { status: 415 },
    );
  }

  if (fileEntry.size > MAX_SIZE_BYTES) {
    return Response.json(
      { ok: false, error: "Fayl ölçüsü limitdən (5 MB) böyükdür." },
      { status: 413 },
    );
  }

  const ext = EXT_MAP[mime] ?? "bin";
  const id = crypto.randomUUID();
  const path = `blog-images/${id}-${Date.now()}.${ext}`;

  try {
    const buffer = await fileEntry.arrayBuffer();
    const url = await uploadFile(path, buffer, mime);
    return Response.json({ ok: true, url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Fayl yüklənmədi. Yenidən cəhd edin.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
