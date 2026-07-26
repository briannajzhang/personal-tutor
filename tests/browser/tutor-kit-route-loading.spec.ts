import { expect, test } from "@playwright/test";
import { shellClientJs } from "../../packages/tutor-kit/dist/ui/client/shell.js";

test.beforeEach(async ({ page }) => {
  await page.setContent("<main id=\"main\"><h1>Ready</h1></main>");
  await page.addScriptTag({
    content: `let routeToken = 0;
    async function load() {}
    ${shellClientJs()}`
  });
  await expect(page.getByRole("heading", { name: "Ready" })).toBeVisible();
});

test("fast route loads keep the current page visible", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#main").innerHTML = "<h1>Current textbook</h1>";
    const app = window as any;
    app.testRouteToken = app.beginRouteLoad("Loading chapter...");
  });
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    const app = window as any;
    app.finishRouteLoad(app.testRouteToken);
  });
  await page.waitForTimeout(150);

  await expect(page.getByRole("heading", { name: "Current textbook" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Loading chapter..." })).toHaveCount(0);
});

test("slow route loads still show the loading screen", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#main").innerHTML = "<h1>Current textbook</h1>";
    const app = window as any;
    app.testRouteToken = app.beginRouteLoad("Loading chapter...");
  });

  await expect(page.getByRole("heading", { name: "Current textbook" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Loading chapter..." })).toBeVisible();
});
