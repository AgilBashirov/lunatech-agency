"use client";

import type { CSSProperties } from "react";
import type { PortfolioProjectKey } from "@/lib/portfolioDemos";

const ACCENT: Record<PortfolioProjectKey, { a: string; b: string }> = {
  project1: { a: "124, 58, 237", b: "34, 211, 238" },
  project2: { a: "59, 130, 246", b: "34, 211, 238" },
  project3: { a: "167, 139, 250", b: "45, 212, 191" },
  project4: { a: "34, 197, 94", b: "34, 211, 238" },
  project5: { a: "192, 132, 252", b: "244, 114, 182" },
  project6: { a: "244, 114, 182", b: "34, 211, 238" },
};

type Props = {
  projectKey: PortfolioProjectKey;
  index: number;
  label: string;
};

export function PortfolioCoverArt({ projectKey, index, label }: Props) {
  const { a, b } = ACCENT[projectKey];
  const delay = index * 0.7;
  const style = {
    "--pc-a": a,
    "--pc-b": b,
    "--pc-delay": `${delay}s`,
  } as CSSProperties;

  return (
    <div
      className="portfolio-cover"
      style={style}
      role="img"
      aria-label={label}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="pc-orb pc-orb--a" />
        <div className="pc-orb pc-orb--b" />
        <div className="pc-orbit-ring" />
        <div className="pc-grid-floor" />
        <div className="pc-stage">
          <div className="pc-device">
            <div className="pc-chrome" aria-hidden>
              <span className="pc-dot bg-red-500/50" />
              <span className="pc-dot bg-amber-400/40" />
              <span className="pc-dot bg-emerald-400/35" />
            </div>
            <div className="pc-screen">
              <div className="pc-screen-glow" />
              <div className="pc-scanline" />
              <div className="pc-ui-bars">
                <span className="pc-bar pc-bar--1" />
                <span className="pc-bar pc-bar--2" />
                <span className="pc-bar pc-bar--3" />
              </div>
            </div>
          </div>
        </div>
        <div className="pc-vignette" />
      </div>
    </div>
  );
}
