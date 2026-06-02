/**
 * Admin — Services overview page
 *
 * Server component. Lists every registered service with links to the
 * multilingual content editor for that service's section.
 *
 * Structural data (icon, slug) is code-level only; this page surfaces
 * the content-management links rather than an inline editor.
 */

import Link from "next/link";
import { services } from "@/lib/services";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** "web-experience" → "Web Experience" */
function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type LocaleLink = {
  label: string;
  locale: "az" | "en" | "ru";
};

const LOCALE_LINKS: LocaleLink[] = [
  { label: "AZ", locale: "az" },
  { label: "EN", locale: "en" },
  { label: "RU", locale: "ru" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminServicesPage() {
  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white mb-1">Xidmətlər</h1>
        <p className="text-sm" style={{ color: "rgba(244,244,245,0.5)" }}>
          Servis strukturu (icon, slug) kod səviyyəsindədir. Aşağıdakı
          linklər vasitəsilə hər servisin məzmununu locale editor-unda
          redaktə edin.
        </p>
      </div>

      {/* Service cards */}
      <ul className="space-y-4" role="list">
        {[...services]
          .sort((a, b) => a.order - b.order)
          .map((service) => {
            const label = slugToLabel(service.slug);

            return (
              <li
                key={service.slug}
                className="rounded-xl border p-5"
                style={{
                  background: "#1a1a1a",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                {/* Service name + slug badge */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-white">
                    {label}
                  </h2>
                  <span
                    className="inline-flex items-center rounded px-2 py-0.5 text-xs font-mono"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(244,244,245,0.45)",
                    }}
                  >
                    {service.slug}
                  </span>
                </div>

                {/* Locale editor links */}
                <div className="flex flex-wrap gap-2">
                  {LOCALE_LINKS.map(({ label: locLabel, locale }) => (
                    <Link
                      key={locale}
                      href={`/admin/messages/${locale}?section=services`}
                      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                      style={{
                        borderColor: "rgba(255,255,255,0.12)",
                        color: "rgba(244,244,245,0.65)",
                      }}
                    >
                      Məzmunu redaktə et ({locLabel})
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
