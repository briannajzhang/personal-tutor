import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { html } from "../packages/tutor-kit/dist/ui/app.js";

type RenderChartSvg = (props: {
  title: string;
  type: "bar" | "line";
  xLabel?: string;
  yLabel?: string;
  points: Array<{ label: string; value: number }>;
}) => string;

function clientScriptWithoutLoad(): string {
  const scripts = [...html("Chart Test").matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
  const clientScript = scripts.at(-1)?.[1];
  assert.ok(clientScript);
  return clientScript.replace(/\nload\(\)\.catch\([\s\S]*$/, "");
}

function loadRenderChartSvg(): RenderChartSvg {
  const sandbox: { __renderChartSvg?: RenderChartSvg } = {};
  runInNewContext(`${clientScriptWithoutLoad()}\nglobalThis.__renderChartSvg = renderChartSvg;`, sandbox);
  assert.equal(typeof sandbox.__renderChartSvg, "function");
  return sandbox.__renderChartSvg;
}

function tickLabels(svg: string): string[] {
  return [...svg.matchAll(/<text class="chart-value"[^>]*>([^<]+)<\/text>/g)].map((match) => match[1]);
}

test("textbook loads always fetch current source data", async () => {
  let requestCount = 0;
  const sandbox: {
    __loadTextbook?: (textbookId: string) => Promise<{ revision: number }>;
    fetch: (url: string) => Promise<{ ok: boolean; json: () => Promise<{ revision: number }> }>;
  } = {
    async fetch(url) {
      assert.equal(url, "/api/textbooks/course");
      requestCount += 1;
      return {
        ok: true,
        async json() {
          return { revision: requestCount };
        }
      };
    }
  };

  runInNewContext(
    `${clientScriptWithoutLoad()}\nglobalThis.__loadTextbook = loadTextbook;`,
    sandbox
  );

  assert.deepEqual(await sandbox.__loadTextbook?.("course"), { revision: 1 });
  assert.deepEqual(await sandbox.__loadTextbook?.("course"), { revision: 2 });
  assert.equal(requestCount, 2);
});

test("percent charts render a clean 0 to 100 y-axis", () => {
  const renderChartSvg = loadRenderChartSvg();
  const svg = renderChartSvg({
    title: "Checkout Attempt Outcomes, Last Hour",
    type: "bar",
    xLabel: "Outcome",
    yLabel: "Percent of checkout attempts",
    points: [
      { label: "Success", value: 91 },
      { label: "Payment error", value: 4 },
      { label: "Inventory error", value: 3 },
      { label: "Unknown error", value: 2 }
    ]
  });

  assert.deepEqual(tickLabels(svg), ["0", "25", "50", "75", "100"]);
  assert.match(svg, /<rect class="chart-bar"/);
  assert.doesNotMatch(svg, />22\.8</);
  assert.doesNotMatch(svg, />45\.5</);
  assert.doesNotMatch(svg, />68\.3</);
});

test("non-percent charts render readable nice-number ticks", () => {
  const renderChartSvg = loadRenderChartSvg();
  const svg = renderChartSvg({
    title: "Cache Latency",
    type: "line",
    xLabel: "Strategy",
    yLabel: "Milliseconds",
    points: [
      { label: "No cache", value: 240 },
      { label: "Memory", value: 35 },
      { label: "Redis", value: 62 }
    ]
  });

  assert.deepEqual(tickLabels(svg), ["0", "50", "100", "150", "200", "250"]);
  assert.match(svg, /<path class="chart-line"/);
  assert.doesNotMatch(svg, />60</);
  assert.doesNotMatch(svg, />120</);
  assert.doesNotMatch(svg, />180</);
  assert.doesNotMatch(svg, />240</);
});

test("diagram parse errors use Tutor Kit fallback without Mermaid body error SVG", async () => {
  const sourceElement = { textContent: "flowchart TD\n  A -->" };
  const target = { innerHTML: "" };
  const element = {
    dataset: { diagram: "broken-flow" } as Record<string, string>,
    querySelector(selector: string) {
      if (selector === "[data-diagram-source]") return sourceElement;
      if (selector === "[data-diagram-body]") return target;
      return null;
    }
  };
  const document = {
    bodyErrors: [] as string[],
    querySelectorAll(selector: string) {
      assert.equal(selector, "[data-diagram]");
      return [element];
    },
    body: {
      appendChild() {
        document.bodyErrors.push("mermaid-error-svg");
      }
    }
  };
  const mermaid = {
    async parse() {
      throw new Error("bad mermaid syntax");
    },
    async render(_id: string, _source: string, _container: unknown) {
      document.body.appendChild();
      throw new Error("render should not run after parse failure");
    }
  };
  const sandbox: {
    __renderDiagrams?: () => Promise<void>;
    __mermaidStub: typeof mermaid;
    document: typeof document;
  } = {
    __mermaidStub: mermaid,
    document
  };

  runInNewContext(
    `${clientScriptWithoutLoad()}\nloadMermaid = () => Promise.resolve(__mermaidStub);\nglobalThis.__renderDiagrams = renderDiagrams;`,
    sandbox
  );

  await sandbox.__renderDiagrams?.();

  assert.equal(document.bodyErrors.length, 0);
  assert.equal(element.dataset.diagramRendered, "error");
  assert.match(target.innerHTML, /Diagram could not be rendered/);
  assert.match(target.innerHTML, /flowchart TD/);
});
