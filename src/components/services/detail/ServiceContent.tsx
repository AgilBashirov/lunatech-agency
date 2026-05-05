import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Typography helpers for prose blocks inside `ServiceSection` (revised spec
 * R3.4). Keeps every detail-page paragraph and bullet list rendering
 * identically without callers reaching for raw `<p className="t-body">`
 * strings — makes future global tweaks cheap.
 *
 * All sub-components are server components (no "use client"), so the bundle
 * stays minimal.
 */

function Prose({
  children,
  className,
}: {
  /** Array of paragraph strings or ReactNode children. */
  children: ReactNode | ReadonlyArray<ReactNode>;
  className?: string;
}) {
  // Normalise to an array of nodes; arrays render each child as a `<p>`.
  const nodes = Array.isArray(children) ? children : [children];
  return (
    <div className={cn("space-y-4", className)}>
      {nodes.map((node, i) => (
        <p key={i} className="t-body">
          {node}
        </p>
      ))}
    </div>
  );
}

function Bullets({
  items,
  tone = "cyan",
  className,
}: {
  items: ReadonlyArray<string>;
  tone?: "cyan" | "muted";
  className?: string;
}) {
  // Default `cyan` matches the existing Solution bullet pattern. `muted`
  // available for future denser blocks; both reuse existing tokens.
  const dotClass =
    tone === "cyan"
      ? "bg-[var(--neon-cyan)]"
      : "bg-[color:var(--text-muted)]";
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-text-secondary">
          <span
            aria-hidden
            className={cn(
              "mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full",
              dotClass,
            )}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function List({
  items,
  className,
}: {
  items: ReadonlyArray<{ title: string; description: string }>;
  className?: string;
}) {
  // Title/description rows used by "Where It Fits" and "Why Choose Us".
  // No icon chip, no GlassCard — plain editorial rhythm per R5.3 / R5.5.
  return (
    <div className={cn("space-y-8", className)}>
      {items.map((item, i) => (
        <div key={i}>
          <h3 className="t-h3 text-foreground">{item.title}</h3>
          <p className="t-body mt-2">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export const ServiceContent = {
  Prose,
  Bullets,
  List,
};
