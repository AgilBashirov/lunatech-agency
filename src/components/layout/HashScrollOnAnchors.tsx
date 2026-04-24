"use client";

import type Lenis from "lenis";
import { useEffect, useRef } from "react";
import { useLenis } from "@/context/lenis-context";
import { getScrollYToCenterElement } from "@/lib/smoothScroll";

/**
 * Smooth scroll for in-page anchor *clicks* (user-initiated). Centres the
 * target vertically because Lenis bypasses the browser's `scroll-padding-top`.
 */
function smoothScrollToHash(lenis: Lenis, id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      lenis.scrollTo(getScrollYToCenterElement(el), {
        programmatic: true,
        force: true,
      });
    });
  });
}

/**
 * INSTANT scroll for the initial-load case. We never animate the entry —
 * a page reload that lands on an anchor should appear already-positioned at
 * that anchor, not visibly scroll there from the top. (Animating it makes
 * users perceive an unexpected "page jumps down" on reload, especially when
 * other async work — fonts, the moon canvas — finishes loading at the same
 * moment as the scroll animation runs.)
 */
function instantScrollToHash(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // Target the same vertical centre as the smooth path uses, but jump to it
  // synchronously without involving Lenis (Lenis would animate even with
  // `immediate: true` on some setups).
  const y = getScrollYToCenterElement(el);
  window.scrollTo({ top: y, behavior: "auto" });
}

/**
 * URL hash navigation handler.
 *  - Click on an in-page anchor: smooth scroll via Lenis. We do NOT add the
 *    hash to the URL — keeping reloads clean (no auto-scroll on reload).
 *  - Initial load with a hash already in the URL (deep link): jump
 *    instantly to the target so it appears as if the page loaded there.
 */
export function HashScrollOnAnchors() {
  const lenis = useLenis();
  const initialHashDoneRef = useRef(false);

  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || !hrefAttr.startsWith("#")) return;

      const id = hrefAttr.slice(1);
      if (!id) return;

      const targetEl = document.getElementById(id);
      if (!targetEl) return;

      e.preventDefault();

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!lenis || reduce) {
        targetEl.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        return;
      }

      smoothScrollToHash(lenis, id);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventList