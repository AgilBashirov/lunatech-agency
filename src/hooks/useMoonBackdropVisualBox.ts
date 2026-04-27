"use client";

import { useEffect, useState } from "react";

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

  const scale = typeof vv.scale === "number" && !Number.isNaN(vv.scale) && vv.scale > 0 ? vv.scale : 1;

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
 * Sizes the moon backdrop so it tracks the **visual viewport** and undoes
 * `visualViewport.scale` on the outer wrapper. Pinch-zoom / dynamic toolbars
 * then do not distort or “detach” the WebGL layer relative to what the user sees.
 *
 * Note: full-page **Ctrl/Cmd +** zoom is applied by the browser to the whole
 * composited page; this hook follows the visual viewport so the backdrop stays
 * aligned with the visible area (no gaps / double-resize jank).
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

  useEffect(() => {
    const apply = () => setBox(readBox());
    apply();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);

    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  return box;
}
