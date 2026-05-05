import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceContent } from "@/components/services/detail/ServiceContent";
import { ServiceSection } from "@/components/services/detail/ServiceSection";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

/**
 * "What We Do" — merges the old Problem + Solution sections into one prose
 * block (revised spec R5.2). Sources:
 *   - `problem.p1` → opening lede paragraph
 *   - `solution.p1` / `solution.p2` → body
 *   - `solution.bullets.b1..bN` → bullet list
 *
 * The right-column GlassCard from the old Solution section is dropped. The
 * additional `problem.p2` / `problem.p3` keys are intentionally orphaned —
 * marketing keeps them for SEO copy reuse, the simplified page does not
 * render them.
 *
 * Heading is sourced from `solution.title` per R5.7 — it already reads as a
 * "what we do"-style phrase in all three shipped locales, no new keys needed.
 *
 * Reveal: ONE wrapping the entire section content (R5.2). Stagger not used.
 */
const BULLET_KEYS = ["b1", "b2", "b3", "b4", "b5"] as const;

export async function WhatWeDoSection({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const tProblem = await getTranslations(`services.detail.${slug}.problem`);
  const tSolution = await getTranslations(`services.detail.${slug}.solution`);

  const bulletKeys = BULLET_KEYS.slice(
    0,
    definition.counts.solutionBullets,
  );
  const bullets = bulletKeys.map((key) => tSolution(`bullets.${key}`));

  // Solution body paragraphs are registry-driven (1 or 2 per spec §3.3).
  const paragraphCount = definition.counts.solutionParagraphs;
  const bodyParagraphs = (["p1", "p2"] as const)
    .slice(0, paragraphCount)
    .map((k) => tSolution(k));

  // Lede = problem.p1 (the framing) + body = solution.p1/p2 (the answer).
  const proseChildren = [tProblem("p1"), ...bodyParagraphs];

  return (
    <ServiceSection
      id="what-we-do"
      headingId="what-we-do"
      eyebrow={tSolution("eyebrow")}
      title={tSolution("title")}
      width="narrow"
    >
      <Reveal>
        <ServiceContent.Prose>{proseChildren}</ServiceContent.Prose>
        <ServiceContent.Bullets items={bullets} tone="cyan" className="mt-6" />
      </Reveal>
    </ServiceSection>
  );
}
