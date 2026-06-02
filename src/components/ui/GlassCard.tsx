import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  className,
  children,
  interactive = true,
  disableBackdropBlur = false,
  disableLift = false,
  innerClassName,
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
  /** When true, skip backdrop blur (avoids stacked blur with opaque fills). */
  disableBackdropBlur?: boolean;
  /** When true, keep hover glow/border but suppress the upward translate. */
  disableLift?: boolean;
  /** Extra classes applied to the inner z-[2] wrapper (interactive mode only). */
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "glass-card group relative overflow-hidden rounded-2xl border border-[color:var(--card-border)] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] md:p-8",
        !disableBackdropBlur && "backdrop-blur-sm md:backdrop-blur-md",
        interactive ? "bg-[var(--card-bg)]" : "bg-[var(--card-bg-inner)]",
        interactive &&
          "transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(124,58,237,0.18),0_0_60px_rgba(34,211,238,0.06)]",
        interactive && !disableLift && "hover:-translate-y-1",
        interactive &&
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        interactive &&
          "before:bg-[conic-gradient(from_210deg_at_50%_50%,rgba(124,58,237,0.12),rgba(34,211,238,0.1),rgba(59,130,246,0.08),rgba(124,58,237,0.12))]",
        interactive &&
          "after:pointer-events-none after:absolute after:inset-px after:z-[1] after:rounded-[15px] after:bg-[var(--card-bg-inner)] after:backdrop-blur-sm",
        className,
      )}
    >
      {interactive ? (
        <div className={cn("relative z-[2]", innerClassName)}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
