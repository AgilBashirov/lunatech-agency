import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceContent } from "@/components/services/detail/ServiceContent";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

/**
 * "Why Choose Us" — renamed from `ServiceBenefits` (revised spec R5.5).
 *
 * Critical change vs the old §3.6: the icon-tile GlassCard 4-up grid is
 * dropped. The simplified page renders Benefits as the same plain
 * title/description rows as "Where It Fits". This is the largest chrome
 * reduction in the revision and the single biggest contributor to the "less
 * chrome" PO ask.
 *
 * Heading: H2 from `benefits.title` (existing key); per-row titles H3.
 *
 * Reveal: ONE around the section header.
 *
 * Heading id: `svc-benefits-heading` preserved for backwards-compat.
 */
const BENEFIT_KEYS = ["i1", "i2", "i3", "i4"] as const;

export async function WhyChooseUsSection({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const t = await getTranslations(`services.detail.${slug}.benefits`);
  const items = BENEFIT_KEYS.slice(0, definition.counts.benefits);

  const rows = items.map((key) => ({
    title: t(`items.${key}.title`),
    description: t(`items.${key}.description`),
  }));

  return (
    <ServiceSection
      id="why-choose-us"
      // Legacy id preserved for backwards-compat with e2e tests.
      headingId="benefits"
      eyebrow={t("eyebrow")}
      title={t("title")}
      width="wide"
    >
      <Reveal>
        <ServiceContent.List items={rows} />
      </Reveal>
    </ServiceSection>
  );
}
