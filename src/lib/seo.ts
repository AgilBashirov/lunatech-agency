import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteUrl } from "@/lib/services";
import { routing } from "@/i18n/routing";

/**
 * Build the site-wide `Organization` + `WebSite` JSON-LD payload for the
 * home page. Mirrors the `Organization` shape already emitted per-service by
 * `buildServiceJsonLd` in `services.ts` so the `@id` resolves to the same
 * entity across pages.
 */
export async function buildHomeJsonLd(locale: string): Promise<Record<string, unknown>> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: "Lunatech",
        url: siteUrl,
        description: t("description"),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        name: "Lunatech",
        url: siteUrl,
        inLanguage: locale,
        publisher: { "@id": `${siteUrl}#organization` },
      },
    ],
  };
}

/**
 * Build canonical + hreflang metadata for a simple static route (e.g.
 * `/privacy`, `/terms`) whose title/description live under a top-level i18n
 * namespace matching `path` (e.g. namespace `"privacy"` → route `/privacy`).
 */
export async function buildLegalMetadata(
  namespace: "privacy" | "terms",
  path: string,
  locale: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}/${locale}${path}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${siteUrl}/${l}${path}`;
  }

  const title = `${t("title")} — Lunatech`;

  return {
    title,
    alternates: { canonical, languages },
    openGraph: { title, url: canonical, locale, type: "website", siteName: "Lunatech" },
    robots: { index: true, follow: true },
  };
}
