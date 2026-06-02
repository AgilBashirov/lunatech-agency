/**
 * Admin Route Handlers — blog collection.
 *
 * GET  /api/admin/blog
 *   Returns all posts (draft + published) sorted by updatedAt descending.
 *   Response: { ok: true; data: BlogPost[] }
 *
 * POST /api/admin/blog
 *   Creates a new post. id, createdAt, updatedAt are assigned automatically.
 *   Body: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
 *   Response: { ok: true; data: BlogPost }
 *
 * Both handlers require a valid admin session cookie.
 */

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getBlogPosts, setBlogPosts } from "@/lib/admin/contentStore";
import { getAdminSessionOrNull } from "@/lib/admin/session";
import type { BlogPost, BlogLocaleContent } from "@/lib/admin/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isLocaleContent(v: unknown): v is BlogLocaleContent {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    typeof o.excerpt === "string" &&
    typeof o.content === "string"
  );
}

type BlogInput = Omit<BlogPost, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

function isBlogInput(v: unknown): v is BlogInput {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.slug === "string" &&
    (o.status === "draft" || o.status === "published") &&
    (o.publishedAt === null || typeof o.publishedAt === "string") &&
    (o.coverImage === undefined || typeof o.coverImage === "string") &&
    Array.isArray(o.tags) &&
    (o.tags as unknown[]).every((t) => typeof t === "string") &&
    isLocaleContent(o.az) &&
    isLocaleContent(o.en) &&
    isLocaleContent(o.ru)
  );
}

// ---------------------------------------------------------------------------
// Revalidate all blog-related paths after a mutation.
// ---------------------------------------------------------------------------

async function revalidateBlogPages(): Promise<void> {
  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}/blog`, "page");
    revalidatePath(`/${loc}/blog`, "layout");
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/blog
// ---------------------------------------------------------------------------

export async function GET(): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const posts = await getBlogPosts();
  const sorted = [...posts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return Response.json({ ok: true, data: sorted });
}

// ---------------------------------------------------------------------------
// POST /api/admin/blog
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

  if (!isBlogInput(body)) {
    return Response.json(
      {
        ok: false,
        error:
          "Body must contain: slug, status, publishedAt, tags, az/en/ru (objects with title, excerpt, content).",
      },
      { status: 422 },
    );
  }

  const now = new Date().toISOString();
  const newPost: BlogPost = {
    id: (body as BlogInput & { id?: string }).id?.trim() || randomUUID(),
    slug: body.slug.trim(),
    status: body.status,
    publishedAt: body.publishedAt,
    createdAt: now,
    updatedAt: now,
    coverImage: body.coverImage,
    tags: body.tags,
    az: body.az,
    en: body.en,
    ru: body.ru,
  };

  const posts = await getBlogPosts();
  await setBlogPosts([...posts, newPost]);
  await revalidateBlogPages();

  return Response.json({ ok: true, data: newPost }, { status: 201 });
}
