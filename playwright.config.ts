import { defineConfig, devices } from "@playwright/test";

/** Viewport-only projects so `npx playwright install chromium` kifayətdir (WebKit tələb olunmur). */
export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    ...devices["Desktop Chrome"],
  },
  projects: [
    {
      name: "iphone",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        userAgent: devices["iPhone 13"].userAgent,
      },
    },
    {
      name: "ipad-portrait",
      use: {
        viewport: { width: 820, height: 1180 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "ipad-landscape",
      use: {
        viewport: { width: 1180, height: 820 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000/az",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
