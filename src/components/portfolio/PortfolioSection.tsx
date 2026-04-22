"use client";

import { CardsSlider, type CardsSliderCard } from "@/components/ui/cards-slider-shadcnui";
import { PortfolioCoverArt } from "@/components/portfolio/PortfolioCoverArt";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { AURA_DEMO_URLS, type PortfolioProjectKey } from "@/lib/portfolioDemos";

const PROJECT_KEYS: PortfolioProjectKey[] = [
  "project1",
  "project2",
  "project3",
  "project4",
  "project5",
  "project6",
];

export function PortfolioSection() {
  const t = useTranslations("portfolio");
  const locale = useLocale();

  const cards: CardsSliderCard[] = useMemo(
    () =>
      PROJECT_KEYS.map((key, i) => ({
        id: i + 1,
        title: t(`${key}.title`),
        description: t(`${key}.summary`),
        href: AURA_DEMO_URLS[key],
        cover: (
          <PortfolioCoverArt
            projectKey={key}
            index={i}
            label={t("coverAlt", { title: t(`${key}.title`) })}
          />
        ),
      })),
    [t],
  );

  return (
    <Section id="portfolio" uncontained className="z-10 overflow-x-visible">
      <Container className="max-w-[min(100%,90rem)]">
        <Reveal>
          <div className="text-center">
            <h2 className="text-gradient-heading text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
              {t("title")}
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-slate-400">{t("subtitle")}</p>
          </div>
        </Reveal>
      </Container>
      <div className="relative mt-8 w-full min-w-0 overflow-x-visible pb-1">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(72vh,560px)] w-[min(118vw,1600px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(5,6,10,0.5)_0%,rgba(5,6,10,0.22)_45%,transparent_72%)]"
          aria-hidden
        />
        <div className="relative z-[1]">
          <CardsSlider
            key={locale}
            cards={cards}
            loop
            ariaScrollLeft={t("sliderPrev")}
            ariaScrollRight={t("sliderNext")}
            ariaRegion={t("sliderNavLabel")}
            ariaRoleDescription={t("sliderAriaCarouselRole")}
            viewDetailsLabel={t("viewCase")}
          />
        </div>
      </div>
    </Section>
  );
}
