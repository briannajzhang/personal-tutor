import { expect, test } from "@playwright/test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ChapterResource } from "../../packages/tutor-kit/dist/index.js";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

const resources: ChapterResource[] = [
  {
    title: "Transaction <script data-injected>guide</script> & reference",
    url: 'https://example.com/reference?label="guide"&view=full#read-committed',
    description: "Compare <strong>actual guarantees</strong> with the model from the lesson.",
    purpose: "reference"
  },
  {
    title: "Practice transaction decisions with an intentionally very long resource title that must wrap on narrow screens",
    url: "https://example.com/practice?lesson=isolation",
    description: "Apply the chapter model to several transaction histories.",
    purpose: "practice"
  },
  {
    title: "See another explanation",
    url: "https://example.edu/isolation/visual-model",
    description: "Explore a visual explanation. <img data-injected src=x>",
    purpose: "alternate-explanation"
  },
  {
    title: "Go deeper into concurrency",
    url: "https://example.edu/isolation/derivation",
    description: "Follow a more detailed derivation of the guarantees.",
    purpose: "deepen"
  }
];

let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  const cwd = mkdtempSync(join(tmpdir(), "tutor-resources-browser-"));
  initWorkspace(cwd, { starter: false });
  linkTutorKit(cwd);
  const textbookDir = join(cwd, "textbooks", "resources-sample");
  mkdirSync(textbookDir, { recursive: true });
  writeFileSync(join(textbookDir, "textbook.ts"), `import { textbook } from "tutor-kit";
export default textbook(${JSON.stringify({
    id: "resources-sample",
    title: "Resource Sample",
    chapters: [
      {
        id: "with-resources",
        title: "Transaction isolation",
        resources,
        sections: [{
          id: "lesson",
          title: "Understanding lost updates",
          blocks: [{
            id: "explanation",
            kind: "p",
            props: { body: "Two transactions can read the same value and overwrite one another's changes. Predict the final value before comparing their interleavings." }
          }],
          subsections: []
        }]
      },
      { id: "omitted", title: "Resources omitted", sections: [] },
      { id: "empty", title: "Empty resources", resources: [], sections: [] }
    ]
  })});\n`);
  server = await startDevServer({ cwd, port: 0 });
});

test.afterAll(async () => {
  await server?.close();
});

test("resources are collapsed below the lesson and expand by keyboard without a count limit", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/resources-sample/chapters/with-resources`);
  const disclosure = page.locator("[data-chapter-resources]");
  const summary = disclosure.locator("summary");
  const firstLink = disclosure.locator("a").first();

  await expect(summary).toHaveText("Continue exploring");
  await expect(summary).toBeVisible();
  await expect(disclosure).not.toHaveAttribute("open");
  await expect(firstLink).toBeHidden();
  await expect(page.locator(".chapter-index")).not.toContainText("Continue exploring");
  await expect(page.locator(".page-head .meta")).toHaveText("1 sections / 0 subsections");
  const childClasses = await page.locator(".chapter-content").evaluate((element) => (
    [...element.children].map((child) => child.className)
  ));
  expect(childClasses).toEqual(["chapter-section", "chapter-resources", "chapter-footer"]);

  await summary.focus();
  await summary.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(disclosure.getByRole("link")).toHaveCount(4);
  await expect(disclosure.locator(".chapter-resource-purpose")).toHaveText([
    "Reference", "Practice", "Another explanation", "Go deeper"
  ]);
  await page.keyboard.press("Tab");
  await expect(firstLink).toBeFocused();
  await expect(firstLink).toHaveAccessibleName(/opens in a new tab/);
  await expect(firstLink).toHaveAttribute("href", resources[0]!.url);
  await expect(firstLink).toHaveAttribute("target", "_blank");
  await expect(firstLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(firstLink).toContainText(resources[0]!.title);
  await expect(disclosure).toContainText(resources[0]!.description);
  await expect(disclosure.locator("[data-injected], strong, img, script")).toHaveCount(0);

  await summary.focus();
  await summary.press("Space");
  await expect(disclosure).not.toHaveAttribute("open");
  await expect(firstLink).toBeHidden();
});

test("omitted and empty resources render no disclosure, including after chapter navigation", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/resources-sample/chapters/with-resources`);
  await page.locator("[data-chapter-resources] summary").click();
  await expect(page.locator("[data-chapter-resources]")).toHaveAttribute("open", "");
  await page.locator('[data-chapter-navigation="omitted"]').click();
  await expect(page).toHaveURL(/\/chapters\/omitted$/);
  await expect(page.getByRole("heading", { name: "Resources omitted" })).toBeVisible();
  await expect(page.locator("[data-chapter-resources], .chapter-resources-summary")).toHaveCount(0);
  await expect(page.getByText("Continue exploring", { exact: true })).toHaveCount(0);

  await page.locator('[data-chapter-navigation="empty"]').click();
  await expect(page.getByRole("heading", { name: "Empty resources" })).toBeVisible();
  await expect(page.locator("[data-chapter-resources], .chapter-resources-summary")).toHaveCount(0);
  await expect(page.getByText("Continue exploring", { exact: true })).toHaveCount(0);
});

test("resource disclosure works on mobile and links open a separate page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${server.url}/textbooks/resources-sample/chapters/with-resources`);
  const disclosure = page.locator("[data-chapter-resources]");
  await expect(disclosure).not.toHaveAttribute("open");
  await disclosure.locator("summary").click();
  await expect(disclosure.getByRole("link")).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await disclosure.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);

  await page.context().route("https://example.com/**", (route) => route.fulfill({
    contentType: "text/html",
    body: "<h1>External resource fixture</h1>"
  }));
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    disclosure.getByRole("link").first().click()
  ]);
  await expect(popup.getByRole("heading", { name: "External resource fixture" })).toBeVisible();
  expect(await popup.evaluate(() => window.opener === null)).toBe(true);
  await expect(page).toHaveURL(/\/chapters\/with-resources$/);
  await popup.close();
});
