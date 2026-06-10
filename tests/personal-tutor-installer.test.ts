import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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

  const output = execFileSync(process.execPath, [cli, "--skills-dir", skillsDir], {
    encoding: "utf8"
  });

  const installedSkill = join(skillsDir, "personal-tutor");
  assert.match(output, /Installed personal-tutor skill/);
  assert.ok(existsSync(join(installedSkill, "SKILL.md")));
  assert.ok(existsSync(join(installedSkill, "agents", "openai.yaml")));
  assert.ok(existsSync(join(installedSkill, "assets", "tutor-kit", "dist", "cli", "index.js")));
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

  execFileSync(process.execPath, [cli, "--skills-dir", skillsDir]);
  writeFileSync(join(installedSkill, "LOCAL_EDIT"), "keep me");

  const blocked = spawnSync(process.execPath, [cli, "--skills-dir", skillsDir], {
    encoding: "utf8"
  });
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /already exists/);
  assert.equal(readFileSync(join(installedSkill, "LOCAL_EDIT"), "utf8"), "keep me");

  execFileSync(process.execPath, [cli, "--skills-dir", skillsDir, "--force"]);
  assert.equal(existsSync(join(installedSkill, "LOCAL_EDIT")), false);
  assert.ok(existsSync(join(installedSkill, "SKILL.md")));
});

test("personal-tutor installer supports dry runs", () => {
  const skillsDir = mkdtempSync(join(tmpdir(), "personal-tutor-skills-"));
  const output = execFileSync(process.execPath, [cli, "--skills-dir", skillsDir, "--dry-run"], {
    encoding: "utf8"
  });

  assert.match(output, /Would install personal-tutor skill/);
  assert.equal(existsSync(join(skillsDir, "personal-tutor")), false);
});
