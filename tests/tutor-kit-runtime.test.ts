import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { addBlock, addChapter, addTextbook, initWorkspace } from "../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches, invalidateWorkspaceCaches, loadTextbooks } from "../packages/tutor-kit/dist/compile/discover.js";
import { linkTutorKit } from "./helpers/tutor-kit.ts";

test.afterEach(() => {
  clearWorkspaceCaches();
});

test("loadTextbooks cache can be invalidated after file edits", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);

  const textbookPath = join(dir, "textbooks", "getting-started", "textbook.ts");
  const original = readFileSync(textbookPath, "utf8");

  const first = await loadTextbooks(dir);
  assert.equal(first.textbooks[0]?.textbook.title, "Getting Started");

  writeFileSync(textbookPath, original.replace("Getting Started", "Changed Title"));
  invalidateWorkspaceCaches(dir);

  const second = await loadTextbooks(dir);
  assert.equal(second.textbooks[0]?.textbook.title, "Changed Title");
});

test("init and add commands create expected workspace files", () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { packageSpec: "file:/tmp/tutor-kit" });
  addTextbook(dir, "mlx", "MLX");
  addChapter(dir, "mlx", "arrays", "Arrays");
  addBlock(dir, "p");
  addBlock(dir, "quiz");

  assert.match(readFileSync(join(dir, "package.json"), "utf8"), /file:\/tmp\/tutor-kit/);
  assert.equal(existsSync(join(dir, "textbooks", "getting-started")), false);
  assert.match(readFileSync(join(dir, "tsconfig.json"), "utf8"), /textbooks\/\*\*\/chapters\/problems\/\*\*/);
  assert.match(readFileSync(join(dir, "textbooks", "mlx", "textbook.ts"), "utf8"), /id: "mlx"/);
  assert.match(readFileSync(join(dir, "textbooks", "mlx", "chapters", "arrays.chapter.ts"), "utf8"), /id: "arrays"/);
  assert.match(readFileSync(join(dir, "tutor", "blocks", "core.tsx"), "utf8"), /coreBlocks/);
});
