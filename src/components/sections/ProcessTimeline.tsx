import styles from "./AgencyNarrativeSection.module.css";

/**
 * Vertical numbered stepper with rail + nodes.
 *
 * Originally lived as a private function inside `AgencyNarrativeSection.tsx`;
 * extracted as a sibling component so service detail pages
 * (`src/app/[locale]/services/[slug]/page.tsx` → `ServiceHowItWorks.tsx`) can
 * reuse the identical visual without inlining or duplicating the module CSS.
 *
 * The companion `AgencyNarrativeSection.module.css` is the single source of
 * truth for the rail/node geometry; importing it here re-uses the same
 * scoped class names so both consumers render byte-for-byte the same DOM.
 */
export function ProcessTimeline({
  steps,
  footnote,
  listLabel,
}: {
  steps: readonly { key: string; label: string; detail: string }[];
  footnote?: string;
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
      {footnote ? <p className={styles.processFoot}>{footnote}</p> : null}
    </div>
  );
}
