/**
 * Admin Route Handlers — single blog post.
 *
 * PUT    /api/admin/blog/[id]
 *   Updates an existing post. updatedAt is refreshed automatically.
 *   Body: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
 *   Response: { ok: true; data: BlogPost }
 *
 * DELETE /api/admin/blog/[id]
 *   Removes the post permanently.
 *   Response: { ok: true }
 *
 * Both handlers require a valid admin session cookie.
 */

import { revalidatePath } from "next/cache";
import { getBlogPosts, setBlogPosts } from "@/lib/admin/contentStore";
import { getAdminSessionOrNull } from "@/lib/admin/session";
import type { BlogPost, BlogLocaleContent } from "@/lib/admin/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

type BlogUpdateInput = Omit<BlogPost, "id" | "createdAt" | "updatedAt">;

function isBlogUpdateInput(v: unknown): v is BlogUpdateInput {
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
// Revalidate blog paths
// ---------------------------------------------------------------------------

async function revalidateBlogPages(slug?: string): Promise<void> {
  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}/blog`, "page");
    revalidatePath(`/${loc}/blog`, "layout");
    if (slug) {
      revalidatePath(`/${loc}/blog/${slug}`, "page");
    }
  }
}

// ---------------------------------------------------------------------------
// PUT /api/admin/blog/[id]
// ---------------------------------------------------------------------------

export async function PUT(req: Request, context: RouteContext): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "Request body is not valid JSON." },
      { status: 400 },
    );
  }

  if (!isBlogUpdateInput(body)) {
    return Response.json(
      {
        ok: false,
        error:
          "Body must contain: slug, status, publishedAt, tags, az/en/ru (objects with title, excerpt, content).",
      },
      { status: 422 },
    );
  }

  const posts = await getBlogPosts();
  const existing = posts.find((p) => p.id === id);
  if (!existing) {
    return Response.json({ ok: false, error: "Post not found." }, { status: 404 });
  }

  const updated: BlogPost = {
    id,
    slug: body.slug.trim(),
    status: body.status,
    publishedAt: body.publishedAt,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    coverImage: body.coverImage,
    tags: body.tags,
    az: body.az,
    en: body.en,
    ru: body.ru,
  };

  await setBlogPosts(posts.map((p) => (p.id === id ? updated : p)));
  await revalidateBlogPages(updated.slug);

  return Response.json({ ok: true, data: updated });
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/blog/[id]
// ---------------------------------------------------------------------------

export async function DELETE(_req: Request, context: RouteContext): Promise<Response> {
  const session = await getAdminSessionOrNull();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const posts = await getBlogPosts();
  const target = posts.find((p) => p.id === id);
  if (!target) {
    return Response.json({ ok: false, error: "Post not found." }, { status: 404 });
  }

  await setBlogPosts(posts.filter((p) => p.id !== id));
  await revalidateBlogPages(target.slug);

  return Response.json({ ok: true });
}
