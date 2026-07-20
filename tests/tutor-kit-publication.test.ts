import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { beginTextbook, publishTextbook } from "../packages/tutor-kit/dist/cli/publication.js";
import { initWorkspace } from "../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches } from "../packages/tutor-kit/dist/compile/discover.js";
import { linkTutorKit } from "./helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("begin creates an isolated work area and publish moves verified source into the library", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-publication-"));
  initWorkspace(dir);
  linkTutorKit(dir);

  const begun = await beginTextbook(dir, "data-modeling", "Data Modeling");
  assert.equal(begun.resumed, false);
  assert.equal(existsSync(join(dir, "textbooks", "data-modeling")), false);
  assert.equal(existsSync(join(begun.workDir, "textbooks", "data-modeling", "textbook.ts")), true);

  const published = await publishTextbook(dir, "data-modeling");
  assert.equal(existsSync(published.publishedDir), true);
  assert.equal(existsSync(join(published.publishedDir, "compile-result.md")), true);
  assert.equal(existsSync(begun.workDir), false);
  assert.equal(published.archivedDir, null);
});

test("publish archives the previous source and preserves learner data", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-publication-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const eventsPath = join(dir, "tutor-data", "events.jsonl");
  writeFileSync(eventsPath, "{\"type\":\"chapter_visited\"}\n");

  const begun = await beginTextbook(dir, "getting-started", "Getting Started");
  const coursePath = join(begun.workDir, "textbooks", "getting-started", "course.md");
  writeFileSync(coursePath, "# Updated course notes\n");
  const published = await publishTextbook(dir, "getting-started");

  assert.ok(published.archivedDir);
  assert.equal(existsSync(join(published.archivedDir!, "textbook.ts")), true);
  assert.equal(readFileSync(join(dir, "textbooks", "getting-started", "course.md"), "utf8"), "# Updated course notes\n");
  assert.equal(readFileSync(eventsPath, "utf8"), "{\"type\":\"chapter_visited\"}\n");
});

test("failed publication leaves published source and work area untouched", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-publication-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const publishedPath = join(dir, "textbooks", "getting-started", "textbook.ts");
  const original = readFileSync(publishedPath, "utf8");
  const begun = await beginTextbook(dir, "getting-started", "Getting Started");
  const stagedPath = join(begun.workDir, "textbooks", "getting-started", "textbook.ts");
  writeFileSync(stagedPath, `import "./missing-module.js";\n${readFileSync(stagedPath, "utf8")}`);

  await assert.rejects(() => publishTextbook(dir, "getting-started"), /Tutor compile failed/);
  assert.equal(readFileSync(publishedPath, "utf8"), original);
  assert.equal(existsSync(begun.workDir), true);
});
