import { test, expect } from "@playwright/test";

/**
 * Avtomatik smoke: üfüqi overflow və əsas landmarklar (mobil / iPad viewport).
 *
 * Əl ilə Safari QA — real cihazda bir dəfə təsdiqləyin:
 * - iPhone: navbar (logo, dil, üfüqi linklər), hero başlıq, #services / #portfolio / #contact,
 *   portfolio (external demo links), contact + klaviatura.
 * - iPad portret və landscape: bir sətir navbar (≥768px), grid düzümü, split view (dar en) davranışı.
 */
test.describe("Responsive smoke", () => {
  test("home page does not drift-scroll after load (no hash)", async ({ page }) => {
    await page.goto("/az", { waitUntil: "networkidle" });
    const samples: number[] = [];
    for (let i = 0; i < 6; i++) {
      samples.push(
        await page.evaluate(() => window.scrollY || document.documentElement.scrollTop),
      );
      await page.waitForTimeout(400);
    }
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    expect(max - min).toBeLessThanOrEqual(48);
  });

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

  test("services anchor lands near viewport vertical center", async ({ page }) => {
    await page.goto("/az#services", { waitUntil: "load" });
    const section = page.locator("#services");
    await expect(section).toBeVisible();
    const vh = page.viewportSize()?.height ?? 900;
    await expect
      .poll(
        async () => {
          const box = await section.boundingBox();
          if (!box) return Number.POSITIVE_INFINITY;
          const mid = box.y + box.height / 2;
          return Math.abs(mid - vh / 2);
        },
        { timeout: 25_000 },
      )
      .toBeLessThan(vh * 0.28);
  });

  test("contact section and form fields visible", async ({ page }) => {
    await page.goto("/az#contact", { waitUntil: "load" });
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
    await expect(page.locator("#contact-message")).toBeVisible();
  });

  test("portfolio section visible", async ({ page }) => {
    await page.goto("/az#portfolio", { waitUntil: "load" });
    await expect(page.locator("#portfolio")).toBeVisible();
  });

  test("about anchor target exists", async ({ page }) => {
    await page.goto("/az#about", { waitUntil: "load" });
    await expect(page.locator("#about")).toBeVisible();
  });

  test("language switcher changes locale path", async ({ page }) => {
    await page.goto("/az", { waitUntil: "load" });
    const lang = page.getByRole("group", { name: "Language" });
    await expect(lang).toBeVisible();
    await lang.getByRole("button", { name: "EN" }).click();
    await expect(page).toHaveURL(/\/en(\/|$)/);
  });
});
