import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { callout, chapter, codeBlock, heading, list, mathBlock, p, section, subsection, textbook, validateTextbook } from "../packages/tutor-kit/src/index.js";
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
              callout({ id: "note", tone: "key-idea", body: "Blocks are semantic." })
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
  assert.equal(result.blockCount, 6);
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
