import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
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

test("dev server handles concurrent root and textbooks requests", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir);
  linkTutorKit(dir);

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const [pageResponse, textbooksResponse] = await Promise.all([
      fetch(`${server.url}/`),
      fetch(`${server.url}/api/textbooks`)
    ]);
    const [pageBody, textbooksBody] = await Promise.all([
      pageResponse.text(),
      textbooksResponse.text()
    ]);

    assert.equal(pageResponse.status, 200, pageBody);
    assert.equal(textbooksResponse.status, 200, textbooksBody);
  } finally {
    await server.close();
  }
});
