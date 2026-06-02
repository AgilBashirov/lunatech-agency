/**
 * Admin — Yeni portfolio layihəsi əlavə et.
 *
 * Server component with an inline Server Action.
 * Form UI is delegated to the client component PortfolioForm.
 * The action returns a FormActionResult instead of calling redirect() to avoid
 * the "Router action dispatched before initialization" bug in Next.js.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { getPortfolio, setPortfolio } from "@/lib/admin/contentStore";
import { getAdminSession } from "@/lib/admin/session";
import { deleteBlob } from "@/lib/admin/blob";
import type { PortfolioItem, FormActionResult } from "@/lib/admin/types";
import { PortfolioForm } from "@/components/admin/PortfolioForm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[əæ]/g, "e")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "item";
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

async function createPortfolioItem(
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

  const maxOrder = items.reduce((acc, it) => Math.max(acc, it.order), -1);
  const order =
    orderRaw !== "" && !isNaN(Number(orderRaw)) ? Number(orderRaw) : maxOrder + 1;

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const id = randomUUID();
  const baseSlug = slugify(azTitle);
  const slug = items.some((it) => it.slug === baseSlug)
    ? `${baseSlug}-${id.slice(0, 6)}`
    : baseSlug;

  const newItem: PortfolioItem = {
    id,
    slug,
    order,
    visible: true,
    liveUrl: liveUrl || undefined,
    coverImage: coverImage || undefined,
    tags,
    az: { title: azTitle, summary: azSummary },
    en: { title: enTitle || azTitle, summary: enSummary || azSummary },
    ru: { title: ruTitle || azTitle, summary: ruSummary || azSummary },
  };

  try {
    await setPortfolio([...items, newItem]);
  } catch (err) {
    if (newItem.coverImage) {
      await deleteBlob(newItem.coverImage);
    }
    const detail =
      err instanceof Error ? err.message.slice(0, 200) : undefined;
    return { ok: false, error: "server", detail };
  }

  revalidatePath("/admin/portfolio", "page");
  for (const loc of ["az", "en", "ru"] as const) {
    revalidatePath(`/${loc}`, "layout");
  }
  revalidatePath("/", "layout");

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function NewPortfolioItemPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

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
        <h1 className="text-xl font-semibold text-white">Yeni layihə əlavə et</h1>
      </div>

      <PortfolioForm action={createPortfolioItem} submitLabel="Layihəni yarat" />
    </div>
  );
}
