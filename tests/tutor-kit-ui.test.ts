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

function loadRenderChartSvg(): RenderChartSvg {
  const scripts = [...html("Chart Test").matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
  const clientScript = scripts.at(-1)?.[1];
  assert.ok(clientScript);

  const scriptWithoutLoad = clientScript.replace(/\nload\(\)\.catch\([\s\S]*$/, "");
  const sandbox: { __renderChartSvg?: RenderChartSvg } = {};
  runInNewContext(`${scriptWithoutLoad}\nglobalThis.__renderChartSvg = renderChartSvg;`, sandbox);
  assert.equal(typeof sandbox.__renderChartSvg, "function");
  return sandbox.__renderChartSvg;
}

function tickLabels(svg: string): string[] {
  return [...svg.matchAll(/<text class="chart-value"[^>]*>([^<]+)<\/text>/g)].map((match) => match[1]);
}

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
