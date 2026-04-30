"use client";

import { useLayoutEffect } from "react";

/**
 * Forces every page load to start at scrollY = 0.
 *
 * Two things happen here:
 *   1. `history.scrollRestoration = "manual"` opts out of the browser's
 *      automatic scroll restoration on reload / back-forward navigation.
 *      This persists for the document, so future reloads also start clean.
 *   2. As a belt-and-suspenders for browsers that interpret "manual"
 *      narrowly, we also call `scrollTo(0, 0)` synchronously in
 *      `useLayoutEffect` — runs before paint, so no flicker.
 *
 * If the URL carries a `#hash`, we leave the page alone — `HashScrollOnAnchors`
 * will scroll the named section into view shortly after.
 */
export function ResetScrollOnLoad() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      window.scrollTo(0, 0);
      // documentElement.scrollTop covers older WebKit fallback paths.
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  return null;
}
