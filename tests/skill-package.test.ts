import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const skillDir = join(root, "skills", "personal-tutor");

test("skill package has a valid entry point and runnable bundled CLI", () => {
  const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);

  assert.ok(frontmatter, "SKILL.md should start with YAML frontmatter");
  assert.match(frontmatter[1], /^name: personal-tutor$/m);
  assert.match(frontmatter[1], /^description: .+$/m);
  assert.ok(existsSync(join(skillDir, "agents", "openai.yaml")));

  const help = execFileSync(process.execPath, [join(skillDir, "scripts", "tutor-kit.mjs"), "--help"], {
    encoding: "utf8"
  });
  assert.match(help, /Tutor Kit/);
  assert.match(help, /compile/);
  assert.match(help, /verify coding-problems/);
});

test("bundled Tutor Kit matches the package build", () => {
  const output = execFileSync(process.execPath, [join(root, "scripts", "build-skill.mjs"), "--check"], {
    encoding: "utf8"
  });

  assert.match(output, /up to date/);
});
