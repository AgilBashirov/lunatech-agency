"use client";

import { useState } from "react";
import {
  CaseStudyModal,
  type ProjectKey,
} from "@/components/portfolio/CaseStudyModal";
import { PortfolioDemoCard } from "@/components/portfolio/PortfolioDemoCard";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { useTranslations } from "next-intl";

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
      <Section
        id="portfolio"
        className="z-10"
        containerClassName="max-w-[min(100%,90rem)]"
      >
        <Reveal>
          <div className="text-center md:text-left">
            <h2 className="text-gradient-heading text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
              {t("title")}
            </h2>
            <p className="mt-3 max-w-3xl text-zinc-300 md:max-w-none">
              {t("subtitle")}
            </p>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-2 md:gap-6 xl:grid-cols-3 xl:gap-7">
          {PROJECT_KEYS.map((key, i) => (
            <PortfolioDemoCard
              key={key}
              projectKey={key}
              index={i}
              onOpenCase={openProject}
            />
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
