import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const cli = join(process.cwd(), "bin", "personal-tutor.js");

test("installer copies a runnable skill and refuses to overwrite local changes", () => {
  const skillsDir = mkdtempSync(join(tmpdir(), "personal-tutor-skills-"));
  const installedSkill = join(skillsDir, "personal-tutor");

  const output = execFileSync(process.execPath, [cli, "--skills-dir", skillsDir, "--skip-deps"], {
    encoding: "utf8"
  });
  assert.match(output, /Installed personal-tutor skill/);
  assert.ok(existsSync(join(installedSkill, "SKILL.md")));
  assert.ok(existsSync(join(installedSkill, "scripts", "tutor-kit.mjs")));
  assert.ok(existsSync(join(installedSkill, "assets", "tutor-kit", "dist", "cli", "index.js")));

  const localEdit = join(installedSkill, "LOCAL_EDIT");
  writeFileSync(localEdit, "keep me");
  const blocked = spawnSync(process.execPath, [cli, "--skills-dir", skillsDir, "--skip-deps"], {
    encoding: "utf8"
  });

  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /already exists/);
  assert.equal(readFileSync(localEdit, "utf8"), "keep me");
});

test("installer supports Claude Code and installing for both agents", () => {
  const root = mkdtempSync(join(tmpdir(), "personal-tutor-agents-"));
  const codexHome = join(root, "codex");
  const claudeHome = join(root, "claude");
  const env = { ...process.env, CODEX_HOME: codexHome, CLAUDE_CONFIG_DIR: claudeHome };

  const output = execFileSync(process.execPath, [cli, "--agent", "all", "--skip-deps"], {
    encoding: "utf8",
    env
  });
  assert.match(output, /Installed personal-tutor skill for Codex/);
  assert.match(output, /Installed personal-tutor skill for Claude Code/);
  assert.ok(existsSync(join(codexHome, "skills", "personal-tutor", "SKILL.md")));
  assert.ok(existsSync(join(claudeHome, "skills", "personal-tutor", "SKILL.md")));
});

test("multi-agent install checks every destination before replacing files", () => {
  const root = mkdtempSync(join(tmpdir(), "personal-tutor-preflight-"));
  const codexHome = join(root, "codex");
  const claudeHome = join(root, "claude");
  const env = { ...process.env, CODEX_HOME: codexHome, CLAUDE_CONFIG_DIR: claudeHome };
  execFileSync(process.execPath, [cli, "--agent", "codex", "--skip-deps"], { env });
  const marker = join(codexHome, "skills", "personal-tutor", "LOCAL_EDIT");
  writeFileSync(marker, "keep me");

  const blocked = spawnSync(process.execPath, [cli, "--agent", "all", "--skip-deps"], {
    encoding: "utf8",
    env
  });
  assert.notEqual(blocked.status, 0);
  assert.equal(readFileSync(marker, "utf8"), "keep me");
  assert.equal(existsSync(join(claudeHome, "skills", "personal-tutor")), false);
});
