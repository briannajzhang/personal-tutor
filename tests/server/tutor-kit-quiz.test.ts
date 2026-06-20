import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("quiz selections and submitted attempt history persist", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    await fetchJson(`${server.url}/api/quiz/state`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        chapterId: "welcome",
        quizId: "authoring-review",
        selectedAnswers: { "source-file-location": "a" }
      })
    });

    const submitted = await fetchJson(`${server.url}/api/quiz/attempt`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        chapterId: "welcome",
        quizId: "authoring-review",
        selectedAnswers: { "source-file-location": "a" },
        responses: [{ questionId: "source-file-location", selectedAnswer: "a", correct: true }],
        score: 1,
        total: 4
      })
    });
    assert.equal(submitted.attempt, 1);
    assert.equal(submitted.attempts.length, 1);
    assert.deepEqual(submitted.attempts[0].responses, [
      { questionId: "source-file-location", selectedAnswer: "a", correct: true }
    ]);

    const loaded = await fetchJson(`${server.url}/api/quiz/state?textbookId=getting-started&chapterId=welcome&quizId=authoring-review`);
    assert.equal(loaded.submitted, true);
    assert.equal(loaded.score, 1);
    assert.equal(loaded.attempts.length, 1);
    assert.match(readFileSync(join(dir, "tutor-data", "events.jsonl"), "utf8"), /quiz_checked/);
  } finally {
    await server.close();
  }
});

test("quiz state supports mixed choice and matching answers", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
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
    assert.deepEqual(submitted.attempts[0].responses, [
      { questionId: "source-file-location", selectedAnswer: "a", correct: true },
      { questionId: "join-behavior", selectedAnswer: { inner: "inner", left: "cross" }, correct: false }
    ]);

    const loaded = await fetchJson(`${server.url}/api/quiz/state?textbookId=getting-started&chapterId=welcome&quizId=authoring-review`);
    assert.deepEqual(loaded.selectedAnswers, selectedAnswers);
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}
