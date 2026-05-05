import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import {
  iconClass,
  iconWrapClass,
  iconWrapStyle,
} from "@/components/services/detail/iconChip";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

const USE_CASE_KEYS = ["uc1", "uc2", "uc3", "uc4", "uc5", "uc6"] as const;

/**
 * Use cases — `Services.tsx` tile grid pattern (spec §3.4).
 *
 * The i18n contract (spec §5) does not include a section eyebrow/title for
 * `useCases` — only per-tile `uc{n}` entries. We still need an `<h2>` for
 * the landmark (spec §7), so the heading is rendered visually-hidden using
 * the global `Metadata.title` brand label as a stable, locale-aware
 * fallback. If marketing later wants a visible heading they can extend the
 * contract; the structural component does not need to change.
 *
 * Icon: services.ts holds one `Icon` per service, so all use-case tiles
 * share that service's icon. Spec §3.4 lists the chip as "optional", so a
 * single-icon-per-service approach stays inside the contract.
 */
export async function ServiceUseCases({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const Icon = definition.Icon;
  const t = await getTranslations(`services.detail.${slug}.useCases`);
  const tNav = await getTranslations("nav");

  const items = USE_CASE_KEYS.slice(0, definition.counts.useCases);

  return (
    <Section ariaLabelledBy="svc-usecases-heading">
      <h2 id="svc-usecases-heading" className="sr-only">
        {tNav("services")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {items.map((key, i) => {
          const hasBadge = t.has(`${key}.badge`);
          return (
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
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-tertiary">
                  {t(`${key}.description`)}
                </p>
                {hasBadge ? (
                  <div className="mt-4">
                    <Badge variant="outline">{t(`${key}.badge`)}</Badge>
                  </div>
                ) : null}
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
