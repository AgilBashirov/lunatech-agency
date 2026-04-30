import { test, expect, type Page } from "@playwright/test";

/**
 * Moon size stability across scroll positions.
 *
 * The moon is rendered into a fixed `.moon-backdrop` wrapper sized at
 * `height: 100lvh` (with `100vh` fallback). On mobile / tablet the
 * `scrollZoomScale` tier is set to 0 so the Three.js group scale never
 * changes during scroll. This test asserts the contract: scrolling alone
 * MUST NOT change the wrapper size or the inner WebGL canvas size at any
 * scroll position. If iOS Safari's address bar collapse re-introduces a
 * size change, this test won't catch that exact case (Playwright can't
 * simulate it), but it locks in the scroll-only invariant.
 */

const SELECTOR = ".moon-backdrop";

type Box = { w: number; h: number; canvasW: number; canvasH: number };

async function measure(page: Page): Promise<Box> {
  return page.evaluate((sel) => {
    const wrapper = document.querySelector(sel) as HTMLElement | null;
    const canvas = wrapper?.querySelector("canvas") as HTMLCanvasElement | null;
    const wRect = wrapper?.getBoundingClientRect();
    const cRect = canvas?.getBoundingClientRect();
    return {
      w: wRect ? Math.round(wRect.width) : -1,
      h: wRect ? Math.round(wRect.height) : -1,
      canvasW: cRect ? Math.round(cRect.width) : -1,
      canvasH: cRect ? Math.round(cRect.height) : -1,
    };
  }, SELECTOR);
}

async function scrollTo(page: Page, y: number) {
  // Direct property assignment bypasses Lenis's `window.scrollTo` override
  // (which wraps the call in a smooth-scroll animation that never resolves
  // synchronously). This is the test's way of "teleporting" to a scroll
  // position so we can sample size at that exact location.
  await page.evaluate((top) => {
    document.documentElement.scrollTop = top;
    document.body.scrollTop = top;
  }, y);
  // Two animation frames for layout/paint to settle, then a small wall-clock
  // grace for the moon's lerp to reach the new target (its frame loop reads
  // scrollY each tick, so size is recomputed within a frame, but allow some
  // slack on slow CI machines).
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.waitForTimeout(120);
}

async function runStabilityCheck(page: Page) {
  await page.goto("/az", { waitUntil: "load" });

  // Wait for the moon wrapper to appear (dynamic-imported, mounts after the
  // GLB HEAD probe + Three.js boot). 20s ceiling — under parallel CI load
  // the dynamic chunk + WebGL init can run past the 8s moon-ready fallback.
  await page.locator(SELECTOR).waitFor({ state: "attached", timeout: 20000 });

  // Initial measurement at top of page.
  await scrollTo(page, 0);
  const initial = await measure(page);
  expect(initial.w).toBeGreaterThan(0);
  expect(initial.h).toBeGreaterThan(0);
  expect(initial.canvasW).toBeGreaterThan(0);
  expect(initial.canvasH).toBeGreaterThan(0);

  // Sample at multiple scroll depths covering hero → mid → contact.
  const docHeight = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  const sampleYs = [
    Math.round(docHeight * 0.15),
    Math.round(docHeight * 0.35),
    Math.round(docHeight * 0.55),
    Math.round(docHeight * 0.75),
    docHeight, // bottom
  ].filter((y) => y > 0);

  for (const y of sampleYs) {
    await scrollTo(page, y);
    const next = await measure(page);
    // Allow 1px tolerance for sub-pixel rounding only.
    expect(next.w, `wrapper width drifted at scrollY=${y}`).toBeGreaterThanOrEqual(initial.w - 1);
    expect(next.w, `wrapper width drifted at scrollY=${y}`).toBeLessThanOrEqual(initial.w + 1);
    expect(next.h, `wrapper height drifted at scrollY=${y}`).toBeGreaterThanOrEqual(initial.h - 1);
    expect(next.h, `wrapper height drifted at scrollY=${y}`).toBeLessThanOrEqual(initial.h + 1);
    expect(next.canvasW, `canvas width drifted at scrollY=${y}`).toBeGreaterThanOrEqual(initial.canvasW - 1);
    expect(next.canvasW, `canvas width drifted at scrollY=${y}`).toBeLessThanOrEqual(initial.canvasW + 1);
    expect(next.canvasH, `canvas height drifted at scrollY=${y}`).toBeGreaterThanOrEqual(initial.canvasH - 1);
    expect(next.canvasH, `canvas height drifted at scrollY=${y}`).toBeLessThanOrEqual(initial.canvasH + 1);
  }
}

test.describe("Moon size stability during scroll", () => {
  test("mobile viewport: wrapper and canvas size constant across scroll", async ({ page }) => {
    await runStabilityCheck(page);
  });
});
