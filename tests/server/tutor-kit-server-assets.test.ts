import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

test.afterEach(() => {
  clearWorkspaceCaches();
});

test("dev server exposes textbooks, chapters, and appends events", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir);
  linkTutorKit(dir);
  const chaptersDir = join(dir, "textbooks", "getting-started", "chapters");
  const welcomePath = join(chaptersDir, "welcome.chapter.ts");
  const welcomeChapter = readFileSync(welcomePath, "utf8");
  writeFileSync(
    join(chaptersDir, "practice.chapter.ts"),
    welcomeChapter.replace('id: "welcome"', 'id: "practice"').replace("Chapter 1: Welcome", "Chapter 2: Practice")
  );
  writeFileSync(
    join(chaptersDir, "review.chapter.ts"),
    welcomeChapter.replace('id: "welcome"', 'id: "review"').replace("Chapter 1: Welcome", "Chapter 3: Review")
  );
  writeFileSync(join(dir, "textbooks", "getting-started", "textbook.ts"), `import { textbook } from "tutor-kit";
import welcome from "./chapters/welcome.chapter.js";
import practice from "./chapters/practice.chapter.js";
import review from "./chapters/review.chapter.js";

export default textbook({
  id: "getting-started",
  title: "Getting Started",
  description: "A starter textbook for checking Tutor Kit.",
  tags: ["starter"],
  chapters: [welcome, practice, review]
});
`);

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const textbooks = await fetchJson(`${server.url}/api/textbooks`);
    assert.equal(Array.isArray(textbooks), true);
    assert.equal(textbooks[0].id, "getting-started");

    const page = await fetchText(`${server.url}/textbooks/getting-started/chapters/welcome`);
    assert.match(page, /katex/);
    assert.match(page, /chapter-navigation/);
    assert.match(page, /data-chapter-navigation/);
    assert.match(page, /bindChapterNavigation/);
    assert.match(page, /grid-template-columns: 1fr/);
    assert.match(page, /renderTransformation/);
    assert.match(page, /transformation-stages/);
    assert.match(page, /transformation-table/);
    assert.match(page, /transformation-focus/);
    assert.match(page, /data-transformation-layout/);
    assert.match(page, /updateTransformationLayouts/);
    assert.match(page, /auto-hybrid/);
    assert.match(page, /transformationStageOverflows/);
    assert.match(page, /inputOverflow \|\| outputOverflow/);
    assert.match(page, /operationOverflow/);
    assert.match(page, /data-transformation-stage/);
    assert.match(page, /renderInlineEmphasis/);
    assert.match(page, /<strong>/);
    assert.match(page, /<em>/);
    assert.match(page, /document\.fonts\?\.ready/);

    const fontResponse = await fetch(`${server.url}/__tutor-assets/katex/fonts/KaTeX_Main-Regular.woff2`);
    assert.equal(fontResponse.status, 200);
    assert.equal(fontResponse.headers.get("content-type"), "font/woff2");
    await fontResponse.arrayBuffer();

    const katexCssResponse = await fetch(`${server.url}/__tutor-assets/katex/katex.min.css`);
    assert.equal(katexCssResponse.status, 200);
    assert.match(katexCssResponse.headers.get("content-type") ?? "", /css/);
    await katexCssResponse.text();

    const katexJsResponse = await fetch(`${server.url}/__tutor-assets/katex/katex.min.js`);
    assert.equal(katexJsResponse.status, 200);
    assert.match(katexJsResponse.headers.get("content-type") ?? "", /javascript/);
    await katexJsResponse.text();

    const monacoResponse = await fetch(`${server.url}/__tutor-assets/monaco/vs/loader.js`);
    assert.equal(monacoResponse.status, 200);
    assert.match(monacoResponse.headers.get("content-type") ?? "", /javascript/);
    await monacoResponse.text();

    const textbookResponse = await fetchJson(`${server.url}/api/textbooks/getting-started`);
    assert.equal(textbookResponse.title, "Getting Started");

    const chapterResponse = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/welcome`);
    assert.equal(chapterResponse.title, "Chapter 1: Welcome");
    assert.equal(chapterResponse.textbookId, "getting-started");
    assert.equal(chapterResponse.previousChapter, null);
    assert.deepEqual(chapterResponse.nextChapter, { id: "practice", title: "Chapter 2: Practice" });

    const middleChapterResponse = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/practice`);
    assert.deepEqual(middleChapterResponse.previousChapter, { id: "welcome", title: "Chapter 1: Welcome" });
    assert.deepEqual(middleChapterResponse.nextChapter, { id: "review", title: "Chapter 3: Review" });

    const finalChapterResponse = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/review`);
    assert.deepEqual(finalChapterResponse.previousChapter, { id: "practice", title: "Chapter 2: Practice" });
    assert.equal(finalChapterResponse.nextChapter, null);

    const eventResponse = await fetchJson(`${server.url}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "test_event" })
    });
    assert.equal(eventResponse.ok, true);
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) {
    assert.fail(await response.text());
  }
  return response.json();
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    assert.fail(await response.text());
  }
  return response.text();
}
