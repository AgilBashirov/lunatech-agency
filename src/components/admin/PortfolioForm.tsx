"use client";

import { useActionState, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PortfolioItem } from "@/lib/admin/types";
import type { FormActionResult } from "@/lib/admin/types";
import { blobImageUrl } from "@/lib/admin/imageUrl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LocaleTab = "az" | "en" | "ru";

type PortfolioFormProps = {
  defaults?: Partial<PortfolioItem>;
  action: (
    prevState: FormActionResult | null,
    formData: FormData,
  ) => Promise<FormActionResult>;
  submitLabel?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inputClass() {
  return "w-full rounded-md border bg-transparent px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30";
}

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

// ---------------------------------------------------------------------------
// TagInput — chip-based tag editor
// ---------------------------------------------------------------------------

function TagInput({ defaultTags = [] }: { defaultTags?: string[] }) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback((raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    setTags((prev) => {
      const next = [...prev];
      for (const p of parts) {
        if (!next.includes(p)) next.push(p);
      }
      return next;
    });
    setInputValue("");
  }, []);

  const removeTag = useCallback(
    (idx: number) => setTags((prev) => prev.filter((_, i) => i !== idx)),
    [],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      {/* Single hidden field — comma-separated — matches server action */}
      <input type="hidden" name="tags" value={tags.join(",")} />

      {/* Chip container + inline input */}
      <div
        className="flex min-h-[38px] w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5"
        style={inputStyle}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium"
            style={{
              background: "rgba(124,58,237,0.18)",
              color: "rgba(196,181,253,1)",
              border: "1px solid rgba(124,58,237,0.30)",
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              className="rounded-full opacity-60 transition-opacity hover:opacity-100"
              aria-label={`${tag} teqini sil`}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
          placeholder={tags.length === 0 ? "UI, Branding, Motion..." : ""}
          className="min-w-[100px] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PortfolioForm({
  defaults,
  action,
  submitLabel = "Saxla",
}: PortfolioFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, null);

  const [activeTab, setActiveTab] = useState<LocaleTab>("az");
  const [coverImage, setCoverImage] = useState(defaults?.coverImage ?? "");
  const previewUrl = blobImageUrl(coverImage);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigate to list on success
  useEffect(() => {
    if (state?.ok === true) {
      router.push("/admin/portfolio");
      router.refresh();
    }
  }, [state, router]);

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
      const res = await fetch("/api/admin/portfolio/upload", {
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
          Zəhmət olmasa AZ başlığı və xülasəni doldurun.
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
        {/* Live URL */}
        <div>
          <label
            htmlFor="field-liveUrl"
            className="mb-1.5 block text-xs font-medium"
            style={labelStyle}
          >
            Canlı sayt URL-i
          </label>
          <input
            id="field-liveUrl"
            name="liveUrl"
            type="text"
            defaultValue={defaults?.liveUrl ?? ""}
            placeholder="https://example.com"
            className={inputClass()}
            style={inputStyle}
          />
          <p className="mt-1 text-xs" style={hintStyle}>
            İstifadəçi portfolio kartına kliklədikdə açılacaq vebsayt.
          </p>
        </div>

        {/* Order */}
        <div>
          <label
            htmlFor="field-order"
            className="mb-1.5 block text-xs font-medium"
            style={labelStyle}
          >
            Sıra (order)
          </label>
          <input
            id="field-order"
            name="order"
            type="number"
            defaultValue={
              defaults?.order !== undefined ? String(defaults.order) : ""
            }
            placeholder="0"
            min={0}
            className={inputClass()}
            style={inputStyle}
          />
          <p className="mt-1 text-xs" style={hintStyle}>
            0-dan başlayan tam ədəd. Boş buraxsanız ən sona əlavə edilir.
          </p>
        </div>

        {/* Tags */}
        <div>
          <p className="mb-1.5 block text-xs font-medium" style={labelStyle}>
            Teqlər
          </p>
          <TagInput defaultTags={defaults?.tags ?? []} />
          <p className="mt-1 text-xs" style={hintStyle}>
            Yazıb Enter və ya vergül basın. Silmək üçün × düyməsinə basın.
          </p>
        </div>

        {/* Cover image */}
        <div>
          <p className="mb-1.5 block text-xs font-medium" style={labelStyle}>
            Cover şəkli
          </p>
          <div className="flex flex-col gap-2">
            <input
              id="field-coverImage-url"
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... (URL)"
              className={inputClass()}
              style={inputStyle}
              aria-label="Cover şəkil URL-i"
            />

            <div className="flex items-center gap-2">
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
            </div>

            {uploadError && (
              <p
                role="alert"
                className="rounded-md p-2 text-xs"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#fca5a5",
                }}
              >
                {uploadError}
              </p>
            )}

            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
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
              aria-controls={`tab-panel-${loc}`}
              id={`tab-${loc}`}
              onClick={() => setActiveTab(loc)}
              className="flex-1 rounded py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={activeTab === loc ? tabActiveStyle : tabInactiveStyle}
            >
              {LOCALE_LABELS[loc]}
            </button>
          ))}
        </div>

        {(["az", "en", "ru"] as const).map((loc) => (
          <div
            key={loc}
            id={`tab-panel-${loc}`}
            role="tabpanel"
            aria-labelledby={`tab-${loc}`}
            hidden={activeTab !== loc}
            className="flex flex-col gap-4"
          >
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
                placeholder="Layihə adı"
                className={inputClass()}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor={`field-${loc}-summary`}
                className="mb-1.5 block text-xs font-medium"
                style={labelStyle}
              >
                {LOCALE_LABELS[loc]} — Xülasə{" "}
                {loc === "az" && (
                  <span aria-hidden style={{ color: "rgba(239,68,68,0.8)" }}>
                    *
                  </span>
                )}
              </label>
              <textarea
                id={`field-${loc}-summary`}
                name={`${loc}.summary`}
                rows={3}
                defaultValue={defaults?.[loc]?.summary ?? ""}
                placeholder="Layihənin qısa təsviri..."
                className={inputClass()}
                style={{ ...inputStyle, resize: "vertical" }}
              />
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
          href="/admin/portfolio"
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
