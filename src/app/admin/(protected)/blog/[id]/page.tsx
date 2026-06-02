/**
 * Admin — Blog yazısını redaktə et / sil.
 *
 * Server component with inline Server Actions.
 * Form UI is delegated to the client component BlogForm.
 * updateBlogPost uses the FormActionResult pattern (not redirect) to avoid the
 * "Router action dispatched before initialization" bug in Next.js.
 *
 * Next.js 16: `params` and `searchParams` are Promises — always await.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getBlogPosts, setBlogPosts } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";
import { deleteBlob } from "@/lib/admin/blob";
import type { BlogPost, BlogLocaleContent } from "@/lib/admin/types";
import type { FormActionResult } from "@/lib/admin/types";
import { BlogForm } from "@/components/admin/BlogForm";

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

async function updateBlogPost(
  postId: string,
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
  const existing = posts.find((p) => p.id === postId);
  if (!existing) redirect("/admin/blog");

  // Allow keeping the same slug; only reject if another post has this slug.
  if (posts.some((p) => p.slug === slug && p.id !== postId)) {
    return {
      ok: false,
      error: "invalid",
      detail: `"${slug}" slug-u artıq mövcuddur. Fərqli bir slug seçin.`,
    };
  }

  const safeStatus: BlogPost["status"] =
    status === "published" ? "published" : "draft";

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

  const newCoverImage = coverImage || undefined;
  const oldCoverImage = existing.coverImage;

  const updated: BlogPost = {
    id: postId,
    slug,
    status: safeStatus,
    publishedAt,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    coverImage: newCoverImage,
    tags,
    az: { title: azTitle, excerpt: azExcerpt, content: azContent },
    en: makeLocale(enTitle, enExcerpt, enContent, azTitle),
    ru: makeLocale(ruTitle, ruExcerpt, ruContent, azTitle),
  };

  try {
    await setBlogPosts(posts.map((p) => (p.id === postId ? updated : p)));
  } catch (err) {
    if (newCoverImage && newCoverImage !== oldCoverImage) {
      await deleteBlob(newCoverImage);
    }
    const detail =
      err instanceof Error ? err.message.slice(0, 200) : undefined;
    return { ok: false, error: "server", detail };
  }

  // Save succeeded — remove the old cover image if it was replaced.
  if (oldCoverImage && oldCoverImage !== newCoverImage) {
    await deleteBlob(oldCoverImage);
  }

  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}/blog`, "page");
    revalidatePath(`/${loc}/blog`, "layout");
    revalidatePath(`/${loc}/blog/${slug}`, "page");
  }
  revalidatePath("/admin/blog", "page");

  return { ok: true };
}

async function deleteBlogPost(postId: string): Promise<void> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const posts = await getBlogPosts();
  const target = posts.find((p) => p.id === postId);

  await setBlogPosts(posts.filter((p) => p.id !== postId));

  if (target?.coverImage) {
    await deleteBlob(target.coverImage);
  }

  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}/blog`, "page");
    revalidatePath(`/${loc}/blog`, "layout");
    if (target) {
      revalidatePath(`/${loc}/blog/${target.slug}`, "page");
    }
  }
  revalidatePath("/admin/blog", "page");

  redirect("/admin/blog");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ delete?: string }>;
};

export default async function EditBlogPostPage({ params, searchParams }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const { delete: deleteFlag } = await searchParams;

  const posts = await getBlogPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) notFound();

  const updateAction = updateBlogPost.bind(null, id);
  const deleteAction = deleteBlogPost.bind(null, id);

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
        <h1 className="text-xl font-semibold text-white">Yazını redaktə et</h1>
      </div>

      <p
        className="mb-6 text-xs font-mono"
        style={{ color: "rgba(244,244,245,0.25)" }}
      >
        id: {post.id}
      </p>

      {/* Edit form — errors shown inline by BlogForm via useActionState */}
      <BlogForm
        defaults={post}
        action={updateAction}
        submitLabel="Dəyişiklikləri saxla"
      />

      {/* Separator */}
      <hr className="my-8" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

      {/* Delete zone */}
      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "rgba(239,68,68,0.2)",
          background: "rgba(239,68,68,0.04)",
        }}
      >
        <h2 className="mb-1 text-sm font-medium text-red-400">Yazını sil</h2>
        <p className="mb-4 text-xs" style={{ color: "rgba(244,244,245,0.4)" }}>
          Bu əməliyyat geri qaytarıla bilməz. Yazı saytdan da silinəcəkdir.
        </p>

        {deleteFlag === "1" ? (
          <div className="flex flex-col gap-3">
            <p
              className="rounded-md p-3 text-sm"
              style={{ background: "rgba(239,68,68,0.08)", color: "#fca5a5" }}
            >
              ⚠ &ldquo;{post.az.title}&rdquo; — bu əməliyyat geri alına bilməz. Yazı
              və cover şəkili həmişəlik silinəcək.
            </p>
            <div className="flex gap-2">
              <form action={deleteAction}>
                <button
                  type="submit"
                  className="rounded-md px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "rgb(220,38,38)" }}
                >
                  Bəli, sil
                </button>
              </form>
              <Link
                href={`/admin/blog/${id}`}
                className="rounded-md border px-4 py-1.5 text-xs font-medium transition-colors hover:border-white/20"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  color: "rgba(244,244,245,0.55)",
                }}
              >
                Ləğv et
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href={`/admin/blog/${id}?delete=1`}
            className="inline-flex items-center rounded-md border px-4 py-1.5 text-xs font-medium transition-colors hover:border-red-500/50 hover:text-red-300"
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              color: "rgba(239,68,68,0.7)",
            }}
          >
            Yazını sil
          </Link>
        )}
      </div>
    </div>
  );
}
