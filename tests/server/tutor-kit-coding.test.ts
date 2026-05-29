import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

test.afterEach(() => {
  clearWorkspaceCaches();
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
