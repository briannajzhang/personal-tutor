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
