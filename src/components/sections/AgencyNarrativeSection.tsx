"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import styles from "./AgencyNarrativeSection.module.css";

const TAB_COUNT = 3;
const PROCESS_STEPS = ["discover", "design", "build", "launch"] as const;

function ProseContent({
  paragraphs,
  className,
}: {
  paragraphs: readonly string[];
  className?: string;
}) {
  return (
    <div className={cn(styles.prose, className)}>
      {paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </div>
  );
}

function ProcessTimeline({
  steps,
  footnote,
  listLabel,
}: {
  steps: readonly { key: string; label: string; detail: string }[];
  footnote: string;
  listLabel: string;
}) {
  return (
    <div className={styles.processWrap}>
      <ol className={styles.steps} aria-label={listLabel}>
        {steps.map((step, i) => (
          <li key={step.key} className={styles.step}>
            <div className={styles.stepRail} aria-hidden>
              <span className={styles.stepNode} />
            </div>
            <div className={styles.stepBody}>
              <div className={styles.stepMeta}>
                <span className={styles.stepIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
              <p className={styles.stepDetail}>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.processFoot}>{footnote}</p>
    </div>
  );
}

export function AgencyNarrativeSection() {
  const uid = useId();
  const aboutT = useTranslations("about");
  const approachT = useTranslations("approach");
  const processT = useTranslations("process");

  const tabLabels = [
    aboutT("title"),
    approachT("title"),
    processT("title"),
  ] as const;

  const landmarkLabel = `${tabLabels[0]} · ${tabLabels[1]} · ${tabLabels[2]}`;

  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = useCallback((index: number) => {
    const i = ((index % TAB_COUNT) + TAB_COUNT) % TAB_COUNT;
    setActive(i);
    tabRefs.current[i]?.focus();
  }, []);

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        focusTab(active + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        focusTab(active - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusTab(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusTab(TAB_COUNT - 1);
      }
    },
    [active, focusTab],
  );

  const aboutParagraphs = [aboutT("p1"), aboutT("p2"), aboutT("p3")] as const;
  const approachParagraphs = [
    approachT("p1"),
    approachT("p2"),
    approachT("p3"),
  ] as const;

  const processSteps = PROCESS_STEPS.map((key) => ({
    key,
    label: processT(key),
    detail: processT(`${key}Detail`),
  }));

  const panelTitleId = `${uid}-panel-title`;

  return (
    <section
      className={styles.section}
      aria-labelledby={`${uid}-landmark`}
    >
      <Container className={styles.inner}>
        <h2 id={`${uid}-landmark`} className="sr-only">
          {landmarkLabel}
        </h2>

        <div className={styles.rule} aria-hidden />

        {/* Mobile / tablet: calm stacked narrative (no accordion) */}
        <div className={styles.stack}>
          <article className={styles.stackCard} aria-labelledby={`${uid}-m-about`}>
            <h3 id={`${uid}-m-about`} className={styles.stackTitle}>
              {tabLabels[0]}
            </h3>
            <ProseContent paragraphs={aboutParagraphs} />
          </article>
          <article
            className={styles.stackCard}
            aria-labelledby={`${uid}-m-approach`}
          >
            <h3 id={`${uid}-m-approach`} className={styles.stackTitle}>
              {tabLabels[1]}
            </h3>
            <ProseContent paragraphs={approachParagraphs} />
          </article>
          <article className={styles.stackCard} aria-labelledby={`${uid}-m-proc`}>
            <h3 id={`${uid}-m-proc`} className={styles.stackTitle}>
              {tabLabels[2]}
            </h3>
            <ProcessTimeline
              steps={processSteps}
              footnote={processT("subtitle")}
              listLabel={processT("title")}
            />
          </article>
        </div>

        {/* Desktop: index + single panel (click to switch, no scroll coupling) */}
        <div className={styles.split}>
          <div className={styles.indexCol}>
            <div className={styles.indexShell}>
              <div
                role="tablist"
                aria-label={landmarkLabel}
                aria-orientation="vertical"
                className={styles.tabList}
              >
                {([0, 1, 2] as const).map((i) => {
                  const selected = active === i;
                  const tabId = `${uid}-tab-${i}`;
                  const panelId = `${uid}-panel`;
                  return (
                    <button
                      key={i}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={tabId}
                      tabIndex={selected ? 0 : -1}
                      aria-selected={selected}
                      aria-controls={panelId}
                      className={cn(styles.tab, selected && styles.tabActive)}
                      onClick={() => setActive(i)}
                      onKeyDown={onTabKeyDown}
                    >
                      <span className={styles.tabIndex} aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.tabLabel}>{tabLabels[i]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.panelCol}>
            <div
              id={`${uid}-panel`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${active}`}
              className={styles.panelOuter}
            >
              {/*
                All three panels live in the same grid cell (panelStack).
                The cell's row height = the tallest child, so swapping the
                visible tab never changes the section height — and the
                "tallest" measurement happens in CSS at first paint, not in
                a post-mount ResizeObserver.
              */}
              <div className={styles.panelStack}>
                <div
                  className={cn(
                    styles.panelCard,
                    active === 0 ? styles.panelVisible : styles.panelHidden,
                  )}
                  aria-hidden={active === 0 ? undefined : "true"}
                >
                  <div
                    key={active === 0 ? `active-${active}` : "p0"}
                    className={active === 0 ? styles.panelBody : undefined}
                  >
                    <h3
                      className={styles.panelHeading}
                      id={active === 0 ? panelTitleId : undefined}
                    >
                      {tabLabels[0]}
                    </h3>
                    <ProseContent paragraphs={aboutParagraphs} />
                  </div>
                </div>
                <div
                  className={cn(
                    styles.panelCard,
                    active === 1 ? styles.panelVisible : styles.panelHidden,
                  )}
                  aria-hidden={active === 1 ? undefined : "true"}
                >
                  <div
                    key={active === 1 ? `active-${active}` : "p1"}
                    className={active === 1 ? styles.panelBody : undefined}
                  >
                    <h3
                      className={styles.panelHeading}
                      id={active === 1 ? panelTitleId : undefined}
                    >
                      {tabLabels[1]}
                    </h3>
                    <ProseContent paragraphs={approachParagraphs} />
                  </div>
                </div>
                <div
                  className={cn(
                    styles.panelCard,
                    active === 2 ? styles.panelVisible : styles.panelHidden,
                  )}
                  aria-hidden={active === 2 ? undefined : "true"}
                >
                  <div
                    key={active === 2 ? `active-${active}` : "p2"}
                    className={active === 2 ? styles.panelBody : undefined}
                  >
                    <h3
                      className={styles.panelHeading}
                      id={active === 2 ? panelTitleId : undefined}
                    >
                      {tabLabels[2]}
                    </h3>
                    <ProcessTimeline
                      steps={processSteps}
                      footnote={processT("subtitle")}
                      listLabel={processT("title")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
