"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/cn";
import { computeSlideWidthPx } from "@/components/portfolio/selectedWorkSlideWidth";
import styles from "./SelectedWorkSlider.module.css";

const SLIDE_W_CSS_VAR = "--selected-work-slide-w";

type Props = {
  className?: string;
  children: ReactNode;
};

function SideArrow({
  direction,
  gradId,
  ariaLabel,
  buttonId,
  onPress,
}: {
  direction: "prev" | "next";
  gradId: string;
  ariaLabel: string;
  buttonId: string;
  onPress: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      id={buttonId}
      type="button"
      className={cn(styles.sideNav, isPrev ? styles.sideNavPrev : styles.sideNavNext)}
      aria-label={ariaLabel}
      onClick={onPress}
    >
      <svg
        className={styles.sideNavSvg}
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {isPrev ? (
          <path
            d="M14 6l-6 6 6 6"
            stroke={`url(#${gradId})`}
            strokeWidth="2.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M10 6l6 6-6 6"
            stroke={`url(#${gradId})`}
            strokeWidth="2.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

export function SelectedWorkSlider({ className, children }: Props) {
  const uid = useId();
  const idBase = `u${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const gradPrevId = `${idBase}-arr-p`;
  const gradNextId = `${idBase}-arr-n`;
  const prevBtnId = `selected-work-prev-${idBase}`;
  const nextBtnId = `selected-work-next-${idBase}`;
  const dotsId = `selected-work-dots-${idBase}`;
  const locale = useLocale();
  const t = useTranslations("portfolio");
  const items = Children.toArray(children).filter(Boolean);
  const count = items.length;
  const showNav = count > 1;

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: 9600,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    [],
  );

  const plugins = useMemo(
    () => (showNav && !reduceMotion ? [autoplayPlugin] : []),
    [autoplayPlugin, reduceMotion, showNav],
  );

  const emblaOptions = useMemo(
    () => ({
      loop: showNav,
      align: "start" as const,
      slidesToScroll: 1,
      duration: reduceMotion ? 0 : 28,
      skipSnaps: false,
    }),
    [reduceMotion, showNav],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, plugins);
  const viewportNodeRef = useRef<HTMLDivElement | null>(null);

  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportNodeRef.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

  const applySlideWidthToViewport = useCallback(() => {
    const el = viewportNodeRef.current;
    if (!el) return;
    const w = computeSlideWidthPx(el.clientWidth);
    el.style.setProperty(SLIDE_W_CSS_VAR, `${w}px`);
  }, []);

  useLayoutEffect(() => {
    const el = viewportNodeRef.current;
    if (!el) return;

    const sync = () => {
      applySlideWidthToViewport();
      requestAnimationFrame(() => {
        emblaApi?.reInit();
      });
    };

    sync();

    const ro = new ResizeObserver(() => {
      sync();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [applySlideWidthToViewport, emblaApi]);

  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(0, true);
  }, [emblaApi, locale]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onViewportKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!showNav || !emblaApi) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        emblaApi.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        emblaApi.scrollNext();
      }
    },
    [emblaApi, showNav],
  );

  return (
    <div className={cn(styles.shell, className)}>
      <div className={styles.stage}>
        <div className={styles.trackWrap}>
          {showNav ? (
            <>
              <SideArrow
                direction="prev"
                gradId={gradPrevId}
                ariaLabel={t("sliderPrev")}
                buttonId={prevBtnId}
                onPress={scrollPrev}
              />
              <SideArrow
                direction="next"
                gradId={gradNextId}
                ariaLabel={t("sliderNext")}
                buttonId={nextBtnId}
                onPress={scrollNext}
              />
            </>
          ) : null}

          <div
            key={reduceMotion ? "rm" : "mo"}
            ref={setViewportRef}
            className={styles.viewport}
            data-testid="selected-work-viewport"
            data-selected-snap={selected}
            data-loop={showNav ? "true" : "false"}
            data-slide-count={count}
            tabIndex={showNav ? 0 : undefined}
            role="region"
            aria-roledescription={t("sliderAriaCarouselRole")}
            aria-label={t("sliderNavLabel")}
            onKeyDown={onViewportKeyDown}
          >
            <div className={styles.container}>
              {items.map((child, slideIndex) => {
                const baseKey = isValidElement(child)
                  ? child.key ?? `slide-${slideIndex}`
                  : `slide-${slideIndex}`;
                const slide = isValidElement(child)
                  ? cloneElement(child as ReactElement<{ variant?: "default" | "carousel" }>, {
                      variant: "carousel",
                    })
                  : child;
                const isActive = slideIndex === selected;
                return (
                  <div
                    key={String(baseKey)}
                    className={styles.slide}
                    data-embla-slide=""
                    aria-hidden={showNav ? !isActive : undefined}
                  >
                    <div className={styles.slideInner}>
                      <span className={styles.visuallyHidden}>
                        {t("sliderSlideLabel", {
                          current: slideIndex + 1,
                          total: count,
                        })}
                      </span>
                      {slide}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {showNav ? (
            <div id={dotsId} className={styles.dots} role="group" aria-label={t("sliderDotsLabel")}>
              {Array.from({ length: count }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(styles.dot, selected === i && styles.dotActive)}
                  aria-label={t("sliderGoTo", { index: String(i + 1) })}
                  aria-pressed={selected === i}
                  onClick={() => emblaApi?.scrollTo(i)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
