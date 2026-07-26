import { expect, test } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  const cwd = mkdtempSync(join(tmpdir(), "tutor-route-loading-"));
  initWorkspace(cwd, { starter: true });
  linkTutorKit(cwd);
  server = await startDevServer({ cwd, port: 0 });
});

test.afterAll(async () => {
  await server?.close();
});

test("fast navigation skips the loading screen while slow navigation still shows it", async ({ page }) => {
  const textbookUrl = `${server.url}/api/textbooks/getting-started`;
  const chapterUrl = `${server.url}/api/textbooks/getting-started/chapters/welcome`;
  const glossaryUrl = `${server.url}/api/glossary-study/state?textbookId=getting-started`;
  const highlightsUrl = `${server.url}/api/highlights?textbookId=getting-started&chapterId=welcome`;
  const [chapter, glossary, highlights] = await Promise.all([
    fetchBody(chapterUrl),
    fetchBody(glossaryUrl),
    fetchBody(highlightsUrl)
  ]);

  await page.route(chapterUrl, (route) => route.fulfill(chapter));
  await page.route(glossaryUrl, (route) => route.fulfill(glossary));
  await page.route(highlightsUrl, (route) => route.fulfill(highlights));
  const textbookResponsePromise = page.waitForResponse((response) => response.url() === textbookUrl);
  await page.goto(`${server.url}/textbooks/getting-started`);
  const textbookResponse = await textbookResponsePromise;
  const textbook = {
    status: textbookResponse.status(),
    contentType: textbookResponse.headers()["content-type"] ?? "application/json",
    body: await textbookResponse.text()
  };
  await expect(page.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  await page.evaluate(() => {
    const messages: string[] = [];
    (window as typeof window & { __routeLoadingMessages?: string[] }).__routeLoadingMessages = messages;
    const main = document.querySelector("#main");
    if (!main) throw new Error("Main content is missing.");
    new MutationObserver(() => {
      const text = main.textContent ?? "";
      if (text.includes("Loading chapter...")) messages.push("Loading chapter...");
    }).observe(main, { childList: true, subtree: true });
  });

  await page.locator('[data-chapter="welcome"]').click();
  await expect(page.getByRole("heading", { name: "Chapter 1: Welcome" })).toBeVisible();
  await page.waitForTimeout(50);

  const messages = await page.evaluate(
    () => (window as typeof window & { __routeLoadingMessages?: string[] }).__routeLoadingMessages ?? []
  );
  expect(messages).toEqual([]);

  await page.route(textbookUrl, (route) => route.fulfill(textbook));
  await page.locator('[data-nav="textbook"]').click();
  await expect(page.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  await page.unroute(chapterUrl);
  await page.route(chapterUrl, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill(chapter);
  });

  await page.locator('[data-chapter="welcome"]').click();
  await page.waitForTimeout(75);
  await expect(page.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Loading chapter..." })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Loading chapter..." })).toBeVisible({ timeout: 300 });
  await expect(page.getByRole("heading", { name: "Chapter 1: Welcome" })).toBeVisible();
});

async function fetchBody(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(await response.text());
  return {
    status: response.status,
    contentType: response.headers.get("content-type") ?? "application/json",
    body: await response.text()
  };
}
