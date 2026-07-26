import { expect, test } from "@playwright/test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  server = await startDevServer({ cwd: resolve("examples"), port: 0 });
});

test.afterAll(async () => {
  await server?.close();
  clearWorkspaceCaches();
});

test("syntax highlighting loads when the learner workspace is outside the repository", async ({ page }) => {
  test.setTimeout(60_000);
  const workspace = mkdtempSync(join(tmpdir(), "tutor-kit-syntax-workspace-"));
  initWorkspace(workspace, { starter: true });
  linkTutorKit(workspace);

  const isolatedServer = await startTutorCli(workspace);
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.goto(`${isolatedServer.url}/textbooks/getting-started/chapters/welcome`);
      await expect(page.getByRole("heading", { name: "Chapter 1: Welcome" })).toBeVisible();
      await expect(page.locator('.code-block[data-language="ts"][data-syntax-highlighted="true"]')).toBeVisible({
        timeout: 20_000
      });
    }

    const response = await page.request.get(`${isolatedServer.url}/api/textbooks/getting-started`);
    expect(response.ok()).toBe(true);
  } finally {
    await isolatedServer.close();
  }
});

async function startTutorCli(cwd: string): Promise<{ url: string; close: () => Promise<void> }> {
  const child = spawn(process.execPath, [
    resolve("packages/tutor-kit/dist/cli/index.js"),
    "--cwd",
    cwd,
    "dev",
    "--port",
    "0"
  ], {
    stdio: ["ignore", "pipe", "pipe"]
  });
  let output = "";
  const url = await new Promise<string>((resolveUrl, reject) => {
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, 30_000);
    const inspectOutput = (chunk: Buffer) => {
      output += chunk.toString();
      const match = output.match(/Tutor UI running at (http:\/\/localhost:\d+)/);
      if (!match || timedOut) return;
      clearTimeout(timeout);
      resolveUrl(match[1]);
    };
    child.stdout?.on("data", inspectOutput);
    child.stderr?.on("data", inspectOutput);
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(timedOut
        ? `Timed out starting isolated Tutor CLI:\n${output}`
        : `Isolated Tutor CLI exited with code ${code}:\n${output}`));
    });
  });
  return {
    url,
    close: async () => {
      if (child.exitCode !== null) return;
      child.kill("SIGTERM");
      await once(child, "exit");
    }
  };
}

test("RealWorld code blocks highlight supported languages and leave plaintext alone", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/express-prisma-realworld-articles/chapters/publish-new-article`);

  await expect(page.locator('.code-block[data-language="ts"][data-syntax-highlighted="true"]').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.code-block[data-language="prisma"][data-syntax-highlighted="true"]').first()).toBeVisible();
  await expect(page.locator('.code-block[data-language="json"][data-syntax-highlighted="true"]').first()).toBeVisible();

  const state = await page.locator(".code-block[data-language]").evaluateAll((blocks) => blocks.map((block) => ({
    language: block.getAttribute("data-language"),
    highlighted: block.getAttribute("data-syntax-highlighted") === "true",
    hasTokenSpan: Boolean(block.querySelector("code span"))
  })));

  expect(state.some((block) => block.language === "ts" && block.highlighted && block.hasTokenSpan)).toBe(true);
  expect(state.some((block) => block.language === "prisma" && block.highlighted && block.hasTokenSpan)).toBe(true);
  expect(state.some((block) => block.language === "json" && block.highlighted && block.hasTokenSpan)).toBe(true);
  expect(state.some((block) => block.language === "text" && block.highlighted)).toBe(false);
});

test("unknown code block languages remain readable without throwing", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/express-prisma-realworld-articles/chapters/publish-new-article`);
  await expect(page.locator(".chapter-content")).toBeVisible();

  await page.evaluate(async () => {
    const host = document.querySelector(".chapter-content");
    if (!host) throw new Error("chapter content missing");
    host.insertAdjacentHTML(
      "beforeend",
      '<pre class="code-block" data-language="made-up-language"><code>alpha &amp;&amp; beta</code></pre>'
    );
    await (window as any).highlightCodeBlocks(host);
  });

  const unknown = page.locator('.code-block[data-language="made-up-language"]');
  await expect(unknown).toContainText("alpha && beta");
  await expect(unknown).not.toHaveAttribute("data-syntax-highlighted", "true");
});

test("syntax highlighting preserves plain code block line spacing", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/express-prisma-realworld-articles/chapters/publish-new-article`);
  await expect(page.locator(".code-block.syntax-highlighted").first()).toBeVisible({ timeout: 20_000 });

  const comparisons = await page.locator(".code-block.syntax-highlighted").evaluateAll((blocks) => blocks.map((block) => {
    const source = block.querySelector("code")?.textContent ?? block.textContent ?? "";
    const plain = document.createElement("pre");
    plain.className = "code-block";
    plain.dataset.language = block.getAttribute("data-language") ?? "";
    const code = document.createElement("code");
    code.textContent = source;
    plain.append(code);
    block.after(plain);

    const blockStyle = getComputedStyle(block);
    const plainStyle = getComputedStyle(plain);
    const result = {
      heightDelta: Math.abs(block.getBoundingClientRect().height - plain.getBoundingClientRect().height),
      lineHeight: blockStyle.lineHeight,
      plainLineHeight: plainStyle.lineHeight,
      paddingTop: blockStyle.paddingTop,
      plainPaddingTop: plainStyle.paddingTop,
      paddingBottom: blockStyle.paddingBottom,
      plainPaddingBottom: plainStyle.paddingBottom,
      paddingLeft: blockStyle.paddingLeft,
      plainPaddingLeft: plainStyle.paddingLeft
    };

    plain.remove();
    return result;
  }));

  expect(comparisons.length).toBeGreaterThan(0);
  for (const comparison of comparisons) {
    expect(comparison.heightDelta).toBeLessThan(0.5);
    expect(comparison.lineHeight).toBe(comparison.plainLineHeight);
    expect(comparison.paddingTop).toBe(comparison.plainPaddingTop);
    expect(comparison.paddingBottom).toBe(comparison.plainPaddingBottom);
    expect(comparison.paddingLeft).toBe(comparison.plainPaddingLeft);
  }
});

test("syntax language labels are inset inside code blocks", async ({ page }) => {
  await page.goto(`${server.url}/textbooks/concert-ticketing-onsale/chapters/on-sale-control-plane`);
  const sqlBlock = page.locator('.code-block[data-language="sql"][data-syntax-highlighted="true"]').first();
  await expect(sqlBlock).toBeVisible({ timeout: 20_000 });

  const labelStyle = await sqlBlock.evaluate((block) => {
    const style = getComputedStyle(block, "::before");
    const blockStyle = getComputedStyle(block);
    return {
      content: style.content,
      position: style.position,
      right: style.right,
      paddingRight: blockStyle.paddingRight
    };
  });

  expect(labelStyle.content).toBe('"sql"');
  expect(labelStyle.position).toBe("absolute");
  expect(labelStyle.right).toBe("16px");
  expect(labelStyle.paddingRight).toBe("64px");
});
