import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { callout, chapter, codeBlock, codingProblem, heading, list, mathBlock, p, projectFiles, section, subsection, textbook, validateTextbook } from "../packages/tutor-kit/src/index.js";
import { compileWorkspace } from "../packages/tutor-kit/src/compile/compile.js";
import { addBlock, addChapter, addTextbook, initWorkspace } from "../packages/tutor-kit/src/cli/workspace.js";
import { startDevServer } from "../packages/tutor-kit/src/server/server.js";

const repoRoot = resolve(import.meta.dirname, "..");
const exampleWorkspace = join(repoRoot, "examples", "learner-workspace");

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

test("compile passes for the example workspace", async () => {
  const result = await compileWorkspace(exampleWorkspace);
  assert.equal(result.ok, true, result.output);
  assert.equal(result.textbookCount, 1);
  assert.equal(result.chapterCount, 1);
  assert.equal(result.sectionCount, 1);
  assert.equal(result.subsectionCount, 1);
  assert.equal(result.blockCount, 7);
});

test("compile reports duplicate block ids", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir);
  linkTutorKit(dir);
  writeFileSync(join(dir, "textbooks", "getting-started", "chapters", "broken.chapter.ts"), `import { chapter, p, section } from "tutor-kit";

export default chapter({
  id: "broken",
  title: "Broken",
  sections: [
    section({
      id: "broken-section",
      title: "1.1 Broken",
      blocks: [
        p({ id: "same", body: "A" }),
        p({ id: "same", body: "B" })
      ]
    })
  ]
});
`);
  writeFileSync(join(dir, "textbooks", "getting-started", "textbook.ts"), `import { textbook } from "tutor-kit";
import broken from "./chapters/broken.chapter.js";

export default textbook({
  id: "getting-started",
  title: "Getting Started",
  chapters: [broken]
});
`);

  const result = await compileWorkspace(dir);
  assert.equal(result.ok, false);
  assert.match(result.output, /Duplicate block id: same/);
});

test("init and add commands create expected workspace files", () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { packageSpec: "file:/tmp/tutor-kit" });
  addTextbook(dir, "mlx", "MLX");
  addChapter(dir, "mlx", "arrays", "Arrays");
  addBlock(dir, "p");

  assert.match(readFileSync(join(dir, "package.json"), "utf8"), /file:\/tmp\/tutor-kit/);
  assert.match(readFileSync(join(dir, "textbooks", "mlx", "textbook.ts"), "utf8"), /id: "mlx"/);
  assert.match(readFileSync(join(dir, "textbooks", "mlx", "chapters", "arrays.chapter.ts"), "utf8"), /id: "arrays"/);
  assert.match(readFileSync(join(dir, "tutor", "blocks", "core.tsx"), "utf8"), /coreBlocks/);
});

test("dev server exposes textbooks, chapters, and appends events", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir);
  linkTutorKit(dir);

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const textbooks = await fetchJson(`${server.url}/api/textbooks`);
    assert.equal(Array.isArray(textbooks), true);
    assert.equal(textbooks[0].id, "getting-started");

    const page = await fetchText(`${server.url}/textbooks/getting-started/chapters/welcome`);
    assert.match(page, /katex/);

    const fontResponse = await fetch(`${server.url}/__tutor-assets/katex/fonts/KaTeX_Main-Regular.woff2`);
    assert.equal(fontResponse.status, 200);
    assert.equal(fontResponse.headers.get("content-type"), "font/woff2");

    const monacoResponse = await fetch(`${server.url}/__tutor-assets/monaco/vs/loader.js`);
    assert.equal(monacoResponse.status, 200);
    assert.match(monacoResponse.headers.get("content-type") ?? "", /javascript/);

    const textbookResponse = await fetchJson(`${server.url}/api/textbooks/getting-started`);
    assert.equal(textbookResponse.title, "Getting Started");

    const chapterResponse = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/welcome`);
    assert.equal(chapterResponse.title, "Welcome");
    assert.equal(chapterResponse.textbookId, "getting-started");

    const eventResponse = await fetchJson(`${server.url}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "test_event" })
    });
    assert.equal(eventResponse.ok, true);
  } finally {
    await server.close();
  }
});

test("coding problems run commands and persist drafts", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir);
  linkTutorKit(dir);

  const problemDir = join(dir, "textbooks", "getting-started", "chapters", "problems", "add-one");
  mkdirSync(problemDir, { recursive: true });
  writeFileSync(join(problemDir, "main.py"), "def add_one(x):\n    return x\n\nif __name__ == \"__main__\":\n    print(add_one(1))\n");
  writeFileSync(join(problemDir, "tests.py"), "from main import add_one\nassert add_one(2) == 3\nprint(\"ok\")\n");
  writeFileSync(join(dir, "textbooks", "getting-started", "chapters", "welcome.chapter.ts"), `import { chapter, codingProblem, projectFiles, section } from "tutor-kit";

const project = projectFiles(import.meta.url, "./problems/add-one");

export default chapter({
  id: "welcome",
  title: "Welcome",
  sections: [
    section({
      id: "practice",
      title: "1.1 Practice",
      blocks: [
        codingProblem({
          id: "add-one",
          title: "Add One",
          prompt: "Fix the function.",
          language: "python",
          files: [
            project.file("main.py", { editable: true }),
            project.file("tests.py")
          ],
          setup: "$PYTHON -c \\"print('setup ok')\\"",
          run: "$PYTHON main.py",
          test: "$PYTHON tests.py",
          review: "Check the implementation."
        })
      ]
    })
  ]
});
`);

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const fixedMain = "def add_one(x):\n    return x + 1\n\nif __name__ == \"__main__\":\n    print(add_one(1))\n";
    const draft = await fetchJson(`${server.url}/api/coding/draft`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        chapterId: "welcome",
        blockId: "add-one",
        files: { "main.py": fixedMain, "tests.py": "ignored" }
      })
    });
    assert.equal(draft.ok, true);

    const loadedDraft = await fetchJson(`${server.url}/api/coding/draft?textbookId=getting-started&chapterId=welcome&blockId=add-one`);
    assert.deepEqual(loadedDraft.files, { "main.py": fixedMain });
    assert.equal(loadedDraft.draftPath, "tutor-data/drafts/getting-started/welcome/add-one.json");
    assert.equal(loadedDraft.feedbackPath, "tutor-data/feedback/getting-started/welcome/add-one.md");
    assert.equal(loadedDraft.draftAbsolutePath, join(dir, "tutor-data", "drafts", "getting-started", "welcome", "add-one.json"));
    assert.equal(loadedDraft.feedbackAbsolutePath, join(dir, "tutor-data", "feedback", "getting-started", "welcome", "add-one.md"));

    const result = await fetchJson(`${server.url}/api/coding/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        chapterId: "welcome",
        blockId: "add-one",
        actionId: "test",
        files: { "main.py": fixedMain }
      })
    });
    assert.equal(result.ok, true);
    assert.match(result.setup.stdout, /setup ok/);
    assert.match(result.stdout, /ok/);

    mkdirSync(join(dir, "tutor-data", "feedback", "getting-started", "welcome"), { recursive: true });
    writeFileSync(join(dir, "tutor-data", "feedback", "getting-started", "welcome", "add-one.md"), "Nice fix.\n");
    const feedback = await fetchJson(`${server.url}/api/coding/feedback?textbookId=getting-started&chapterId=welcome&blockId=add-one`);
    assert.equal(feedback.feedback, "Nice fix.\n");
    assert.equal(feedback.feedbackPath, "tutor-data/feedback/getting-started/welcome/add-one.md");
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) {
    assert.fail(await response.text());
  }
  return response.json();
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    assert.fail(await response.text());
  }
  return response.text();
}

function linkTutorKit(workspace: string): void {
  const nodeModules = join(workspace, "node_modules");
  mkdirSync(nodeModules, { recursive: true });
  const target = join(nodeModules, "tutor-kit");
  symlinkSync(join(repoRoot, "packages", "tutor-kit"), target, "dir");
}
