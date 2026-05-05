import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

/**
 * Problem section — single-column quiet narrative (spec §3.2).
 *
 * Paragraph count is registry-driven (`counts.problemParagraphs`); the i18n
 * contract uses fixed keys `p1` / `p2` / `p3`, only as many as the registry
 * declares get rendered. Missing keys are not probed because the registry is
 * the source of truth for which paragraphs exist.
 */
export async function ServiceProblem({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const t = await getTranslations(`services.detail.${slug}.problem`);
  const count = definition.counts.problemParagraphs;
  const paragraphKeys = ["p1", "p2", "p3"].slice(0, count) as Array<
    "p1" | "p2" | "p3"
  >;

  return (
    <Section ariaLabelledBy="svc-problem-heading">
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <span className="t-eyebrow">{t("eyebrow")}</span>
          <h2
            id="svc-problem-heading"
            className="t-h2 mt-3 text-foreground"
          >
            {t("title")}
          </h2>
          <div className="mt-6 space-y-4">
            {paragraphKeys.map((k) => (
              <p key={k} className="t-body">
                {t(k)}
              </p>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
