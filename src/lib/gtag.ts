declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a gtag event through the global `gtag` bootstrap (see
 * `src/app/layout.tsx`). No-ops silently when `gtag` hasn't loaded yet
 * (ad blockers, slow script load) rather than throwing.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
