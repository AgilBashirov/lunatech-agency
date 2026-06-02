/**
 * Admin — Portfolio siyahısı.
 *
 * Server component. Blob-dan portfolio itemlərini oxuyur və siyahı halında
 * göstərir. Hər item üçün redaktə linki + görünürlük toggle + silmə server action var.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPortfolio, setPortfolio } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";
import { blobImageUrl } from "@/lib/admin/imageUrl";
import { deleteBlob } from "@/lib/admin/blob";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Server Action — görünürlüğü dəyiş
// ---------------------------------------------------------------------------

async function togglePortfolioVisibility(itemId: string): Promise<void> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const items = await getPortfolio();
  const updated = items.map((it) =>
    it.id === itemId ? { ...it, visible: !it.visible } : it,
  );

  await setPortfolio(updated);

  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/portfolio", "page");

  redirect("/admin/portfolio");
}

// ---------------------------------------------------------------------------
// Server Action — item sil
// ---------------------------------------------------------------------------

async function deletePortfolioItem(itemId: string): Promise<void> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const items = await getPortfolio();
  const target = items.find((it) => it.id === itemId);
  const remaining = items
    .filter((it) => it.id !== itemId)
    .sort((a, b) => a.order - b.order)
    .map((it, i) => ({ ...it, order: i }));

  await setPortfolio(remaining);

  // Delete the cover image from blob storage after the JSON is saved.
  if (target?.coverImage) {
    await deleteBlob(target.coverImage);
  }

  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/portfolio", "page");

  redirect("/admin/portfolio");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminPortfolioPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const items = await getPortfolio();
  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white mb-1">Portfolio</h1>
          <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
            Açıq saytda görünən portfolio layihələrini idarə edin.
          </p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: "rgba(255,255,255,0.08)", color: "#f4f4f5" }}
        >
          + Yeni layihə əlavə et
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div
          className="rounded-xl border p-8 text-center"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "#1a1a1a" }}
        >
          <p className="text-sm" style={{ color: "rgba(244,244,245,0.4)" }}>
            Hələ portfolio yoxdur.
          </p>
          <Link
            href="/admin/portfolio/new"
            className="mt-4 inline-flex items-center gap-1 text-sm transition-colors"
            style={{ color: "rgba(244,244,245,0.55)" }}
          >
            İlk layihəni əlavə et →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list">
          {sorted.map((item) => {
            const deleteAction = deletePortfolioItem.bind(null, item.id);
            const toggleAction = togglePortfolioVisibility.bind(null, item.id);

            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
                style={{
                  background: "#1a1a1a",
                  borderColor: item.visible
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.04)",
                  opacity: item.visible ? 1 : 0.6,
                }}
              >
                {/* Left: cover + order badge + title */}
                <div className="flex min-w-0 items-center gap-3">
                  {/* Cover image preview */}
                  {item.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blobImageUrl(item.coverImage)}
                      alt={item.az.title}
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

                  {/* Order badge */}
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-mono"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(244,244,245,0.45)",
                    }}
                    aria-label={`Sıra: ${item.order}`}
                  >
                    {item.order}
                  </span>

                  {/* Title + slug */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {item.az.title}
                    </p>
                    <p
                      className="truncate text-xs font-mono"
                      style={{ color: "rgba(244,244,245,0.35)" }}
                    >
                      {item.slug}
                    </p>
                  </div>
                </div>

                {/* Right: toggle + edit + delete */}
                <div className="flex shrink-0 items-center gap-2">
                  {/* Visibility toggle */}
                  <form action={toggleAction}>
                    <button
                      type="submit"
                      aria-label={item.visible ? `"${item.az.title}" layihəsini gizlət` : `"${item.az.title}" layihəsini göstər`}
                      className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                      style={
                        item.visible
                          ? {
                              borderColor: "rgba(34,197,94,0.3)",
                              color: "rgba(134,239,172,0.85)",
                              background: "rgba(34,197,94,0.06)",
                            }
                          : {
                              borderColor: "rgba(255,255,255,0.07)",
                              color: "rgba(244,244,245,0.35)",
                            }
                      }
                    >
                      {item.visible ? "Görünür" : "Gizli"}
                    </button>
                  </form>

                  <Link
                    href={`/admin/portfolio/${item.id}`}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-white/20"
                    style={{
                      borderColor: "rgba(255,255,255,0.10)",
                      color: "rgba(244,244,245,0.65)",
                    }}
                  >
                    Redaktə
                  </Link>

                  <Link
                    href={`/admin/portfolio/${item.id}?delete=1`}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-red-500/40"
                    style={{
                      borderColor: "rgba(255,255,255,0.07)",
                      color: "rgba(239,68,68,0.65)",
                    }}
                    aria-label={`"${item.az.title}" layihəsini sil`}
                  >
                    Sil
                  </Link>

                  {/* Hidden form for direct server-action delete (used by confirmation page) */}
                  <form action={deleteAction} id={`delete-form-${item.id}`} className="hidden">
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
