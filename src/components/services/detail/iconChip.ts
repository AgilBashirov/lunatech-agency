/**
 * Shared icon-chip chrome used by Use Cases and Benefits cards.
 *
 * Lifted verbatim from `src/components/sections/Services.tsx` so the detail
 * page tiles match the home grid byte-for-byte. Do NOT introduce a new
 * variant — adjust the Services source first if a unified change is needed.
 */
export const iconWrapClass =
  "services-icon-wrap mb-5 inline-flex h-14 w-14 items-center justify-center border border-white/[0.08] bg-[#05060a]/80 transition-shadow duration-300 ease-out sm:mb-6 sm:h-16 sm:w-16";

export const iconWrapStyle = {
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-1), var(--shadow-inset-hairline)",
};

export const iconClass = "h-8 w-8 text-[var(--neon-cyan)] sm:h-9 sm:w-9";
