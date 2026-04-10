import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ReadablePanel } from "@/components/ui/ReadablePanel";
import { Section } from "@/components/ui/Section";

export async function About() {
  const t = await getTranslations("about");

  return (
    <Section id="about" className="z-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="bg-cyber-grid absolute inset-0" aria-hidden />
        <div
          className="animate-sweep absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        <Reveal>
          <ReadablePanel>
            <h2 className="text-gradient-heading text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
              {t("title")}
            </h2>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-zinc-300 md:text-lg">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>
          </ReadablePanel>
        </Reveal>
      </div>
    </Section>
  );
}
