import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { reportDevTextbookIssues } from "../packages/tutor-kit/dist/cli/dev.js";
import { addTextbook, initWorkspace } from "../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches } from "../packages/tutor-kit/dist/compile/discover.js";
import { linkTutorKit } from "./helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("dev reports load issues and stops when no textbooks can load", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-dev-"));
  initWorkspace(dir, { packageSpec: "tutor-kit" });
  addTextbook(dir, "data-modeling", "Data Modeling");
  const reports: string[] = [];

  await assert.rejects(
    () => reportDevTextbookIssues(dir, (message) => reports.push(message)),
    /Tutor UI did not start because no textbooks could be loaded/
  );

  assert.equal(reports.length, 1);
  assert.match(reports[0] ?? "", /textbook load issue before starting the Tutor UI/);
  assert.match(reports[0] ?? "", /data-modeling/);
  assert.match(reports[0] ?? "", /Cannot find package 'tutor-kit'/);
  assert.doesNotMatch(reports[0] ?? "", /node:internal/);

  const cli = join(process.cwd(), "packages", "tutor-kit", "dist", "cli", "index.js");
  const result = spawnSync(process.execPath, [cli, "--cwd", dir, "dev"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /textbook load issue before starting the Tutor UI/);
  assert.match(result.stderr, /Tutor UI did not start because no textbooks could be loaded/);
});

test("dev reports a broken textbook and continues when another textbook loads", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-dev-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  addTextbook(dir, "broken", "Broken");
  writeFileSync(
    join(dir, "textbooks", "broken", "textbook.ts"),
    "import './missing-module.js';\nexport default {};\n"
  );
  const reports: string[] = [];

  await reportDevTextbookIssues(dir, (message) => reports.push(message));

  assert.equal(reports.length, 1);
  assert.match(reports[0] ?? "", /broken/);
  assert.match(reports[0] ?? "", /missing-module/);
});
