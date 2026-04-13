"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import type { ProjectKey } from "./CaseStudyModal";
import { PortfolioCoverArt } from "./PortfolioCoverArt";

type Props = {
  projectKey: ProjectKey;
  index: number;
  onOpenCase: (key: ProjectKey) => void;
  /** Grid: entrance animation. Carousel: off to avoid scroll/snap conflicts. */
  reveal?: boolean;
};

export function PortfolioDemoCard({
  projectKey,
  index,
  onOpenCase,
  reveal = true,
}: Props) {
  const t = useTranslations("portfolio");
  const coverLabel = t("coverAlt", { title: t(`${projectKey}.title`) });

  const card = (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-shadow duration-300 hover:shadow-[0_0_48px_rgba(124,58,237,0.12)]",
      )}
    >
        <div
          className="relative min-h-[200px] w-full overflow-hidden bg-[#030308] sm:min-h-0 sm:aspect-[16/10] xl:aspect-[2/1] xl:min-h-[220px]"
          style={{ isolation: "isolate" }}
        >
          <div className="absolute inset-0 origin-center transition-transform duration-700 ease-out group-hover:scale-[1.035]">
            <PortfolioCoverArt
              projectKey={projectKey}
              index={index}
              label={coverLabel}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05060a]/80 via-transparent to-[#05060a]/30"
            aria-hidden
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.08] p-4 sm:gap-4 sm:p-5 md:p-5 lg:p-5">
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">
              {t(`${projectKey}.title`)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {t(`${projectKey}.summary`)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenCase(projectKey)}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-purple-400/35 hover:bg-white/10 touch-manipulation sm:w-auto sm:self-start"
          >
            {t("viewCase")} →
          </button>
        </div>
      </article>
  );

  if (!reveal) {
    return card;
  }

  return <Reveal delay={index * 0.06}>{card}</Reveal>;
}
