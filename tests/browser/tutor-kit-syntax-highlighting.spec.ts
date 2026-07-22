import { expect, test } from "@playwright/test";
import { resolve } from "node:path";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";

let server: Awaited<ReturnType<typeof startDevServer>>;

test.beforeAll(async () => {
  server = await startDevServer({ cwd: resolve("examples"), port: 0 });
});

test.afterAll(async () => {
  await server?.close();
  clearWorkspaceCaches();
});

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
      padding: blockStyle.padding,
      plainPadding: plainStyle.padding
    };

    plain.remove();
    return result;
  }));

  expect(comparisons.length).toBeGreaterThan(0);
  for (const comparison of comparisons) {
    expect(comparison.heightDelta).toBeLessThan(0.5);
    expect(comparison.lineHeight).toBe(comparison.plainLineHeight);
    expect(comparison.padding).toBe(comparison.plainPadding);
  }
});
