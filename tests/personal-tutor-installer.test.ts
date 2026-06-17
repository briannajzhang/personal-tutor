import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const cli = join(process.cwd(), "bin", "personal-tutor.js");

test("package metadata exposes an npx-friendly installer", () => {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));

  assert.equal(packageJson.private, undefined);
  assert.equal(packageJson.bin?.["personal-tutor"], "./bin/personal-tutor.js");
  assert.ok(packageJson.files.includes("bin"));
  assert.ok(packageJson.files.includes("skills/personal-tutor"));
});

test("personal-tutor installer copies the skill into a skills directory", () => {
  const skillsDir = mkdtempSync(join(tmpdir(), "personal-tutor-skills-"));

  const output = execFileSync(process.execPath, [cli, "--skills-dir", skillsDir, "--skip-deps"], {
    encoding: "utf8"
  });

  const installedSkill = join(skillsDir, "personal-tutor");
  assert.match(output, /Installed personal-tutor skill/);
  assert.match(output, /practice-heavy Tutor Kit lesson with quizzes and verified exercises/);
  assert.doesNotMatch(output, /study plan/i);
  assert.ok(existsSync(join(installedSkill, "SKILL.md")));
  assert.ok(existsSync(join(installedSkill, "agents", "openai.yaml")));
  assert.ok(existsSync(join(installedSkill, "scripts", "tutor-kit.mjs")));
  assert.ok(existsSync(join(installedSkill, "assets", "tutor-kit", "dist", "cli", "index.js")));
  assert.ok(existsSync(join(installedSkill, "assets", "tutor-kit", "package-lock.json")));
});

test("personal-tutor installer installs bundled Tutor Kit dependencies", () => {
  const dir = mkdtempSync(join(tmpdir(), "personal-tutor-install-"));
  const skillsDir = join(dir, "skills");
  const fakeNpm = join(dir, "fake-npm.js");
  const npmArgsPath = join(dir, "npm-args.txt");

  writeFakeNpm(fakeNpm);
  const output = execFileSync(process.execPath, [cli, "--skills-dir", skillsDir], {
    encoding: "utf8",
    env: {
      ...process.env,
      PERSONAL_TUTOR_NPM_BIN: fakeNpm,
      PERSONAL_TUTOR_FAKE_NPM_ARGS: npmArgsPath
    }
  });

  const installedSkill = join(skillsDir, "personal-tutor");
  const args = readFileSync(npmArgsPath, "utf8");
  assert.match(output, /Tutor Kit dependencies installed/);
  assert.match(output, /bundled Tutor Kit CLI: verified/);
  assert.match(args, /^ci$/m);
  assert.doesNotMatch(args, /--prefix/);
  assert.match(args, /--omit=dev/);
  assert.ok(existsSync(join(installedSkill, "assets", "tutor-kit", "node_modules", "tsx", "package.json")));
});

test("personal-tutor installer supports top-level version flag", () => {
  const output = execFileSync(process.execPath, [cli, "--version"], {
    encoding: "utf8"
  });

  assert.match(output, /^personal-tutor \d+\.\d+\.\d+/);
});

test("personal-tutor installer refuses overwrite unless forced", () => {
  const skillsDir = mkdtempSync(join(tmpdir(), "personal-tutor-skills-"));
  const installedSkill = join(skillsDir, "personal-tutor");

  execFileSync(process.execPath, [cli, "--skills-dir", skillsDir, "--skip-deps"]);
  writeFileSync(join(installedSkill, "LOCAL_EDIT"), "keep me");

  const blocked = spawnSync(process.execPath, [cli, "--skills-dir", skillsDir, "--skip-deps"], {
    encoding: "utf8"
  });
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /already exists/);
  assert.equal(readFileSync(join(installedSkill, "LOCAL_EDIT"), "utf8"), "keep me");

  execFileSync(process.execPath, [cli, "--skills-dir", skillsDir, "--force", "--skip-deps"]);
  assert.equal(existsSync(join(installedSkill, "LOCAL_EDIT")), false);
  assert.ok(existsSync(join(installedSkill, "SKILL.md")));
  assert.ok(existsSync(join(installedSkill, "scripts", "tutor-kit.mjs")));
});

test("personal-tutor installer supports dry runs", () => {
  const skillsDir = mkdtempSync(join(tmpdir(), "personal-tutor-skills-"));
  const output = execFileSync(process.execPath, [cli, "--skills-dir", skillsDir, "--dry-run"], {
    encoding: "utf8"
  });

  assert.match(output, /Would install personal-tutor skill/);
  assert.match(output, /install Tutor Kit dependencies: yes/);
  assert.equal(existsSync(join(skillsDir, "personal-tutor")), false);
});

function writeFakeNpm(path: string): void {
  writeFileSync(path, `#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
writeFileSync(process.env.PERSONAL_TUTOR_FAKE_NPM_ARGS, args.join("\\n"));
const prefix = process.cwd();

function write(path, contents) {
  mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  writeFileSync(path, contents);
}

const nodeModules = join(prefix, "node_modules");
write(join(nodeModules, "tsx", "package.json"), JSON.stringify({
  type: "module",
  exports: { "./esm/api": "./esm/api.js" }
}, null, 2));
write(join(nodeModules, "tsx", "esm", "api.js"), "export function register() { return { unregister: async () => {} }; }\\n");
write(join(nodeModules, "typescript", "package.json"), JSON.stringify({ main: "index.js" }, null, 2));
write(join(nodeModules, "typescript", "index.js"), "module.exports = {};\\n");
write(join(nodeModules, "katex", "package.json"), JSON.stringify({ main: "dist/katex.min.js" }, null, 2));
write(join(nodeModules, "katex", "dist", "katex.min.css"), "/* fake katex */\\n");
write(join(nodeModules, "katex", "dist", "katex.min.js"), "window.katex = {};\\n");
write(join(nodeModules, "katex", "dist", "fonts", ".keep"), "");
write(join(nodeModules, "monaco-editor", "package.json"), JSON.stringify({ name: "monaco-editor" }, null, 2));
write(join(nodeModules, "monaco-editor", "min", "vs", ".keep"), "");
`);
  chmodSync(path, 0o755);
}
