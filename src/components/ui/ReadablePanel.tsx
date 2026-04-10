import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Frosted panel over fixed moon backdrop — improves body/heading contrast.
 */
export function ReadablePanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.09] bg-[var(--surface)]/80 px-6 py-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md md:px-8 md:py-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
