import { expect, test } from "@playwright/test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  const cwd = mkdtempSync(join(tmpdir(), "tutor-kit-sidebar-browser-"));
  initWorkspace(cwd, { starter: true });
  linkTutorKit(cwd);

  const sections = Array.from({ length: 30 }, (_, index) => `section({
    id: "section-${index + 1}",
    title: "Section ${index + 1}",
    blocks: [p({ id: "copy-${index + 1}", body: ${JSON.stringify("Lesson content ".repeat(30))} })]
  })`).join(",\n");

  writeFileSync(join(cwd, "textbooks", "getting-started", "chapters", "welcome.chapter.ts"), `import { chapter, p, section } from "tutor-kit";

export default chapter({
  id: "welcome",
  title: "Independent sidebar scrolling",
  sections: [
    ${sections}
  ]
});
`);

  server = await startDevServer({ cwd, port: 0 });
});

test.afterAll(async () => {
  await server?.close();
  clearWorkspaceCaches();
});

test("scrolling the desktop sidebar does not scroll the lesson page", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 600 });
  await page.goto(`${server.url}/textbooks/getting-started/chapters/welcome`);

  const sidebar = page.locator(".chapter-index");
  await expect(sidebar).toHaveCSS("overflow-y", "auto");
  await expect(sidebar).toHaveCSS("overscroll-behavior-y", "contain");

  const box = await sidebar.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const pageScrollBefore = await page.evaluate(() => window.scrollY);
  await page.mouse.move(box.x + box.width / 2, box.y + Math.min(box.height / 2, 100));
  await page.mouse.wheel(0, 10_000);

  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);

  await page.mouse.wheel(0, 10_000);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);
});

test("the larger chapter title does not change titles on other pages", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 600 });
  await page.goto(server.url);
  await expect(page.locator("h1")).toHaveCSS("font-size", "30px");

  await page.goto(`${server.url}/textbooks/getting-started/chapters/welcome`);
  await expect(page.locator("h1")).toHaveCSS("font-size", "35px");

  await page.setViewportSize({ width: 390, height: 600 });
  await expect(page.locator("h1")).toHaveCSS("font-size", "28px");
});
