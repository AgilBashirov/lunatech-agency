import { test, expect, type Page } from "@playwright/test";

const VIEWPORT = '#portfolio [data-testid="selected-work-viewport"]';

type CarouselState = {
  selectedSnap: number;
  loop: boolean;
  slideCount: number;
};

async function getSelectedWorkCarousel(page: Page): Promise<CarouselState | null> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return null;
    const snap = Number(el.getAttribute("data-selected-snap"));
    const loop = el.getAttribute("data-loop") === "true";
    const slideCount = Number(el.getAttribute("data-slide-count"));
    return {
      selectedSnap: Number.isFinite(snap) ? snap : 0,
      loop,
      slideCount: Number.isFinite(slideCount) ? slideCount : 0,
    };
  }, VIEWPORT);
}

test.describe("Portfolio slider columns", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("slide widths are consistent for current viewport", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    const portfolio = page.locator("#portfolio");
    await expect(portfolio).toBeVisible();
    await portfolio.scrollIntoViewIfNeeded();

    const region = page.locator(VIEWPORT);
    await expect(region).toBeVisible();

    await expect.poll(async () => getSelectedWorkCarousel(page), { timeout: 25_000 }).not.toBeNull();

    const dims = await region.evaluate((el) => {
      const vp = el.clientWidth;
      const visible = Number(el.getAttribute("data-visible-count") ?? "1");
      const slides = [...el.querySelectorAll("[data-embla-slide]")] as HTMLElement[];
      const widths = slides
        .map((s) => Math.round(s.getBoundingClientRect().width))
        .filter((w) => w > 40);
      return { vp, widths, visible: Number.isFinite(visible) ? visible : 1 };
    });

    expect(dims.widths.length).toBeGreaterThanOrEqual(Math.min(3, dims.visible));
    // Width should be near viewport / visible-cards (minus gaps), not hero-wide.
    const expectedMax = Math.floor(dims.vp / Math.max(1, dims.visible));
    for (const w of dims.widths.slice(0, Math.max(3, dims.visible))) {
      expect(w).toBeGreaterThanOrEqual(120);
      expect(w).toBeLessThanOrEqual(expectedMax + 20);
      expect(w).toBeLessThan(dims.vp * 0.9);
    }
    if (dims.widths.length >= 3) {
      expect(Math.abs(dims.widths[0]! - dims.widths[1]!)).toBeLessThanOrEqual(14);
      expect(Math.abs(dims.widths[1]! - dims.widths[2]!)).toBeLessThanOrEqual(14);
    }
  });

  test("navigation arrows are hidden on narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en", { waitUntil: "load" });
    const portfolio = page.locator("#portfolio");
    await portfolio.scrollIntoViewIfNeeded();
    const prev = portfolio.locator('[id^="selected-work-prev-"]').first();
    const next = portfolio.locator('[id^="selected-work-next-"]').first();
    await expect(prev).toBeHidden();
    await expect(next).toBeHidden();
    await expect(page.locator(VIEWPORT)).toBeVisible();
  });
});

/**
 * Carousel navigation (loop + variable-width slides): advancing must update the active snap.
 * Uses a comfortable viewport width so the carousel and side arrows are usable.
 */
test.describe("Portfolio slider loop / navigation stress", () => {
  test.use({ viewport: { width: 1200, height: 900 } });
  test.describe.configure({ timeout: 120_000 });

  async function gotoPortfolio(page: Page) {
    await page.goto("/en", { waitUntil: "load" });
    const portfolio = page.locator("#portfolio");
    await expect(portfolio).toBeVisible({ timeout: 30_000 });
    await portfolio.scrollIntoViewIfNeeded();
  }

  test("portfolio carousel is ready with loop and multiple slides", async ({ page }) => {
    await gotoPortfolio(page);
    /** `VIEWPORT` already starts with `#portfolio`; do not chain `portfolio.locator` or the selector repeats. */
    await expect(page.locator(VIEWPORT)).toBeVisible();

    await expect
      .poll(async () => getSelectedWorkCarousel(page), { timeout: 25_000 })
      .toMatchObject({
        selectedSnap: expect.any(Number),
        loop: true,
        slideCount: 6,
      });
  });

  test("loop stress: repeated next advances through multiple snaps", async ({ page }) => {
    await gotoPortfolio(page);
    const next = page.locator("#portfolio").locator('[id^="selected-work-next-"]').first();
    const prev = page.locator("#portfolio").locator('[id^="selected-work-prev-"]').first();
    await expect(next).toBeVisible();
    await expect(prev).toBeVisible();
    await expect.poll(async () => getSelectedWorkCarousel(page), { timeout: 25_000 }).not.toBeNull();

    const seen = new Set<number>();
    for (let i = 0; i < 12; i++) {
      const before = await getSelectedWorkCarousel(page);
      expect(before).not.toBeNull();
      seen.add(before!.selectedSnap);
      await next.click({ force: true });
      await page.waitForFunction(
        (args: { prev: number; sel: string }) => {
          const el = document.querySelector(args.sel) as HTMLElement | null;
          if (!el) return false;
          const snap = Number(el.getAttribute("data-selected-snap"));
          return Number.isFinite(snap) && snap !== args.prev;
        },
        { prev: before!.selectedSnap, sel: VIEWPORT },
        { timeout: 30_000 },
      );
    }
    const after = await getSelectedWorkCarousel(page);
    seen.add(after!.selectedSnap);
    expect(seen.size).toBeGreaterThanOrEqual(4);
  });
});
