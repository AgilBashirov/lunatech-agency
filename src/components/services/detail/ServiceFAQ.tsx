import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

/**
 * FAQ — plain always-open Q/A list (spec §3.7). No accordion or `<details>`
 * — the codebase has no disclosure pattern and §8 forbids introducing one.
 * Items are separated by a hairline rule using the existing `--card-border`
 * token, with a tighter Reveal cadence (`i * 0.04`) than the card grids
 * because list items are denser than cards.
 */
export async function ServiceFAQ({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const t = await getTranslations(`services.detail.${slug}.faq`);
  const items = FAQ_KEYS.slice(0, definition.counts.faq);

  return (
    <Section ariaLabelledBy="svc-faq-heading">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <span className="t-eyebrow">{t("eyebrow")}</span>
          <h2
            id="svc-faq-heading"
            className="t-h2 mt-3 text-foreground"
          >
            {t("title")}
          </h2>
        </Reveal>
        <div className="mt-10">
          {items.map((key, i) => (
            // The divider sits OUTSIDE the per-item Reveal so it stays as a
            // static hairline rule instead of fading in with the next QA pair.
            <div key={key}>
              {i > 0 ? (
                <hr
                  className="my-8 border-0 border-t border-[color:var(--card-border)]"
                  aria-hidden
                />
              ) : null}
              <Reveal delay={i * 0.04}>
                <h3 className="t-h3 text-foreground">
                  {t(`items.${key}.q`)}
                </h3>
                <p className="t-body mt-3">{t(`items.${key}.a`)}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
