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

/*
 * Wave 3 — service icon tiles unified to a single visual language. All tiles
 * now share the same accent (cyan), radius, border, and shadow stack. Hover
 * adds a single outer glow; resting state keeps an inner hairline highlight.
 * The icon SVG paths still differ — only the chrome unifies.
 */
const iconWrapClass =
  "services-icon-wrap mb-5 inline-flex h-14 w-14 items-center justify-center border border-white/[0.08] bg-[#05060a]/80 transition-shadow duration-300 ease-out sm:mb-6 sm:h-16 sm:w-16";

const iconWrapStyle = {
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-1), var(--shadow-inset-hairline)",
};

const iconClass = "h-8 w-8 text-[var(--neon-cyan)] sm:h-9 sm:w-9";

export async function Services() {
  const t = await getTranslations("services");

  return (
    <Section className="z-10" ariaLabelledBy="services-heading">
      <Reveal>
        <div className="text-center md:text-left">
          <span className="t-eyebrow">{t("title")}</span>
          <h2
            id="services-heading"
            className="mt-3 text-foreground text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
          >
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-tertiary md:mx-0 md:mt-4">
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
            <GlassCard className="h-full services-tile">
              <span className={iconWrapClass} style={iconWrapStyle} aria-hidden>
                <Icon className={iconClass} />
              </span>
              <h3 className="text-card-heading text-lg font-semibold leading-snug">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-tertiary [text-shadow:0_1px_14px_rgba(0,0,0,0.35)]">
                {t(`${key}.desc`)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
