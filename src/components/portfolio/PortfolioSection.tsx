"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  CaseStudyModal,
  type ProjectKey,
} from "@/components/portfolio/CaseStudyModal";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

const PROJECT_KEYS: ProjectKey[] = [
  "project1",
  "project2",
  "project3",
  "project4",
  "project5",
  "project6",
];

export function PortfolioSection() {
  const t = useTranslations("portfolio");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ProjectKey | null>(null);
  const [lastProject, setLastProject] = useState<ProjectKey | null>(null);

  const displayProject = active ?? lastProject;

  const openProject = (key: ProjectKey) => {
    setActive(key);
    setLastProject(key);
    setOpen(true);
  };

  const onModalChange = (next: boolean) => {
    setOpen(next);
    if (!next) setActive(null);
  };

  return (
    <>
      <Section id="portfolio" className="z-10">
        <Reveal>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-3 text-zinc-400">{t("subtitle")}</p>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {PROJECT_KEYS.map((key, i) => (
            <Reveal key={key} delay={i * 0.06}>
              <button
                type="button"
                onClick={() => openProject(key)}
                className="group block w-full min-w-0 text-left touch-manipulation"
              >
                <div
                  className={cn(
                    "relative aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-purple-950/50 via-[#0b0f1a] to-cyan-950/30",
                    "shadow-[inset_0_0_60px_rgba(124,58,237,0.08)] transition-all duration-300",
                    "group-hover:border-purple-500/35 group-hover:shadow-[0_0_40px_rgba(124,58,237,0.25)]",
                  )}
                >
                  <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(34,211,238,0.15),transparent_55%)] opacity-80 transition-transform duration-500 group-hover:scale-105"
                    aria-hidden
                  />
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
                    {t(`${key}.tag`)}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05060a]/95 to-transparent p-3 pt-10 sm:p-4 sm:pt-12">
                    <p className="text-sm font-semibold text-white opacity-100 transition duration-300 sm:translate-y-1 sm:opacity-90 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      {t(`${key}.title`)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400 opacity-100 transition duration-300 sm:mt-1 sm:translate-y-1 sm:text-zinc-500 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      {t(`${key}.summary`)}
                    </p>
                  </div>
                </div>
                <span className="mt-3 inline-block font-mono text-[10px] uppercase tracking-wider text-cyan-400/70 transition group-hover:text-cyan-300">
                  {t("viewCase")} →
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </Section>
      <CaseStudyModal
        project={open ? displayProject : null}
        open={open}
        onOpenChange={onModalChange}
      />
    </>
  );
}
