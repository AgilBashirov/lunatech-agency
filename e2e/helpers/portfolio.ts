import { test, type Page } from "@playwright/test";

/**
 * The home page `#portfolio` section is data-driven: it renders only when the
 * admin portfolio (Vercel Blob `content/portfolio.json`) holds at least one
 * visible item. There is no seed fallback — an unconfigured environment
 * deliberately ships no portfolio section, and no links pointing at it.
 *
 * Specs that exercise the carousel must therefore skip, not fail, wherever no
 * portfolio content is seeded. They start running again on their own once real
 * projects are added through `/admin/portfolio`.
 *
 * Call this immediately after navigating to the page under test.
 */
export async function skipWithoutPortfolio(page: Page): Promise<void> {
  const rendered = (await page.locator("#portfolio").count()) > 0;
  test.skip(
    !rendered,
    "No portfolio content seeded — #portfolio section is intentionally absent.",
  );
}
