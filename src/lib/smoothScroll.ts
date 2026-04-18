import type Lenis from "lenis";

/** Matches in-page anchor scroll used with the site header (Lenis + `scroll-padding-top`). */
export const LENIS_ANCHOR_OFFSET = -14;

export function scrollToElementWithLenis(
  el: HTMLElement,
  lenis: Lenis | null,
  prefersReducedMotion: boolean,
) {
  if (lenis && !prefersReducedMotion) {
    lenis.scrollTo(el, {
      offset: LENIS_ANCHOR_OFFSET,
      programmatic: true,
      force: true,
    });
    return;
  }
  if (lenis && prefersReducedMotion) {
    lenis.scrollTo(el, {
      offset: LENIS_ANCHOR_OFFSET,
      immediate: true,
      programmatic: true,
      force: true,
    });
    return;
  }
  el.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function scrollToTopWithLenis(
  lenis: Lenis | null,
  prefersReducedMotion: boolean,
) {
  if (lenis && !prefersReducedMotion) {
    lenis.scrollTo(0, { programmatic: true, force: true });
    return;
  }
  if (lenis && prefersReducedMotion) {
    lenis.scrollTo(0, { immediate: true, programmatic: true, force: true });
    return;
  }
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
