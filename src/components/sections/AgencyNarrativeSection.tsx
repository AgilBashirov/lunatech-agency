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
import { ProcessTimeline } from "./ProcessTimeline";
import styles from "./AgencyNarrativeSection.module.css";

const TAB_COUNT = 3;
const PROCESS_STEPS = ["discover", "design", "build", "launch"] as const;

/**
 * Panel title.
 *
 * All three panels render simultaneously into the same grid cell so the cell
 * keeps a stable height; the two inactive ones are hidden with
 * `visibility: hidden` (see `.panelHidden`), which preserves their layout box.
 * A hidden-but-laid-out heading still reads as a real heading to a raw DOM
 * scan while returning empty `innerText`, so only the active panel gets
 * heading semantics — the inactive two use a visually identical `<div>`.
 *
 * This is a tidiness fix, not an accessibility one: the inactive panels are
 * already `aria-hidden`, so assistive tech never announced them either way.
 */
function PanelHeading({
  active,
  id,
  children,
}: {
  active: boolean;
  id: string;
  children: string;
}) {
  if (!active) return <div className={styles.panelHeading}>{children}</div>;
  return (
    <h3 className={styles.panelHeading} id={id}>
      {children}
    </h3>
  );
}

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
                    <PanelHeading active={active === 0} id={panelTitleId}>
                      {tabLabels[0]}
                    </PanelHeading>
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
                    <PanelHeading active={active === 1} id={panelTitleId}>
                      {tabLabels[1]}
                    </PanelHeading>
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
                    <PanelHeading active={active === 2} id={panelTitleId}>
                      {tabLabels[2]}
                    </PanelHeading>
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
