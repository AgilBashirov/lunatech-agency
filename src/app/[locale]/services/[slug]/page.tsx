import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { BackToHomeButton } from "@/components/services/detail/BackToHomeButton";
import { OurProcessSection } from "@/components/services/detail/OurProcessSection";
import { ServiceCTASection } from "@/components/services/detail/ServiceCTASection";
import { ServicePageHeader } from "@/components/services/detail/ServicePageHeader";
import { WhatWeDoSection } from "@/components/services/detail/WhatWeDoSection";
import { WhereItFitsSection } from "@/components/services/detail/WhereItFitsSection";
import { WhyChooseUsSection } from "@/components/services/detail/WhyChooseUsSection";
import { GovernmentDetail } from "@/components/services/government/GovernmentDetail";
import { WebExperienceDetail } from "@/components/services/web-experience/WebExperienceDetail";
import { routing } from "@/i18n/routing";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
  isValidServiceSlug,
  serviceSlugs,
  type ServiceSlug,
} from "@/lib/services";

/** Slugs that render a bespoke layout instead of the shared editorial template.
 *  Single source of truth for the branch in `ServiceDetailPage`. */
const BESPOKE_SLUGS = new Set<ServiceSlug>(["government", "web-experience"]);

function renderBespoke(slug: ServiceSlug) {
  switch (slug) {
    case "government":
      return <GovernmentDetail />;
    case "web-experience":
      return <WebExperienceDetail />;
    default:
      return null;
  }
}

type RouteParams = { locale: string; slug: string };

type Props = {
  params: Promise<RouteParams>;
};

/**
 * Pre-render every (locale × slug) combination at build time. The detail
 * page is fully static — copy comes from i18n, structure from the registry.
 */
export function generateStaticParams(): RouteParams[] {
  const out: RouteParams[] = [];
  for (const locale of routing.locales) {
    for (const slug of serviceSlugs) {
      out.push({ locale, slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidServiceSlug(slug)) return {};
  return buildServiceMetadata(slug, locale);
}

/**
 * Service detail page (revised spec R2 / R4).
 *
 * Simplified, content-focused layout — intentionally different from the
 * cinematic home page. NO MoonReadyProvider, NO MoonBackdrop, NO 3D scene,
 * NO gradient text on the H1. Page background inherits `--background` from
 * <body>; no custom wrapper gradient.
 *
 * Section order (revised spec R2):
 *   1. Navbar
 *   2. BackToHomeButton (top)
 *   3. ServicePageHeader (page H1)
 *   4. WhatWeDoSection      (merges old Problem + Solution)
 *   5. WhereItFitsSection   (renamed UseCases)
 *   6. OurProcessSection    (renamed HowItWorks — uses ProcessTimeline)
 *   7. WhyChooseUsSection   (renamed Benefits, plain list — no icon grid)
 *   8. ServiceCTASection    (simplified, no GlassCard)
 *   9. BackToHomeButton (bottom)
 *  10. Footer
 *  11. ScrollToTopButton
 *
 * The FAQ section is dropped from render. The `faq.*` i18n keys remain in
 * place as orphans (per PO constraint: shipped keys must not be discarded).
 */
export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isValidServiceSlug(slug)) {
    notFound();
  }
  setRequestLocale(locale);

  const jsonLd = await buildServiceJsonLd(slug, locale);

  // `government` and `web-experience` render bespoke layouts (cards + compact
  // overview block + subtle SVG backdrop) rather than the shared editorial
  // template. The chrome (Navbar / BackToHome × 2 / Footer / ScrollToTopButton)
  // is identical so the e2e contracts on those landmarks still pass.
  const isBespoke = BESPOKE_SLUGS.has(slug);

  return (
    <>
      <div className="relative flex min-h-full min-w-0 max-w-full flex-col">
        <Navbar />
        <main className="min-w-0 flex-1">
          <BackToHomeButton placement="top" />
          {isBespoke ? (
            renderBespoke(slug)
          ) : (
            <>
              <ServicePageHeader slug={slug} />
              <WhatWeDoSection slug={slug} />
              <WhereItFitsSection slug={slug} />
              <OurProcessSection slug={slug} />
              <WhyChooseUsSection slug={slug} />
              <ServiceCTASection slug={slug} />
            </>
          )}
          <BackToHomeButton placement="bottom" />
        </main>
        <Footer />
        <ScrollToTopButton />
      </div>
      <script
        type="application/ld+json"
        // JSON-LD payload is built from controlled i18n strings; stringifying
        // through JSON.stringify is the standard injection pattern Next.js
        // recommends for structured data.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
