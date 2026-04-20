import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

export function Section({
  id,
  className,
  containerClassName,
  ariaLabelledBy,
  uncontained,
  children,
}: {
  id?: string;
  className?: string;
  /** Widen inner `Container` (e.g. portfolio embeds) */
  containerClassName?: string;
  /** When `id` lives on a child (e.g. in-page scroll target), keep the landmark labelled. */
  ariaLabelledBy?: string;
  /**
   * When true, children are not wrapped in the default max-width `Container`.
   * Use for full-bleed bands (e.g. carousels) while keeping the same section spacing/landmark.
   * Compose your own `Container` only around text blocks that should stay column-width.
   */
  uncontained?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "relative scroll-mt-28 py-16 sm:scroll-mt-32 sm:py-20 md:scroll-mt-24 md:py-28",
        className,
      )}
    >
      {uncontained ? (
        children
      ) : (
        <Container className={containerClassName}>{children}</Container>
      )}
    </section>
  );
}
