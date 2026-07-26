import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("a broken textbook does not block the library or healthy textbooks", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-isolation-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const brokenDir = join(dir, "textbooks", "broken-book");
  mkdirSync(brokenDir, { recursive: true });
  writeFileSync(join(brokenDir, "textbook.ts"), 'import "./missing.js";\nexport default {};\n');

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const libraryResponse = await fetch(`${server.url}/api/textbooks`);
    assert.equal(libraryResponse.status, 200);
    const library = await libraryResponse.json() as Array<{ id: string; status: string }>;
    assert.deepEqual(library.map(({ id, status }) => [id, status]).sort(), [
      ["broken-book", "error"],
      ["getting-started", "ready"]
    ]);
    assert.equal((await fetch(`${server.url}/api/textbooks/getting-started`)).status, 200);
    assert.equal((await fetch(`${server.url}/api/textbooks/getting-started/chapters/welcome`)).status, 200);
    assert.equal((await fetch(`${server.url}/api/textbooks/broken-book`)).status, 422);
  } finally {
    await server.close();
  }
});

test("reading position and completion are reflected across server views", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-reading-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const before = await fetchJson(`${server.url}/api/textbooks`);
    assert.equal(before[0].progress.percent, 0);

    const visited = await fetchJson(`${server.url}/api/reading-progress`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ textbookId: "getting-started", chapterId: "welcome", headingId: "workspace-source", action: "visit" })
    });
    assert.equal(visited.summary.lastChapter.headingId, "workspace-source");

    const completed = await fetchJson(`${server.url}/api/reading-progress`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ textbookId: "getting-started", chapterId: "welcome", action: "complete" })
    });
    assert.equal(completed.summary.percent, 100);
    assert.equal(completed.summary.lastChapter.headingId, "workspace-source");
    const chapter = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/welcome`);
    assert.equal(chapter.chapterCompleted, true);
    const textbook = await fetchJson(`${server.url}/api/textbooks/getting-started`);
    assert.equal(textbook.readingProgress.completedChapters, 1);
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}
