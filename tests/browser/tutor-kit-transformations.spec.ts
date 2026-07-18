import { expect, test, type Page } from "@playwright/test";
import { blocksClientJs } from "../../packages/tutor-kit/dist/ui/client/blocks.js";
import { css } from "../../packages/tutor-kit/dist/ui/styles.js";

const wideCells = [
  ["A narrow label", "A long explanatory cell that should wrap inside the table instead of forcing a horizontal scrollbar in the lesson.", "Another long consequence cell that is readable only if the table gets a useful stage width first."],
  ["Second label", "This cell deliberately contains enough prose to overflow a compare column before wrapping is enabled.", "The renderer should stack the transformation, then wrap this text."]
];

test("transformation tables choose a wide layout before wrapping cells", async ({ page }) => {
  await mountTransformations(page, 900);

  await expect(page.locator('[data-transformation="compare-wide-output"]')).toHaveClass(/auto-flow/);
  await expect(page.locator('[data-transformation="auto-wide-output"]')).toHaveClass(/auto-flow/);
  await expect(page.locator('[data-transformation="auto-operation-overflow"]')).toHaveClass(/auto-hybrid/);
  await expectNoTableOverflow(page);

  const compareOutputWidth = await page.locator('[data-transformation="compare-wide-output"] [data-transformation-stage="output"]').evaluate((element) => (
    Math.round(element.getBoundingClientRect().width)
  ));
  expect(compareOutputWidth).toBeGreaterThan(300);
});

test("transformation table layout remains readable on mobile and after resize", async ({ page }) => {
  await mountTransformations(page, 390);
  await expectNoTableOverflow(page);

  await page.setViewportSize({ width: 900, height: 900 });
  await scheduleAndWaitForTransformationLayout(page);
  await expectNoTableOverflow(page);
  await expect(page.locator('[data-transformation="compare-wide-output"]')).toHaveClass(/auto-flow/);

  await page.setViewportSize({ width: 390, height: 900 });
  await scheduleAndWaitForTransformationLayout(page);
  await expectNoTableOverflow(page);
});

async function mountTransformations(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.setContent(`<!doctype html>
    <html>
      <head>
        <style>
          :root {
            --paper: #ffffff;
            --panel: #f8f7f4;
            --panel-soft: #eeece7;
            --ink: #1f1d1a;
            --ink-soft: #3f3a34;
            --muted: #6f675f;
            --line: #d7d1c8;
            --accent: #83623f;
            --accent-2: #6d4f2f;
          }
          body { margin: 0; padding: 24px; font-family: system-ui, sans-serif; }
          .chapter-content { max-width: 720px; margin: 0 auto; }
          ${css()}
        </style>
      </head>
      <body>
        <main class="chapter-content">
          ${transformationHtml({
            id: "compare-wide-output",
            layout: "compare",
            input: markdownArtifact("A compact starting case."),
            operation: markdownArtifact("Translate the case into a decision table."),
            output: tableArtifact(["Cue", "Decision", "Reason"], wideCells)
          })}
          ${transformationHtml({
            id: "flow-wide-table",
            layout: "flow",
            input: tableArtifact(["Starting fact", "Interpretation", "Consequence"], wideCells),
            operation: markdownArtifact("Keep the stages vertical."),
            output: markdownArtifact("The table should not scroll horizontally.")
          })}
          ${transformationHtml({
            id: "auto-wide-output",
            layout: "auto",
            input: markdownArtifact("Small input."),
            operation: markdownArtifact("Produce a wide table."),
            output: tableArtifact(["Cue", "Decision", "Reason"], wideCells)
          })}
          ${transformationHtml({
            id: "auto-operation-overflow",
            layout: "auto",
            input: markdownArtifact("Small input."),
            operation: codeArtifact("operation_with_a_long_unbroken_identifier_that_should_trigger_the_hybrid_layout_before_wrapping_tables"),
            output: markdownArtifact("Small output.")
          })}
        </main>
      </body>
    </html>
  `);
  await page.addScriptTag({ content: blocksClientJs() });
  await scheduleAndWaitForTransformationLayout(page);
}

async function scheduleAndWaitForTransformationLayout(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event("resize"));
    scheduleTransformationLayouts();
  });
  await waitForTransformationLayout(page);
}

async function waitForTransformationLayout(page: Page) {
  await page.waitForFunction(() => {
    const measured = [...document.querySelectorAll('[data-transformation-layout="auto"], [data-transformation-layout="compare"]')];
    return measured.length === 3 &&
      measured.every((element) => element.getAttribute("data-transformation-measured") === "true") &&
      !document.documentElement.classList.contains("measuring-transformation-layout");
  });
}

async function expectNoTableOverflow(page: Page) {
  const overflows = await page.locator(".transformation-table-scroll").evaluateAll((elements) => (
    elements.map((element) => Math.ceil(element.scrollWidth - element.clientWidth))
  ));
  expect(Math.max(...overflows)).toBeLessThanOrEqual(1);
}

function transformationHtml(input: { id: string; layout: "auto" | "compare" | "flow"; input: string; operation: string; output: string }) {
  return `<article class="block transformation layout-${input.layout}" data-transformation="${input.id}" data-transformation-layout="${input.layout}">
    <h4 class="transformation-title">Transformation</h4>
    <div class="transformation-focus">Inspect the relationship.</div>
    <div class="transformation-stages">
      ${stageHtml("input", "Input", input.input)}
      ${stageHtml("operation", "Operation", input.operation)}
      ${stageHtml("output", "Output", input.output)}
    </div>
    <div class="transformation-explanation">
      <div class="transformation-explanation-label">Explanation</div>
      <div class="markdown"><p>The layout should stay readable.</p></div>
    </div>
  </article>`;
}

function stageHtml(stage: string, label: string, artifact: string) {
  return `<section class="transformation-stage transformation-stage-${stage}" data-transformation-stage="${stage}">
    <div class="transformation-stage-label">${label}</div>
    <div class="transformation-artifacts">
      <div class="transformation-artifact">${artifact}</div>
    </div>
  </section>`;
}

function markdownArtifact(body: string) {
  return `<div class="markdown"><p>${escapeHtml(body)}</p></div>`;
}

function codeArtifact(body: string) {
  return `<pre class="code-block" data-language="text"><code>${escapeHtml(body)}</code></pre>`;
}

function tableArtifact(columns: string[], rows: string[][]) {
  return `<div class="transformation-table-scroll">
    <table class="transformation-table">
      <thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </div>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
