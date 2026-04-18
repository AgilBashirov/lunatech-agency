"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import styles from "./AgencyNarrativeSection.module.css";

const BLOCK_COUNT = 3;
const SENTINEL_IDS = [
  "narrative-sentinel-0",
  "narrative-sentinel-1",
  "narrative-sentinel-2",
] as const;

const PROCESS_STEPS = ["discover", "design", "build", "launch"] as const;

const IO_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

function useDesktopScrollActiveIndex() {
  const [active, setActive] = useState(0);
  const ratiosRef = useRef<number[]>([0, 0, 0]);
  const rafRef = useRef<number | null>(null);
  const sentinelElsRef = useRef<(HTMLElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const attachRafRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    const ratios = ratiosRef.current;
    let bestIdx = 0;
    let best = ratios[0] ?? 0;
    for (let i = 1; i < BLOCK_COUNT; i++) {
      const v = ratios[i] ?? 0;
      if (v > best) {
        best = v;
        bestIdx = i;
      }
    }
    if (best < 0.02) {
      return;
    }
    setActive((prev) => (prev === bestIdx ? prev : bestIdx));
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafRef.current != null) {
      return;
    }
    rafRef.current = window.requestAnimationFrame(flush);
  }, [flush]);

  const detachObserver = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const attachObserver = useCallback(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) {
      detachObserver();
      return;
    }
    const nodes = sentinelElsRef.current.filter(Boolean) as HTMLElement[];
    if (nodes.length !== BLOCK_COUNT) {
      return;
    }
    detachObserver();
    ratiosRef.current = [0, 0, 0];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.narrativeIndex);
          if (!Number.isFinite(idx) || idx < 0 || idx >= BLOCK_COUNT) {
            continue;
          }
          ratiosRef.current[idx] = entry.intersectionRatio;
        }
        scheduleFlush();
      },
      {
        threshold: IO_THRESHOLDS,
        root: null,
        rootMargin: "-40% 0px -40% 0px",
      },
    );
    for (const el of nodes) {
      observer.observe(el);
    }
    observerRef.current = observer;
    scheduleFlush();
  }, [detachObserver, scheduleFlush]);

  const scheduleAttach = useCallback(() => {
    if (attachRafRef.current != null) {
      cancelAnimationFrame(attachRafRef.current);
    }
    attachRafRef.current = requestAnimationFrame(() => {
      attachRafRef.current = null;
      attachObserver();
    });
  }, [attachObserver]);

  const registerSentinel = useCallback(
    (index: number, el: HTMLElement | null) => {
      sentinelElsRef.current[index] = el;
      scheduleAttach();
    },
    [scheduleAttach],
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = () => {
      scheduleAttach();
    };
    mq.addEventListener("change", onMq);
    scheduleAttach();
    return () => {
      mq.removeEventListener("change", onMq);
      detachObserver();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (attachRafRef.current != null) {
        cancelAnimationFrame(attachRafRef.current);
      }
    };
  }, [detachObserver, scheduleAttach]);

  return { active, setActive, registerSentinel } as const;
}

function NarrativeProse({
  title,
  paragraphs,
}: {
  title: string;
  paragraphs: readonly string[];
}) {
  return (
    <>
      <h3 className={styles.panelTitle}>{title}</h3>
      <div className={styles.panelBody}>
        {paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </>
  );
}

function NarrativeProcess({
  title,
  stepLabels,
  subtitle,
}: {
  title: string;
  stepLabels: readonly string[];
  subtitle: string;
}) {
  return (
    <>
      <h3 className={styles.panelTitle}>{title}</h3>
      <ol className={styles.timeline}>
        {stepLabels.map((label, i) => (
          <li key={PROCESS_STEPS[i]} className={styles.timelineItem}>
            <div className={styles.timelineRail} aria-hidden>
              <span className={styles.timelineNode} />
            </div>
            <div className={styles.timelineMain}>
              <div className={styles.timelineRow}>
                <span className={styles.timelineStepIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.timelineStepLabel}>{label}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.timelineFootnote}>{subtitle}</p>
    </>
  );
}

function DesktopPanelBody({
  index,
  aboutT,
  approachT,
  processT,
}: {
  index: number;
  aboutT: (key: string) => string;
  approachT: (key: string) => string;
  processT: (key: string) => string;
}) {
  if (index === 0) {
    return (
      <NarrativeProse
        title={aboutT("title")}
        paragraphs={[aboutT("p1"), aboutT("p2"), aboutT("p3")]}
      />
    );
  }
  if (index === 1) {
    return (
      <NarrativeProse
        title={approachT("title")}
        paragraphs={[approachT("p1"), approachT("p2"), approachT("p3")]}
      />
    );
  }
  return (
    <NarrativeProcess
      title={processT("title")}
      stepLabels={PROCESS_STEPS.map((k) => processT(k))}
      subtitle={processT("subtitle")}
    />
  );
}

function MobileAccordionBody({
  index,
  aboutT,
  approachT,
  processT,
}: {
  index: number;
  aboutT: (key: string) => string;
  approachT: (key: string) => string;
  processT: (key: string) => string;
}) {
  return (
    <div className={styles.accBodyReveal}>
      {index === 0 ? (
        <div className={styles.accBody}>
          <p>{aboutT("p1")}</p>
          <p>{aboutT("p2")}</p>
          <p>{aboutT("p3")}</p>
        </div>
      ) : null}
      {index === 1 ? (
        <div className={styles.accBody}>
          <p>{approachT("p1")}</p>
          <p>{approachT("p2")}</p>
          <p>{approachT("p3")}</p>
        </div>
      ) : null}
      {index === 2 ? (
        <div className={styles.accBody}>
          <ol className={styles.timeline} aria-label={processT("title")}>
            {PROCESS_STEPS.map((k, i) => (
              <li key={k} className={styles.timelineItem}>
                <div className={styles.timelineRail} aria-hidden>
                  <span className={styles.timelineNode} />
                </div>
                <div className={styles.timelineMain}>
                  <div className={styles.timelineRow}>
                    <span className={styles.timelineStepIndex}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.timelineStepLabel}>{processT(k)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.timelineFootnote}>{processT("subtitle")}</p>
        </div>
      ) : null}
    </div>
  );
}

export function AgencyNarrativeSection() {
  const uid = useId();
  const aboutT = useTranslations("about");
  const approachT = useTranslations("approach");
  const processT = useTranslations("process");

  const navTitles = [aboutT("title"), approachT("title"), processT("title")] as const;
  const landmarkLabel = `${navTitles[0]} · ${navTitles[1]} · ${navTitles[2]}`;

  const { active, setActive, registerSentinel } = useDesktopScrollActiveIndex();
  const [mobileOpen, setMobileOpen] = useState(0);

  const onRailClick = useCallback((index: number) => {
    setActive(index);
  }, [setActive]);

  return (
    <section
      id="about"
      className={styles.section}
      aria-labelledby={`${uid}-landmark`}
    >
      <Container>
        <h2 id={`${uid}-landmark`} className="sr-only">
          {landmarkLabel}
        </h2>

        <div className={styles.intro} aria-hidden>
          <div className={styles.introRule} />
        </div>

        {/* Mobile: single-expand accordion */}
        <div className={styles.mobileOnly}>
          {[0, 1, 2].map((i) => {
            const open = mobileOpen === i;
            const headId = `${uid}-acc-h-${i}`;
            const panelId = `${uid}-acc-p-${i}`;
            return (
              <div
                key={i}
                className={cn(styles.accItem, open && styles.accItemOpen)}
              >
                <button
                  type="button"
                  id={headId}
                  className={cn(styles.accTrigger, open && styles.accTriggerOpen)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setMobileOpen(open ? -1 : i)}
                >
                  <span className={styles.accIcon} aria-hidden>
                    <span className={styles.accIconGlyph}>
                      <span className={styles.accIconBarH} />
                      <span
                        className={cn(
                          styles.accIconBarV,
                          open && styles.accIconBarVCollapsed,
                        )}
                      />
                    </span>
                  </span>
                  <span className={styles.accHead}>
                    <span
                      className={cn(styles.accTitle, open && styles.accTitleOpen)}
                    >
                      {navTitles[i]}
                    </span>
                  </span>
                </button>
                <div
                  className={cn(styles.accExpand, open && styles.accExpandOpen)}
                >
                  <div className={styles.accExpandInner}>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={headId}
                      className={styles.accPanel}
                      {...(!open ? { inert: true } : {})}
                    >
                      <MobileAccordionBody
                        index={i}
                        aboutT={aboutT}
                        approachT={approachT}
                        processT={processT}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: sticky rail + scroll-synced panel */}
        <div className={styles.desktopShell}>
          <aside className={styles.rail}>
            <nav className={styles.railNav}>
              {[0, 1, 2].map((i) => (
                <a
                  key={i}
                  id={`${uid}-nav-${i}`}
                  href={`#${SENTINEL_IDS[i]}`}
                  className={cn(styles.railLink, active === i && styles.railLinkActive)}
                  aria-current={active === i ? "true" : undefined}
                  onClick={() => onRailClick(i)}
                >
                  <span className={styles.railIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.railLabel}>{navTitles[i]}</span>
                </a>
              ))}
            </nav>
            <div className={styles.progress} aria-hidden>
              <div className={styles.progressTrack}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(styles.progressDot, active === i && styles.progressDotActive)}
                  />
                ))}
              </div>
            </div>
          </aside>

          <div className={styles.stageRoot}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                id={SENTINEL_IDS[i]}
                ref={(el) => registerSentinel(i, el)}
                className={styles.sentinel}
                data-narrative-index={i}
                aria-hidden
              />
            ))}

            <div className={styles.panelLayer}>
              <div className={styles.panelSticky}>
                <article
                  className={styles.panelCard}
                  aria-labelledby={`${uid}-nav-${active}`}
                >
                  <div key={active} className={cn(styles.panelSwap)}>
                    <DesktopPanelBody
                      index={active}
                      aboutT={aboutT}
                      approachT={approachT}
                      processT={processT}
                    />
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
