import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl, serviceSlugs } from "@/lib/services";

/**
 * Single root sitemap covering:
 *  - the home page in every locale
 *  - every service detail page (locale × slug)
 *
 * `alternates.languages` is populated for each URL so search engines see
 * the full hreflang map. We emit the entry under the *default* locale and
 * link sibling locales via `alternates`, mirroring Next 16's localized
 * sitemap recommendation.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const defaultLocale = routing.defaultLocale;

  const buildLanguages = (path: string): Record<string, string> => {
    const languages: Record<string, string> = {};
    for (const l of routing.locales) {
      languages[l] = `${siteUrl}/${l}${path}`;
    }
    return languages;
  };

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/${defaultLocale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: buildLanguages("") },
    },
  ];

  for (const slug of serviceSlugs) {
    entries.push({
      url: `${siteUrl}/${defaultLocale}/services/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: buildLanguages(`/services/${slug}`) },
    });
  }

  return entries;
}
