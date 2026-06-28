import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("chapter highlights persist, update status, append events, and delete", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const baseHighlight = {
      id: "highlight-1",
      textbookId: "getting-started",
      chapterId: "welcome",
      sectionId: "orientation",
      blockId: "textbook-as-code",
      quote: "Tutor Kit",
      startOffset: 0,
      endOffset: 9,
      prefix: "",
      suffix: " keeps",
      color: "yellow",
      status: "attached",
      createdAt: "2026-06-26T00:00:00.000Z",
      updatedAt: "2026-06-26T00:00:00.000Z"
    };

    const saved = await fetchJson(`${server.url}/api/highlights`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseHighlight)
    });
    assert.equal(saved.highlights.length, 1);
    assert.equal(saved.highlight.id, "highlight-1");
    assert.match(saved.statePath, /tutor-data\/highlights\/getting-started\/welcome\.json/);

    const loaded = await fetchJson(`${server.url}/api/highlights?textbookId=getting-started&chapterId=welcome`);
    assert.equal(loaded.highlights[0].quote, "Tutor Kit");
    assert.equal(loaded.highlights[0].status, "attached");

    const changed = await fetchJson(`${server.url}/api/highlights`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...baseHighlight, status: "changed" })
    });
    assert.equal(changed.highlights[0].status, "changed");

    const removed = await fetchJson(`${server.url}/api/highlights`, {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        chapterId: "welcome",
        id: "highlight-1"
      })
    });
    assert.deepEqual(removed.highlights, []);

    const events = readFileSync(join(dir, "tutor-data", "events.jsonl"), "utf8");
    assert.match(events, /highlight_created/);
    assert.match(events, /highlight_status_changed/);
    assert.match(events, /highlight_deleted/);
  } finally {
    await server.close();
  }
});

test("chapter highlights sanitize storage paths and reject invalid payloads", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const saved = await fetchJson(`${server.url}/api/highlights`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "highlight-unsafe",
        textbookId: "../getting-started",
        chapterId: "welcome/../../bad",
        sectionId: "section",
        blockId: "block",
        quote: "safe",
        startOffset: 1,
        endOffset: 5,
        prefix: "",
        suffix: "",
        color: "yellow",
        status: "attached"
      })
    });
    assert.match(saved.statePath, /tutor-data\/highlights\/\.\._getting-started\/welcome_.._.._bad\.json/);

    const traversal = await fetchJson(`${server.url}/api/highlights`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "highlight-traversal",
        textbookId: "..",
        chapterId: ".",
        sectionId: "section",
        blockId: "block",
        quote: "safe",
        startOffset: 1,
        endOffset: 5,
        prefix: "",
        suffix: "",
        color: "yellow",
        status: "attached"
      })
    });
    assert.match(traversal.statePath, /tutor-data\/highlights\/_\/_\.json/);

    const response = await fetch(`${server.url}/api/highlights`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "bad-highlight",
        textbookId: "getting-started",
        chapterId: "welcome",
        sectionId: "section",
        blockId: "block",
        quote: "safe",
        startOffset: 5,
        endOffset: 1,
        prefix: "",
        suffix: "",
        color: "blue",
        status: "maybe"
      })
    });
    assert.equal(response.ok, false);
    assert.match(await response.text(), /endOffset must be greater than startOffset|color must be yellow|status must be attached/);
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}
