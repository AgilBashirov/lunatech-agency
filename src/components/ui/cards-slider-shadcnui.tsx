"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type CardsSliderCard = {
  id: number;
  title: string;
  description: string;
  href?: string;
  /** Remote hero image (demo mode) */
  imageUrl?: string;
  /** Custom cover, e.g. `PortfolioCoverArt` */
  cover?: ReactNode;
  /** Optional small chip rendered over the cover (e.g. "Concept"). */
  badge?: string;
};

const DEMO_CARDS: CardsSliderCard[] = [
  {
    id: 1,
    title: "Liquid Motion",
    description:
      "Experience the fluid dynamics of modern web interactions with physics-based animations.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
  {
    id: 2,
    title: "Glassmorphism",
    description:
      "Blur the lines between layers with advanced backdrop filters and transparency effects.",
    imageUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  },
  {
    id: 3,
    title: "Dark Mode",
    description:
      "Easy on the eyes, elegant in appearance. A seamless transition to the dark side.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80",
  },
  {
    id: 4,
    title: "Micro-Interactions",
    description:
      "Delightful details that make the difference between good and great user experience.",
    imageUrl:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
  },
  {
    id: 5,
    title: "Responsive Layouts",
    description:
      "Fluid grids that adapt to any screen size, ensuring your content looks perfect everywhere.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
];

function BrandArrow({
  direction,
  gradId,
  id,
  ariaLabel,
  onPress,
  disabled = false,
  className,
}: {
  direction: "prev" | "next";
  gradId: string;
  id: string;
  ariaLabel: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      id={id}
      type="button"
      className={cn(
        "cs-arrow",
        isPrev ? "cs-arrow-prev" : "cs-arrow-next",
        "absolute top-1/2 z-40 -translate-y-1/2 touch-manipulation",
        "transition-opacity duration-300 ease-out motion-reduce:transition-none",
        disabled
          ? "pointer-events-none opacity-0"
          : "opacity-85 hover:opacity-100",
        className,
      )}
      style={{ [isPrev ? "left" : "right"]: "0.25rem" }}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onPress}
    >
      <svg
        className="block"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>
        <path
          d={isPrev ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
          stroke={`url(#${gradId})`}
          strokeWidth="2.0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Dot({
  index,
  active,
  label,
  onSelect,
}: {
  index: number;
  active: boolean;
  label: string;
  onSelect: (index: number) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={label}
      tabIndex={active ? 0 : -1}
      onClick={() => onSelect(index)}
      className={cn(
        "relative h-2 rounded-full transition-all duration-300 ease-out touch-manipulation",
        active
          ? "w-8 bg-[var(--neon-cyan)] shadow-[0_0_10px_rgba(34,211,238,0.45)]"
          : "w-2 bg-white/20 hover:bg-white/35 motion-reduce:transition-none",
      )}
    />
  );
}

export type ArrowVisibility = "always" | "tablet" | "desktop" | "never";

type CardsSliderProps = {
  cards?: CardsSliderCard[];
  /** When true, wraps seamlessly from the last card back to the first. */
  loop?: boolean;
  /** When true, advances automatically on a timer. */
  autoplay?: boolean;
  /** Milliseconds between autoplay advances. Defaults to 5000. */
  autoplayDelay?: number;
  /** Milliseconds to pause autoplay after user interaction. Defaults to 6000. */
  autoplayResumeDelay?: number;
  /** When arrows are shown. "desktop" = only at ≥1024px. */
  arrowsOn?: ArrowVisibility;
  /** Show pagination dots below the rail. Defaults true when count > 1. */
  showDots?: boolean;
  ariaScrollLeft?: string;
  ariaScrollRight?: string;
  ariaRegion?: string;
  ariaRoleDescription?: string;
  viewDetailsLabel?: string;
  /** Builds per-slide aria-label, e.g. `(current, total) => "Slide 2 of 6"`. */
  slideLabel?: (current: number, total: number) => string;
};

export function CardsSlider({
  cards: cardsProp,
  loop = false,
  autoplay = false,
  autoplayDelay = 5000,
  autoplayResumeDelay = 6000,
  arrowsOn = "always",
  showDots,
  ariaScrollLeft = "Scroll left",
  ariaScrollRight = "Scroll right",
  ariaRegion = "Carousel",
  ariaRoleDescription = "carousel",
  viewDetailsLabel = "View Details",
  slideLabel,
}: CardsSliderProps) {
  const cards = cardsProp ?? DEMO_CARDS;
  const count = cards.length;

  const uid = useId();
  const idBase = `cs${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const gradPrev = `${idBase}-gp`;
  const gradNext = `${idBase}-gn`;
  const prevBtnId = `selected-work-prev-${idBase}`;
  const nextBtnId = `selected-work-next-${idBase}`;

  // Direct Embla initialization via useRef + useEffect — avoids the
  // useEmblaCarousel hook's internal useState-as-ref pattern which doesn't
  // initialize reliably in React 19 (the state setter is called as a ref
  // callback, causing the viewport state to never be populated).
  const viewportRef = useRef<HTMLDivElement>(null);
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);

  // Stable autoplay plugin instance — recreated only when autoplayDelay changes.
  const autoplayRef = useRef<ReturnType<typeof Autoplay> | null>(null);
  if (autoplay && count > 1 && !autoplayRef.current) {
    autoplayRef.current = Autoplay({
      delay: Math.max(1500, autoplayDelay),
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    });
  }

  // Initialize Embla on mount using the stable viewportRef.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const plugins = autoplay && count > 1 && autoplayRef.current
      ? [autoplayRef.current]
      : [];

    const embla = EmblaCarousel(
      el,
      {
        loop: loop && count > 1,
        align: "start",
        watchDrag: count > 1,
      },
      plugins,
    );

    setEmblaApi(embla);
    return () => {
      embla.destroy();
      setEmblaApi(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — initialized once on mount; keyed by locale in parent

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(count > 1);

  // Sync React state from Embla after any scroll/reInit.
  useEffect(() => {
    if (!emblaApi) return;
    const viewport = viewportRef.current;

    const sync = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    const onScroll = () => { viewport?.setAttribute("data-animating", "true"); };
    const onSettle = () => { viewport?.removeAttribute("data-animating"); };
    const onPointerDown = () => { viewport?.setAttribute("data-dragging", "true"); };
    const onPointerUp = () => { viewport?.removeAttribute("data-dragging"); };

    sync();
    emblaApi
      .on("select", sync)
      .on("reInit", sync)
      .on("scroll", onScroll)
      .on("settle", onSettle)
      .on("pointerDown", onPointerDown)
      .on("pointerUp", onPointerUp);
    return () => {
      emblaApi
        .off("select", sync)
        .off("reInit", sync)
        .off("scroll", onScroll)
        .off("settle", onSettle)
        .off("pointerDown", onPointerDown)
        .off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  // After user swipe, restart autoplay after autoplayResumeDelay.
  useEffect(() => {
    if (!autoplay || !emblaApi || !autoplayRef.current) return;
    const plugin = autoplayRef.current;
    let tid: ReturnType<typeof setTimeout>;
    const resume = () => {
      clearTimeout(tid);
      tid = setTimeout(() => plugin.play(), autoplayResumeDelay);
    };
    emblaApi.on("pointerUp", resume);
    return () => {
      emblaApi.off("pointerUp", resume);
      clearTimeout(tid);
    };
  }, [autoplay, autoplayResumeDelay, emblaApi]);

  // Pause autoplay while the page is being scrolled (prevents spring jank).
  useEffect(() => {
    if (!autoplay || !autoplayRef.current) return;
    const plugin = autoplayRef.current;
    let tid: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      plugin.stop();
      clearTimeout(tid);
      tid = setTimeout(() => plugin.play(), 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(tid);
    };
  }, [autoplay]);

  // Pause autoplay when the browser tab is hidden.
  useEffect(() => {
    if (!autoplay || !autoplayRef.current) return;
    const plugin = autoplayRef.current;
    const apply = () => {
      if (document.hidden) plugin.stop();
      else plugin.play();
    };
    document.addEventListener("visibilitychange", apply);
    return () => document.removeEventListener("visibilitychange", apply);
  }, [autoplay]);

  const goPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const goNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const goTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (count <= 1) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(count - 1);
          break;
      }
    },
    [count, goPrev, goNext, goTo],
  );

  const showNav = count > 1;
  const dotsVisible = (showDots ?? true) && count > 1;

  const formatSlideLabel = useCallback(
    (current: number) =>
      slideLabel ? slideLabel(current, count) : `${current} / ${count}`,
    [count, slideLabel],
  );

  const arrowsWrapperClass =
    arrowsOn === "never"
      ? "hidden"
      : arrowsOn === "desktop"
        ? "hidden lg:contents"
        : arrowsOn === "tablet"
          ? "hidden sm:contents"
          : "contents";

  return (
    <div
      className="group/slider relative w-full px-3 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6 lg:px-12 xl:px-16"
    >
      {showNav ? (
        <div className={arrowsWrapperClass}>
          <BrandArrow
            direction="prev"
            gradId={gradPrev}
            id={prevBtnId}
            ariaLabel={ariaScrollLeft}
            onPress={goPrev}
            disabled={!canPrev}
          />
          <BrandArrow
            direction="next"
            gradId={gradNext}
            id={nextBtnId}
            ariaLabel={ariaScrollRight}
            onPress={goNext}
            disabled={!canNext}
          />
        </div>
      ) : null}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {formatSlideLabel(selectedIndex + 1)}
      </div>

      {/* Embla viewport — useRef is used here instead of the hook's setState-as-ref
          pattern, which doesn't initialize reliably under React 19. */}
      <div
        ref={viewportRef}
        className="cs-viewport relative overflow-hidden pb-10 pt-2 [touch-action:pan-y]"
        data-testid="selected-work-viewport"
        data-selected-snap={selectedIndex}
        tabIndex={showNav ? 0 : undefined}
        role="region"
        aria-roledescription={ariaRoleDescription}
        aria-label={ariaRegion}
        onKeyDown={onKeyDown}
      >
        {/* Embla container — translated by Embla to scroll slides. */}
        <div className="cs-rail">
          {cards.map((card, i) => (
            <div
              key={card.id}
              role="group"
              aria-roledescription="slide"
              aria-label={formatSlideLabel(i + 1)}
              aria-current={i === selectedIndex ? "true" : undefined}
              data-active={i === selectedIndex ? "true" : undefined}
              className="cs-card"
            >
              <CardContent
                card={card}
                viewDetailsLabel={viewDetailsLabel}
                ctaHref={card.href}
              />
            </div>
          ))}
        </div>
      </div>

      {dotsVisible ? (
        <div
          role="tablist"
          aria-label={ariaRegion}
          className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:mt-6 sm:gap-2"
        >
          {cards.map((_, i) => (
            <Dot
              key={i}
              index={i}
              active={i === selectedIndex}
              label={formatSlideLabel(i + 1)}
              onSelect={goTo}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CardContent({
  card,
  viewDetailsLabel,
  ctaHref,
}: {
  card: CardsSliderCard;
  viewDetailsLabel: string;
  ctaHref?: string;
}) {
  return (
    <Card
      className={cn(
        "group/card relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl",
        "border-border bg-card/95 text-card-foreground shadow-[0_2px_6px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]",
        "transition-[border-color,box-shadow] duration-500 ease-out",
        "hover:border-primary/35 hover:shadow-[0_4px_10px_rgba(0,0,0,0.4),0_0_0_1px_var(--glow-purple),0_0_28px_var(--glow-cyan),inset_0_1px_0_rgba(255,255,255,0.06)]",
      )}
    >
      <div className="relative aspect-video shrink-0 overflow-hidden bg-surface ring-1 ring-inset ring-white/[0.06]">
        <div
          className="cs-card-media h-full w-full [filter:grayscale(1)] [transition:filter_500ms_ease-out] [.cs-card:hover_&]:[filter:grayscale(0)]"
        >
          {card.cover ? (
            <div className="h-full w-full">{card.cover}</div>
          ) : card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- demo Unsplash URLs; portfolio uses `cover` slot
            <img
              src={card.imageUrl}
              alt={card.title}
              draggable={false}
              loading="lazy"
              decoding="async"
              className="pointer-events-none h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-background/40 to-transparent opacity-80 transition-opacity duration-300 group-hover/card:opacity-50"
          aria-hidden
        />
        {card.badge ? (
          <span
            className="pointer-events-none absolute left-3 top-3 z-[2] inline-flex items-center rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-text-secondary shadow-[0_2px_10px_rgba(0,0,0,0.45)] backdrop-blur-sm"
          >
            {card.badge}
          </span>
        ) : null}
      </div>

      {ctaHref ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 border-t border-white/[0.06] bg-[color-mix(in_oklab,var(--card-bg-inner)_88%,transparent)] px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3.5">
          <div className="min-h-0 space-y-1.5">
            <h3
              className="line-clamp-2 text-card-heading text-lg font-bold leading-snug tracking-tight sm:text-xl"
              title={card.title}
            >
              {card.title}
            </h3>
            <p
              className="line-clamp-2 text-xs leading-snug text-text-tertiary sm:text-sm sm:leading-relaxed"
              title={card.description}
            >
              {card.description}
            </p>
          </div>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className={cn(
              "group/btn mt-auto inline-flex h-9 w-fit max-w-full shrink cursor-pointer items-center gap-1.5 self-start rounded-full",
              "border border-white/[0.14] bg-white/[0.03] px-3.5 text-[0.75rem] font-medium leading-none tracking-wide text-text-secondary",
              "no-underline outline-none touch-manipulation select-none",
              "transition-[border-color,background-color,color,box-shadow] duration-300 ease-out",
              "hover:border-cyan-300/45 hover:bg-cyan-300/[0.05] hover:text-white hover:shadow-[0_0_14px_rgba(34,211,238,0.16)]",
              "active:scale-[0.97]",
            )}
            aria-label={`${card.title} — ${viewDetailsLabel}`}
          >
            {viewDetailsLabel}
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="shrink-0 opacity-75 transition-opacity duration-200 group-hover/btn:opacity-100"
            >
              <path d="M7 17L17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-white/[0.06] bg-[color-mix(in_oklab,var(--card-bg-inner)_88%,transparent)] px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3.5">
          <div className="min-h-0 space-y-1.5">
            <h3
              className="line-clamp-2 text-card-heading text-lg font-bold leading-snug tracking-tight sm:text-xl"
              title={card.title}
            >
              {card.title}
            </h3>
            <p
              className="line-clamp-2 text-xs leading-snug text-text-tertiary sm:text-sm sm:leading-relaxed"
              title={card.description}
            >
              {card.description}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
