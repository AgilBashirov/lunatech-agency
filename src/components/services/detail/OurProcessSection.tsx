import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

/**
 * "Our Process" — renamed from `ServiceHowItWorks` (revised spec R5.4).
 * Reuses the canonical `ProcessTimeline` extracted from
 * `AgencyNarrativeSection`; the rail/node/mono-index design is content-first
 * by construction so it fits the simplified page without modification.
 *
 * Heading source: `howItWorks.title` (existing key) — preserves the
 * localised heading. The PO-suggested "Our Process" is the *intent*; the
 * actual rendered string is the localised value.
 *
 * Reveal: ONE around the section heading via ServiceSection's children
 * wrapper (here we wrap the whole section). Per-step stagger NOT used —
 * matches `AgencyNarrativeSection`.
 *
 * Heading id: `svc-howitworks-heading` preserved for backwards-compat.
 */
const STEP_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;

export async function OurProcessSection({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const t = await getTranslations(`services.detail.${slug}.howItWorks`);
  const stepKeys = STEP_KEYS.slice(0, definition.counts.howItWorksSteps);

  const steps = stepKeys.map((key) => ({
    key,
    label: t(`steps.${key}.label`),
    detail: t(`steps.${key}.detail`),
  }));

  const footnote = t.has("footnote") ? t("footnote") : undefined;

  return (
    <ServiceSection
      id="our-process"
      // Legacy id preserved for backwards-compat with e2e tests.
      headingId="howitworks"
      eyebrow={t("eyebrow")}
      title={t("title")}
      width="narrow"
    >
      <Reveal>
        <ProcessTimeline
          steps={steps}
          footnote={footnote}
          listLabel={t("title")}
        />
      </Reveal>
    </ServiceSection>
  );
}
