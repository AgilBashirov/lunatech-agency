/**
 * Admin — Yeni blog yazısı əlavə et.
 *
 * Server component with an inline Server Action.
 * Form UI is delegated to the client component BlogForm.
 * The action returns a FormActionResult instead of calling redirect() to avoid
 * the "Router action dispatched before initialization" bug in Next.js.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getBlogPosts, setBlogPosts } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";
import { deleteBlob } from "@/lib/admin/blob";
import type { BlogPost, BlogLocaleContent } from "@/lib/admin/types";
import type { FormActionResult } from "@/lib/admin/types";
import { BlogForm } from "@/components/admin/BlogForm";

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

async function createBlogPost(
  _prevState: FormActionResult | null,
  formData: FormData,
): Promise<FormActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const slug = (formData.get("slug") as string | null)?.trim() ?? "";
  const status = formData.get("status") as string | null;
  const publishedAtRaw =
    (formData.get("publishedAt") as string | null)?.trim() ?? "";
  const coverImage =
    (formData.get("coverImage") as string | null)?.trim() ?? "";
  const tagsRaw = (formData.get("tags") as string | null)?.trim() ?? "";

  const azTitle = (formData.get("az.title") as string | null)?.trim() ?? "";
  const azExcerpt =
    (formData.get("az.excerpt") as string | null)?.trim() ?? "";
  const azContent =
    (formData.get("az.content") as string | null)?.trim() ?? "";
  const enTitle = (formData.get("en.title") as string | null)?.trim() ?? "";
  const enExcerpt =
    (formData.get("en.excerpt") as string | null)?.trim() ?? "";
  const enContent =
    (formData.get("en.content") as string | null)?.trim() ?? "";
  const ruTitle = (formData.get("ru.title") as string | null)?.trim() ?? "";
  const ruExcerpt =
    (formData.get("ru.excerpt") as string | null)?.trim() ?? "";
  const ruContent =
    (formData.get("ru.content") as string | null)?.trim() ?? "";

  const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slug || !SLUG_RE.test(slug) || !azTitle) {
    return {
      ok: false,
      error: "invalid",
      detail:
        "Zəhmət olmasa slug-u və AZ başlığını doldurun. Slug yalnız kiçik hərf, rəqəm və defis (-) ehtiva etməlidir.",
    };
  }

  const posts = await getBlogPosts();
  if (posts.some((p) => p.slug === slug)) {
    return {
      ok: false,
      error: "invalid",
      detail: `"${slug}" slug-u artıq mövcuddur. Fərqli bir slug seçin.`,
    };
  }

  const safeStatus: BlogPost["status"] =
    status === "published" ? "published" : "draft";

  const now = new Date().toISOString();
  const publishedAt =
    publishedAtRaw !== ""
      ? new Date(publishedAtRaw).toISOString()
      : null;

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const makeLocale = (
    title: string,
    excerpt: string,
    content: string,
    fallbackTitle: string,
  ): BlogLocaleContent => ({
    title: title || fallbackTitle,
    excerpt: excerpt || azExcerpt,
    content: content || azContent,
  });

  const newPost: BlogPost = {
    id: randomUUID(),
    slug,
    status: safeStatus,
    publishedAt,
    createdAt: now,
    updatedAt: now,
    coverImage: coverImage || undefined,
    tags,
    az: { title: azTitle, excerpt: azExcerpt, content: azContent },
    en: makeLocale(enTitle, enExcerpt, enContent, azTitle),
    ru: makeLocale(ruTitle, ruExcerpt, ruContent, azTitle),
  };

  try {
    await setBlogPosts([...posts, newPost]);
  } catch (err) {
    if (newPost.coverImage) {
      await deleteBlob(newPost.coverImage);
    }
    const detail =
      err instanceof Error ? err.message.slice(0, 200) : undefined;
    return { ok: false, error: "server", detail };
  }

  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}/blog`, "page");
    revalidatePath(`/${loc}/blog`, "layout");
  }
  revalidatePath("/admin/blog", "page");

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function NewBlogPostPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/blog"
          className="text-xs transition-colors"
          style={{ color: "rgba(244,244,245,0.4)" }}
        >
          ← Blog
        </Link>
        <span style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
        <h1 className="text-xl font-semibold text-white">Yeni yazı əlavə et</h1>
      </div>

      <BlogForm action={createBlogPost} submitLabel="Yazını yarat" />
    </div>
  );
}
