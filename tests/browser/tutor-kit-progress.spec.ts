import { expect, test } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  const cwd = mkdtempSync(join(tmpdir(), "tutor-progress-browser-"));
  initWorkspace(cwd, { starter: true });
  linkTutorKit(cwd);
  server = await startDevServer({ cwd, port: 0 });
});

test.afterAll(async () => {
  await server.close();
});

test("a learner can continue and complete a chapter", async ({ page }) => {
  await page.goto(server.url);
  await expect(page.getByText("0 of 1 chapters complete")).toBeVisible();
  await page.locator("[data-continue-textbook='getting-started']").click();
  await expect(page).toHaveURL(/\/textbooks\/getting-started\/chapters\/welcome/);

  const completion = page.locator("[data-chapter-completion]");
  await completion.click();
  await expect(completion).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Chapter complete", { exact: true })).toBeVisible();

  await page.goto(server.url);
  await expect(page.getByText("Complete", { exact: true })).toBeVisible();
  await page.goto(`${server.url}/textbooks/getting-started/chapters/welcome`);
  await expect(page.locator("[data-chapter-completion]")).toHaveAttribute("aria-pressed", "true");
});
