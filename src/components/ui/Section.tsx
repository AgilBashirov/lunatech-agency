import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-28 py-20 sm:scroll-mt-32 md:scroll-mt-24 md:py-28",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
