"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import { AURA_DEMO_URLS, type PortfolioProjectKey } from "@/lib/portfolioDemos";
import { PortfolioCoverArt } from "./PortfolioCoverArt";

type Props = {
  projectKey: PortfolioProjectKey;
  index: number;
  /** Off in horizontal slider to avoid scroll/snap conflicts with entrance motion. */
  reveal?: boolean;
  /**
   * `carousel`: fixed card + media heights for the Selected Work carousel rail (no aspect-ratio growth).
   */
  variant?: "default" | "carousel";
};

export function PortfolioDemoCard({
  projectKey,
  index,
  reveal = true,
  variant = "default",
}: Props) {
  const t = useTranslations("portfolio");
  const coverLabel = t("coverAlt", { title: t(`${projectKey}.title`) });
  const href = AURA_DEMO_URLS[projectKey];
  const title = t(`${projectKey}.title`);

  const isCarousel = variant === "carousel";

  const card = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} — ${t("viewCase")}`}
      className={cn(
        "group flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[var(--card-bg)]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-shadow duration-300 hover:shadow-[0_0_48px_rgba(124,58,237,0.12)]",
        "touch-manipulation no-underline",
        isCarousel && "h-[448px] shrink-0",
      )}
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden bg-[#030308]",
          isCarousel ? "h-[228px] min-h-0" : "min-h-[200px] sm:min-h-0 sm:aspect-[16/10] xl:aspect-[2/1] xl:min-h-[220px]",
        )}
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

      <div
        className={cn(
          "flex min-h-0 flex-col gap-3 border-t border-white/[0.08] p-4 sm:gap-4 sm:p-5 md:p-5 lg:p-5",
          isCarousel && "flex-1",
        )}
      >
        <div className="min-h-0 min-w-0 flex-1">
          <h3
            className={cn(
              "text-base font-semibold tracking-tight text-white sm:text-lg",
              isCarousel && "line-clamp-2",
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-zinc-300",
              isCarousel && "line-clamp-3",
            )}
          >
            {t(`${projectKey}.summary`)}
          </p>
        </div>
        <span className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors group-hover:border-purple-400/35 group-hover:bg-white/10 sm:w-auto sm:self-start">
          {t("viewCase")} →
        </span>
      </div>
    </a>
  );

  if (!reveal) {
    return card;
  }

  return <Reveal delay={index * 0.06}>{card}</Reveal>;
}
