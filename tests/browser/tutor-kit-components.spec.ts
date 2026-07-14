import { expect, test } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { createComponentWorkspace } from "../helpers/component-workspace.ts";

let cwd: string;
let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  cwd = createComponentWorkspace();
  server = await startDevServer({ cwd, port: 0 });
});

test.afterAll(async () => {
  await server?.close();
  clearWorkspaceCaches();
});

test("custom component mounts in the lesson DOM and cleans up", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/getting-started/chapters/welcome`);

  const host = page.locator("[data-tutor-component]");
  await expect(host).toHaveAttribute("data-component-state", "ready");
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(host.locator(".component-card")).toHaveCSS("display", "grid");
  await expect(host.locator(".component-card")).toHaveAttribute("data-animated", "true");
  await expect(host.locator("[data-plugin-message]")).toHaveAttribute("data-plugin-message", "plugin loaded");
  await expect(host.locator("[data-asset-url]")).toHaveAttribute(
    "data-asset-url",
    "/__tutor-assets/textbooks/getting-started/assets/example.txt"
  );

  const slider = host.getByRole("slider");
  await slider.fill("10");
  await expect(host.locator("output")).toHaveText("12");
  await expect(slider).toBeFocused();

  writeFileSync(
    join(cwd, "textbooks", "getting-started", "components", "value.ts"),
    "export const step = 3;\n"
  );
  await expect(host.locator("output")).toHaveText("8");
  await expect(page.locator("html")).toHaveAttribute("data-component-abort-count", "1");
  await expect(page.locator("html")).toHaveAttribute("data-component-cleanup-count", "1");
  await expect(page.locator("[data-tutor-component]")).toHaveCount(1);

  await page.getByRole("button", { name: "Getting Started", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Getting Started", exact: true })).toBeVisible();
  await expect(page.locator("[data-tutor-component]")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-component-abort-count", "2");
  await expect(page.locator("html")).toHaveAttribute("data-component-cleanup-count", "2");
});

test("invalid component exports show an inline runtime error", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/getting-started/chapters/welcome`);
  const host = page.locator("[data-tutor-component]");
  await expect(host).toHaveAttribute("data-component-state", "ready");

  writeFileSync(
    join(cwd, "textbooks", "getting-started", "components", "explorer.tsx"),
    "export default {};\n"
  );

  await expect(host).toHaveAttribute("data-component-state", "error");
  await expect(host.getByRole("alert")).toContainText("default export must be created with defineComponent");
});
