"use client";

import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { motionTransition } from "@/lib/motion";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function Button({
  className,
  children,
  variant = "primary",
  type = "button",
  ...props
}: Props) {
  const reduce = useReducedMotion();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee]";

  if (variant === "primary") {
    return (
      <motion.span
        className="gradient-border-wrap inline-flex"
        transition={motionTransition.fast}
        whileHover={reduce ? undefined : { scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
      >
        <button
          type={type}
          className={cn(
            "gradient-border-inner",
            base,
            "relative z-[1] min-h-[44px] px-7 text-white",
            "shadow-[0_0_24px_rgba(124,58,237,0.4),0_0_40px_rgba(34,211,238,0.12)]",
            "hover:shadow-[0_0_32px_rgba(124,58,237,0.5),0_0_52px_rgba(34,211,238,0.2)]",
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
    <motion.span
      className="inline-flex"
      transition={motionTransition.fast}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
    >
      <button
        type={type}
        className={cn(
          base,
          "border border-white/20 bg-white/5 text-white hover:border-white/35 hover:bg-white/10",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </motion.span>
  );
}
