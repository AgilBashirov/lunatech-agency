import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ReadablePanel } from "@/components/ui/ReadablePanel";
import { Section } from "@/components/ui/Section";

export async function Approach() {
  const t = await getTranslations("approach");

  return (
    <Section id="approach" className="z-10">
      <div className="mx-auto w-full max-w-2xl">
        <Reveal>
          <ReadablePanel>
          <h2 className="text-gradient-heading text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
            {t("title")}
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-zinc-300 md:mt-10 md:text-lg">
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
