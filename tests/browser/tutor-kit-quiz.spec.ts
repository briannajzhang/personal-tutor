import { expect, test } from "@playwright/test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  const cwd = mkdtempSync(join(tmpdir(), "tutor-kit-quiz-browser-"));
  initWorkspace(cwd, { starter: true });
  linkTutorKit(cwd);
  writeFileSync(join(cwd, "textbooks", "getting-started", "chapters", "welcome.chapter.ts"), `import { chapter, quiz, section } from "tutor-kit";

function feedbackCheck(index: number) {
  return quiz({
    id: \`feedback-check-\${index}\`,
    title: \`Feedback check \${index}\`,
    mode: "check",
    questions: [{
      kind: "multiple-choice",
      id: \`result-\${index}\`,
      prompt: "Which result is correct?",
      choices: [
        { id: "a", body: "The correct result" },
        { id: "b", body: "The wrong result", explanation: "This choice ignores the final operation." },
        { id: "c", body: "A nearby but incorrect result" },
        { id: "d", body: "An unrelated result" }
      ],
      answer: "a",
      explanation: "The final operation produces the first result.",
      tags: ["feedback"],
      difficulty: "easy"
    }]
  });
}

export default chapter({
  id: "welcome",
  title: "Quiz feedback",
  sections: [section({
    id: "practice",
    title: "Practice",
    blocks: [1, 2, 3, 4].map(feedbackCheck)
  })]
});
`);
  server = await startDevServer({ cwd, port: 0 });
});

test.afterAll(async () => {
  await server?.close();
  clearWorkspaceCaches();
});

test("rendered quiz choices use the contextual distribution", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/getting-started/chapters/welcome`);
  await expect(page.locator("[data-quiz-question]")).toHaveCount(4);
  await expect(page.locator("[data-quiz-choice]")).toHaveCount(16);
  const positions: number[] = [];
  for (let index = 1; index <= 4; index += 1) {
    const question = page.locator(`[data-quiz-question="result-${index}"]`);
    const choiceIds = await question.locator("[data-quiz-choice]").evaluateAll((choices) => (
      choices.map((choice) => choice.getAttribute("data-quiz-choice"))
    ));
    positions.push(choiceIds.indexOf("a"));
  }

  expect(new Set(positions)).toEqual(new Set([0, 1, 2, 3]));
});

test("wrong quiz choices show useful feedback and restore by choice id after reload", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/getting-started/chapters/welcome`);
  const quizBlock = page.locator('[data-quiz="feedback-check-1"]');
  const question = quizBlock.locator('[data-quiz-question="result-1"]');

  await question.locator('input[value="b"]').check();
  await quizBlock.locator("[data-quiz-check]").click();
  await expect(question.locator("[data-quiz-choice-feedback]")).toContainText("This choice ignores the final operation.");
  await expect(question.locator('[data-quiz-choice="b"]')).toHaveClass(/incorrect/);
  await expect(quizBlock.locator("[data-quiz-score]")).toHaveText("0 / 1 correct");

  await page.reload();
  await expect(page.locator('[data-quiz-question="result-1"] input[value="b"]')).toBeChecked();
  await expect(page.locator('[data-quiz-question="result-1"] input[value="b"]')).toBeDisabled();
  await expect(page.locator('[data-quiz-question="result-1"][data-quiz-answer="a"]')).toBeVisible();
  await expect(page.locator('[data-quiz="feedback-check-1"] [data-quiz-score]')).toHaveText("0 / 1 correct");
});
