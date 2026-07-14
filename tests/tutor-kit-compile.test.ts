import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { compileWorkspace } from "../packages/tutor-kit/dist/compile/compile.js";
import { clearWorkspaceCaches } from "../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../packages/tutor-kit/dist/cli/workspace.js";
import { linkTutorKit } from "./helpers/tutor-kit.ts";

test.afterEach(() => {
  clearWorkspaceCaches();
});

test("compile passes for a generated starter workspace", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);

  const result = await compileWorkspace(dir);
  assert.equal(result.ok, true, result.output);
  assert.equal(result.textbookCount, 1);
  assert.equal(result.chapterCount, 1);
  assert.equal(result.sectionCount, 2);
  assert.equal(result.subsectionCount, 1);
  assert.equal(result.blockCount, 8);
});

test("compile reports duplicate block ids", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
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

test("compile rejects missing textbook image assets", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const chapterPath = join(dir, "textbooks", "getting-started", "chapters", "welcome.chapter.ts");
  const chapterSource = readFileSync(chapterPath, "utf8")
    .replace("import { ", "import { image, ")
    .replace("blocks: [", `blocks: [
        image({
          id: "missing-figure",
          src: "assets/missing.png",
          alt: "A missing test figure."
        }),`);
  writeFileSync(chapterPath, chapterSource);

  const missing = await compileWorkspace(dir);
  assert.equal(missing.ok, false, missing.output);
  assert.match(missing.output, /Image asset does not exist inside the textbook directory: assets\/missing\.png/);

  const assetsDir = join(dir, "textbooks", "getting-started", "assets");
  mkdirSync(assetsDir, { recursive: true });
  writeFileSync(join(assetsDir, "missing.png"), "test image");
  clearWorkspaceCaches();

  const present = await compileWorkspace(dir);
  assert.equal(present.ok, true, present.output);
});

test("targeted compile ignores unrelated broken textbooks", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  mkdirSync(join(dir, "textbooks", "broken"), { recursive: true });
  writeFileSync(join(dir, "textbooks", "broken", "textbook.ts"), "import missing from './missing.js'; export default missing;\n");

  const result = await compileWorkspace(dir, { textbookId: "getting-started" });
  assert.equal(result.ok, true, result.output);
  assert.match(result.output, /scope: textbook getting-started/);
  assert.equal(result.textbookCount, 1);
});

test("compile rejects textbooks that fail learning heuristics", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  writeFileSync(join(dir, "textbooks", "getting-started", "chapters", "welcome.chapter.ts"), `import { chapter, p, section } from "tutor-kit";
export default chapter({
  id: "welcome",
  title: "Welcome",
  sections: [section({
    id: "only-section",
    title: "Only Section",
    blocks: [
      p({ id: "one", body: "Explanation one." }),
      p({ id: "two", body: "Explanation two." }),
      p({ id: "three", body: "Explanation three." }),
      p({ id: "four", body: "Explanation four." })
    ]
  })]
});
`);

  const result = await compileWorkspace(dir);
  assert.equal(result.ok, false, result.output);
  assert.match(result.output, /exposition-heavy/);
});
