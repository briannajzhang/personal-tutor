import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
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

  assert.match(help, /add block <p\|heading\|list\|codeBlock\|mathBlock\|callout\|quiz\|codingProblem>/);
  assert.match(help, /compile \[--textbook textbook-id\]/);
  assert.match(help, /verify coding-problems \[--textbook textbook-id\]/);
});
