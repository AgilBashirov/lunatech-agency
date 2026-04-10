import { getTranslations } from "next-intl/server";
import {
  IconBranding,
  IconDesign,
  IconMotion,
  IconWeb,
} from "@/components/services/ServiceIcons";
import { Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";

const items = [
  { key: "webExperience" as const, Icon: IconWeb },
  { key: "uiux" as const, Icon: IconDesign },
  { key: "strategy" as const, Icon: IconBranding },
  { key: "performance" as const, Icon: IconMotion },
];

export async function Services() {
  const t = await getTranslations("services");

  return (
    <Section className="z-10" ariaLabelledBy="services-heading">
      <Reveal>
        <div className="text-center md:text-left">
          <h2
            id="services-heading"
            className="text-gradient-heading text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
          >
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-300 md:mx-0 md:mt-4">
            {t("subtitle")}
          </p>
        </div>
      </Reveal>
      <div
        id="services"
        className="mt-10 scroll-mt-28 grid gap-4 sm:mt-12 sm:scroll-mt-32 sm:grid-cols-2 sm:gap-5 md:scroll-mt-24 lg:grid-cols-4"
      >
        {items.map(({ key, Icon }, i) => (
          <Reveal key={key} delay={i * 0.06}>
            <GlassCard className="h-full">
              <span
                className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-[#05060a]/75 to-violet-600/25 shadow-[0_0_36px_rgba(34,211,238,0.22),0_0_48px_rgba(124,58,237,0.08),inset_0_1px_0_0_rgba(255,255,255,0.08)] sm:mb-6 sm:h-16 sm:w-16 sm:rounded-3xl"
                aria-hidden
              >
                <Icon className="h-8 w-8 text-cyan-50 drop-shadow-[0_0_14px_rgba(34,211,238,0.55)] sm:h-9 sm:w-9" />
              </span>
              <h3 className="text-lg font-semibold text-white">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                {t(`${key}.desc`)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
