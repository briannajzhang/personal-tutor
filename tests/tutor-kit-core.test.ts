import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { callout, chapter, codeBlock, codingProblem, heading, list, mathBlock, p, projectFiles, section, subsection, textbook, validateTextbook } from "../packages/tutor-kit/dist/index.js";
import { clearWorkspaceCaches, discoverTextbookFiles, resolveWorkspace } from "../packages/tutor-kit/dist/compile/discover.js";

test.afterEach(() => {
  clearWorkspaceCaches();
});

test("builders create valid textbooks", () => {
  const built = textbook({
    id: "programming",
    title: "Programming",
    chapters: [
      chapter({
        id: "abstractions",
        title: "Chapter 1: Abstractions",
        sections: [
          section({
            id: "elements",
            title: "1.1 Elements",
            blocks: [
              p({ id: "intro", body: "Hello $x$." }),
              heading({ id: "what-next", text: "What comes next" }),
              list({ id: "checks", items: ["Read the expression.", "Evaluate it."] }),
              codeBlock({ id: "code", language: "js", code: "const x = 1;" }),
              mathBlock({ id: "math", body: "x^2 + y^2 = z^2" }),
              callout({ id: "note", tone: "key-idea", body: "Blocks are semantic." }),
              codingProblem({
                id: "double",
                title: "Double",
                prompt: "Implement `double`.",
                language: "python",
                files: [
                  { path: "main.py", content: "def double(x):\n    return x\n", editable: true },
                  { path: "tests.py", content: "from main import double\nassert double(2) == 4\n", editable: false }
                ],
                setup: "$PYTHON -c \"print('ready')\"",
                test: "$PYTHON tests.py"
              })
            ],
            subsections: [
              subsection({
                id: "calls",
                title: "1.1.1 Calls",
                blocks: []
              })
            ]
          })
        ]
      })
    ]
  });

  assert.deepEqual(validateTextbook(built), []);
});

test("discoverTextbookFiles skips symlink directory cycles", () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  const textbooksDir = join(dir, "textbooks");
  const nestedDir = join(textbooksDir, "loop");
  mkdirSync(nestedDir, { recursive: true });
  writeFileSync(join(textbooksDir, "textbook.ts"), "export default {};\n");
  symlinkSync(textbooksDir, join(nestedDir, "back"), "dir");

  const files = discoverTextbookFiles(textbooksDir);
  assert.deepEqual(files, [join(textbooksDir, "textbook.ts")]);
});

test("resolveWorkspace reports the config path on syntax errors", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  writeFileSync(join(dir, "tutor.config.ts"), "export default {\n");

  await assert.rejects(
    resolveWorkspace(dir),
    /Failed to load tutor config .*tutor\.config\.ts/
  );
});
