/**
 * Scroll-to-top FAB: visible only while `#contact` intersects the viewport.
 * Used with IntersectionObserver for immediate updates (no scroll thresholds / timers).
 */
export function isContactInViewport(contact: HTMLElement): boolean {
  const cr = contact.getBoundingClientRect();
  const vh = window.visualViewport?.height ?? window.innerHeight;
  if (cr.height < 32) {
    return false;
  }
  return cr.bottom > 0 && cr.top < vh;
}
