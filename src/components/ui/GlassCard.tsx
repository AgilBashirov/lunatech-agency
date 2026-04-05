import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  className,
  children,
  interactive = true,
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-card group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md md:backdrop-blur-[20px] md:p-8",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/25 hover:shadow-[0_0_40px_rgba(124,58,237,0.18),0_0_60px_rgba(34,211,238,0.06)]",
        interactive &&
          "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        interactive &&
          "before:bg-[conic-gradient(from_210deg_at_50%_50%,rgba(124,58,237,0.12),rgba(34,211,238,0.1),rgba(59,130,246,0.08),rgba(124,58,237,0.12))]",
        "after:pointer-events-none after:absolute after:inset-px after:z-[1] after:rounded-[15px] after:bg-[#0b0f1a]/90 after:backdrop-blur-sm",
        className,
      )}
    >
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
