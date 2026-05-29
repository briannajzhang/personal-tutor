import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { compileWorkspace } from "../packages/tutor-kit/dist/compile/compile.js";
import { clearWorkspaceCaches } from "../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../packages/tutor-kit/dist/cli/workspace.js";
import { exampleWorkspace, linkTutorKit } from "./helpers/tutor-kit.ts";

test.afterEach(() => {
  clearWorkspaceCaches();
});

test("compile passes for the example workspace", async () => {
  const result = await compileWorkspace(exampleWorkspace);
  assert.equal(result.ok, true, result.output);
  assert.equal(result.textbookCount, 1);
  assert.equal(result.chapterCount, 1);
  assert.equal(result.sectionCount, 1);
  assert.equal(result.subsectionCount, 1);
  assert.equal(result.blockCount, 7);
});

test("compile reports duplicate block ids", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir);
  linkTutorKit(dir);
  writeFileSync(join(dir, "textbooks", "getting-started", "chapters", "broken.chapter.ts"), `import { chapter, p, section } from "tutor-kit";

export default chapter({
  id: "broken",
  title: "Broken",
  sections: [
    section({
      id: "broken-section",
      title: "1.1 Broken",
      blocks: [
        p({ id: "same", body: "A" }),
        p({ id: "same", body: "B" })
      ]
    })
  ]
});
`);
  writeFileSync(join(dir, "textbooks", "getting-started", "textbook.ts"), `import { textbook } from "tutor-kit";
import broken from "./chapters/broken.chapter.js";

export default textbook({
  id: "getting-started",
  title: "Getting Started",
  chapters: [broken]
});
`);

  const result = await compileWorkspace(dir);
  assert.equal(result.ok, false);
  assert.match(result.output, /Duplicate block id: same/);
});
