import { setRequestLocale } from "next-intl/server";
import { MoonBackdrop } from "@/components/moon/MoonBackdrop";
import { MoonReadyProvider } from "@/context/moon-ready";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { AgencyNarrativeSection } from "@/components/sections/AgencyNarrativeSection";
import { Services } from "@/components/sections/Services";
import { ValueStrip } from "@/components/sections/ValueStrip";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <MoonReadyProvider>
      <MoonBackdrop />
      {/* No overflow-x here: html/body already suppress horizontal page scroll; an extra
          overflow-x-hidden on this wrapper was clipping descendants (e.g. portfolio rail edges). */}
      <div className="relative z-[2] flex min-h-full min-w-0 max-w-full flex-col">
        <Navbar />
        <main className="min-w-0 flex-1">
          <Hero />
          <ValueStrip />
          <Services />
          <Portfolio />
          <AgencyNarrativeSection />
          <Contact />
        </main>
        <Footer />
        <ScrollToTopButton />
      </div>
    </MoonReadyProvider>
  );
}
