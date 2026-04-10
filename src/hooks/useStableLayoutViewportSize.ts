"use client";

import { useEffect, useState } from "react";

const SCALE_EPS = 0.02;

function readLayoutSize() {
  const el = document.documentElement;
  return {
    width: el.clientWidth,
    height: el.clientHeight,
  };
}

/** Skip dimension updates while OS/browser pinch-zoom is active (when API exists). */
function pinchZoomActive(): boolean {
  const vv = window.visualViewport;
  if (!vv || typeof vv.scale !== "number" || Number.isNaN(vv.scale)) {
    return false;
  }
  return Math.abs(vv.scale - 1) > SCALE_EPS;
}

/**
 * Layout viewport width/height in CSS pixels. During pinch-zoom, updates are
 * frozen so fixed full-bleed WebGL layers avoid repeated resize/setSize jank.
 */
export function useStableLayoutViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const apply = (force: boolean) => {
      if (!force && pinchZoomActive()) return;
      setSize(readLayoutSize());
    };

    apply(true);

    const onWindowResize = () => apply(false);
    const onOrientation = () => apply(true);

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("orientationchange", onOrientation);

    const vv = window.visualViewport;
    const onVv = () => apply(false);
    vv?.addEventListener("resize", onVv);
    vv?.addEventListener("scroll", onVv);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("orientationchange", onOrientation);
      vv?.removeEventListener("resize", onVv);
      vv?.removeEventListener("scroll", onVv);
    };
  }, []);

  return size;
}
