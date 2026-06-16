import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const skillDir = join(process.cwd(), "skills", "personal-tutor");
const assetDir = join(skillDir, "assets", "tutor-kit");

test("skill folder has UI metadata and no macOS packaging artifacts", () => {
  assert.ok(existsSync(join(skillDir, "agents", "openai.yaml")));
  assert.deepEqual(readdirSync(skillDir).filter((name) => name === ".DS_Store"), []);
});

test("bundled Tutor Kit asset exposes the documented CLI surface", () => {
  assert.ok(existsSync(join(assetDir, "dist", "compile", "verify-coding.js")));

  const help = execFileSync("node", [join(assetDir, "dist", "cli", "index.js"), "--help"], {
    encoding: "utf8"
  });

  assert.match(help, /add block <p\|heading\|list\|codeBlock\|mathBlock\|callout\|transformation\|quiz\|codingProblem>/);
  assert.match(help, /compile \[--textbook textbook-id\]/);
  assert.match(help, /verify coding-problems \[--textbook textbook-id\]/);
});

test("transformation guidance uses one coherence prompt and avoids formulaic adjacency rules", () => {
  const chapterSpecs = readFileSync(join(skillDir, "references", "chapter-specs.md"), "utf8");
  const blockAuthoring = readFileSync(join(skillDir, "references", "block-authoring.md"), "utf8");
  const reviewRubric = readFileSync(join(skillDir, "references", "review-rubric.md"), "utf8");

  assert.match(chapterSpecs, /coherence and lesson role/);
  assert.doesNotMatch(chapterSpecs, /necessary framing before the block/);
  assert.doesNotMatch(chapterSpecs, /generalization, implication, trap, or learner action after the block/);
  assert.match(blockAuthoring, /distinct teaching move/);
  assert.match(blockAuthoring, /baseline, temporary state, intermediate result, rejected input, or comparison output/);
  assert.match(reviewRubric, /stock openings, transition phrases, generic bridges, or identical mastery endings/);
});
