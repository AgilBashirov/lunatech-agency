"use client";

import { CardsSlider, type CardsSliderCard } from "@/components/ui/cards-slider-shadcnui";
import { PortfolioCoverArt } from "@/components/portfolio/PortfolioCoverArt";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import type { PortfolioItem } from "@/lib/admin/types";
import { blobImageUrl } from "@/lib/admin/imageUrl";

type PortfolioSectionProps = {
  items: PortfolioItem[];
};

export function PortfolioSection({ items }: PortfolioSectionProps) {
  const t = useTranslations("portfolio");
  const locale = useLocale() as "az" | "en" | "ru";

  const cards: CardsSliderCard[] = useMemo(
    () =>
      items.map((item, i) => ({
        id: i + 1,
        title: item[locale].title,
        description: item[locale].summary,
        href: item.liveUrl || "#",
        badge: item.tags[0] || undefined,
        // Use uploaded cover image if available; fall back to generative art.
        ...(item.coverImage
          ? { imageUrl: blobImageUrl(item.coverImage) }
          : {
              cover: (
                <PortfolioCoverArt
                  index={i}
                  label={t("coverAlt", { title: item[locale].title })}
                />
              ),
            }),
      })),
    [items, locale, t],
  );

  return (
    <Section id="portfolio" uncontained className="z-10 overflow-x-visible">
      <Container className="max-w-[min(100%,90rem)]">
        <Reveal>
          <div className="text-center">
            <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">
              {t("title")}
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-text-tertiary">{t("subtitle")}</p>
          </div>
        </Reveal>
      </Container>

      {items.length === 0 ? (
        <Container className="max-w-[min(100%,90rem)] mt-10">
          <p className="text-center text-text-tertiary text-sm">
            {t("emptyPlaceholder")}
          </p>
        </Container>
      ) : (
        <div className="relative mt-10 w-full min-w-0 overflow-x-visible pb-1 sm:mt-12">
          {/*
            Soft focus veil — keeps the moon atmospheric without fighting the card
            row. Lower opacity + taller/narrower ellipse so the rail area is clear
            and the fade tapers smoothly into the surrounding section.
          */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(68vh,520px)] w-[min(108vw,1480px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(5,6,10,0.42)_0%,rgba(5,6,10,0.18)_50%,transparent_78%)]"
            aria-hidden
          />
          <div className="relative z-[1]">
            <CardsSlider
              key={locale}
              cards={cards}
              loop
              autoplay
              autoplayDelay={5000}
              autoplayResumeDelay={6000}
              arrowsOn="tablet"
              showDots
              ariaScrollLeft={t("sliderPrev")}
              ariaScrollRight={t("sliderNext")}
              ariaRegion={t("sliderNavLabel")}
              ariaRoleDescription={t("sliderAriaCarouselRole")}
              viewDetailsLabel={t("viewCase")}
              slideLabel={(current, total) =>
                t("sliderSlideLabel", { current, total })
              }
            />
          </div>
        </div>
      )}
    </Section>
  );
}
