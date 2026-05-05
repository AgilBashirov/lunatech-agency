import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { Section } from "@/components/ui/Section";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

const STEP_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;

/**
 * How it works — vertical numbered timeline (spec §3.5). Reuses the canonical
 * `ProcessTimeline` extracted out of `AgencyNarrativeSection`, so the rail,
 * node, and index typography all match the home page byte-for-byte.
 */
export async function ServiceHowItWorks({ slug }: { slug: ServiceSlug }) {
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
    <Section
      id="how-it-works"
      ariaLabelledBy="svc-howitworks-heading"
    >
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <span className="t-eyebrow">{t("eyebrow")}</span>
          <h2
            id="svc-howitworks-heading"
            className="t-h2 mt-3 text-foreground"
          >
            {t("title")}
          </h2>
          <div className="mt-8">
            <ProcessTimeline
              steps={steps}
              footnote={footnote}
              listLabel={t("title")}
            />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
