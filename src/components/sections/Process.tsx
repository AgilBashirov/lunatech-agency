import { getTranslations } from "next-intl/server";
import { Fragment } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ReadablePanel } from "@/components/ui/ReadablePanel";
import { Section } from "@/components/ui/Section";

export async function Process() {
  const t = await getTranslations("process");
  const steps = ["discover", "design", "build", "launch"] as const;

  return (
    <Section id="process" className="z-10">
      <div className="mx-auto w-full max-w-2xl">
        <Reveal>
          <ReadablePanel>
          <h2 className="text-gradient-heading text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
            {t("title")}
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-sm text-white/90 md:mt-10 md:text-base">
            {steps.map((key, i) => (
              <Fragment key={key}>
                {i > 0 ? (
                  <span
                    className="mx-1 text-zinc-500 transition-colors duration-300 ease-out select-none"
                    aria-hidden
                  >
                    →
                  </span>
                ) : null}
                <span className="rounded-md px-2 py-1 transition-colors duration-300 ease-out hover:bg-white/[0.06] hover:text-cyan-200/90">
                  {t(key)}
                </span>
              </Fragment>
            ))}
          </div>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            {t("subtitle")}
          </p>
        </ReadablePanel>
        </Reveal>
      </div>
    </Section>
  );
}
