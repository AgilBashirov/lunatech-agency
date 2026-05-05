import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import {
  iconClass,
  iconWrapClass,
  iconWrapStyle,
} from "@/components/services/detail/iconChip";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

const BENEFIT_KEYS = ["i1", "i2", "i3", "i4"] as const;

/**
 * Benefits — icon-tile grid mirroring `Services.tsx` exactly (spec §3.6),
 * with `lg:grid-cols-4` because Benefits typically has 4 items. Tile count
 * is registry-driven so a 3-item service (rare) still aligns visually.
 */
export async function ServiceBenefits({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const Icon = definition.Icon;
  const t = await getTranslations(`services.detail.${slug}.benefits`);
  const items = BENEFIT_KEYS.slice(0, definition.counts.benefits);

  return (
    <Section ariaLabelledBy="svc-benefits-heading">
      <Reveal>
        <div className="text-center md:text-left">
          <span className="t-eyebrow">{t("eyebrow")}</span>
          <h2
            id="svc-benefits-heading"
            className="t-h2 mt-3 text-foreground"
          >
            {t("title")}
          </h2>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {items.map((key, i) => (
          <Reveal key={key} delay={i * 0.06}>
            <GlassCard className="h-full services-tile">
              <span
                className={iconWrapClass}
                style={iconWrapStyle}
                aria-hidden
              >
                <Icon className={iconClass} />
              </span>
              <h3 className="text-card-heading text-lg font-semibold leading-snug">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-tertiary">
                {t(`items.${key}.description`)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
