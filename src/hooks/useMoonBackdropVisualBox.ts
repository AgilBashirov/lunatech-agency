"use client";

import { useEffect, useRef, useState } from "react";

type MoonBackdropBox = {
  /** Outer wrapper size before inverse scale (layout px) */
  outerW: number;
  outerH: number;
  /** Inner box = visual viewport in CSS px — Canvas / R3F resize target */
  innerW: number;
  innerH: number;
  offsetLeft: number;
  offsetTop: number;
  /** visualViewport.scale; inverse applied on outer so pinch zoom does not stretch the scene */
  scale: number;
};

function readBox(): MoonBackdropBox {
  const vv = window.visualViewport;
  if (!vv) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      outerW: w,
      outerH: h,
      innerW: w,
      innerH: h,
      offsetLeft: 0,
      offsetTop: 0,
      scale: 1,
    };
  }

  const scale =
    typeof vv.scale === "number" && !Number.isNaN(vv.scale) && vv.scale > 0
      ? vv.scale
      : 1;

  return {
    outerW: vv.width * scale,
    outerH: vv.height * scale,
    innerW: vv.width,
    innerH: vv.height,
    offsetLeft: vv.offsetLeft,
    offsetTop: vv.offsetTop,
    scale,
  };
}

/**
 * Sizes the moon backdrop so it tracks the visual viewport.
 *
 * Mobile address-bar collapse during scroll fires `visualViewport.resize`
 * with a height-only change. Re-rendering the Canvas at the new height
 * shifts the camera aspect and makes the moon visibly resize while the
 * user scrolls — which we do not want. We therefore react only to:
 *   - first mount
 *   - width changes (orientation flip, real resize, desktop)
 *   - orientation events
 *   - visualViewport.scale changes (kept for safety, even though pinch is blocked)
 *
 * Height-only changes are intentionally ignored. The canvas keeps the
 * height it had at first paint; the moon stays a fixed visual size while
 * the address bar shows/hides.
 */
export function useMoonBackdropVisualBox() {
  const [box, setBox] = useState<MoonBackdropBox>(() =>
    typeof window === "undefined"
      ? {
          outerW: 0,
          outerH: 0,
          innerW: 0,
          innerH: 0,
          offsetLeft: 0,
          offsetTop: 0,
          scale: 1,
        }
      : readBox(),
  );

  const lastWidthRef = useRef<number | null>(null);
  const lastScaleRef = useRef<number | null>(null);

  useEffect(() => {
    const apply = () => {
      const next = readBox();
      lastWidthRef.current = next.innerW;
      lastScaleRef.current = next.scale;
      setBox(next);
    };
    apply();

    const onMaybeResize = () => {
      const vv = window.visualViewport;
      const w = vv ? vv.width : window.innerWidth;
      const s = vv && typeof vv.scale === "number" && vv.scale > 0 ? vv.scale : 1;
      if (lastWidthRef.current !== w || lastScaleRef.current !== s) {
        apply();
      }
    };

    const onOrientation = () => {
      // Wait one frame so the browser settles new dimensions, then snapshot.
      window.requestAnimationFrame(apply);
    };

    const vv = window.visualViewport;
    vv?.addEventListener("resize", onMaybeResize);
    window.addEventListener("resize", onMaybeResize);
    window.addEventListener("orientationchange", onOrientation);

    return () => {
      vv?.removeEventListener("resize", onMaybeResize);
      window.removeEventListener("resize", onMaybeResize);
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, []);

  return box;
}
