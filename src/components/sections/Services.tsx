import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import {
  iconClass,
  iconWrapClass,
  iconWrapStyle,
} from "@/components/services/detail/iconChip";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { services } from "@/lib/services";

// Source the home-grid items directly from the canonical service registry so
// adding/removing a service in one place updates the home grid, the detail
// routes, and the sitemap together. Order is `services[].order`.
const items = services
  .slice()
  .sort((a, b) => a.order - b.order)
  .map(({ homeKey, slug, Icon }) => ({ key: homeKey, slug, Icon }));

/*
 * Wave 3 — service icon tiles unified to a single visual language. The chip
 * chrome (size, border, radius, shadow, accent) lives in
 * `@/components/services/detail/iconChip` so the home grid and the per-service
 * detail page tiles stay byte-for-byte identical. The icon SVG paths still
 * differ — only the chrome unifies.
 */

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
        {items.map(({ key, slug, Icon }, i) => (
          <Reveal key={key} delay={i * 0.06}>
            {/* Wrap the existing GlassCard in a locale-aware Link so the tile
                navigates to /[locale]/services/[slug]. The card chrome,
                hover, and stagger are unchanged — Link is `display: contents`
                via the `block h-full` so the tile fills the grid cell
                identically to the previous (un-linked) markup. */}
            <Link
              href={`/services/${slug}`}
              className="block h-full"
              aria-label={t(`${key}.title`)}
            >
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
                <p className="mt-2 text-sm leading-relaxed text-text-tertiary [text-shadow:0_1px_14px_rgba(0,0,0,0.35)]">
                  {t(`${key}.desc`)}
                </p>
              </GlassCard>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
