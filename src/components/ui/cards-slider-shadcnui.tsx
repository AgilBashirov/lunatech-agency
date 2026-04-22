"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

const CARD_W = 320;
const GAP = 24;
const STEP = CARD_W + GAP;

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
      className="absolute top-1/2 z-40 inline-flex min-h-[52px] min-w-[52px] -translate-y-1/2 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-transparent p-3 transition-opacity hover:opacity-90 active:opacity-80"
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
  const [activeIndex, setActiveIndex] = useState(0);

  const count = cards.length;
  const showNav = count > 1;

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const tr = trackRef.current;
    if (!vp || !tr) return;
    const max = Math.max(0, tr.scrollWidth - vp.clientWidth);
    setMaxScroll(max);
    const pos = -x.get();
    if (pos > max) x.set(-max);
    if (pos < 0) x.set(0);
  }, [x]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    const vp = viewportRef.current;
    if (vp) ro.observe(vp);
    return () => ro.disconnect();
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
      const raw = index * STEP;
      return -Math.min(raw, maxScroll);
    },
    [maxScroll],
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
    const idx = Math.round(pos / STEP);
    const clamped = Math.max(0, Math.min(count - 1, idx));
    scrollToIndex(clamped);
  }, [count, maxScroll, scrollToIndex, showNav, x]);

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
    <div className="group/slider relative mx-auto w-full max-w-[min(100%,90rem)] px-4 py-6 sm:px-6 md:px-8">
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
        className="-mx-2 cursor-grab overflow-hidden px-2 py-4 active:cursor-grabbing sm:-mx-4 sm:px-4"
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
          className="flex gap-6"
        >
          {cards.map((card) => (
            <motion.div
              key={card.id}
              data-embla-slide=""
              className="h-[420px] min-w-[320px] max-w-[320px] shrink-0"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              {card.href ? (
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  className="block h-full min-h-0 touch-manipulation rounded-3xl text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`${card.title} — ${viewDetailsLabel}`}
                >
                  <CardContent
                    card={card}
                    viewDetailsLabel={viewDetailsLabel}
                    showHeroCta
                  />
                </a>
              ) : (
                <CardContent card={card} viewDetailsLabel={viewDetailsLabel} showHeroCta={false} />
              )}
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
  showHeroCta,
}: {
  card: CardsSliderCard;
  viewDetailsLabel: string;
  showHeroCta: boolean;
}) {
  return (
    <Card className="group/card relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border-border/50 bg-card/30 backdrop-blur-md transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
      <div className="relative h-48 shrink-0 overflow-hidden bg-[#030308]">
        {card.cover ? (
          <div className="h-full w-full [&_.portfolio-cover]:min-h-[12rem]">{card.cover}</div>
        ) : card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- demo Unsplash URLs; portfolio uses `cover` slot
          <img
            src={card.imageUrl}
            alt={card.title}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 transition-opacity duration-300 group-hover/card:opacity-40" />

        <div className="absolute left-4 top-4 z-[1]">
          <Badge
            variant="secondary"
            className="border-white/10 bg-background/50 px-3 py-1 text-xs font-medium backdrop-blur-md"
          >
            {card.category}
          </Badge>
        </div>

        {showHeroCta ? (
          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
            <motion.span
              aria-hidden
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/92 px-6 py-2.5 text-sm font-semibold text-black shadow-lg ring-1 ring-black/10"
            >
              {viewDetailsLabel}
            </motion.span>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-6">
        <div className="space-y-3">
          <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover/card:text-primary">
            {card.title}
          </h3>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
        </div>
      </div>
    </Card>
  );
}
