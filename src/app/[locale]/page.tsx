import { setRequestLocale } from "next-intl/server";
import { MoonBackdrop } from "@/components/moon/MoonBackdrop";
import { MoonReadyProvider } from "@/context/moon-ready";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { Services } from "@/components/sections/Services";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <MoonReadyProvider>
      <MoonBackdrop />
      <div className="relative z-[2] flex min-h-full min-w-0 max-w-full flex-col overflow-x-hidden">
        <Navbar />
        <main className="min-w-0 flex-1">
          <Hero />
          <Services />
          <About />
          <Portfolio />
          <Contact />
        </main>
        <Footer />
      </div>
    </MoonReadyProvider>
  );
}
