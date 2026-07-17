import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { initWorkspace } from "../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches } from "../packages/tutor-kit/dist/compile/discover.js";
import { verifyCodingProblems } from "../packages/tutor-kit/dist/compile/verify-coding.js";
import { linkTutorKit } from "./helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("coding problem verification requires starter failure and reference success", async () => {
  const dir = verifiedWorkspace();
  const result = await verifyCodingProblems(dir);

  assert.equal(result.ok, true, result.output);
  assert.equal(result.problemCount, 1);
  assert.match(result.output, /starter failed as expected; reference solution passed/);
});

test("coding problem verification reports meaningful failure modes", async () => {
  const cases = [
    {
      name: "passing starter",
      options: { starter: "def add_one(x):\n    return x + 1\n" },
      expected: /starter unexpectedly passed/
    },
    {
      name: "failing reference",
      options: { solution: "def add_one(x):\n    return x\n" },
      expected: /reference solution failed/
    },
    {
      name: "setup failure",
      options: { setup: "$PYTHON -c \"raise SystemExit('missing dependency')\"" },
      expected: /starter setup\/runtime failed/
    },
    {
      name: "missing metadata",
      options: { includeVerification: false },
      expected: /should define verification metadata/
    }
  ];

  for (const entry of cases) {
    const result = await verifyCodingProblems(verifiedWorkspace(entry.options));
    assert.equal(result.ok, false, entry.name);
    assert.match(result.output, entry.expected, entry.name);
  }
});

test("CLI verifies full workspaces and supports targeted textbooks", () => {
  const dir = verifiedWorkspace();
  mkdirSync(join(dir, "textbooks", "broken"), { recursive: true });
  writeFileSync(join(dir, "textbooks", "broken", "textbook.ts"), "import missing from './missing.js'; export default missing;\n");
  const cli = join(process.cwd(), "packages", "tutor-kit", "dist", "cli", "index.js");

  const targeted = spawnSync(process.execPath, [cli, "--cwd", dir, "verify", "coding-problems", "--textbook", "getting-started"], {
    encoding: "utf8"
  });
  assert.equal(targeted.status, 0, targeted.stderr || targeted.stdout);
  assert.match(targeted.stdout, /scope: textbook getting-started/);

  const full = spawnSync(process.execPath, [cli, "--cwd", dir, "verify", "coding-problems"], { encoding: "utf8" });
  assert.notEqual(full.status, 0);
  assert.match(full.stdout, /Coding problem verification failed/);
});

function verifiedWorkspace(options: {
  starter?: string;
  solution?: string;
  setup?: string;
  includeVerification?: boolean;
} = {}): string {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-verify-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  writeFileSync(join(dir, "textbooks", "getting-started", "chapters", "welcome.chapter.ts"), `import { chapter, codingProblem, section } from "tutor-kit";

export default chapter({
  id: "welcome",
  title: "Welcome",
  sections: [
    section({
      id: "practice",
      title: "Practice",
      blocks: [
        codingProblem({
          id: "add-one",
          title: "Add One",
          prompt: "Implement add_one so it returns the input plus one and passes the provided tests.",
          language: "python",
          files: [
            { path: "main.py", content: ${JSON.stringify(options.starter ?? "def add_one(x):\n    return x\n")}, editable: true },
            { path: "solution.py", content: ${JSON.stringify(options.solution ?? "def add_one(x):\n    return x + 1\n")}, hidden: true },
            { path: "tests.py", content: "from main import add_one\\nassert add_one(2) == 3\\n" }
          ],
          ${options.setup ? `setup: ${JSON.stringify(options.setup)},` : ""}
          test: "$PYTHON tests.py",
          ${options.includeVerification === false ? "" : `verification: { actionId: "test", referenceFiles: { "main.py": "solution.py" } },`}
          review: "Check the implementation."
        })
      ]
    })
  ]
});
`);
  return dir;
}
