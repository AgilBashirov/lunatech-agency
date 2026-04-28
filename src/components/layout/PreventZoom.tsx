"use client";

import { useEffect } from "react";

/**
 * Belt-and-suspenders zoom guard for iOS Safari.
 *
 * The viewport meta (`maximumScale=1, userScalable=no`) and CSS
 * `touch-action: pan-x pan-y` block pinch-zoom on most browsers, but
 * iOS Safari historically ignores the viewport hints in some versions
 * and still fires the WebKit-only `gesturestart` / `gesturechange` /
 * `gestureend` events for two-finger pinch. Calling `preventDefault`
 * on those is the only reliable way to suppress zoom on those devices.
 *
 * Touchmove is intentionally NOT intercepted — making it non-passive
 * regresses scroll performance even when nothing is prevented.
 */
export function PreventZoom() {
  useEffect(() => {
    const stop = (event: Event) => {
      event.preventDefault();
    };

    // Cast through unknown — gesture* events are non-standard WebKit
    // and not in the lib.dom.d.ts event map.
    const target = document as unknown as {
      addEventListener: (type: string, listener: EventListener, options?: AddEventListenerOptions) => void;
      removeEventListener: (type: string, listener: EventListener, options?: EventListenerOptions) => void;
    };

    const opts: AddEventListenerOptions = { passive: false };

    target.addEventListener("gesturestart", stop, opts);
    target.addEventListener("gesturechange", stop, opts);
    target.addEventListener("gestureend", stop, opts);

    return () => {
      target.removeEventListener("gesturestart", stop);
      target.removeEventListener("gesturechange", stop);
      target.removeEventListener("gestureend", stop);
    };
  }, []);

  return null;
}
