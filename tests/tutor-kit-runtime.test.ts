import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import test from "node:test";
import { addTextbook, initWorkspace } from "../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches, invalidateWorkspaceCaches, loadTextbooks } from "../packages/tutor-kit/dist/compile/discover.js";
import { linkTutorKit } from "./helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("workspace init creates learner memory without overwriting it", () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-runtime-"));
  initWorkspace(dir);
  const memoryPath = join(dir, "memory.md");

  assert.match(readFileSync(memoryPath, "utf8"), /# Learner memory/);
  writeFileSync(memoryPath, "# Learner memory\n\n- Prefer worked examples.\n");
  initWorkspace(dir);

  assert.equal(readFileSync(memoryPath, "utf8"), "# Learner memory\n\n- Prefer worked examples.\n");
});

test("textbook loading can be refreshed after source edits", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-runtime-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const textbookPath = join(dir, "textbooks", "getting-started", "textbook.ts");

  assert.equal((await loadTextbooks(dir)).textbooks[0]?.textbook.title, "Getting Started");
  writeFileSync(textbookPath, readFileSync(textbookPath, "utf8").replace("Getting Started", "Changed Title"));
  invalidateWorkspaceCaches(dir);

  assert.equal((await loadTextbooks(dir)).textbooks[0]?.textbook.title, "Changed Title");
});

test("addTextbook preserves course notes and runtime history", () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-runtime-"));
  initWorkspace(dir);
  const eventsPath = join(dir, "tutor-data", "events.jsonl");
  writeFileSync(eventsPath, "{\"type\":\"quiz_checked\"}\n");

  const result = addTextbook(dir, "sql", "SQL Foundations");
  assert.deepEqual(relativePaths(dir, result.created), ["textbooks/sql/course.md", "textbooks/sql/textbook.ts"]);
  assert.deepEqual(readdirSync(join(dir, "textbooks", "sql", "chapters")), []);
  assert.equal(readFileSync(eventsPath, "utf8"), "{\"type\":\"quiz_checked\"}\n");

  const notesPath = join(dir, "textbooks", "sql", "course.md");
  writeFileSync(notesPath, "# Course: SQL Foundations\n\nLearner wants SQL for analytics.\n");
  assert.equal(addTextbook(dir, "sql", "SQL Foundations").created.length, 0);
  assert.match(readFileSync(notesPath, "utf8"), /Learner wants SQL for analytics/);
});

function relativePaths(root: string, paths: string[]): string[] {
  return paths.map((path) => relative(root, path)).sort();
}
