const MIN_SLIDE = 248;
const MAX_SLIDE = 340;

export function slideMarginForWindow(): number {
  if (typeof window === "undefined") return 18;
  if (window.matchMedia("(min-width: 1280px)").matches) return 28;
  if (window.matchMedia("(min-width: 768px)").matches) return 26;
  return 18;
}

/**
 * Slide width (px) so that for some n ≥ 1, `n * w + (n - 1) * m <= V`
 * with MIN_SLIDE ≤ w ≤ MAX_SLIDE when n ≥ 2; single column uses `min(MAX, V)`.
 */
export function computeSlideWidthPx(viewportClientWidth: number): number {
  const m = slideMarginForWindow();
  const V = Math.max(0, Math.floor(viewportClientWidth));
  if (V === 0) return MIN_SLIDE;

  let n = Math.floor((V + m) / (MIN_SLIDE + m));
  n = Math.max(1, n);

  for (; n >= 2; n--) {
    const raw = (V - (n - 1) * m) / n;
    if (raw < MIN_SLIDE) continue;
    let w = Math.floor(raw);
    w = Math.min(MAX_SLIDE, Math.max(MIN_SLIDE, w));
    while (n * w + (n - 1) * m > V && w > MIN_SLIDE) {
      w -= 1;
    }
    if (w >= MIN_SLIDE && n * w + (n - 1) * m <= V + 1) {
      return w;
    }
  }

  return Math.min(MAX_SLIDE, Math.max(1, V));
}
