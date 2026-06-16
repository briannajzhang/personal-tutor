export function html(title: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${css()}</style>
    <link rel="stylesheet" href="/__tutor-assets/katex/katex.min.css" />
  </head>
  <body>
    <div id="app">
      <main id="main"></main>
    </div>
    <script src="/__tutor-assets/katex/katex.min.js"></script>
    <script src="/__tutor-assets/monaco/vs/loader.js"></script>
    <script>${clientJs()}</script>
  </body>
</html>`;
}

function css(): string {
  return `
:root {
  color-scheme: light;
  --ink: #020202;
  --ink-soft: #403e3a;
  --muted: #5e5d59;
  --muted-2: #7d7c77;
  --line: #b5b3ad;
  --paper: #faf9f5;
  --panel: #f1eee6;
  --panel-soft: #f0eee6;
  --accent: #8a5b41;
  --accent-2: #654533;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
button {
  font: inherit;
}
main {
  width: min(1180px, calc(100vw - 160px));
  margin: 0 auto;
  padding: 84px 0 104px;
}
.crumbs {
  min-height: 22px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 42px;
  color: var(--muted);
  font-size: 13px;
}
.crumb-link {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  padding: 0;
}
.crumb-link:hover,
.index-link:hover,
.row:hover {
  color: var(--accent-2);
}
.crumb-current {
  color: var(--ink-soft);
}
.crumb-separator {
  color: var(--muted-2);
}
.page-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
}
h1 {
  margin: 0;
  color: var(--ink);
  font-size: 30px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.16;
}
.meta {
  color: var(--muted);
  font-size: 13px;
  white-space: nowrap;
}
.rows {
  border-top: 1px solid var(--line);
}
.row {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  padding: 24px 0;
  text-align: left;
}
.row-title {
  display: block;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1.2;
}
.row-description {
  display: block;
  max-width: 660px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
  margin-top: 8px;
}
.row-count {
  color: var(--muted-2);
  font-size: 13px;
  white-space: nowrap;
}
.chapter-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 82px;
  align-items: start;
}
.chapter-index {
  position: sticky;
  top: 48px;
  border-top: 1px solid var(--line);
  padding-top: 18px;
}
.index-label {
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.index-list {
  display: grid;
  gap: 2px;
}
.index-link {
  display: block;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  padding: 7px 0;
  text-align: left;
  text-decoration: none;
  font-size: 13px;
  line-height: 1.35;
}
.index-link.subsection {
  padding-left: 18px;
  color: var(--muted-2);
}
.chapter-content {
  min-width: 0;
}
.chapter-navigation {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  border-top: 1px solid var(--line);
  margin-top: 50px;
  padding-top: 24px;
}
.chapter-navigation-button {
  display: grid;
  gap: 7px;
  border: 0;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  padding: 0;
  text-align: left;
}
.chapter-navigation-button.next {
  grid-column: 2;
  text-align: right;
}
.chapter-navigation-button:hover .chapter-navigation-title {
  color: var(--accent-2);
}
.chapter-navigation-label {
  color: var(--muted-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.chapter-navigation-title {
  font-size: 17px;
  font-weight: 560;
  line-height: 1.35;
}
.chapter-section {
  border-top: 1px solid var(--line);
  padding: 32px 0 6px;
}
.chapter-section:first-child {
  padding-top: 0;
  border-top: 0;
}
.section-title {
  margin: 0 0 18px;
  color: var(--ink);
  font-size: 24px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.2;
}
.subsection-block {
  margin-top: 34px;
  padding-top: 0;
}
.subsection-title {
  margin: 0 0 14px;
  color: var(--ink-soft);
  font-size: 18px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.3;
}
.blocks {
  display: grid;
  gap: 18px;
}
.block {
  min-width: 0;
}
.local-heading {
  margin: 10px 0 0;
  color: var(--accent-2);
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0;
}
.local-heading.level-5 {
  color: var(--ink-soft);
  font-size: 13px;
}
.markdown ul,
.markdown ol {
  color: var(--ink-soft);
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 12px;
  padding-left: 22px;
}
.code-block {
  overflow: auto;
  margin: 0 0 12px;
  padding: 14px 16px;
  background: var(--panel-soft);
  border: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  border-radius: 6px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.55;
}
.math-block {
  margin: 2px 0 14px;
  color: var(--accent-2);
  font-size: 23px;
  line-height: 1.4;
}
.math-block .katex-display {
  margin: 0;
  text-align: left;
}
.math .katex {
  font-size: 1.02em;
}
.callout {
  margin: 4px 0 14px;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--panel) 68%, transparent);
  border-left: 3px solid var(--accent);
}
.callout.caution {
  border-left-color: var(--accent-2);
}
.callout.key-idea {
  border-left-color: var(--ink-soft);
}
.callout-title {
  color: var(--accent-2);
  font-size: 12px;
  font-weight: 650;
  letter-spacing: .04em;
  text-transform: uppercase;
  margin: 0 0 7px;
}
.transformation {
  margin: 10px 0 22px;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  background: color-mix(in srgb, var(--panel) 34%, transparent);
}
.transformation-title {
  margin: 0;
  padding: 18px 18px 6px;
  color: var(--ink);
  font-size: 18px;
  font-weight: 560;
}
.transformation-focus {
  padding: 0 18px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 50%, transparent);
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}
.transformation-stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.transformation.layout-flow .transformation-stages,
.transformation.layout-auto.auto-flow .transformation-stages {
  grid-template-columns: 1fr;
}
.transformation.layout-auto.auto-hybrid .transformation-stages {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.transformation.layout-auto.auto-hybrid .transformation-stage-operation {
  grid-column: 1 / -1;
  grid-row: 2;
}
.transformation.layout-auto.auto-hybrid .transformation-stage-output {
  grid-column: 2;
  grid-row: 1;
}
.transformation-stage {
  min-width: 0;
  padding: 16px 18px 18px;
  border-right: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.transformation-stage:last-child {
  border-right: 0;
}
.transformation.layout-flow .transformation-stage,
.transformation.layout-auto.auto-flow .transformation-stage {
  border-right: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.transformation.layout-flow .transformation-stage:last-child,
.transformation.layout-auto.auto-flow .transformation-stage:last-child {
  border-bottom: 0;
}
.transformation.layout-auto.auto-hybrid .transformation-stage-input,
.transformation.layout-auto.auto-hybrid .transformation-stage-output {
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.transformation.layout-auto.auto-hybrid .transformation-stage-output,
.transformation.layout-auto.auto-hybrid .transformation-stage-operation {
  border-right: 0;
}
.transformation-stage-label,
.transformation-artifact-label,
.transformation-explanation-label {
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .07em;
  text-transform: uppercase;
}
.transformation-stage-label {
  margin-bottom: 12px;
}
.transformation-artifacts {
  display: grid;
  gap: 12px;
}
.transformation-artifact {
  min-width: 0;
}
.transformation-artifact-label {
  margin-bottom: 6px;
  color: var(--muted);
  letter-spacing: .04em;
  text-transform: none;
}
.transformation-artifact .code-block,
.transformation-artifact .math-block,
.transformation-artifact .markdown p {
  margin-bottom: 0;
}
.transformation-table-scroll {
  overflow-x: auto;
}
.transformation-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--ink-soft);
  font-size: 13px;
}
.transformation-table th,
.transformation-table td {
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  text-align: left;
  white-space: nowrap;
}
.transformation-table th {
  background: var(--panel-soft);
  color: var(--ink);
  font-weight: 600;
}
.transformation-explanation {
  padding: 16px 18px 18px;
  border-top: 1px solid color-mix(in srgb, var(--line) 50%, transparent);
}
.transformation-explanation-label {
  margin-bottom: 8px;
}
.quiz {
  margin: 10px 0 22px;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  background: color-mix(in srgb, var(--panel) 34%, transparent);
}
.quiz-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 50%, transparent);
}
.quiz-title {
  margin: 0;
  color: var(--ink);
  font-size: 18px;
  font-weight: 560;
  letter-spacing: 0;
}
.quiz-meta {
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}
.quiz-form {
  margin: 0;
  padding: 0;
}
.quiz-question {
  margin: 0;
  padding: 16px 18px;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.quiz-question-title {
  margin: 0 0 12px;
  color: var(--ink-soft);
  font-size: 15px;
  font-weight: 560;
  line-height: 1.5;
}
.quiz-choices {
  display: grid;
  gap: 8px;
}
.quiz-choice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  background: var(--paper);
  color: var(--ink-soft);
  cursor: pointer;
}
.quiz-choice input {
  margin-top: 3px;
}
.quiz-choice.correct {
  border-color: color-mix(in srgb, #2f7d46 68%, var(--line));
  background: color-mix(in srgb, #2f7d46 12%, var(--paper));
}
.quiz-choice.incorrect {
  border-color: color-mix(in srgb, #a33b2f 62%, var(--line));
  background: color-mix(in srgb, #a33b2f 10%, var(--paper));
}
.quiz-explanation {
  margin-top: 12px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--paper) 78%, transparent);
  border-left: 3px solid var(--accent);
}
.quiz-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 18px;
}
.quiz-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.quiz-check,
.quiz-reset {
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  background: var(--paper);
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 13px;
  padding: 7px 11px;
}
.quiz-check {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}
.quiz-score {
  color: var(--muted);
  font-size: 13px;
}
.coding-problem {
  margin: 10px 0 22px;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  background: color-mix(in srgb, var(--panel) 42%, transparent);
}
.coding-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 55%, transparent);
}
.coding-title {
  margin: 0;
  color: var(--ink);
  font-size: 18px;
  font-weight: 560;
  letter-spacing: 0;
}
.coding-language {
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}
.coding-prompt {
  padding: 16px 18px 0;
}
.coding-workspace {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  min-height: 610px;
  border-top: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
}
.coding-problem.files-collapsed .coding-workspace {
  grid-template-columns: minmax(0, 1fr);
}
.coding-problem.files-collapsed .coding-files {
  display: none;
}
.coding-files {
  border-right: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
  padding: 12px 0;
  background: color-mix(in srgb, var(--paper) 56%, transparent);
}
.coding-file {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
  line-height: 1.35;
  overflow: hidden;
  padding: 7px 14px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.coding-file.active {
  color: var(--ink);
  background: var(--panel-soft);
}
.coding-editor-wrap {
  min-width: 0;
}
.coding-editor-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
  color: var(--muted);
  font-size: 12px;
  padding: 0 12px;
}
.coding-editor-status {
  align-items: center;
  display: inline-flex;
  gap: 10px;
}
.coding-files-toggle {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.coding-editor {
  height: 574px;
}
.coding-fallback {
  width: 100%;
  height: 574px;
  border: 0;
  background: var(--paper);
  color: var(--ink-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 12px;
  resize: vertical;
}
.coding-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
}
.coding-action,
.coding-review {
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  background: var(--paper);
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 13px;
  padding: 7px 11px;
}
.coding-action.primary {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}
.coding-output {
  min-height: 80px;
  margin: 0;
  padding: 14px 18px 18px;
  border-top: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
  background: #020202;
  color: #f1eee6;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
}
.coding-feedback {
  margin: 0;
  padding: 14px 18px 18px;
  border-top: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
  background: #020202;
  color: #b5b3ad;
}
.coding-feedback-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}
.coding-feedback-title {
  color: #f0eee6;
  font-size: 13px;
  font-weight: 620;
}
.coding-feedback-path,
.coding-feedback-empty {
  color: #7d7c77;
  font-size: 12px;
  line-height: 1.5;
}
.coding-feedback-refresh {
  border: 0;
  background: transparent;
  color: #b5b3ad;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  padding: 0;
}
.coding-feedback-body.markdown p,
.coding-feedback-body.markdown ul,
.coding-feedback-body.markdown ol {
  color: #b5b3ad;
  font-size: 13px;
  line-height: 1.6;
}
.coding-feedback-body.markdown code {
  background: #403e3a;
  border-color: #5e5d59;
  color: #f1eee6;
}
.coding-feedback-body .math {
  color: #f0eee6;
}
.markdown p {
  color: var(--ink-soft);
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 12px;
}
.markdown code {
  background: var(--panel-soft);
  border: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  padding: 2px 5px;
  border-radius: 5px;
  font-size: .92em;
}
.markdown strong,
.transformation-focus strong {
  color: var(--ink);
  font-weight: 650;
}
.markdown em,
.transformation-focus em {
  font-style: italic;
}
.math {
  color: var(--accent-2);
  font-family: "Times New Roman", serif;
  font-style: italic;
}
body.route-loading {
  cursor: progress;
}
.loading-shell {
  min-height: 240px;
}
.loading-stack {
  display: grid;
  gap: 12px;
}
.loading-bar {
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--panel) 0%, color-mix(in srgb, var(--paper) 82%, transparent) 45%, var(--panel) 100%);
  background-size: 200% 100%;
  animation: loading-bar 1.15s linear infinite;
}
.loading-bar.wide {
  width: min(100%, 560px);
}
.loading-bar.mid {
  width: min(100%, 420px);
}
.loading-bar.short {
  width: min(100%, 260px);
}
@keyframes loading-bar {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
@media (max-width: 860px) {
  main {
    width: min(100vw - 40px, 1180px);
    padding: 36px 0 60px;
  }
  .crumbs {
    margin-bottom: 36px;
  }
  .page-head {
    display: block;
    margin-bottom: 28px;
  }
  .meta {
    margin-top: 12px;
    white-space: normal;
  }
  h1 {
    font-size: 28px;
  }
  .row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 20px 0;
  }
  .row-title {
    font-size: 21px;
  }
  .chapter-layout {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  .chapter-index {
    position: static;
  }
  .chapter-navigation {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .chapter-navigation-button.next {
    grid-column: 1;
    text-align: left;
  }
  .transformation-stages,
  .transformation.layout-auto.auto-hybrid .transformation-stages {
    grid-template-columns: 1fr;
  }
  .transformation.layout-auto.auto-hybrid .transformation-stage-operation,
  .transformation.layout-auto.auto-hybrid .transformation-stage-output {
    grid-column: auto;
    grid-row: auto;
  }
  .transformation-stage {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
  }
  .transformation-stage:last-child {
    border-bottom: 0;
  }
  .coding-workspace {
    grid-template-columns: 1fr;
  }
  .coding-files {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
  }
}`;
}

function clientJs(): string {
  return `
let textbooks = [];
let activeChapter = null;
const codingStates = new Map();
const quizStates = new Map();
let monacoReady = null;
let routeToken = 0;

async function load() {
  textbooks = await fetchJson("/api/textbooks");
  window.addEventListener("popstate", () => { void renderRoute(); });
  window.addEventListener("resize", scheduleTransformationLayouts);
  await renderRoute();
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function renderHome() {
  const totalChapters = textbooks.reduce((sum, textbook) => sum + textbook.chapterCount, 0);
  document.querySelector("#main").innerHTML = \`
    <section>
      <div class="page-head">
        <h1>\${escapeHtml(document.title)}</h1>
        <div class="meta">\${textbooks.length} textbooks / \${totalChapters} chapters</div>
      </div>
      <div class="rows">
        \${textbooks.map((textbook) => \`
          <button class="row" data-textbook="\${escapeAttr(textbook.id)}">
            <span>
              <span class="row-title">\${escapeHtml(textbook.title)}</span>
              \${textbook.description ? \`<span class="row-description">\${escapeHtml(textbook.description)}</span>\` : ""}
            </span>
            <span class="row-count">\${textbook.chapterCount} chapters</span>
          </button>
        \`).join("")}
      </div>
    </section>
  \`;
  document.querySelectorAll("[data-textbook]").forEach((button) => {
    button.addEventListener("click", () => navigateTextbook(button.dataset.textbook));
  });
}

async function renderTextbook(textbookId) {
  const token = beginRouteLoad("Loading textbook...");
  const textbook = await fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}\`);
  if (token !== routeToken) return;
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: textbook.title }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(textbook.title)}</h1>
        <div class="meta">\${textbook.chapters.length} chapters</div>
      </div>
      <div class="rows">
        \${textbook.chapters.map((chapter) => {
          const sectionCount = chapter.sections.length;
          const subsectionCount = chapter.sections.reduce((sum, section) => sum + section.subsections.length, 0);
          return \`
            <button class="row" data-chapter="\${escapeAttr(chapter.id)}">
              <span>
                <span class="row-title">\${escapeHtml(chapter.title)}</span>
                \${chapter.description ? \`<span class="row-description">\${escapeHtml(chapter.description)}</span>\` : ""}
              </span>
              <span class="row-count">\${sectionCount} sections / \${subsectionCount} subsections</span>
            </button>
          \`;
        }).join("")}
      </div>
    </section>
  \`;
  document.querySelectorAll("[data-chapter]").forEach((button) => {
    button.addEventListener("click", () => navigateChapter(textbook.id, button.dataset.chapter));
  });
  bindCrumbs();
  finishRouteLoad(token);
}

async function renderChapter(textbookId, chapterId) {
  const token = beginRouteLoad("Loading chapter...");
  const chapter = await fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  if (token !== routeToken) return;
  activeChapter = chapter;
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: chapter.textbookTitle, action: "textbook", textbookId },
        { label: chapter.title }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(chapter.title)}</h1>
        <div class="meta">\${chapter.sectionCount} sections / \${chapter.subsectionCount} subsections</div>
      </div>
      <div class="chapter-layout">
        <aside class="chapter-index" aria-label="Chapter sections">
          <div class="index-label">Contents</div>
          <div class="index-list">
            \${chapter.sections.map((section) => \`
              <a class="index-link" href="#\${escapeAttr(anchorId(section.id))}">\${escapeHtml(section.title)}</a>
              \${section.subsections.map((subsection) => \`
                <a class="index-link subsection" href="#\${escapeAttr(anchorId(subsection.id))}">\${escapeHtml(subsection.title)}</a>
              \`).join("")}
            \`).join("")}
          </div>
        </aside>
        <div class="chapter-content">
          \${chapter.sections.map((section) => renderSection(section)).join("")}
          \${renderChapterNavigation(chapter)}
        </div>
      </div>
    </section>
  \`;
  bindCrumbs();
  bindChapterIndex();
  bindChapterNavigation(textbookId);
  bindQuizzes(chapter);
  bindCodingProblems(chapter);
  scheduleTransformationLayouts();
  if (document.fonts?.ready) void document.fonts.ready.then(scheduleTransformationLayouts);
  finishRouteLoad(token);
  scrollToHashTarget(window.location.hash, "auto");
}

function renderChapterNavigation(chapter) {
  if (!chapter.previousChapter && !chapter.nextChapter) return "";
  return \`
    <nav class="chapter-navigation" aria-label="Chapter navigation">
      \${chapter.previousChapter ? \`
        <button class="chapter-navigation-button previous" data-chapter-navigation="\${escapeAttr(chapter.previousChapter.id)}">
          <span class="chapter-navigation-label">Previous chapter</span>
          <span class="chapter-navigation-title">\${escapeHtml(chapter.previousChapter.title)}</span>
        </button>
      \` : ""}
      \${chapter.nextChapter ? \`
        <button class="chapter-navigation-button next" data-chapter-navigation="\${escapeAttr(chapter.nextChapter.id)}">
          <span class="chapter-navigation-label">Next chapter</span>
          <span class="chapter-navigation-title">\${escapeHtml(chapter.nextChapter.title)}</span>
        </button>
      \` : ""}
    </nav>
  \`;
}

function bindChapterNavigation(textbookId) {
  document.querySelectorAll("[data-chapter-navigation]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateChapter(textbookId, button.dataset.chapterNavigation, true);
    });
  });
}

function bindChapterIndex() {
  document.querySelectorAll(".index-link[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href") ?? "";
      if (!hash || hash === "#") return;
      const id = parseHashId(hash);
      if (!id || !document.getElementById(id)) return;

      event.preventDefault();
      const nextUrl = window.location.pathname + window.location.search + hash;
      if (window.location.hash === hash) {
        history.replaceState(history.state, "", nextUrl);
      } else {
        history.pushState({}, "", nextUrl);
      }
      scrollToHashTarget(hash, "smooth");
    });
  });
}

function scrollToHashTarget(hash = window.location.hash, behavior = "auto") {
  const id = parseHashId(hash);
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ block: "start", behavior });
  return true;
}

function parseHashId(hash) {
  const value = String(hash ?? "");
  if (!value.startsWith("#") || value.length <= 1) return "";
  try {
    return decodeURIComponent(value.slice(1));
  } catch {
    return value.slice(1);
  }
}

function renderSection(section) {
  return \`
    <section class="chapter-section" id="\${escapeAttr(anchorId(section.id))}">
      <h2 class="section-title">\${escapeHtml(section.title)}</h2>
      \${section.description ? \`<div class="markdown"><p>\${escapeHtml(section.description)}</p></div>\` : ""}
      <div class="blocks">\${section.blocks.map((block) => renderBlock(block)).join("")}</div>
      \${section.subsections.map((subsection) => \`
        <section class="subsection-block" id="\${escapeAttr(anchorId(subsection.id))}">
          <h3 class="subsection-title">\${escapeHtml(subsection.title)}</h3>
          \${subsection.description ? \`<div class="markdown"><p>\${escapeHtml(subsection.description)}</p></div>\` : ""}
          <div class="blocks">\${subsection.blocks.map((block) => renderBlock(block)).join("")}</div>
        </section>
      \`).join("")}
    </section>
  \`;
}

async function renderRoute() {
  const route = parseRoute(window.location.pathname);
  try {
    if (route.kind === "chapter") {
      await renderChapter(route.textbookId, route.chapterId);
      return;
    }
    if (route.kind === "textbook") {
      await renderTextbook(route.textbookId);
      return;
    }
    routeToken += 1;
    finishRouteLoad(routeToken);
    renderHome();
  } catch (error) {
    finishRouteLoad();
    renderRouteError(error);
  }
}

function parseRoute(pathname) {
  const parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] === "textbooks" && parts[1] && parts[2] === "chapters" && parts[3]) {
    return { kind: "chapter", textbookId: parts[1], chapterId: parts[3] };
  }
  if (parts[0] === "textbooks" && parts[1]) {
    return { kind: "textbook", textbookId: parts[1] };
  }
  return { kind: "home" };
}

function navigateHome() {
  history.pushState({}, "", "/");
  void renderRoute();
}

function navigateTextbook(textbookId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}\`);
  void renderRoute();
}

function navigateChapter(textbookId, chapterId, scrollToTop = false) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  if (scrollToTop) window.scrollTo({ top: 0, behavior: "auto" });
  void renderRoute();
}

function renderBlock(block) {
  if (block.kind === "p" || block.kind === "explanation" || block.kind === "blurb") {
    const title = block.props.title ? \`<h4 class="local-heading">\${escapeHtml(block.props.title)}</h4>\` : "";
    return \`<article class="block">\${title}<div class="markdown">\${renderMarkdown(block.props.body)}</div></article>\`;
  }
  if (block.kind === "heading") {
    return \`<h\${block.props.level} class="local-heading level-\${block.props.level}">\${escapeHtml(block.props.text)}</h\${block.props.level}>\`;
  }
  if (block.kind === "list") {
    const tag = block.props.style === "number" ? "ol" : "ul";
    return \`<div class="block markdown"><\${tag}>\${block.props.items.map((item) => \`<li>\${renderInlineMarkdown(item)}</li>\`).join("")}</\${tag}></div>\`;
  }
  if (block.kind === "codeBlock") {
    const language = block.props.language ? \` data-language="\${escapeAttr(block.props.language)}"\` : "";
    return \`<pre class="code-block"\${language}><code>\${escapeHtml(block.props.code)}</code></pre>\`;
  }
  if (block.kind === "mathBlock") {
    return \`<div class="math-block">\${renderMath(block.props.body, true)}</div>\`;
  }
  if (block.kind === "callout") {
    const title = block.props.title ? block.props.title : block.props.tone.replace("-", " ");
    return \`<aside class="callout \${escapeAttr(block.props.tone)}"><div class="callout-title">\${escapeHtml(title)}</div><div class="markdown">\${renderMarkdown(block.props.body)}</div></aside>\`;
  }
  if (block.kind === "transformation") {
    return renderTransformation(block);
  }
  if (block.kind === "codingProblem") {
    return renderCodingProblem(block);
  }
  if (block.kind === "quiz") {
    return renderQuiz(block);
  }
  return \`<article class="block"><div class="markdown"><p>Unsupported block: \${escapeHtml(block.kind)}</p></div></article>\`;
}

function renderTransformation(block) {
  return \`
    <article class="block transformation layout-\${escapeAttr(block.props.layout)}" data-transformation="\${escapeAttr(block.id)}" data-transformation-layout="\${escapeAttr(block.props.layout)}">
      <h4 class="transformation-title">\${escapeHtml(block.props.title)}</h4>
      <div class="transformation-focus">\${renderInlineMarkdown(block.props.focus)}</div>
      <div class="transformation-stages">
        \${renderTransformationStage("input", block.props.inputLabel, block.props.input)}
        \${renderTransformationStage("operation", block.props.operationLabel, [block.props.operation])}
        \${renderTransformationStage("output", block.props.outputLabel, block.props.output)}
      </div>
      <div class="transformation-explanation">
        <div class="transformation-explanation-label">Explanation</div>
        <div class="markdown">\${renderMarkdown(block.props.explanation)}</div>
      </div>
    </article>
  \`;
}

let transformationLayoutFrame = null;

function scheduleTransformationLayouts() {
  if (transformationLayoutFrame !== null) cancelAnimationFrame(transformationLayoutFrame);
  transformationLayoutFrame = requestAnimationFrame(() => {
    transformationLayoutFrame = null;
    updateTransformationLayouts();
  });
}

function updateTransformationLayouts() {
  document.querySelectorAll('[data-transformation-layout="auto"]').forEach((element) => {
    element.classList.remove("auto-flow", "auto-hybrid");
    const inputOverflow = transformationStageOverflows(element, "input");
    const operationOverflow = transformationStageOverflows(element, "operation");
    const outputOverflow = transformationStageOverflows(element, "output");
    if (inputOverflow || outputOverflow) {
      element.classList.add("auto-flow");
    } else if (operationOverflow) {
      element.classList.add("auto-hybrid");
    }
  });
}

function transformationStageOverflows(element, stage) {
  const artifacts = element.querySelectorAll(
    \`[data-transformation-stage="\${stage}"] .code-block, [data-transformation-stage="\${stage}"] .math-block, [data-transformation-stage="\${stage}"] .markdown, [data-transformation-stage="\${stage}"] .transformation-table-scroll\`
  );
  return [...artifacts].some((artifact) => artifact.scrollWidth > artifact.clientWidth + 1);
}

function renderTransformationStage(stage, label, artifacts) {
  return \`
    <section class="transformation-stage transformation-stage-\${escapeAttr(stage)}" data-transformation-stage="\${escapeAttr(stage)}">
      <div class="transformation-stage-label">\${escapeHtml(label)}</div>
      <div class="transformation-artifacts">\${artifacts.map(renderTransformationArtifact).join("")}</div>
    </section>
  \`;
}

function renderTransformationArtifact(artifact) {
  const label = artifact.label
    ? \`<div class="transformation-artifact-label">\${escapeHtml(artifact.label)}</div>\`
    : "";
  let content = "";
  if (artifact.format === "markdown") {
    content = \`<div class="markdown">\${renderMarkdown(artifact.body)}</div>\`;
  } else if (artifact.format === "code") {
    const language = artifact.language ? \` data-language="\${escapeAttr(artifact.language)}"\` : "";
    content = \`<pre class="code-block"\${language}><code>\${escapeHtml(artifact.body)}</code></pre>\`;
  } else if (artifact.format === "math") {
    content = \`<div class="math-block">\${renderMath(artifact.body, true)}</div>\`;
  } else if (artifact.format === "table") {
    content = \`
      <div class="transformation-table-scroll">
        <table class="transformation-table">
          <thead><tr>\${artifact.columns.map((column) => \`<th>\${escapeHtml(column)}</th>\`).join("")}</tr></thead>
          <tbody>\${artifact.rows.map((row) => \`<tr>\${row.map((cell) => \`<td>\${escapeHtml(cell)}</td>\`).join("")}</tr>\`).join("")}</tbody>
        </table>
      </div>
    \`;
  }
  return \`<div class="transformation-artifact">\${label}\${content}</div>\`;
}

function renderQuiz(block) {
  return \`
    <article class="block quiz" data-quiz="\${escapeAttr(block.id)}">
      <div class="quiz-head">
        <h4 class="quiz-title">\${escapeHtml(block.props.title)}</h4>
        <div class="quiz-meta">\${escapeHtml(formatQuizMode(block.props.mode))} / \${block.props.questions.length} questions</div>
      </div>
      <form class="quiz-form">
        \${block.props.questions.map((question, index) => \`
          <fieldset class="quiz-question" data-quiz-question="\${escapeAttr(question.id)}" data-quiz-answer="\${escapeAttr(question.answer)}">
            <div class="quiz-question-title">\${index + 1}. \${renderInlineMarkdown(question.prompt)}</div>
            <div class="quiz-choices">
              \${question.choices.map((choice) => \`
                <label class="quiz-choice" data-quiz-choice="\${escapeAttr(choice.id)}">
                  <input type="radio" name="\${escapeAttr(block.id)}-\${escapeAttr(question.id)}" value="\${escapeAttr(choice.id)}" />
                  <span>\${renderInlineMarkdown(choice.body)}</span>
                </label>
              \`).join("")}
            </div>
            <div class="quiz-explanation markdown" data-quiz-explanation hidden>\${renderMarkdown(question.explanation)}</div>
          </fieldset>
        \`).join("")}
        <div class="quiz-footer">
          <div class="quiz-actions">
            <button class="quiz-check" type="button" data-quiz-check>Check answers</button>
            <button class="quiz-reset" type="button" data-quiz-reset>Try again</button>
          </div>
          <div class="quiz-score" data-quiz-score hidden></div>
        </div>
      </form>
    </article>
  \`;
}

function formatQuizMode(mode) {
  return String(mode ?? "check").replace("-", " ");
}

function bindQuizzes(chapter) {
  quizStates.clear();
  collectChapterBlocks(chapter)
    .filter((block) => block.kind === "quiz")
    .forEach((block) => {
      const element = document.querySelector(\`[data-quiz="\${cssEscape(block.id)}"]\`);
      if (element) void hydrateQuiz(element, block, chapter);
    });
}

async function hydrateQuiz(element, block, chapter) {
  const state = { element, block, chapter, selectedAnswers: {}, submitted: false };
  quizStates.set(block.id, state);
  try {
    const persisted = await fetchJson(\`/api/quiz/state?\${quizQuery(chapter, block)}\`);
    state.selectedAnswers = persisted.selectedAnswers ?? {};
    state.submitted = persisted.submitted === true;
    restoreQuizState(state, persisted);
  } catch {
    // Quiz persistence is a convenience; the quiz remains usable without it.
  }
  element.querySelectorAll("input[type=radio]").forEach((input) => {
    input.addEventListener("change", () => {
      const questionId = input.closest("[data-quiz-question]")?.dataset.quizQuestion;
      if (!questionId) return;
      state.selectedAnswers[questionId] = input.value;
      void saveQuizSelections(state);
    });
  });
  const checkButton = element.querySelector("[data-quiz-check]");
  const resetButton = element.querySelector("[data-quiz-reset]");
  if (checkButton) {
    checkButton.addEventListener("click", () => checkQuizAnswers(state));
  }
  if (resetButton) {
    resetButton.addEventListener("click", () => resetQuiz(state));
  }
}

async function checkQuizAnswers(state) {
  const { element, block, chapter } = state;
  let correct = 0;
  const responses = [];
  for (const question of block.props.questions) {
    const questionElement = element.querySelector(\`[data-quiz-question="\${cssEscape(question.id)}"]\`);
    if (!questionElement) continue;
    const selected = questionElement.querySelector("input:checked")?.value;
    if (selected === question.answer) correct += 1;
    if (selected) {
      state.selectedAnswers[question.id] = selected;
      responses.push({ questionId: question.id, selectedAnswer: selected, correct: selected === question.answer });
    }

    questionElement.querySelectorAll("[data-quiz-choice]").forEach((choiceElement) => {
      const choiceId = choiceElement.dataset.quizChoice;
      choiceElement.classList.toggle("correct", choiceId === question.answer);
      choiceElement.classList.toggle("incorrect", Boolean(selected) && choiceId === selected && selected !== question.answer);
    });

    questionElement.querySelectorAll("input").forEach((input) => {
      input.disabled = true;
    });
    const explanation = questionElement.querySelector("[data-quiz-explanation]");
    if (explanation) explanation.hidden = false;
  }

  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = \`\${correct} / \${block.props.questions.length} correct\`;
    score.hidden = false;
  }
  state.submitted = true;
  await fetchJson("/api/quiz/attempt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: chapter.textbookId,
      chapterId: chapter.id,
      quizId: block.id,
      selectedAnswers: state.selectedAnswers,
      responses,
      score: correct,
      total: block.props.questions.length
    })
  });
}

function resetQuiz(state) {
  const { element } = state;
  state.selectedAnswers = {};
  state.submitted = false;
  element.querySelectorAll("input").forEach((input) => {
    input.checked = false;
    input.disabled = false;
  });
  element.querySelectorAll("[data-quiz-choice]").forEach((choiceElement) => {
    choiceElement.classList.remove("correct", "incorrect");
  });
  element.querySelectorAll("[data-quiz-explanation]").forEach((explanation) => {
    explanation.hidden = true;
  });
  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = "";
    score.hidden = true;
  }
  void saveQuizSelections(state);
}

function restoreQuizState(state, persisted) {
  for (const [questionId, answer] of Object.entries(state.selectedAnswers)) {
    const input = state.element.querySelector(\`[data-quiz-question="\${cssEscape(questionId)}"] input[value="\${cssEscape(answer)}"]\`);
    if (input) input.checked = true;
  }
  if (persisted.submitted) {
    void checkQuizAnswersLocally(state, persisted.score, persisted.total);
  }
}

function checkQuizAnswersLocally(state, persistedScore, persistedTotal) {
  const { element, block } = state;
  for (const question of block.props.questions) {
    const questionElement = element.querySelector(\`[data-quiz-question="\${cssEscape(question.id)}"]\`);
    const selected = state.selectedAnswers[question.id];
    if (!questionElement) continue;
    questionElement.querySelectorAll("[data-quiz-choice]").forEach((choiceElement) => {
      const choiceId = choiceElement.dataset.quizChoice;
      choiceElement.classList.toggle("correct", choiceId === question.answer);
      choiceElement.classList.toggle("incorrect", Boolean(selected) && choiceId === selected && selected !== question.answer);
    });
    questionElement.querySelectorAll("input").forEach((input) => { input.disabled = true; });
    const explanation = questionElement.querySelector("[data-quiz-explanation]");
    if (explanation) explanation.hidden = false;
  }
  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = \`\${persistedScore ?? 0} / \${persistedTotal ?? block.props.questions.length} correct\`;
    score.hidden = false;
  }
}

async function saveQuizSelections(state) {
  await fetchJson("/api/quiz/state", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      quizId: state.block.id,
      selectedAnswers: state.selectedAnswers
    })
  });
}

function quizQuery(chapter, block) {
  return new URLSearchParams({
    textbookId: chapter.textbookId,
    chapterId: chapter.id,
    quizId: block.id
  }).toString();
}

function renderCodingProblem(block) {
  const visibleFiles = block.props.files.filter((file) => !file.hidden);
  const visibleActions = block.props.actions.filter((action) => !action.hidden);
  return \`
    <article class="block coding-problem" data-coding-problem="\${escapeAttr(block.id)}">
      <div class="coding-head">
        <h4 class="coding-title">\${escapeHtml(block.props.title)}</h4>
        <div class="coding-language">\${escapeHtml(block.props.language)}</div>
      </div>
      <div class="coding-prompt markdown">\${renderMarkdown(block.props.prompt)}</div>
      <div class="coding-workspace">
        <div class="coding-files">
          \${visibleFiles.map((file) => \`<button class="coding-file" data-coding-file="\${escapeAttr(file.path)}">\${escapeHtml(file.path)}\${file.editable ? "" : " · read-only"}</button>\`).join("")}
        </div>
        <div class="coding-editor-wrap">
          <div class="coding-editor-meta">
            <span data-coding-active-file></span>
            <span class="coding-editor-status">
              <button class="coding-files-toggle" type="button" data-coding-toggle-files>Hide files</button>
              <span data-coding-save-state>Saved</span>
            </span>
          </div>
          <div class="coding-editor" data-coding-editor></div>
        </div>
      </div>
      <div class="coding-actions">
        \${visibleActions.map((action, index) => \`<button class="coding-action \${index === 0 ? "primary" : ""}" data-coding-action="\${escapeAttr(action.id)}">\${escapeHtml(action.label)}</button>\`).join("")}
        \${block.props.review ? \`<button class="coding-review" data-coding-review>Copy review task</button>\` : ""}
      </div>
      <pre class="coding-output" data-coding-output>Ready.</pre>
      <section class="coding-feedback" data-coding-feedback aria-readonly="true">
        <div class="coding-feedback-head">
          <div>
            <div class="coding-feedback-title">Agent Feedback</div>
          </div>
          <button class="coding-feedback-refresh" type="button" data-coding-refresh-feedback>Refresh</button>
        </div>
        <div class="coding-feedback-body markdown" data-coding-feedback-body></div>
        <div class="coding-feedback-empty" data-coding-feedback-empty>No feedback yet. Copy the review task, ask an agent to review the saved draft, then refresh.</div>
      </section>
    </article>
  \`;
}

function bindCodingProblems(chapter) {
  codingStates.clear();
  collectChapterBlocks(chapter)
    .filter((block) => block.kind === "codingProblem")
    .forEach((block) => {
      const element = document.querySelector(\`[data-coding-problem="\${cssEscape(block.id)}"]\`);
      if (element) hydrateCodingProblem(element, block, chapter);
    });
}

async function hydrateCodingProblem(element, block, chapter) {
  const files = Object.fromEntries(block.props.files.map((file) => [file.path, file.content]));
  const visibleFiles = block.props.files.filter((file) => !file.hidden);
  const firstFile = visibleFiles.find((file) => file.editable) ?? visibleFiles[0] ?? block.props.files[0];
  const state = {
    element,
    block,
    chapter,
    files,
    activePath: firstFile?.path,
    editor: null,
    saveTimer: null,
    latestResult: null,
    draftPath: null,
    feedbackPath: null,
    draftAbsolutePath: null,
    feedbackAbsolutePath: null,
    loadingFile: false
  };
  codingStates.set(block.id, state);

  try {
    const draft = await fetchJson(\`/api/coding/draft?\${codingQuery(chapter, block)}\`);
    state.draftPath = draft.draftPath;
    state.feedbackPath = draft.feedbackPath;
    state.draftAbsolutePath = draft.draftAbsolutePath;
    state.feedbackAbsolutePath = draft.feedbackAbsolutePath;
    for (const [path, content] of Object.entries(draft.files ?? {})) {
      if (block.props.files.some((file) => file.path === path && file.editable)) {
        state.files[path] = content;
      }
    }
  } catch {
    // Drafts are a convenience; the problem should still run without them.
  }

  element.querySelectorAll("[data-coding-file]").forEach((button) => {
    button.addEventListener("click", () => setCodingFile(state, button.dataset.codingFile));
  });

  element.querySelectorAll("[data-coding-action]").forEach((button) => {
    button.addEventListener("click", () => runCodingAction(state, button.dataset.codingAction));
  });

  const reviewButton = element.querySelector("[data-coding-review]");
  if (reviewButton) {
    reviewButton.addEventListener("click", () => copyReviewPrompt(state));
  }

  const toggleButton = element.querySelector("[data-coding-toggle-files]");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => toggleCodingFiles(state));
  }

  const refreshButton = element.querySelector("[data-coding-refresh-feedback]");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => refreshCodingFeedback(state));
  }

  await refreshCodingFeedback(state);
  await mountCodingEditor(state);
  setCodingFile(state, state.activePath);
}

async function mountCodingEditor(state) {
  const container = state.element.querySelector("[data-coding-editor]");
  try {
    const monaco = await loadMonaco();
    state.editor = monaco.editor.create(container, {
      value: "",
      language: "plaintext",
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 13,
      lineHeight: 20,
      scrollBeyondLastLine: false,
      theme: "vs"
    });
    state.editor.onDidChangeModelContent(() => {
      if (state.loadingFile) return;
      const file = currentProblemFile(state);
      if (!file?.editable) return;
      state.files[state.activePath] = state.editor.getValue();
      markDraftState(state, "Saving");
      clearTimeout(state.saveTimer);
      state.saveTimer = setTimeout(() => saveCodingDraft(state), 700);
    });
  } catch (error) {
    container.innerHTML = \`<textarea class="coding-fallback" spellcheck="false"></textarea>\`;
    const textarea = container.querySelector("textarea");
    state.editor = {
      getValue: () => textarea.value,
      setValue: (value) => { textarea.value = value; },
      updateOptions: (options) => { textarea.readOnly = Boolean(options.readOnly); }
    };
    textarea.addEventListener("input", () => {
      if (state.loadingFile) return;
      const file = currentProblemFile(state);
      if (!file?.editable) return;
      state.files[state.activePath] = textarea.value;
      markDraftState(state, "Saving");
      clearTimeout(state.saveTimer);
      state.saveTimer = setTimeout(() => saveCodingDraft(state), 700);
    });
  }
}

function setCodingFile(state, path) {
  if (!path) return;
  const file = state.block.props.files.find((candidate) => candidate.path === path);
  if (!file || file.hidden) return;
  state.activePath = path;
  state.element.querySelectorAll("[data-coding-file]").forEach((button) => {
    button.classList.toggle("active", button.dataset.codingFile === path);
  });
  state.element.querySelector("[data-coding-active-file]").textContent = path;
  if (state.editor) {
    state.loadingFile = true;
    state.editor.setValue(state.files[path] ?? file.content);
    state.loadingFile = false;
    state.editor.updateOptions({ readOnly: !file.editable });
    if (window.monaco?.editor && state.editor.getModel) {
      window.monaco.editor.setModelLanguage(state.editor.getModel(), monacoLanguage(state.block, file));
    }
  }
}

function toggleCodingFiles(state) {
  const collapsed = !state.element.classList.contains("files-collapsed");
  state.element.classList.toggle("files-collapsed", collapsed);
  const button = state.element.querySelector("[data-coding-toggle-files]");
  if (button) button.textContent = collapsed ? "Show files" : "Hide files";
  if (state.editor?.layout) requestAnimationFrame(() => state.editor.layout());
}

async function runCodingAction(state, actionId) {
  syncActiveEditor(state);
  await saveCodingDraft(state);
  const output = state.element.querySelector("[data-coding-output]");
  output.textContent = "Running...";
  const result = await fetchJson("/api/coding/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      blockId: state.block.id,
      actionId,
      files: editableFileContents(state)
    })
  });
  state.latestResult = result;
  output.textContent = formatRunResult(result);
  await refreshCodingFeedback(state);
}

async function saveCodingDraft(state) {
  syncActiveEditor(state);
  const saved = await fetchJson("/api/coding/draft", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      blockId: state.block.id,
      files: editableFileContents(state)
    })
  });
  state.draftPath = saved.draftPath ?? state.draftPath;
  state.feedbackPath = saved.feedbackPath ?? state.feedbackPath;
  state.draftAbsolutePath = saved.draftAbsolutePath ?? state.draftAbsolutePath;
  state.feedbackAbsolutePath = saved.feedbackAbsolutePath ?? state.feedbackAbsolutePath;
  markDraftState(state, "Saved");
  return saved;
}

async function refreshCodingFeedback(state) {
  try {
    const result = await fetchJson(\`/api/coding/feedback?\${codingQuery(state.chapter, state.block)}\`);
    state.feedbackPath = result.feedbackPath ?? state.feedbackPath;
    const bodyTarget = state.element.querySelector("[data-coding-feedback-body]");
    const emptyTarget = state.element.querySelector("[data-coding-feedback-empty]");
    if (!bodyTarget || !emptyTarget) return;
    if (result.feedback && result.feedback.trim()) {
      bodyTarget.innerHTML = renderMarkdown(result.feedback);
      emptyTarget.hidden = true;
    } else {
      bodyTarget.innerHTML = "";
      emptyTarget.hidden = false;
    }
  } catch {
    // Feedback files are optional.
  }
}

async function copyReviewPrompt(state) {
  syncActiveEditor(state);
  await saveCodingDraft(state);
  const draftPath = state.draftAbsolutePath ?? state.draftPath ?? \`tutor-data/drafts/\${state.chapter.textbookId}/\${state.chapter.id}/\${state.block.id}.json\`;
  const feedbackPath = state.feedbackAbsolutePath ?? state.feedbackPath ?? \`tutor-data/feedback/\${state.chapter.textbookId}/\${state.chapter.id}/\${state.block.id}.md\`;
  const visibleSourcePaths = [...new Set(
    state.block.props.files
      .map((file) => problemSourcePath(state, file))
      .filter(Boolean)
  )];
  const prompt = [
    "Review this Tutor Kit coding problem attempt.",
    "",
    "Goal:",
    state.block.props.review ?? "Check correctness, explain the most important issue, and give one focused next step.",
    "",
    "Read:",
    \`- Learner draft: \${draftPath}\`,
    ...visibleSourcePaths.map((path) => \`- Problem file: \${path}\`),
    "- Optional run history: tutor-data/events.jsonl",
    "",
    "Write:",
    \`- Markdown feedback/hints: \${feedbackPath}\`,
    "",
    "Do not ask the learner to paste code. Read the draft JSON, then create or update the feedback file."
  ].filter(Boolean).join("\\n");
  await navigator.clipboard.writeText(prompt);
  await fetchJson("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "coding_review_prompt_copied",
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      blockId: state.block.id
    })
  });
  state.element.querySelector("[data-coding-output]").textContent = \`Review task copied. Feedback target: \${feedbackPath}\`;
}

function problemSourcePath(state, file) {
  if (file.sourcePath) return file.sourcePath;
  if (!file.source) return file.path;
  if (file.source.startsWith("textbooks/")) return file.source;
  return \`textbooks/\${state.chapter.textbookId}/chapters/\${file.source}\`;
}

function syncActiveEditor(state) {
  const file = currentProblemFile(state);
  if (file?.editable && state.editor) {
    state.files[state.activePath] = state.editor.getValue();
  }
}

function editableFileContents(state) {
  return Object.fromEntries(
    state.block.props.files
      .filter((file) => file.editable)
      .map((file) => [file.path, state.files[file.path] ?? file.content])
  );
}

function currentProblemFile(state) {
  return state.block.props.files.find((file) => file.path === state.activePath);
}

function markDraftState(state, text) {
  const target = state.element.querySelector("[data-coding-save-state]");
  if (target) target.textContent = text;
}

function formatRunResult(result) {
  const setupText = result.setup ? [
    "setup:",
    formatShellResult(result.setup)
  ].join("\\n") : "";
  const actionText = [
    "action:",
    formatShellResult(result)
  ].join("\\n");
  return [setupText, actionText].filter(Boolean).join("\\n\\n");
}

function formatShellResult(result) {
  const status = result.timedOut
    ? "Timed out"
    : result.exitCode === 0
      ? "Passed"
      : result.exitCode === null
        ? "Not run"
      : \`Exited with code \${result.exitCode}\`;
  return [
    \`\${status} in \${result.durationMs}ms\${result.truncated ? " (output truncated)" : ""}\`,
    result.stdout ? \`\\nstdout:\\n\${result.stdout}\` : "",
    result.stderr ? \`\\nstderr:\\n\${result.stderr}\` : ""
  ].join("");
}

function codingQuery(chapter, block) {
  return new URLSearchParams({
    textbookId: chapter.textbookId,
    chapterId: chapter.id,
    blockId: block.id
  }).toString();
}

function collectChapterBlocks(chapter) {
  const blocks = [];
  for (const section of chapter.sections) {
    blocks.push(...section.blocks);
    for (const subsection of section.subsections) {
      blocks.push(...subsection.blocks);
    }
  }
  return blocks;
}

function loadMonaco() {
  if (!monacoReady) {
    monacoReady = new Promise((resolve, reject) => {
      if (!window.require) {
        reject(new Error("Monaco loader is unavailable"));
        return;
      }
      window.require.config({ paths: { vs: "/__tutor-assets/monaco/vs" } });
      window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
    });
  }
  return monacoReady;
}

function monacoLanguage(block, file) {
  if (file.language) return file.language;
  const extension = file.path.split(".").pop();
  const byExtension = {
    py: "python",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    h: "cpp",
    hpp: "cpp",
    json: "json",
    md: "markdown",
    sql: "sql"
  };
  return byExtension[extension] ?? block.props.language ?? "plaintext";
}

function renderCrumbs(items) {
  return \`
    <nav class="crumbs" aria-label="Breadcrumb">
      \${items.map((item, index) => {
        const separator = index === 0 ? "" : '<span class="crumb-separator">/</span>';
        if (item.action) {
          const attrs = item.action === "textbook"
            ? \`data-nav="textbook" data-textbook="\${escapeAttr(item.textbookId ?? "")}"\`
            : 'data-nav="home"';
          return \`\${separator}<button class="crumb-link" \${attrs}>\${escapeHtml(item.label)}</button>\`;
        }
        return \`\${separator}<span class="crumb-current">\${escapeHtml(item.label)}</span>\`;
      }).join("")}
    </nav>
  \`;
}

function bindCrumbs() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.nav === "home") {
        navigateHome();
        return;
      }
      if (button.dataset.nav === "textbook" && button.dataset.textbook) {
        navigateTextbook(button.dataset.textbook);
      }
    });
  });
}

function beginRouteLoad(message) {
  const token = ++routeToken;
  document.body.classList.add("route-loading");
  document.querySelector("#main").innerHTML = \`
    <section class="loading-shell" aria-busy="true">
      <div class="page-head">
        <h1>\${escapeHtml(message)}</h1>
        <div class="meta">Fetching content</div>
      </div>
      <div class="loading-stack" aria-hidden="true">
        <div class="loading-bar wide"></div>
        <div class="loading-bar mid"></div>
        <div class="loading-bar wide"></div>
        <div class="loading-bar short"></div>
      </div>
    </section>
  \`;
  return token;
}

function finishRouteLoad(token) {
  if (token && token !== routeToken) return;
  document.body.classList.remove("route-loading");
}

function renderRouteError(error) {
  document.querySelector("#main").innerHTML = \`
    <section>
      <div class="page-head">
        <h1>Unable to load</h1>
      </div>
      <pre>\${escapeHtml(error?.stack || error?.message || String(error))}</pre>
    </section>
  \`;
}

function renderMarkdown(value) {
  return String(value ?? "")
    .split(/\\n{2,}/)
    .map((paragraph) => "<p>" + renderInlineMarkdown(paragraph).replace(/\\n/g, "<br>") + "</p>")
    .join("");
}

function renderInlineMarkdown(value) {
  const source = String(value ?? "");
  let html = "";
  let cursor = 0;
  const pattern = /(\`[^\`]*\`|\\$[^$\\n]+\\$)/g;
  for (const match of source.matchAll(pattern)) {
    html += renderInlineEmphasis(source.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("\`")) {
      html += \`<code>\${escapeHtml(token.slice(1, -1))}</code>\`;
    } else {
      html += \`<span class="math">\${renderMath(token.slice(1, -1), false)}</span>\`;
    }
    cursor = match.index + token.length;
  }
  html += renderInlineEmphasis(source.slice(cursor));
  return html;
}

function renderInlineEmphasis(value) {
  const source = String(value ?? "");
  let html = "";
  let cursor = 0;
  const pattern = /(\\*\\*[^*\\n]+\\*\\*|\\*[^*\\n]+\\*)/g;
  for (const match of source.matchAll(pattern)) {
    html += escapeHtml(source.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      html += \`<strong>\${escapeHtml(token.slice(2, -2))}</strong>\`;
    } else {
      html += \`<em>\${escapeHtml(token.slice(1, -1))}</em>\`;
    }
    cursor = match.index + token.length;
  }
  html += escapeHtml(source.slice(cursor));
  return html;
}

function renderMath(value, displayMode) {
  const source = normalizeLatex(value);
  if (window.katex && typeof window.katex.renderToString === "function") {
    return window.katex.renderToString(source, {
      displayMode,
      throwOnError: false,
      strict: "ignore"
    });
  }
  return escapeHtml(source);
}

function normalizeLatex(value) {
  const slash = String.fromCharCode(92);
  return String(value ?? "")
    .replaceAll(slash + slash, slash)
    .replaceAll(slash + "left", "")
    .replaceAll(slash + "right", "");
}

function anchorId(value) {
  return String(value ?? "").replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(String(value));
  return String(value).replace(/["\\\\]/g, "\\\\$&");
}

load().catch((error) => {
  document.querySelector("#main").innerHTML = \`<section><div class="page-head"><h1>Unable to load</h1></div><pre>\${escapeHtml(error.stack || error.message)}</pre></section>\`;
});
`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
