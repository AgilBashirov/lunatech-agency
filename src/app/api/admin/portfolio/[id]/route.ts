/**
 * Admin Route Handlers — single portfolio item operations.
 *
 * PUT    /api/admin/portfolio/[id]
 *   Replace all mutable fields of an item.
 *   Response: { ok: true; data: PortfolioItem }
 *
 * DELETE /api/admin/portfolio/[id]
 *   Remove the item. Remaining items are re-ordered by their current `order`
 *   value, then normalised to 0-based consecutive integers.
 *   Response: { ok: true }
 *
 * Both handlers require a valid admin session cookie.
 *
 * Next.js 16: `params` is a Promise — always `await params` before use.
 */

import { revalidatePath } from "next/cache";
import { getPortfolio, setPortfolio } from "@/lib/admin/contentStore";
import { getAdminSessionOrNull } from "@/lib/admin/session";
import type { PortfolioItem } from "@/lib/admin/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

type LocaleContent = { title: string; summary: string };

type PortfolioUpdate = {
  slug: string;
  order: number;
  coverImage?: string;
  tags?: string[];
  az: LocaleContent;
  en: LocaleContent;
  ru: LocaleContent;
};

function isLocaleContent(v: unknown): v is LocaleContent {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.summary === "string";
}

function isPortfolioUpdate(v: unknown): v is PortfolioUpdate {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    typeof o.order === "number" &&
    isLocaleContent(o.az) &&
    isLocaleContent(o.en) &&
    isLocaleContent(o.ru) &&
    (o.coverImage === undefined || typeof o.coverImage === "string") &&
    (o.tags === undefined ||
      (Array.isArray(o.tags) && o.tags.every((t) => typeof t === "string")))
  );
}

// ---------------------------------------------------------------------------
// Revalidate all locale home pages after a mutation.
// ---------------------------------------------------------------------------

async function revalidatePortfolioPages(): Promise<void> {
  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// PUT /api/admin/portfolio/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body is not valid JSON." },
      { status: 400 },
    );
  }

  if (!isPortfolioUpdate(body)) {
    return Response.json(
      {
        ok: false,
        error:
          "Body must contain: slug (string), order (number), az/en/ru (objects with title & summary). coverImage and tags are optional.",
      },
      { status: 422 },
    );
  }

  const items = await getPortfolio();
  const index = items.findIndex((it) => it.id === id);

  if (index === -1) {
    return Response.json(
      { ok: false, error: `Portfolio item "${id}" tapılmadı.` },
      { status: 404 },
    );
  }

  const existing = items[index];
  const updated: PortfolioItem = {
    id,
    slug: body.slug.trim(),
    order: body.order,
    visible: existing.visible,
    coverImage: body.coverImage,
    tags: body.tags ?? [],
    az: body.az,
    en: body.en,
    ru: body.ru,
  };

  const next = items.map((it) => (it.id === id ? updated : it));
  await setPortfolio(next);
  await revalidatePortfolioPages();

  return Response.json({ ok: true, data: updated });
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/portfolio/[id]
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const items = await getPortfolio();
  const exists = items.some((it) => it.id === id);

  if (!exists) {
    return Response.json(
      { ok: false, error: `Portfolio item "${id}" tapılmadı.` },
      { status: 404 },
    );
  }

  // Filter out the deleted item, then normalise order to 0-based consecutive integers.
  const remaining = items
    .filter((it) => it.id !== id)
    .sort((a, b) => a.order - b.order)
    .map((it, i) => ({ ...it, order: i }));

  await setPortfolio(remaining);
  await revalidatePortfolioPages();

  return Response.json({ ok: true });
}
