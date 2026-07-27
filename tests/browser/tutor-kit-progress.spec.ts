import { expect, test } from "@playwright/test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

let server: Awaited<ReturnType<typeof startDevServer>> | undefined;

test.beforeAll(async () => {
  const cwd = mkdtempSync(join(tmpdir(), "tutor-progress-browser-"));
  initWorkspace(cwd, { starter: true });
  writeMultiChapterTextbook(cwd);
  linkTutorKit(cwd);
  server = await startDevServer({ cwd, port: 0 });
  await markChapter("progress-sample", "one", "complete");
  await markChapter("progress-sample", "two", "complete");
});

test.afterAll(async () => {
  await server?.close();
});

test("a learner can continue and complete a chapter", async ({ page }) => {
  const url = serverUrl();
  await page.goto(url);
  await expect(page.locator("body")).not.toContainText("ready /");
  await expect(page.locator("body")).not.toContainText("0 of 1 chapters complete");

  const starterRow = page.locator(".library-row", { hasText: "Getting Started" });
  await expect(starterRow.getByText("0 of 1 chapter complete")).toBeVisible();
  await expect(starterRow.getByRole("progressbar")).toHaveCount(0);
  await starterRow.getByRole("button", { name: /^Start/ }).click();
  await expect(page).toHaveURL(/\/textbooks\/getting-started\/chapters\/welcome/);

  const completion = page.locator("[data-chapter-completion]");
  await expect(completion).toHaveAccessibleName("Mark chapter complete");
  await expect(completion).toHaveText("Mark chapter complete");
  await completion.click();
  await expect(completion).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Chapter complete", { exact: true })).toBeVisible();
  await expect(completion).toHaveAccessibleName("Mark chapter incomplete");
  await expect(completion).toHaveText("Mark incomplete");
  await completion.click();
  await expect(completion).toHaveAccessibleName("Mark chapter complete");
  await expect(completion).toHaveText("Mark chapter complete");
  await completion.click();

  await page.goto(url);
  await expect(starterRow.getByText("Complete · 1 chapter")).toBeVisible();
  await expect(starterRow.getByRole("button", { name: "Review" })).toBeVisible();
  await expect(page.getByText("2 of 3 chapters complete")).toBeVisible();

  await starterRow.getByRole("button", { name: "Review" }).click();
  await expect(page).toHaveURL(/\/textbooks\/getting-started$/);
  await expect(page.locator(".textbook-chapter-rows .row")).toContainText("2 sections / 1 subsection");
  await expect(page.locator(".textbook-chapter-rows .row .chapter-row-status")).toHaveText("Complete");
  await expect(page.locator("body")).not.toContainText("COURSE PROGRESS");
  await expect(page.locator(".chapter-progress-block")).toContainText("1 of 1 chapter complete");
  await expect(page.locator(".chapter-progress-block").getByRole("progressbar")).toHaveCount(0);
  await expect(page.locator(".textbook-chapter-rows .row")).not.toContainText("NEXT UP");

  await page.goto(`${url}/textbooks/progress-sample`);
  await expect(page.locator("body")).not.toContainText("COURSE PROGRESS");
  await expect(page.locator(".course-progress-panel")).toHaveCount(0);
  await expect(page.locator("[data-course-continue]")).toHaveCount(0);
  await expect(page.locator(".chapter-progress-block")).toContainText("2 of 3 chapters complete");
  await expect(page.locator(".chapter-progress-block").getByRole("progressbar")).toHaveCount(0);
  await expect(page.locator(".textbook-chapter-rows .row", { hasText: "Chapter three" })).toContainText("NEXT UP");
  await expect(page.locator(".textbook-chapter-rows .row", { hasText: "Chapter three" })).toContainText("1 section / 0 subsections");
  await expect(page.locator(".textbook-chapter-rows .row", { hasText: "Chapter one" })).not.toContainText("NEXT UP");
  await expect(page.locator(".textbook-chapter-rows .row", { hasText: "Chapter two" })).not.toContainText("NEXT UP");
  await page.getByRole("button", { name: "Glossary · 1" }).click();
  await expect(page).toHaveURL(/\/textbooks\/progress-sample\/glossary$/);
  await expect(page.locator(".chapter-progress-block")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("2 of 3 chapters complete");

  await page.goto(`${url}/textbooks/getting-started/chapters/welcome`);
  await expect(page.locator("[data-chapter-completion]")).toHaveAttribute("aria-pressed", "true");
});

async function markChapter(textbookId: string, chapterId: string, action: "complete" | "visit") {
  const response = await fetch(`${serverUrl()}/api/reading-progress`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ textbookId, chapterId, action })
  });
  if (!response.ok) throw new Error(await response.text());
}

function serverUrl() {
  if (!server) throw new Error("Server did not start.");
  return server.url;
}

function writeMultiChapterTextbook(cwd: string) {
  const textbookDir = join(cwd, "textbooks", "progress-sample");
  const chaptersDir = join(textbookDir, "chapters");
  mkdirSync(chaptersDir, { recursive: true });
  writeFileSync(join(textbookDir, "textbook.ts"), `import { textbook } from "tutor-kit";
import one from "./chapters/one.chapter.js";
import two from "./chapters/two.chapter.js";
import three from "./chapters/three.chapter.js";

export default textbook({
  id: "progress-sample",
  title: "Progress Sample",
  description: "A small fixture for plural progress states.",
  chapters: [one, two, three]
});
`);
  for (const id of ["one", "two", "three"]) {
    writeFileSync(join(chaptersDir, `${id}.chapter.ts`), `import { chapter, glossary, p, section } from "tutor-kit";

export default chapter({
  id: "${id}",
  title: "Chapter ${id}",
  sections: [
    section({
      id: "main",
      title: "Main",
      blocks: [
        p({ id: "copy", body: "Fixture chapter." })
        ${id === "three" ? ',\n        glossary({ id: "terms", entries: [{ term: "Progress", definition: "A chapter completion fixture." }] })' : ""}
      ]
    })
  ]
});
`);
  }
}
