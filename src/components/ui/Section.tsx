import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

export function Section({
  id,
  className,
  containerClassName,
  ariaLabelledBy,
  children,
}: {
  id?: string;
  className?: string;
  /** Widen inner `Container` (e.g. portfolio embeds) */
  containerClassName?: string;
  /** When `id` lives on a child (e.g. in-page scroll target), keep the landmark labelled. */
  ariaLabelledBy?: string;
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
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
