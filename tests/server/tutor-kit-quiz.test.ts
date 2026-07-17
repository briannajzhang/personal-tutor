import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("quiz attempts persist choice and matching answers", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-quiz-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const selectedAnswers = {
      "source-file-location": "a",
      "join-behavior": { inner: "inner", left: "cross" }
    };
    await fetchJson(`${server.url}/api/quiz/state`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        chapterId: "welcome",
        quizId: "authoring-review",
        selectedAnswers
      })
    });

    const submitted = await fetchJson(`${server.url}/api/quiz/attempt`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        chapterId: "welcome",
        quizId: "authoring-review",
        selectedAnswers,
        responses: [
          { questionId: "source-file-location", selectedAnswer: "a", correct: true },
          { questionId: "join-behavior", selectedAnswer: { inner: "inner", left: "cross" }, correct: false }
        ],
        score: 1,
        total: 2
      })
    });
    assert.deepEqual(submitted.selectedAnswers, selectedAnswers);
    assert.equal(submitted.attempts.length, 1);

    const loaded = await fetchJson(`${server.url}/api/quiz/state?textbookId=getting-started&chapterId=welcome&quizId=authoring-review`);
    assert.equal(loaded.submitted, true);
    assert.deepEqual(loaded.selectedAnswers, selectedAnswers);
    assert.match(readFileSync(join(dir, "tutor-data", "events.jsonl"), "utf8"), /quiz_checked/);
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}
