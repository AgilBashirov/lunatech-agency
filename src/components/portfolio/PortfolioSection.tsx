"use client";

import { useEffect, useState } from "react";
import {
  CaseStudyModal,
  type ProjectKey,
} from "@/components/portfolio/CaseStudyModal";
import { PortfolioCarousel } from "@/components/portfolio/PortfolioCarousel";
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
  const [isXl, setIsXl] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ProjectKey | null>(null);
  const [lastProject, setLastProject] = useState<ProjectKey | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsXl(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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
        {isXl ? (
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
        ) : (
          <PortfolioCarousel className="mt-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {PROJECT_KEYS.map((key, i) => (
              <PortfolioDemoCard
                key={key}
                projectKey={key}
                index={i}
                reveal={false}
                onOpenCase={openProject}
              />
            ))}
          </PortfolioCarousel>
        )}
      </Section>
      <CaseStudyModal
        project={open ? displayProject : null}
        open={open}
        onOpenChange={onModalChange}
      />
    </>
  );
}
