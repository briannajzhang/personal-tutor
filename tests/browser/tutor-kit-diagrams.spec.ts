import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";

let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  server = await startDevServer({ cwd: resolve("examples"), port: 0 });
});

test.afterAll(async () => {
  await server?.close();
  clearWorkspaceCaches();
});

test("oversized expanded diagrams remain fully reachable by scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${server.url}/textbooks/concert-ticketing-onsale/chapters/checkout-as-saga`);

  const diagram = page.locator('[data-diagram="saga-flow"]');
  await expect(diagram).toHaveAttribute("data-diagram-rendered", "true", { timeout: 20_000 });
  await diagram.getByRole("button", { name: "Expand diagram" }).click();

  const body = page.locator(".diagram-overlay-body");
  const initial = await body.evaluate((element) => {
    const svg = element.querySelector("svg");
    if (!svg) throw new Error("Expanded diagram SVG is missing");
    const bodyRect = element.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    return {
      bodyTop: bodyRect.top,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      svgTop: svgRect.top
    };
  });

  expect(initial.scrollHeight).toBeGreaterThan(initial.clientHeight);
  expect(initial.svgTop).toBeGreaterThanOrEqual(initial.bodyTop - 1);

  await body.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
  const scrolled = await body.evaluate((element) => {
    const svg = element.querySelector("svg");
    if (!svg) throw new Error("Expanded diagram SVG is missing");
    const bodyRect = element.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    return {
      bodyBottom: bodyRect.bottom,
      scrollTop: element.scrollTop,
      svgBottom: svgRect.bottom
    };
  });

  expect(scrolled.scrollTop).toBeGreaterThan(0);
  expect(scrolled.svgBottom).toBeLessThanOrEqual(scrolled.bodyBottom + 1);
});
