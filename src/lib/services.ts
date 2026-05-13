import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { getTranslations } from "next-intl/server";
import {
  IconGovernment,
  IconMobile,
  IconWeb,
} from "@/components/services/ServiceIcons";
import { routing } from "@/i18n/routing";

/**
 * Service detail registry.
 *
 * Holds *structural* data only — slug, icon reference, sort order, and
 * per-section item counts that the page uses to iterate `useCases`,
 * `howItWorks.steps`, `benefits.items`, and `faq.items` against the i18n
 * key contract defined in `.claude/service-detail-spec.md` §5.
 *
 * All human-readable copy lives in `messages/{locale}.json` under
 * `services.detail.{slug}.*`. Do NOT add titles/descriptions here.
 */

export const SERVICE_SLUGS = [
  "web-experience",
  "mobile-app",
  "government",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/**
 * Maps the home-grid `services.{key}` namespace key to a detail-page slug.
 * Home grid uses camelCase keys (`webExperience`); detail routes use kebab
 * (`web-experience`). Keep both in sync — every entry in the registry must
 * have a matching `home*Key` so the home grid can link to it.
 */
export type HomeServiceKey = "webExperience" | "mobileApp" | "government";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type ServiceDefinition = {
  slug: ServiceSlug;
  homeKey: HomeServiceKey;
  /** Sort order across home grid + sitemap. Lower comes first. */
  order: number;
  /** Stroke-style icon from `ServiceIcons.tsx`. */
  Icon: IconComponent;
  /**
   * Section item counts. Drive the frontend's `t(\`...uc${i}\`)` style
   * iteration, since the i18n key contract uses fixed *named* keys
   * (`uc1`–`uc6`, `s1`–`s5`, `i1`–`i4`, `q1`–`q8`) per the spec §5.
   *
   * Counts here represent the actual number of items the page should
   * render — frontend reads only as many keys as the count specifies.
   */
  counts: {
    /** Use-cases tiles (3, 4, or 6 per spec §3.4). */
    useCases: number;
    /** Solution bullets (3–5 per spec §3.3). */
    solutionBullets: number;
    /** How-it-works steps (3–5 per spec §3.5). */
    howItWorksSteps: number;
    /** Benefits items (3 or 4 per spec §3.6). */
    benefits: number;
    /** FAQ items (4–8 per spec §3.7). */
    faq: number;
    /** Problem paragraphs (1–3 per spec §3.2). */
    problemParagraphs: number;
    /** Solution paragraphs (1–2 per spec §3.3). */
    solutionParagraphs: number;
  };
};

/**
 * Canonical service order. Mirrors the home-grid order with `government`
 * appended last (newest service). Frontend MUST use this order anywhere it
 * lists services (sitemap, breadcrumbs, related links).
 */
export const services: ReadonlyArray<ServiceDefinition> = [
  // All three rendered services use the bespoke layout (see
  // `WebExperienceDetail`, `MobileAppDetail`, `GovernmentDetail`). The
  // editorial-template `counts` below are kept as zeroed placeholders for
  // type shape only and are NOT consumed by any rendered component — the
  // matching long-form i18n keys (`useCases`, `howItWorks`, `benefits`,
  // `faq`, etc.) no longer exist under `services.detail.*`.
  {
    slug: "web-experience",
    homeKey: "webExperience",
    order: 1,
    Icon: IconWeb,
    counts: {
      useCases: 0,
      solutionBullets: 0,
      howItWorksSteps: 0,
      benefits: 0,
      faq: 0,
      problemParagraphs: 0,
      solutionParagraphs: 0,
    },
  },
  {
    slug: "mobile-app",
    homeKey: "mobileApp",
    order: 2,
    Icon: IconMobile,
    counts: {
      useCases: 0,
      solutionBullets: 0,
      howItWorksSteps: 0,
      benefits: 0,
      faq: 0,
      problemParagraphs: 0,
      solutionParagraphs: 0,
    },
  },
  {
    slug: "government",
    homeKey: "government",
    order: 3,
    Icon: IconGovernment,
    // Counts mirror the content marketing has already populated under
    // `services.detail.government.*` in messages/{locale}.json. If marketing
    // adds a 6th FAQ or a 5th step later, bump the matching count here.
    counts: {
      useCases: 4,
      solutionBullets: 5,
      howItWorksSteps: 4,
      benefits: 4,
      faq: 5,
      problemParagraphs: 3,
      solutionParagraphs: 2,
    },
  },
];

/** Slugs only, in canonical order — pass to `generateStaticParams`. */
export const serviceSlugs: ReadonlyArray<ServiceSlug> = services.map(
  (s) => s.slug,
);

const slugSet = new Set<string>(serviceSlugs);

export function isValidServiceSlug(slug: string): slug is ServiceSlug {
  return slugSet.has(slug);
}

export function getServiceBySlug(
  slug: string,
): ServiceDefinition | undefined {
  if (!isValidServiceSlug(slug)) return undefined;
  return services.find((s) => s.slug === slug);
}

// ---------------------------------------------------------------------------
// SEO helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the canonical site origin. Uses `NEXT_PUBLIC_SITE_URL` when set;
 * falls back to the production domain. Trailing slashes are normalised away
 * so callers can always do `${SITE_URL}/path`.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lunatech.az";
  return raw.replace(/\/+$/, "");
}

/** `/[locale]/services/[slug]` — locale-aware absolute URL. */
export function getServiceUrl(locale: string, slug: ServiceSlug): string {
  return `${getSiteUrl()}/${locale}/services/${slug}`;
}

type Locale = (typeof routing.locales)[number];

/**
 * Build a Next.js `Metadata` object for a service detail page. Pulls
 * title/description from i18n (`services.detail.{slug}.hero.title|lede`),
 * sets canonical + per-locale alternates, and mirrors the home layout's
 * OG/twitter shape so cards render consistently across the site.
 */
export async function buildServiceMetadata(
  slug: ServiceSlug,
  locale: string,
): Promise<Metadata> {
  const tHero = await getTranslations({
    locale,
    namespace: `services.detail.${slug}.hero`,
  });
  const tSite = await getTranslations({ locale, namespace: "Metadata" });

  const heroTitle = tHero("title");
  const heroLede = tHero("lede");
  const siteName = tSite("title");

  // "<service title> — Lunatech" keeps the brand suffix consistent with the
  // home page's site title pattern without duplicating it when the hero
  // title already contains the brand.
  const fullTitle = heroTitle.includes("Lunatech")
    ? heroTitle
    : `${heroTitle} — Lunatech`;

  const canonical = getServiceUrl(locale, slug);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = getServiceUrl(l, slug);
  }

  return {
    title: fullTitle,
    description: heroLede,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: fullTitle,
      description: heroLede,
      url: canonical,
      locale,
      type: "website",
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: heroLede,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Build a schema.org `Service` JSON-LD payload for a service detail page.
 * Frontend injects this via `<script type="application/ld+json">`.
 *
 * Shape follows https://schema.org/Service. `provider` is the Lunatech
 * `Organization`; `areaServed` is "AZ" (Azerbaijan) by default — adjust
 * here if marketing later supplies country lists per service.
 */
export async function buildServiceJsonLd(
  slug: ServiceSlug,
  locale: string,
): Promise<Record<string, unknown>> {
  const t = await getTranslations({
    locale,
    namespace: `services.detail.${slug}`,
  });
  const tSite = await getTranslations({ locale, namespace: "Metadata" });

  const url = getServiceUrl(locale, slug);
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: t("hero.title"),
    description: t("hero.lede"),
    serviceType: t("hero.eyebrow"),
    url,
    inLanguage: locale,
    areaServed: { "@type": "Country", name: "AZ" },
    provider: {
      "@type": "Organization",
      "@id": `${siteUrl}#organization`,
      name: "Lunatech",
      url: siteUrl,
      description: tSite("description"),
    },
  };
}

/** Type guard helper exposed so frontend can narrow params before rendering. */
export type { Locale };
