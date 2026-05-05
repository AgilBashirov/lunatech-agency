import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { getServiceBySlug, type ServiceSlug } from "@/lib/services";

/**
 * Solution section — two-column on `lg+`, narrative left + GlassCard accent
 * right (spec §3.3). Narrative paragraph count and bullet count are both
 * registry-driven so per-service variation is contained to `services.ts`.
 *
 * The right-hand visual uses the existing `.portfolio-cover` decorative
 * scene — no marketing-supplied image hook in v1 (per spec §9 question 2).
 */
export async function ServiceSolution({ slug }: { slug: ServiceSlug }) {
  const definition = getServiceBySlug(slug);
  if (!definition) return null;

  const t = await getTranslations(`services.detail.${slug}.solution`);
  const paragraphCount = definition.counts.solutionParagraphs;
  const bulletCount = definition.counts.solutionBullets;

  const paragraphKeys = ["p1", "p2"].slice(0, paragraphCount) as Array<
    "p1" | "p2"
  >;
  const bulletKeys = ["b1", "b2", "b3", "b4", "b5"].slice(
    0,
    bulletCount,
  ) as Array<"b1" | "b2" | "b3" | "b4" | "b5">;

  return (
    <Section ariaLabelledBy="svc-solution-heading">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
        <Reveal className="lg:col-span-7">
          <span className="t-eyebrow">{t("eyebrow")}</span>
          <h2
            id="svc-solution-heading"
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
          <ul className="mt-6 space-y-3">
            {bulletKeys.map((k) => (
              <li
                key={k}
                className="flex gap-3 text-text-secondary"
              >
                <span
                  aria-hidden
                  className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--neon-cyan)]"
                />
                <span>{t(`bullets.${k}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-5">
          <GlassCard
            interactive={false}
            disableBackdropBlur
            className="aspect-[4/3] lg:aspect-[5/4] p-0 overflow-hidden"
          >
            <div className="portfolio-cover h-full w-full">
              <span className="pc-orb pc-orb--a" aria-hidden />
              <span className="pc-orb pc-orb--b" aria-hidden />
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </Section>
  );
}
