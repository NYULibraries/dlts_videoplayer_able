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

  await page.locator(".able-button-handler-play").click();

  await expect
    .poll(() => page.locator("video").evaluate((v) => v.currentTime > 0 && !v.paused), {
      timeout: 20_000,
    })
    .toBe(true);
});

test("transcript window has a View in new tab link that opens plain text", async ({ page }) => {
  await page.goto("/tests/harness.html");
  await page.locator(".able-button-handler-transcript").click();

  const toolbar = page.locator(".able-transcript-area .able-window-toolbar");
  const link = toolbar.getByRole("button", { name: "View in new tab" });
  await expect(link).toBeVisible();
  await expect(link).toHaveText("View in new tab");
  await expect(toolbar.locator(".able-transcript-newtab + .autoscroll-transcript")).toHaveCount(1);
  await expect(page.locator(".able-button-handler-view-transcript")).toHaveCount(0);

  const [popup] = await Promise.all([page.waitForEvent("popup"), link.click()]);
  await expect(popup.locator("body")).toContainText("¿puede decirme");
  await expect(popup.locator("body")).toContainText("Hablante 1 00:01:30.340");
});

test("transcript toolbar controls fit on one row without crowding", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("/tests/harness.html");
  await page.locator(".able-button-handler-transcript").click();
  const toolbar = page.locator(".able-transcript-area .able-window-toolbar");
  await toolbar.waitFor();

  const layout = await toolbar.evaluate((el) => {
    const items = [...el.children].filter(
      (c) => c.offsetParent && getComputedStyle(c).position !== "absolute",
    );
    const centers = items.map((c) => {
      const r = c.getBoundingClientRect();
      return r.top + r.height / 2;
    });
    const handle = el.querySelector(".able-drag-handle");
    return {
      oneRow: Math.max(...centers) - Math.min(...centers) < 4,
      hasLanguage: !!el.querySelector("select"),
      overflow: el.scrollWidth > el.clientWidth,
      handleWidth: handle ? handle.getBoundingClientRect().width : 0,
      handleGap:
        handle.querySelector("svg").getBoundingClientRect().left -
        el.querySelector(".able-button-handler-preferences").getBoundingClientRect().right,
    };
  });
  expect(layout.hasLanguage).toBe(true);
  expect(layout.oneRow).toBe(true);
  expect(layout.overflow).toBe(false);
  expect(layout.handleWidth).toBeGreaterThanOrEqual(80);
  expect(layout.handleGap).toBeLessThanOrEqual(20);
});
