import assert from "node:assert/strict";
import test from "node:test";
import { shellClientJs } from "../packages/tutor-kit/dist/ui/client/shell.js";

// The inline markdown renderer ships inside the browser client bundle as a
// template-literal string. Pull the relevant functions out of that bundle and
// evaluate them so we can exercise the real, shipped parsing logic here.
function loadInlineRenderers() {
  const js = shellClientJs();
  const names = ["escapeHtml", "renderInlineEmphasis", "renderMath", "renderInlineMarkdown", "renderMarkdown"];
  let src = "";
  for (const name of names) {
    const start = js.indexOf("function " + name + "(");
    assert.notEqual(start, -1, "expected to find " + name + " in the client bundle");
    let depth = 0;
    let end = -1;
    for (let i = js.indexOf("{", start); i < js.length; i += 1) {
      if (js[i] === "{") depth += 1;
      else if (js[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    src += js.slice(start, end) + "\n";
  }
  // Stub KaTeX so rendered math is recognizable and distinct from literal text.
  const window = {
    katex: {
      renderToString(value: string) {
        return `<math-render>${value}</math-render>`;
      }
    }
  };
  return new Function("window", src + "\nreturn { renderInlineMarkdown, renderMarkdown };")(window) as {
    renderInlineMarkdown: (value: string) => string;
    renderMarkdown: (value: string) => string;
  };
}

const { renderInlineMarkdown, renderMarkdown } = loadInlineRenderers();

test("escaped dollar renders a literal $ and is not treated as math", () => {
  const html = renderInlineMarkdown("It costs \\$5 and \\$10 total.");
  assert.equal(html, "It costs $5 and $10 total.");
  assert.doesNotMatch(html, /math-render/);
  assert.doesNotMatch(html, /class="math"/);
});

test("a single escaped dollar does not open a math span", () => {
  const html = renderInlineMarkdown("Pay \\$5 now.");
  assert.equal(html, "Pay $5 now.");
});

test("unescaped $...$ still renders as math", () => {
  const html = renderInlineMarkdown("The formula is $x + y$ here.");
  assert.match(html, /<span class="math"><math-render>x \+ y<\/math-render><\/span>/);
});

test("escaped dollars and real math coexist in one string", () => {
  const html = renderInlineMarkdown("A price \\$5 then math $a^2$ mix.");
  assert.match(html, /^A price \$5 then math <span class="math"><math-render>a\^2<\/math-render><\/span> mix\.$/);
});

test("escaped dollar does not interfere with inline code", () => {
  const html = renderInlineMarkdown("Use `code` and \\$3 together.");
  assert.equal(html, "Use <code>code</code> and $3 together.");
});

test("a literal $ from an escape is HTML-safe alongside other markup", () => {
  const html = renderInlineMarkdown("Compare \\$5 < \\$10 always.");
  assert.equal(html, "Compare $5 &lt; $10 always.");
});

test("renderMarkdown carries the escape through paragraph rendering", () => {
  const html = renderMarkdown("Budget line: \\$5 per unit.");
  assert.equal(html, "<p>Budget line: $5 per unit.</p>");
});
