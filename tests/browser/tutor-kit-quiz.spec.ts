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

export default chapter({
  id: "welcome",
  title: "Quiz feedback",
  sections: [section({
    id: "practice",
    title: "Practice",
    blocks: [quiz({
      id: "feedback-check",
      title: "Feedback check",
      mode: "check",
      questions: [{
        kind: "multiple-choice",
        id: "result",
        prompt: "Which result is correct?",
        choices: [
          { id: "a", body: "The correct result" },
          { id: "b", body: "The wrong result", explanation: "This choice ignores the final operation." }
        ],
        answer: "a",
        explanation: "The final operation produces the first result.",
        tags: ["feedback"],
        difficulty: "easy"
      }]
    })]
  })]
});
`);
  server = await startDevServer({ cwd, port: 0 });
});

test.afterAll(async () => {
  await server?.close();
  clearWorkspaceCaches();
});

test("wrong quiz choices show useful feedback and restore after reload", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/getting-started/chapters/welcome`);
  const question = page.locator('[data-quiz-question="result"]');

  await question.locator('input[value="b"]').check();
  await page.locator("[data-quiz-check]").click();
  await expect(question.locator("[data-quiz-choice-feedback]")).toContainText("This choice ignores the final operation.");
  await expect(question.locator('[data-quiz-choice="b"]')).toHaveClass(/incorrect/);

  await page.reload();
  await expect(page.locator('[data-quiz-question="result"] input[value="b"]')).toBeChecked();
  await expect(page.locator('[data-quiz-question="result"] input[value="b"]')).toBeDisabled();
});
