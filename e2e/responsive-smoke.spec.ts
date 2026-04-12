import { test, expect } from "@playwright/test";

/**
 * Avtomatik smoke: üfüqi overflow və əsas landmarklar (mobil / iPad viewport).
 *
 * Əl ilə Safari QA — real cihazda bir dəfə təsdiqləyin:
 * - iPhone: navbar (logo, dil, contact, üfüqi linklər), hero başlıq, #services / #portfolio / #contact,
 *   portfolio modal, contact + klaviatura.
 * - iPad portret və landscape: bir sətir navbar (≥768px), grid düzümü, split view (dar en) davranışı.
 */
test.describe("Responsive smoke", () => {
  test("no significant horizontal overflow", async ({ page }) => {
    await page.goto("/az", { waitUntil: "load" });
    const delta = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth - root.clientWidth;
    });
    expect(delta).toBeLessThanOrEqual(2);
  });

  test("header, main, footer visible", async ({ page }) => {
    await page.goto("/az", { waitUntil: "load" });
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("services anchor lands with top offset below header", async ({ page }) => {
    await page.goto("/az#services", { waitUntil: "load" });
    const section = page.locator("#services");
    await expect(section).toBeVisible();
    const top = await section.evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(32);
  });
});
