"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { AURA_DEMO_URLS } from "@/lib/portfolioDemos";
import { cn } from "@/lib/cn";
import type { ProjectKey } from "./CaseStudyModal";
import { PortfolioCoverArt } from "./PortfolioCoverArt";

type Props = {
  projectKey: ProjectKey;
  index: number;
  onOpenCase: (key: ProjectKey) => void;
};

export function PortfolioDemoCard({ projectKey, index, onOpenCase }: Props) {
  const t = useTranslations("portfolio");
  const url = AURA_DEMO_URLS[projectKey];
  const coverLabel = t("coverAlt", { title: t(`${projectKey}.title`) });

  return (
    <Reveal delay={index * 0.06}>
      <article
        className={cn(
          "group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-shadow duration-300 hover:shadow-[0_0_48px_rgba(124,58,237,0.12)]",
        )}
      >
        <div
          className="relative w-full overflow-hidden bg-[#030308] sm:aspect-[2/1] sm:min-h-0 min-h-[240px] lg:aspect-[2.2/1] lg:min-h-[300px]"
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
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-3 z-[1] inline-flex min-h-9 items-center rounded-full border border-white/15 bg-[#05060a]/85 px-3 py-1.5 font-mono text-[9px] font-medium uppercase tracking-wider text-cyan-200/95 shadow-lg backdrop-blur-md transition-colors hover:border-cyan-400/40 hover:text-cyan-100 sm:text-[10px]"
          >
            {t("openSite")} ↗
          </a>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.08] p-5 sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-400/75">
                {t(`${projectKey}.tag`)}
              </span>
              <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
                {t(`${projectKey}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300 sm:text-base">
                {t(`${projectKey}.summary`)}
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-zinc-400">{t("previewHint")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenCase(projectKey)}
              className="inline-flex min-h-11 items-center rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-purple-400/35 hover:bg-white/10 touch-manipulation"
            >
              {t("viewCase")} →
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:border-cyan-300/50 hover:bg-cyan-400/15"
            >
              {t(`${projectKey}.demoLink`)} ↗
            </a>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
