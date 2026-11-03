import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// axe-core: https://github.com/dequelabs/axe-core
// Rule list: https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
// WCAG 2 A/AA examples: missing button names, img alt, contrast, html lang,
// duplicate ids, invalid ARIA. Does not assert that play/captions/HLS work.
test("demo player meets WCAG 2 A/AA", async ({ page }) => {
  await page.goto("/");
  await page.locator(".able-controller").waitFor();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

// Loads the shipped bundle (dist/) via tests/harness.html, with a public
// CORS-enabled stream, so CI checks the exact file other projects import.
test("bundled player plays HLS video", async ({ page }) => {
  await page.goto("/tests/harness.html");
  await page.locator(".able-controller").waitFor();
  await expect(page.locator(".able-button-handler-view-transcript")).toBeVisible();

  await page.locator(".able-button-handler-play").click();

  await expect
    .poll(() => page.locator("video").evaluate((v) => v.currentTime > 0 && !v.paused), {
      timeout: 20_000,
    })
    .toBe(true);
});
