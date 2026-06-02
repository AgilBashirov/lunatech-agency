"use client";

/**
 * BlogForm — reusable client component for creating/editing blog posts.
 *
 * Uses useActionState (React 19) so the server action returns a FormActionResult
 * instead of calling redirect(). On success the component navigates via
 * router.push() to avoid the "Router action dispatched before initialization"
 * bug triggered by Adblock Plus hydration mismatches.
 *
 * Renders a 3-locale tab panel (AZ / EN / RU) for per-language content fields,
 * plus common fields: slug, status, publishedAt, coverImage (URL + upload),
 * and tags. A character counter is shown for the excerpt (SEO hint: ~160 chars).
 */

import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BlogPost } from "@/lib/admin/types";
import type { FormActionResult } from "@/lib/admin/types";
import { blobImageUrl } from "@/lib/admin/imageUrl";
import { generateSlug } from "@/lib/blog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LocaleTab = "az" | "en" | "ru";

export type BlogFormDefaults = Partial<BlogPost>;

type BlogFormProps = {
  defaults?: BlogFormDefaults;
  action: (
    prevState: FormActionResult | null,
    formData: FormData,
  ) => Promise<FormActionResult>;
  submitLabel?: string;
};

// ---------------------------------------------------------------------------
// Style helpers — match AdminShell dark theme
// ---------------------------------------------------------------------------

const inputClass =
  "w-full rounded-md border bg-transparent px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30";

const inputStyle: React.CSSProperties = {
  borderColor: "rgba(255,255,255,0.12)",
};

const labelStyle: React.CSSProperties = { color: "rgba(244,244,245,0.65)" };
const hintStyle: React.CSSProperties = { color: "rgba(244,244,245,0.35)" };

const tabActiveStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  color: "#f4f4f5",
  borderColor: "rgba(255,255,255,0.15)",
};

const tabInactiveStyle: React.CSSProperties = {
  color: "rgba(244,244,245,0.45)",
  borderColor: "transparent",
};

const LOCALE_LABELS: Record<LocaleTab, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

const EXCERPT_LIMIT = 160;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BlogForm({
  defaults,
  action,
  submitLabel = "Saxla",
}: BlogFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  const [activeTab, setActiveTab] = useState<LocaleTab>("az");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [coverImage, setCoverImage] = useState(defaults?.coverImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Per-locale excerpt state to show character counter
  const [excerpts, setExcerpts] = useState<Record<LocaleTab, string>>({
    az: defaults?.az?.excerpt ?? "",
    en: defaults?.en?.excerpt ?? "",
    ru: defaults?.ru?.excerpt ?? "",
  });

  // Auto-generate slug from AZ title (only when slug is still empty)
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigate to list on success
  useEffect(() => {
    if (state?.ok === true) {
      router.push("/admin/blog");
      router.refresh();
    }
  }, [state, router]);

  function handleAzTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugTouched) {
      setSlug(generateSlug(e.target.value));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugTouched(true);
    setSlug(e.target.value);
  }

  function handleExcerptChange(loc: LocaleTab, value: string) {
    setExcerpts((prev) => ({ ...prev, [loc]: value }));
  }

  // ---------------------------------------------------------------------------
  // Image upload
  // ---------------------------------------------------------------------------

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
      };
      if (!json.ok || !json.url) {
        setUploadError(json.error ?? "Yükləmə xətası baş verdi.");
      } else {
        setCoverImage(json.url);
      }
    } catch {
      setUploadError("Şəbəkə xətası. Yenidən cəhd edin.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Hidden field for coverImage URL managed by React state */}
      <input type="hidden" name="coverImage" value={coverImage} />

      {/* Error banners */}
      {state?.ok === false && state.error === "invalid" && (
        <p
          role="alert"
          className="rounded-md p-3 text-sm"
          style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}
        >
          {state.detail ??
            "Zəhmət olmasa slug-u və AZ başlığını doldurun. Slug yalnız kiçik hərf, rəqəm və defis (-) ehtiva etməlidir."}
        </p>
      )}
      {state?.ok === false && state.error === "server" && (
        <p
          role="alert"
          className="rounded-md p-3 text-sm"
          style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5" }}
        >
          Saxlama xətası baş verdi. Yenidən cəhd edin.
          {state.detail && (
            <span className="mt-1 block font-mono text-xs opacity-70">
              {state.detail}
            </span>
          )}
        </p>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Common fields                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4">
        {/* Slug */}
        <div>
          <label
            htmlFor="field-slug"
            className="mb-1.5 block text-xs font-medium"
            style={labelStyle}
          >
            Slug (URL){" "}
            <span aria-hidden style={{ color: "rgba(239,68,68,0.8)" }}>
              *
            </span>
          </label>
          <input
            id="field-slug"
            name="slug"
            type="text"
            value={slug}
            onChange={handleSlugChange}
            placeholder="yeni-meqale"
            className={inputClass}
            style={inputStyle}
          />
          <p className="mt-1 text-xs" style={hintStyle}>
            AZ başlıqdan avtomatik yaranır. Kebab-case, məs: &ldquo;texniki-meqale&rdquo;.
          </p>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="field-status"
            className="mb-1.5 block text-xs font-medium"
            style={labelStyle}
          >
            Status{" "}
            <span aria-hidden style={{ color: "rgba(239,68,68,0.8)" }}>
              *
            </span>
          </label>
          <select
            id="field-status"
            name="status"
            defaultValue={defaults?.status ?? "published"}
            className={inputClass}
            style={{ ...inputStyle, color: "#f4f4f5" }}
          >
            <option value="published">Dərc edilib (published)</option>
            <option value="draft">Qaralama (draft)</option>
          </select>
        </div>

        {/* Published at */}
        <div>
          <label
            htmlFor="field-publishedAt"
            className="mb-1.5 block text-xs font-medium"
            style={labelStyle}
          >
            Dərc tarixi
          </label>
          <input
            id="field-publishedAt"
            name="publishedAt"
            type="datetime-local"
            defaultValue={
              defaults?.publishedAt
                ? defaults.publishedAt.slice(0, 16)
                : ""
            }
            className={inputClass}
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
          <p className="mt-1 text-xs" style={hintStyle}>
            Boş buraxılsa saytda tarix göstərilmir.
          </p>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="field-tags"
            className="mb-1.5 block text-xs font-medium"
            style={labelStyle}
          >
            Teqlər (tags)
          </label>
          <input
            id="field-tags"
            name="tags"
            type="text"
            defaultValue={defaults?.tags?.join(", ") ?? ""}
            placeholder="Next.js, Dizayn, Texnologiya"
            className={inputClass}
            style={inputStyle}
          />
          <p className="mt-1 text-xs" style={hintStyle}>
            Vergüllə ayrılmış teqlər.
          </p>
        </div>

        {/* Cover image */}
        <div>
          <p className="mb-1.5 block text-xs font-medium" style={labelStyle}>
            Cover şəkli
          </p>
          <div className="flex flex-col gap-2">
            {/* Manual URL */}
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... (URL)"
              className={inputClass}
              style={inputStyle}
              aria-label="Cover şəkil URL-i"
            />

            {/* File upload trigger */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                onChange={handleFileChange}
                disabled={uploading}
                className="sr-only"
                id="field-coverImage-file"
                aria-label="Cover şəkil faylı yüklə"
              />
              <label
                htmlFor="field-coverImage-file"
                className="inline-flex cursor-pointer items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-white/25"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  color: uploading
                    ? "rgba(244,244,245,0.3)"
                    : "rgba(244,244,245,0.65)",
                  background: "rgba(255,255,255,0.04)",
                }}
                aria-disabled={uploading}
              >
                {uploading ? "Yüklənir..." : "Fayl seç"}
              </label>
              {coverImage && !uploading && (
                <span
                  className="truncate text-xs"
                  style={{ color: "rgba(244,244,245,0.4)", maxWidth: "16rem" }}
                >
                  {coverImage.split("/").pop()}
                </span>
              )}
            </div>

            {uploadError && (
              <p
                role="alert"
                className="rounded-md p-2 text-xs"
                style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}
              >
                {uploadError}
              </p>
            )}

            {coverImage && !uploading && (
              <button
                type="button"
                onClick={() => {
                  setCoverImage("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:border-red-500/40 hover:text-red-400"
                style={{
                  borderColor: "rgba(239,68,68,0.20)",
                  color: "rgba(252,165,165,0.75)",
                  background: "rgba(239,68,68,0.06)",
                }}
              >
                Şəkili sil
              </button>
            )}

            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blobImageUrl(coverImage)}
                alt="Cover önizləməsi"
                className="mt-1 w-full rounded-md"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Locale tabs                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div>
        {/* Tab bar */}
        <div
          className="flex gap-1 rounded-md p-1 mb-4"
          role="tablist"
          aria-label="Dil məzmunu tabları"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {(["az", "en", "ru"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              role="tab"
              aria-selected={activeTab === loc}
              aria-controls={`tab-panel-blog-${loc}`}
              id={`tab-blog-${loc}`}
              onClick={() => setActiveTab(loc)}
              className="flex-1 rounded py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={activeTab === loc ? tabActiveStyle : tabInactiveStyle}
            >
              {LOCALE_LABELS[loc]}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {(["az", "en", "ru"] as const).map((loc) => (
          <div
            key={loc}
            id={`tab-panel-blog-${loc}`}
            role="tabpanel"
            aria-labelledby={`tab-blog-${loc}`}
            hidden={activeTab !== loc}
            className="flex flex-col gap-4"
          >
            {/* Title */}
            <div>
              <label
                htmlFor={`field-${loc}-title`}
                className="mb-1.5 block text-xs font-medium"
                style={labelStyle}
              >
                {LOCALE_LABELS[loc]} — Başlıq{" "}
                {loc === "az" && (
                  <span aria-hidden style={{ color: "rgba(239,68,68,0.8)" }}>
                    *
                  </span>
                )}
              </label>
              <input
                id={`field-${loc}-title`}
                name={`${loc}.title`}
                type="text"
                defaultValue={defaults?.[loc]?.title ?? ""}
                placeholder="Yazının başlığı"
                onChange={loc === "az" ? handleAzTitleChange : undefined}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Excerpt + character counter */}
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label
                  htmlFor={`field-${loc}-excerpt`}
                  className="text-xs font-medium"
                  style={labelStyle}
                >
                  {LOCALE_LABELS[loc]} — Xülasə (excerpt){" "}
                  {loc === "az" && (
                    <span aria-hidden style={{ color: "rgba(239,68,68,0.8)" }}>
                      *
                    </span>
                  )}
                </label>
                <span
                  className="text-xs tabular-nums"
                  style={{
                    color:
                      excerpts[loc].length > EXCERPT_LIMIT
                        ? "#fca5a5"
                        : "rgba(244,244,245,0.35)",
                  }}
                  aria-label={`${excerpts[loc].length} / ${EXCERPT_LIMIT} simvol`}
                >
                  {excerpts[loc].length} / {EXCERPT_LIMIT}
                </span>
              </div>
              <textarea
                id={`field-${loc}-excerpt`}
                name={`${loc}.excerpt`}
                rows={3}
                value={excerpts[loc]}
                onChange={(e) => handleExcerptChange(loc, e.target.value)}
                placeholder="Yazının qısa xülasəsi (SEO description üçün ~160 simvol)"
                className={inputClass}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Content (markdown) */}
            <div>
              <label
                htmlFor={`field-${loc}-content`}
                className="mb-1.5 block text-xs font-medium"
                style={labelStyle}
              >
                {LOCALE_LABELS[loc]} — Məzmun (Markdown)
              </label>
              <textarea
                id={`field-${loc}-content`}
                name={`${loc}.content`}
                rows={15}
                defaultValue={defaults?.[loc]?.content ?? ""}
                placeholder="## Başlıq&#10;&#10;Mətn buraya..."
                className={`${inputClass} font-mono text-xs`}
                style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
              />
              <p className="mt-1 text-xs" style={hintStyle}>
                Markdown formatı: **qalın**, *italik*, ## başlıq, - siyahı.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Actions                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md px-5 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.08)", color: "#f4f4f5" }}
        >
          {isPending ? "Saxlanır..." : submitLabel}
        </button>
        <Link
          href="/admin/blog"
          className="rounded-md border px-5 py-2 text-sm font-medium transition-colors"
          style={{
            borderColor: "rgba(255,255,255,0.10)",
            color: "rgba(244,244,245,0.55)",
          }}
        >
          Ləğv et
        </Link>
      </div>
    </form>
  );
}
