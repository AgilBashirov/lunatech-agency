/**
 * Admin — Portfolio layihəsini redaktə et / sil.
 *
 * Server component with inline Server Actions.
 * Form UI is delegated to the client component PortfolioForm.
 *
 * Next.js 16: `params` and `searchParams` are Promises — always await.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPortfolio, setPortfolio } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";
import { deleteBlob } from "@/lib/admin/blob";
import type { PortfolioItem, FormActionResult } from "@/lib/admin/types";
import { PortfolioForm } from "@/components/admin/PortfolioForm";

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

async function updatePortfolioItem(
  itemId: string,
  _prevState: FormActionResult | null,
  formData: FormData,
): Promise<FormActionResult> {
  "use server";

  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const orderRaw = (formData.get("order") as string | null)?.trim() ?? "";
  const coverImage = (formData.get("coverImage") as string | null)?.trim() ?? "";
  const liveUrl = (formData.get("liveUrl") as string | null)?.trim() ?? "";
  const tagsRaw = (formData.get("tags") as string | null)?.trim() ?? "";

  const azTitle = (formData.get("az.title") as string | null)?.trim() ?? "";
  const azSummary = (formData.get("az.summary") as string | null)?.trim() ?? "";
  const enTitle = (formData.get("en.title") as string | null)?.trim() ?? "";
  const enSummary = (formData.get("en.summary") as string | null)?.trim() ?? "";
  const ruTitle = (formData.get("ru.title") as string | null)?.trim() ?? "";
  const ruSummary = (formData.get("ru.summary") as string | null)?.trim() ?? "";

  if (!azTitle || !azSummary) {
    return { ok: false, error: "invalid" };
  }

  const items = await getPortfolio();
  const existing = items.find((it) => it.id === itemId);
  if (!existing) redirect("/admin/portfolio");

  const order =
    orderRaw !== "" && !isNaN(Number(orderRaw))
      ? Number(orderRaw)
      : existing.order;

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const newCoverImage = coverImage || undefined;
  const oldCoverImage = existing.coverImage;

  const updated: PortfolioItem = {
    id: itemId,
    slug: existing.slug,
    order,
    visible: existing.visible,
    liveUrl: liveUrl || undefined,
    coverImage: newCoverImage,
    tags,
    az: { title: azTitle, summary: azSummary },
    en: { title: enTitle || azTitle, summary: enSummary || azSummary },
    ru: { title: ruTitle || azTitle, summary: ruSummary || azSummary },
  };

  try {
    await setPortfolio(items.map((it) => (it.id === itemId ? updated : it)));
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

  revalidatePath("/admin/portfolio", "page");
  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");

  return { ok: true };
}

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

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ delete?: string }>;
};

export default async function EditPortfolioItemPage({ params, searchParams }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const { delete: deleteFlag } = await searchParams;

  const items = await getPortfolio();
  const item = items.find((it) => it.id === id);
  if (!item) notFound();

  const updateAction = updatePortfolioItem.bind(null, id);
  const deleteAction = deletePortfolioItem.bind(null, id);

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/portfolio"
          className="text-xs transition-colors"
          style={{ color: "rgba(244,244,245,0.4)" }}
        >
          ← Portfolio
        </Link>
        <span style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
        <h1 className="text-xl font-semibold text-white">Layihəni redaktə et</h1>
      </div>

      <p className="mb-6 text-xs font-mono" style={{ color: "rgba(244,244,245,0.25)" }}>
        id: {item.id}
      </p>

      {/* Edit form — errors shown inline by PortfolioForm via useActionState */}
      <PortfolioForm
        defaults={item}
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
        <h2 className="mb-1 text-sm font-medium text-red-400">Layihəni sil</h2>
        <p className="mb-4 text-xs" style={{ color: "rgba(244,244,245,0.4)" }}>
          Bu əməliyyat geri qaytarıla bilməz. Qalan layihələrin sırası yenidən
          hesablanacaq.
        </p>

        {deleteFlag === "1" ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-red-300">
              &ldquo;{item.az.title}&rdquo; silinsin?
            </p>
            <form action={deleteAction} className="flex gap-2">
              <button
                type="submit"
                className="rounded-md px-4 py-1.5 text-xs font-medium text-white transition-colors"
                style={{ background: "rgba(239,68,68,0.6)" }}
              >
                Bəli, sil
              </button>
              <Link
                href={`/admin/portfolio/${id}`}
                className="rounded-md border px-4 py-1.5 text-xs font-medium transition-colors"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  color: "rgba(244,244,245,0.55)",
                }}
              >
                Ləğv et
              </Link>
            </form>
          </div>
        ) : (
          <Link
            href={`/admin/portfolio/${id}?delete=1`}
            className="inline-flex items-center rounded-md border px-4 py-1.5 text-xs font-medium transition-colors"
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              color: "rgba(239,68,68,0.7)",
            }}
          >
            Sil
          </Link>
        )}
      </div>
    </div>
  );
}
