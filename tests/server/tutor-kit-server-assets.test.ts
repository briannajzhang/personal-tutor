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

test("dev server exposes workspace data and protects asset paths", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-server-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);

  const assetsDir = join(dir, "textbooks", "getting-started", "assets");
  mkdirSync(assetsDir, { recursive: true });
  writeFileSync(join(assetsDir, "tiny.png"), "tiny image");

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const textbooks = await fetchJson(`${server.url}/api/textbooks`);
    assert.deepEqual(textbooks.map((entry: { id: string }) => entry.id), ["getting-started"]);

    const textbook = await fetchJson(`${server.url}/api/textbooks/getting-started`);
    assert.equal(textbook.title, "Getting Started");
    assert.equal(textbook.chapters.length, 1);

    const chapter = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/welcome`);
    assert.equal(chapter.title, "Chapter 1: Welcome");
    assert.equal(chapter.textbookId, "getting-started");

    const page = await fetch(`${server.url}/textbooks/getting-started/chapters/welcome`);
    assert.equal(page.status, 200);
    const pageHtml = await page.text();
    assert.match(pageHtml, /<main id="main"><\/main>/);
    assert.match(pageHtml, /<link rel="icon" type="image\/png" href="\/favicon\.ico" \/>/);
    assert.match(pageHtml, /\/__tutor-assets\/app\.css\?v=[a-f0-9]{12}/);
    assert.match(pageHtml, /\/__tutor-assets\/app\.js\?v=[a-f0-9]{12}/);
    assert.ok(Buffer.byteLength(pageHtml) < 2_000);

    const appCssUrl = pageHtml.match(/href="([^"]*\/__tutor-assets\/app\.css\?v=[a-f0-9]{12})"/)?.[1];
    const appJsUrl = pageHtml.match(/src="([^"]*\/__tutor-assets\/app\.js\?v=[a-f0-9]{12})"/)?.[1];
    assert.ok(appCssUrl);
    assert.ok(appJsUrl);
    const [appCss, appJs] = await Promise.all([
      fetch(new URL(appCssUrl, server.url)),
      fetch(new URL(appJsUrl, server.url))
    ]);
    assert.equal(appCss.headers.get("content-type"), "text/css; charset=utf-8");
    assert.equal(appJs.headers.get("content-type"), "text/javascript; charset=utf-8");
    assert.match(appCss.headers.get("cache-control") ?? "", /immutable/);
    assert.match(appJs.headers.get("cache-control") ?? "", /immutable/);
    assert.ok((await appCss.text()).length > 10_000);
    assert.ok((await appJs.text()).length > 10_000);

    const brandIcon = await fetch(`${server.url}/__tutor-assets/brand/wizard-icon.png`);
    assert.equal(brandIcon.status, 200);
    assert.equal(brandIcon.headers.get("content-type"), "image/png");
    assert.ok((await brandIcon.arrayBuffer()).byteLength > 0);

    const favicon = await fetch(`${server.url}/favicon.ico`);
    assert.equal(favicon.status, 200);
    assert.equal(favicon.headers.get("content-type"), "image/png");
    assert.ok((await favicon.arrayBuffer()).byteLength > 0);

    const image = await fetch(`${server.url}/__tutor-assets/textbooks/getting-started/assets/tiny.png`);
    assert.equal(image.status, 200);
    assert.equal(image.headers.get("content-type"), "image/png");
    assert.equal(await image.text(), "tiny image");

    const traversal = await fetch(`${server.url}/__tutor-assets/textbooks/getting-started/assets/../textbook.ts`);
    assert.equal(traversal.status, 404);

    const nonAsset = await fetch(`${server.url}/__tutor-assets/textbooks/getting-started/textbook.ts`);
    assert.equal(nonAsset.status, 404);

    const missingRoute = await fetch(`${server.url}/missing-route`);
    assert.equal(missingRoute.status, 404);

    const event = await fetchJson(`${server.url}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "test_event" })
    });
    assert.equal(event.ok, true);

    const invalidJson = await fetch(`${server.url}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{"
    });
    assert.equal(invalidJson.status, 400);

    const oversizedJson = await fetch(`${server.url}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(1_000_000) })
    });
    assert.equal(oversizedJson.status, 413);
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}
