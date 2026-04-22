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
import { cn } from "@/lib/cn";

const items = [
  {
    key: "webExperience" as const,
    Icon: IconWeb,
    iconClass:
      "text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.5)] sm:drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]",
    iconWrapClass:
      "border-cyan-400/25 bg-gradient-to-br from-cyan-500/25 via-[#05060a]/80 to-violet-600/20 shadow-[0_0_28px_rgba(34,211,238,0.2),0_0_40px_rgba(124,58,237,0.1),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
  },
  {
    key: "uiux" as const,
    Icon: IconDesign,
    iconClass:
      "text-violet-300 drop-shadow-[0_0_14px_rgba(167,139,250,0.45)] sm:drop-shadow-[0_0_18px_rgba(139,92,246,0.4)]",
    iconWrapClass:
      "border-violet-400/25 bg-gradient-to-br from-violet-500/25 via-[#05060a]/80 to-fuchsia-600/15 shadow-[0_0_28px_rgba(139,92,246,0.18),0_0_40px_rgba(244,114,182,0.08),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
  },
  {
    key: "strategy" as const,
    Icon: IconBranding,
    iconClass:
      "text-purple-300 drop-shadow-[0_0_14px_rgba(192,132,252,0.45)] sm:drop-shadow-[0_0_18px_rgba(168,85,247,0.4)]",
    iconWrapClass:
      "border-purple-400/25 bg-gradient-to-br from-purple-500/25 via-[#05060a]/80 to-cyan-600/12 shadow-[0_0_28px_rgba(168,85,247,0.18),0_0_40px_rgba(34,211,238,0.08),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
  },
  {
    key: "performance" as const,
    Icon: IconMotion,
    iconClass:
      "text-sky-300 drop-shadow-[0_0_14px_rgba(125,211,252,0.45)] sm:drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]",
    iconWrapClass:
      "border-sky-400/25 bg-gradient-to-br from-sky-500/22 via-[#05060a]/80 to-cyan-600/22 shadow-[0_0_28px_rgba(56,189,248,0.18),0_0_40px_rgba(34,211,238,0.12),inset_0_1px_0_0_rgba(255,255,255,0.1)]",
  },
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
          <p className="mx-auto mt-3 max-w-2xl text-slate-400 md:mx-0 md:mt-4">
            {t("subtitle")}
          </p>
        </div>
      </Reveal>
      <div
        id="services"
        className="mt-10 scroll-mt-28 grid gap-4 sm:mt-12 sm:scroll-mt-32 sm:grid-cols-2 sm:gap-5 md:scroll-mt-24 lg:grid-cols-4"
      >
        {items.map(({ key, Icon, iconClass, iconWrapClass }, i) => (
          <Reveal key={key} delay={i * 0.06}>
            <GlassCard className="h-full">
              <span
                className={cn(
                  "mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border sm:mb-6 sm:h-16 sm:w-16 sm:rounded-3xl",
                  iconWrapClass,
                )}
                aria-hidden
              >
                <Icon className={cn("h-8 w-8 sm:h-9 sm:w-9", iconClass)} />
              </span>
              <h3 className="text-card-heading text-lg font-semibold leading-snug">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 [text-shadow:0_1px_14px_rgba(0,0,0,0.35)]">
                {t(`${key}.desc`)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
