"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { animate, motion, useMotionValue } from "framer-motion";
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
  category: string;
  href?: string;
  /** Remote hero image (demo mode) */
  imageUrl?: string;
  /** Custom cover, e.g. `PortfolioCoverArt` */
  cover?: ReactNode;
};

const DEMO_CARDS: CardsSliderCard[] = [
  {
    id: 1,
    title: "Liquid Motion",
    description:
      "Experience the fluid dynamics of modern web interactions with physics-based animations.",
    category: "Animation",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
  {
    id: 2,
    title: "Glassmorphism",
    description:
      "Blur the lines between layers with advanced backdrop filters and transparency effects.",
    category: "Design",
    imageUrl:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  },
  {
    id: 3,
    title: "Dark Mode",
    description:
      "Easy on the eyes, elegant in appearance. A seamless transition to the dark side.",
    category: "Theme",
    imageUrl:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80",
  },
  {
    id: 4,
    title: "Micro-Interactions",
    description:
      "Delightful details that make the difference between good and great user experience.",
    category: "UX",
    imageUrl:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
  },
  {
    id: 5,
    title: "Responsive Layouts",
    description:
      "Fluid grids that adapt to any screen size, ensuring your content looks perfect everywhere.",
    category: "Layout",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
];

/** Fallback step (px) before first layout measure. */
const FALLBACK_SLIDE_STEP = 344;

function BrandArrow({
  direction,
  gradId,
  id,
  ariaLabel,
  onPress,
}: {
  direction: "prev" | "next";
  gradId: string;
  id: string;
  ariaLabel: string;
  onPress: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      id={id}
      type="button"
      className="absolute top-1/2 z-40 inline-flex min-h-[52px] min-w-[52px] origin-center -translate-y-1/2 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-transparent p-3 transition-[transform,opacity] duration-300 ease-out hover:scale-110 hover:opacity-100 active:scale-100 active:opacity-90 motion-reduce:transition-none motion-reduce:hover:scale-100"
      style={{ [isPrev ? "left" : "right"]: "0.05rem" }}
      aria-label={ariaLabel}
      onClick={onPress}
    >
      <svg
        className="block"
        width="42"
        height="42"
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
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M10 6l6 6-6 6"
            stroke={`url(#${gradId})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

type CardsSliderProps = {
  cards?: CardsSliderCard[];
  /** When true, last → first / first → last and `data-loop="true"` for tests. */
  loop?: boolean;
  /** Match portfolio SelectedWorkSlider chrome (labels from next-intl). */
  ariaScrollLeft?: string;
  ariaScrollRight?: string;
  ariaRegion?: string;
  ariaRoleDescription?: string;
  viewDetailsLabel?: string;
};

export function CardsSlider({
  cards: cardsProp,
  loop = false,
  ariaScrollLeft = "Scroll left",
  ariaScrollRight = "Scroll right",
  ariaRegion = "Carousel",
  ariaRoleDescription = "carousel",
  viewDetailsLabel = "View Details",
}: CardsSliderProps) {
  const cards = cardsProp ?? DEMO_CARDS;
  const uid = useId();
  const idBase = `cs${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const gradPrev = `${idBase}-gp`;
  const gradNext = `${idBase}-gn`;
  const prevBtnId = `selected-work-prev-${idBase}`;
  const nextBtnId = `selected-work-next-${idBase}`;

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [slideStep, setSlideStep] = useState(FALLBACK_SLIDE_STEP);
  const [activeIndex, setActiveIndex] = useState(0);

  const count = cards.length;
  const showNav = count > 1;

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const tr = trackRef.current;
    if (!vp || !tr) return;
    const slides = tr.querySelectorAll("[data-embla-slide]");
    let step = FALLBACK_SLIDE_STEP;
    if (slides.length >= 2) {
      const a = slides[0] as HTMLElement;
      const b = slides[1] as HTMLElement;
      step = Math.max(1, Math.round(b.offsetLeft - a.offsetLeft));
    } else if (slides.length === 1) {
      const one = slides[0] as HTMLElement;
      step = Math.max(1, Math.round(one.getBoundingClientRect().width + 16));
    }
    setSlideStep(step);

    const max = Math.max(0, tr.scrollWidth - vp.clientWidth);
    setMaxScroll(max);
    const pos = -x.get();
    if (pos > max) x.set(-max);
    if (pos < 0) x.set(0);
  }, [x]);

  useEffect(() => {
    const initial = requestAnimationFrame(() => {
      measure();
    });
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    const vp = viewportRef.current;
    const tr = trackRef.current;
    if (vp) ro.observe(vp);
    if (tr) ro.observe(tr);
    return () => {
      cancelAnimationFrame(initial);
      ro.disconnect();
    };
  }, [cards, measure]);

  useEffect(() => {
    x.set(0);
    const id = requestAnimationFrame(() => {
      setActiveIndex(0);
    });
    return () => cancelAnimationFrame(id);
  }, [cards.length, x]);

  const snapX = useCallback(
    (index: number) => {
      const raw = index * slideStep;
      return -Math.min(raw, maxScroll);
    },
    [maxScroll, slideStep],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(count - 1, index));
      setActiveIndex(clamped);
      animate(x, snapX(clamped), {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
      });
    },
    [count, snapX, x],
  );

  const goNext = useCallback(() => {
    if (!showNav) return;
    setActiveIndex((prev) => {
      const n = loop ? (prev + 1) % count : Math.min(prev + 1, count - 1);
      void animate(x, snapX(n), {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
      });
      return n;
    });
  }, [count, loop, showNav, snapX, x]);

  const goPrev = useCallback(() => {
    if (!showNav) return;
    setActiveIndex((prev) => {
      const n = loop ? (prev - 1 + count) % count : Math.max(prev - 1, 0);
      void animate(x, snapX(n), {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
      });
      return n;
    });
  }, [count, loop, showNav, snapX, x]);

  const scrollTo = useCallback(
    (dir: "left" | "right") => {
      if (dir === "left") goPrev();
      else goNext();
    },
    [goNext, goPrev],
  );

  const onDragEndSnap = useCallback(() => {
    if (!showNav || maxScroll <= 0) return;
    const pos = -x.get();
    const idx = Math.round(pos / slideStep);
    const clamped = Math.max(0, Math.min(count - 1, idx));
    scrollToIndex(clamped);
  }, [count, maxScroll, scrollToIndex, showNav, slideStep, x]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!showNav) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goNext, goPrev, showNav],
  );

  return (
    <div className="group/slider relative mx-auto w-full max-w-[min(100%,90rem)] px-3 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6">
      {showNav ? (
        <>
          <BrandArrow
            direction="prev"
            gradId={gradPrev}
            id={prevBtnId}
            ariaLabel={ariaScrollLeft}
            onPress={() => scrollTo("left")}
          />
          <BrandArrow
            direction="next"
            gradId={gradNext}
            id={nextBtnId}
            ariaLabel={ariaScrollRight}
            onPress={() => scrollTo("right")}
          />
        </>
      ) : null}

      <div
        ref={viewportRef}
        className="-mx-1 cursor-grab overflow-hidden px-1 py-3 active:cursor-grabbing sm:-mx-3 sm:px-3 sm:py-4 md:-mx-4 md:px-4"
        data-testid="selected-work-viewport"
        data-selected-snap={activeIndex}
        data-loop={loop ? "true" : "false"}
        data-slide-count={count}
        tabIndex={showNav ? 0 : undefined}
        role="region"
        aria-roledescription={ariaRoleDescription}
        aria-label={ariaRegion}
        onKeyDown={onKeyDown}
      >
        <motion.div
          ref={trackRef}
          drag={showNav && maxScroll > 0 ? "x" : false}
          dragConstraints={{ left: -maxScroll, right: 0 }}
          dragElastic={0.1}
          dragMomentum
          style={{ x }}
          onDragEnd={onDragEndSnap}
          className="flex gap-4 sm:gap-6"
        >
          {cards.map((card) => (
            <motion.div
              key={card.id}
              data-embla-slide=""
              className="h-[clamp(17.25rem,52vw,23.75rem)] w-[min(20rem,calc(100vw-2.25rem))] min-w-[min(20rem,calc(100vw-2.25rem))] max-w-[min(20rem,calc(100vw-2.25rem))] shrink-0 md:h-[380px] md:w-[320px] md:min-w-[320px] md:max-w-[320px]"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <CardContent
                card={card}
                viewDetailsLabel={viewDetailsLabel}
                ctaHref={card.href}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
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
        "border-border bg-card/95 text-card-foreground shadow-[0_14px_44px_-18px_rgba(0,0,0,0.75)]",
        "backdrop-blur-md transition-[border-color,box-shadow] duration-500 ease-out",
        "hover:border-primary/35 hover:shadow-[0_20px_50px_-14px_rgba(0,0,0,0.65),0_0_0_1px_var(--glow-purple),0_0_36px_var(--glow-cyan)]",
      )}
    >
      <div className="relative h-40 shrink-0 overflow-hidden bg-surface ring-1 ring-inset ring-white/[0.06] sm:h-44">
        {card.cover ? (
          <div className="h-full w-full [&_.portfolio-cover]:min-h-[10rem] sm:[&_.portfolio-cover]:min-h-[11rem]">
            {card.cover}
          </div>
        ) : card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- demo Unsplash URLs; portfolio uses `cover` slot
          <img
            src={card.imageUrl}
            alt={card.title}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
          />
        ) : null}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-background/55 to-transparent opacity-70 transition-opacity duration-300 group-hover/card:opacity-55"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,rgba(124,58,237,0.12),transparent_55%)]"
          aria-hidden
        />

        <div className="absolute left-4 top-4 z-[1]">
          <Badge
            variant="outline"
            className="border-primary/30 bg-background/55 px-3 py-1 text-xs font-medium text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md"
          >
            {card.category}
          </Badge>
        </div>
      </div>

      {ctaHref ? (
        <motion.a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          whileTap={{ scale: 0.995 }}
          className={cn(
            "group/link flex min-h-0 flex-1 flex-col gap-2 border-t border-white/[0.06]",
            "bg-[color-mix(in_oklab,var(--card-bg-inner)_88%,transparent)]",
            "px-4 pb-4 pt-3 text-left text-inherit no-underline outline-none sm:px-5 sm:pb-5 sm:pt-3.5",
            "touch-manipulation transition-[background-color] duration-200",
            "hover:bg-[color-mix(in_oklab,var(--card-bg-inner)_96%,white)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#22d3ee]/80",
          )}
          aria-label={`${card.title} — ${viewDetailsLabel}`}
        >
          <h3 className="text-gradient-heading text-lg font-bold leading-snug tracking-tight sm:text-xl">
            {card.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">
            {card.description}
          </p>
          <span className="mt-auto flex items-center gap-1.5 pt-0.5 text-xs font-semibold tracking-wide text-cyan-300/95 sm:text-sm">
            {viewDetailsLabel}
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 group-hover/link:translate-x-0.5"
            >
              →
            </span>
          </span>
        </motion.a>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-white/[0.06] bg-[color-mix(in_oklab,var(--card-bg-inner)_88%,transparent)] px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3.5">
          <div className="min-h-0 space-y-1.5">
            <h3 className="text-gradient-heading text-lg font-bold leading-snug tracking-tight sm:text-xl">
              {card.title}
            </h3>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
