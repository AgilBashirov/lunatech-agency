/**
 * Admin Route Handlers — portfolio collection.
 *
 * GET  /api/admin/portfolio
 *   Returns all items sorted by `order` ascending.
 *   Response: { ok: true; data: PortfolioItem[] }
 *
 * POST /api/admin/portfolio
 *   Creates a new portfolio item. `order` defaults to max+1 if omitted.
 *   Body: Omit<PortfolioItem, "id" | "order"> & { id?: string; order?: number }
 *   Response: { ok: true; data: PortfolioItem }
 *
 * Both handlers require a valid admin session cookie.
 */

import { revalidatePath } from "next/cache";
import { getPortfolio, setPortfolio } from "@/lib/admin/contentStore";
import { getAdminSessionOrNull } from "@/lib/admin/session";
import type { PortfolioItem } from "@/lib/admin/types";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

type LocaleContent = { title: string; summary: string };

type PortfolioInput = {
  id?: string;
  slug: string;
  order?: number;
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

function isPortfolioInput(v: unknown): v is PortfolioInput {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    isLocaleContent(o.az) &&
    isLocaleContent(o.en) &&
    isLocaleContent(o.ru) &&
    (o.id === undefined || typeof o.id === "string") &&
    (o.order === undefined || typeof o.order === "number") &&
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
// GET /api/admin/portfolio
// ---------------------------------------------------------------------------

export async function GET(): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const items = await getPortfolio();
  const sorted = [...items].sort((a, b) => a.order - b.order);
  return Response.json({ ok: true, data: sorted });
}

// ---------------------------------------------------------------------------
// POST /api/admin/portfolio
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body is not valid JSON." },
      { status: 400 },
    );
  }

  if (!isPortfolioInput(body)) {
    return Response.json(
      {
        ok: false,
        error:
          "Body must contain: slug (string), az/en/ru (objects with title & summary). id, order, coverImage, tags are optional.",
      },
      { status: 422 },
    );
  }

  const items = await getPortfolio();

  const maxOrder = items.reduce((acc, it) => Math.max(acc, it.order), -1);
  const newItem: PortfolioItem = {
    id: body.id?.trim() || randomUUID(),
    slug: body.slug.trim(),
    order: typeof body.order === "number" ? body.order : maxOrder + 1,
    visible: true,
    coverImage: body.coverImage,
    tags: body.tags ?? [],
    az: body.az,
    en: body.en,
    ru: body.ru,
  };

  await setPortfolio([...items, newItem]);
  await revalidatePortfolioPages();

  return Response.json({ ok: true, data: newItem }, { status: 201 });
}
