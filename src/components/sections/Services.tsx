import { getTranslations } from "next-intl/server";
import {
  IconAI,
  IconBranding,
  IconDesign,
  IconMobile,
  IconMotion,
  IconWeb,
} from "@/components/services/ServiceIcons";
import { Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";

const items = [
  { key: "web" as const, Icon: IconWeb },
  { key: "mobile" as const, Icon: IconMobile },
  { key: "design" as const, Icon: IconDesign },
  { key: "ai" as const, Icon: IconAI },
  { key: "branding" as const, Icon: IconBranding },
  { key: "motion" as const, Icon: IconMotion },
];

export async function Services() {
  const t = await getTranslations("services");

  return (
    <Section id="services" className="z-10">
      <Reveal>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400 md:mx-0 md:mt-4">
            {t("subtitle")}
          </p>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {items.map(({ key, Icon }, i) => (
          <Reveal key={key} delay={i * 0.06}>
            <GlassCard className="h-full">
              <span
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#05060a]/60 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                aria-hidden
              >
                <Icon className="text-cyan-200/90" />
              </span>
              <h3 className="text-lg font-semibold text-white">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {t(`${key}.desc`)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
