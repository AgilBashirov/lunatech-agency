import { setRequestLocale } from "next-intl/server";
import { MoonBackdrop } from "@/components/moon/MoonBackdrop";
import { MoonReadyProvider } from "@/context/moon-ready";
import { Footer } from "@/components/layout/Footer";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { AgencyNarrativeSection } from "@/components/sections/AgencyNarrativeSection";
import { Services } from "@/components/sections/Services";
import { ValueStrip } from "@/components/sections/ValueStrip";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { loadContactTopics } from "@/data/services";
import { getVisiblePortfolio } from "@/lib/portfolio";
import { buildHomeJsonLd } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [contactTopics, sortedPortfolio, jsonLd] = await Promise.all([
    loadContactTopics(),
    getVisiblePortfolio(),
    buildHomeJsonLd(locale),
  ]);

  const hasPortfolio = sortedPortfolio.length > 0;

  return (
    <MoonReadyProvider>
      <MoonBackdrop />
      {/* No overflow-x here: html/body already suppress horizontal page scroll; an extra
          overflow-x-hidden on this wrapper was clipping descendants (e.g. portfolio rail edges). */}
      <div className="relative z-[2] flex min-h-full min-w-0 max-w-full flex-col">
        <SiteNavbar />
        <main className="min-w-0 flex-1">
          <Hero hasPortfolio={hasPortfolio} />
          <ValueStrip />
          <Services />
          {hasPortfolio && <Portfolio items={sortedPortfolio} />}
          {/* Anchor wraps the strip + narrative so #about scrolls to land
              on the strip (visual lead-in to the about section). */}
          <div id="about" className="scroll-mt-44 md:scroll-mt-40">
            <ValueStrip tKey="aboutStrip" variant="secondary" />
            <AgencyNarrativeSection />
          </div>
          <Contact topics={contactTopics} />
        </main>
        <Footer />
        <WhatsAppButton />
        <ScrollToTopButton />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </MoonReadyProvider>
  );
}
