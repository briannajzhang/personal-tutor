import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { createServer } from "node:http";
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
  initWorkspace(dir, { starter: true });
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

test("dev server rejects a busy port without hanging", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const blocker = createServer();
  await new Promise<void>((resolve) => blocker.listen(0, "127.0.0.1", resolve));
  const address = blocker.address();
  assert.ok(address && typeof address === "object");
  try {
    await assert.rejects(
      startDevServer({ cwd: dir, port: address.port }),
      (error: NodeJS.ErrnoException) => error.code === "EADDRINUSE"
    );
  } finally {
    await new Promise<void>((resolve, reject) => blocker.close((error) => error ? reject(error) : resolve()));
  }
});
