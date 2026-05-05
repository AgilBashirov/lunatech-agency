import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

/**
 * Wrapper for every content block on the simplified detail page (revised spec
 * R3.3). Composes `Section` (does not replace it) so the page keeps its
 * `--gutter-section` rhythm and `scroll-mt-*` anchor offset; on top of that
 * provides the standardised eyebrow/h2 rhythm without GlassCard chrome.
 *
 * The H2 id pattern mirrors the existing detail page so backwards-compat with
 * e2e tests targeting `#svc-{usecases,howitworks,benefits,cta}-heading` keeps
 * working. Pass the exact id you want as `headingId` (e.g. `"usecases"` ⇒
 * `"svc-usecases-heading"`).
 */
type ServiceSectionProps = {
  /** In-page anchor id (e.g. "where-it-fits" → `<section id="where-it-fits">`). */
  id: string;
  /**
   * Heading id slug. The H2 will receive `id="svc-${headingId}-heading"` and
   * the Section's `aria-labelledby` will match. Pass the legacy slug to
   * preserve e2e selectors (e.g. `"usecases"`, `"howitworks"`, `"benefits"`,
   * `"cta"`); for new sections that have no legacy id, pass the section slug.
   */
  headingId: string;
  /** Optional short uppercase label rendered with `.t-eyebrow`. */
  eyebrow?: string;
  /** Section H2 — always rendered with `.t-h2`. */
  title: string;
  /**
   * Inner column width. `narrow` (default) caps at `max-w-3xl` for prose;
   * `wide` removes the prose cap so a list/grid can fill the Container.
   */
  width?: "narrow" | "wide";
  children: ReactNode;
  className?: string;
};

export function ServiceSection({
  id,
  headingId,
  eyebrow,
  title,
  width = "narrow",
  children,
  className,
}: ServiceSectionProps) {
  const ariaId = `svc-${headingId}-heading`;

  return (
    <Section id={id} ariaLabelledBy={ariaId} className={className}>
      <div className={width === "wide" ? "" : "mx-auto max-w-3xl"}>
        {eyebrow ? <span className="t-eyebrow">{eyebrow}</span> : null}
        <h2
          id={ariaId}
          className={cn("t-h2 text-foreground", eyebrow && "mt-3")}
        >
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </Section>
  );
}
