import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runShell, writeProblemFiles } from "../packages/tutor-kit/dist/core/command-runner.js";

test("shared coding runner preserves output limits and file replacement behavior", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-runner-"));
  const result = await runShell(
    `$NODE -e "process.stdout.write('abcdefgh')"`,
    dir,
    "javascript",
    { maxOutputBytes: 4 }
  );

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, "abcd");
  assert.equal(result.truncated, true);
  assert.equal(result.timedOut, false);

  const spawnFailure = await runShell("echo unreachable", join(dir, "missing"), "javascript", {});
  assert.equal(spawnFailure.exitCode, null);
  assert.match(spawnFailure.stderr, /ENOENT/);

  writeProblemFiles(dir, [{
    path: "src/main.js",
    content: "starter",
    editable: true,
    hidden: false
  }], { "src/main.js": "replacement" });
  assert.equal(readFileSync(join(dir, "src", "main.js"), "utf8"), "replacement");

  assert.throws(() => writeProblemFiles(dir, [{
    path: "../escape.js",
    content: "bad",
    editable: true,
    hidden: false
  }]));
});
