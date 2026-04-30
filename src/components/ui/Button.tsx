"use client";

import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { motionTransition } from "@/lib/motion";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
  /** Smaller hover halo — for inline contexts where a big aura would
   *  overwhelm (e.g. inside a contact card). Resting state is identical
   *  to the default variant; only the hover intensity differs. */
  subtleGlow?: boolean;
};

export function Button({
  className,
  children,
  variant = "primary",
  subtleGlow = false,
  type = "button",
  ...props
}: Props) {
  const reduce = useReducedMotion();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]";

  // No hover transform — buttons stay stationary on hover. Visual feedback
  // comes entirely from the box-shadow / brightness / border-color changes
  // animated by the CSS `transition` rule on the wrap. Tap still gets a
  // small scale-down for tactile press feedback.
  const motionHoverTap = reduce
    ? {}
    : {
        whileTap: { scale: 0.98, transition: motionTransition.fast },
      };

  if (variant === "primary") {
    return (
      <motion.span
        className={cn(
          // Resting state: just the gradient ring, no glow.
          // Hover state: soft halo (drop shadow + cyan ambient) + 10% brightness bump on the ring.
          "gradient-border-wrap inline-flex cursor-pointer hover:brightness-110",
          subtleGlow
            ? "hover:shadow-[0_8px_22px_-10px_rgba(124,58,237,0.35),0_0_24px_rgba(34,211,238,0.10)]"
            : "hover:shadow-[0_12px_30px_-12px_rgba(124,58,237,0.45),0_0_34px_rgba(34,211,238,0.14)]",
        )}
        {...motionHoverTap}
      >
        <button
          type={type}
          className={cn(
            "gradient-border-inner",
            base,
            "relative z-[1] min-h-[44px] cursor-pointer px-7 text-white",
            className,
          )}
          {...props}
        >
          {children}
        </button>
      </motion.span>
    );
  }

  return (
    <motion.span className="inline-flex cursor-pointer" {...motionHoverTap}>
      <button
        type={type}
        className={cn(
          base,
          "min-h-[44px] cursor-pointer border border-white/20 bg-white/5 text-white",
          // Hover: brighter border + slightly fuller bg + a faint white drop
          // shadow so the lift reads. Stays whisper-quiet — no neon.
          "hover:border-white/35 hover:bg-white/10 hover:shadow-[0_8px_22px_-12px_rgba(255,255,255,0.18)]",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </motion.span>
  );
}
