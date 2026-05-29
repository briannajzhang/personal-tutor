import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearWorkspaceCaches } from "../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "./helpers/tutor-kit.ts";

test.afterEach(() => {
  clearWorkspaceCaches();
});

test("dev server exposes textbooks, chapters, and appends events", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir);
  linkTutorKit(dir);

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const textbooks = await fetchJson(`${server.url}/api/textbooks`);
    assert.equal(Array.isArray(textbooks), true);
    assert.equal(textbooks[0].id, "getting-started");

    const page = await fetchText(`${server.url}/textbooks/getting-started/chapters/welcome`);
    assert.match(page, /katex/);

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
    assert.equal(chapterResponse.title, "Welcome");
    assert.equal(chapterResponse.textbookId, "getting-started");

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
