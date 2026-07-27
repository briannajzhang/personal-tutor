import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const cli = join(process.cwd(), "bin", "personal-tutor.js");

function fakeInstalledSkill(): string {
  const skillDir = mkdtempSync(join(tmpdir(), "personal-tutor-installed-"));
  const scriptsDir = join(skillDir, "scripts");
  mkdirSync(scriptsDir, { recursive: true });
  writeFileSync(join(scriptsDir, "tutor-kit.mjs"), [
    "if (process.argv.includes('--help')) {",
    "  console.log('Tutor Kit\\n\\nUsage:\\n  tutor [--cwd path] dev [--port 4177]');",
    "} else {",
    "  console.log(JSON.stringify(process.argv.slice(2)));",
    "}"
  ].join("\n"));
  return skillDir;
}

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

test("help lists the stable dev command", () => {
  const output = execFileSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  assert.match(output, /personal-tutor dev \[options\]/);
  assert.match(output, /npx personal-tutor@latest dev --agent claude-code/);
});

test("dev delegates help to the installed Tutor Kit wrapper", () => {
  const skillDir = fakeInstalledSkill();
  const output = execFileSync(process.execPath, [cli, "dev", "--skill-dir", skillDir, "--help"], {
    encoding: "utf8"
  });
  assert.match(output, /Tutor Kit/);
  assert.match(output, /tutor \[--cwd path\] dev \[--port 4177\]/);
});

test("dev supports Claude Code and passes Tutor Kit options through", () => {
  const skillDir = fakeInstalledSkill();
  const workspace = mkdtempSync(join(tmpdir(), "personal-tutor-library-"));
  const output = execFileSync(process.execPath, [
    cli,
    "dev",
    "--agent",
    "claude-code",
    "--skill-dir",
    skillDir,
    "--cwd",
    workspace,
    "--port",
    "4180"
  ], { encoding: "utf8" });

  assert.deepEqual(JSON.parse(output), ["dev", "--cwd", workspace, "--port", "4180"]);
});

test("unknown commands still fail", () => {
  const result = spawnSync(process.execPath, [cli, "launch"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown command: launch/);
});
