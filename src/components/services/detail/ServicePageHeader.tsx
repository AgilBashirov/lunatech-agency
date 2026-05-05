import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import type { ServiceSlug } from "@/lib/services";

/**
 * Replaces the old gradient `ServiceHero` (revised spec R3.2). Title + 1-line
 * lede + eyebrow only — no CTAs in the header (the page CTA lives in the
 * "Ready to start?" section), no moon, no full-bleed visual, no gradient text.
 *
 * Backwards compat note: the H1 keeps `id="svc-hero-heading"` and the
 * containing Section keeps `ariaLabelledBy="svc-hero-heading"` so existing
 * e2e selectors that target the page H1 continue to work.
 *
 * Reveal: NOT used. The header is the first thing the user sees — fading it
 * in delays perceived TTFB. Static markup keeps framer-motion off the
 * above-the-fold critical path.
 */
type ServicePageHeaderProps = {
  slug: ServiceSlug;
};

export async function ServicePageHeader({ slug }: ServicePageHeaderProps) {
  const t = await getTranslations(`services.detail.${slug}.hero`);

  const eyebrow = t("eyebrow");
  const title = t("title");
  const lede = t("lede");

  return (
    <Section
      ariaLabelledBy="svc-hero-heading"
      // Override the default --gutter-section top padding so the header sits
      // close under the top BackToHomeButton (spec R3.2 / R5.1).
      className="!pt-[var(--space-2)] md:!pt-[var(--space-4)]"
    >
      <div className="max-w-3xl">
        <span className="t-eyebrow">{eyebrow}</span>
        <h1
          id="svc-hero-heading"
          className="t-h2 mt-3 text-foreground text-balance"
        >
          {title}
        </h1>
        <p className="mt-4 t-body text-text-secondary">{lede}</p>
      </div>
    </Section>
  );
}
