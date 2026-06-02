/**
 * Admin — Blog yazıları siyahısı.
 *
 * Server component. Blob-dan bütün postları (draft + published) oxuyur.
 * Hər post üçün status badge, AZ başlığı, dərc tarixi, redaktə linki
 * və silmə server action-u göstərir.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getBlogPosts, setBlogPosts } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";
import { deleteBlob } from "@/lib/admin/blob";
import { blobImageUrl } from "@/lib/admin/imageUrl";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Server Action — post sil
// ---------------------------------------------------------------------------

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
  }
  revalidatePath("/admin/blog", "page");

  redirect("/admin/blog");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("az-AZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminBlogPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const posts = await getBlogPosts();
  const sorted = [...posts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">Blog</h1>
          <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
            Blog yazılarını idarə edin — draft və ya dərc edilmiş.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: "rgba(255,255,255,0.08)", color: "#f4f4f5" }}
        >
          + Yeni yazı əlavə et
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{
            borderColor: "rgba(255,255,255,0.07)",
            background: "#1a1a1a",
          }}
        >
          <p className="text-sm" style={{ color: "rgba(244,244,245,0.4)" }}>
            Hələ blog yazısı yoxdur.
          </p>
          <Link
            href="/admin/blog/new"
            className="mt-4 inline-flex items-center gap-1 text-sm transition-colors"
            style={{ color: "rgba(244,244,245,0.55)" }}
          >
            İlk yazını əlavə et →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {sorted.map((post) => {
            const deleteAction = deleteBlogPost.bind(null, post.id);
            const isPublished = post.status === "published";

            return (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                style={{
                  background: "#1a1a1a",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                {/* Left: cover + status + title */}
                <div className="flex min-w-0 items-center gap-3">
                  {/* Cover preview */}
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blobImageUrl(post.coverImage)}
                      alt={post.az.title}
                      className="h-10 w-14 shrink-0 rounded object-cover"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-14 shrink-0 items-center justify-center rounded text-xs"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(244,244,245,0.2)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      aria-hidden
                    >
                      ?
                    </div>
                  )}

                  {/* Status badge */}
                  <span
                    className="flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={
                      isPublished
                        ? {
                            background: "rgba(34,197,94,0.12)",
                            color: "rgba(134,239,172,0.9)",
                          }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(244,244,245,0.4)",
                          }
                    }
                  >
                    {isPublished ? "Dərc" : "Draft"}
                  </span>

                  {/* Title + date */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {post.az.title || "(başlıqsız)"}
                    </p>
                    <p
                      className="truncate text-xs font-mono"
                      style={{ color: "rgba(244,244,245,0.35)" }}
                    >
                      {post.slug}
                      {post.publishedAt && (
                        <span className="ml-2">
                          · {formatDate(post.publishedAt)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: edit + delete */}
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-white/20"
                    style={{
                      borderColor: "rgba(255,255,255,0.10)",
                      color: "rgba(244,244,245,0.65)",
                    }}
                  >
                    Redaktə
                  </Link>

                  <Link
                    href={`/admin/blog/${post.id}?delete=1`}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-red-500/40"
                    style={{
                      borderColor: "rgba(255,255,255,0.07)",
                      color: "rgba(239,68,68,0.65)",
                    }}
                    aria-label={`"${post.az.title}" yazısını sil`}
                  >
                    Sil
                  </Link>

                  {/* Hidden form for server action (used by confirm page) */}
                  <form
                    action={deleteAction}
                    id={`delete-form-${post.id}`}
                    className="hidden"
                  >
                    <button type="submit" />
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
