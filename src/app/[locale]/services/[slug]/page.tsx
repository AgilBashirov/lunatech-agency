import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { MoonBackdrop } from "@/components/moon/MoonBackdrop";
import { ServiceBenefits } from "@/components/services/detail/ServiceBenefits";
import { ServiceCTA } from "@/components/services/detail/ServiceCTA";
import { ServiceFAQ } from "@/components/services/detail/ServiceFAQ";
import { ServiceHero } from "@/components/services/detail/ServiceHero";
import { ServiceHowItWorks } from "@/components/services/detail/ServiceHowItWorks";
import { ServiceProblem } from "@/components/services/detail/ServiceProblem";
import { ServiceSolution } from "@/components/services/detail/ServiceSolution";
import { ServiceUseCases } from "@/components/services/detail/ServiceUseCases";
import { MoonReadyProvider } from "@/context/moon-ready";
import { routing } from "@/i18n/routing";
import {
  buildServiceJsonLd,
  buildServiceMetadata,
  isValidServiceSlug,
  serviceSlugs,
} from "@/lib/services";

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

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isValidServiceSlug(slug)) {
    notFound();
  }
  setRequestLocale(locale);

  const jsonLd = await buildServiceJsonLd(slug, locale);

  return (
    <MoonReadyProvider>
      <MoonBackdrop />
      <div className="relative z-[2] flex min-h-full min-w-0 max-w-full flex-col">
        <Navbar />
        <main className="min-w-0 flex-1">
          <ServiceHero slug={slug} />
          <ServiceProblem slug={slug} />
          <ServiceSolution slug={slug} />
          <ServiceUseCases slug={slug} />
          <ServiceHowItWorks slug={slug} />
          <ServiceBenefits slug={slug} />
          <ServiceFAQ slug={slug} />
          <ServiceCTA slug={slug} />
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
    </MoonReadyProvider>
  );
}
