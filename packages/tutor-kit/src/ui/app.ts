export function html(title: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${css()}</style>
  </head>
  <body>
    <div id="app">
      <main id="main"></main>
    </div>
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
  border-top: 1px solid color-mix(in srgb, var(--line) 55%, transparent);
  margin-top: 26px;
  padding-top: 24px;
}
.subsection-title {
  margin: 0 0 14px;
  color: var(--ink-soft);
  font-size: 18px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.3;
}
.widgets {
  display: grid;
  gap: 16px;
}
.widget {
  padding: 0 0 8px;
}
.widget h3 {
  margin: 0 0 10px;
  color: var(--accent-2);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: .02em;
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
.math {
  color: var(--accent-2);
  font-family: "Times New Roman", serif;
  font-style: italic;
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
}`;
}

function clientJs(): string {
  return `
let textbooks = [];

async function load() {
  textbooks = await fetchJson("/api/textbooks");
  window.addEventListener("popstate", () => renderRoute());
  renderRoute();
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
  const textbook = await fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}\`);
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
}

async function renderChapter(textbookId, chapterId) {
  const chapter = await fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
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
        </div>
      </div>
    </section>
  \`;
  bindCrumbs();
}

function renderSection(section) {
  return \`
    <section class="chapter-section" id="\${escapeAttr(anchorId(section.id))}">
      <h2 class="section-title">\${escapeHtml(section.title)}</h2>
      \${section.description ? \`<div class="markdown"><p>\${escapeHtml(section.description)}</p></div>\` : ""}
      <div class="widgets">\${section.widgets.map((widget) => renderWidget(widget)).join("")}</div>
      \${section.subsections.map((subsection) => \`
        <section class="subsection-block" id="\${escapeAttr(anchorId(subsection.id))}">
          <h3 class="subsection-title">\${escapeHtml(subsection.title)}</h3>
          \${subsection.description ? \`<div class="markdown"><p>\${escapeHtml(subsection.description)}</p></div>\` : ""}
          <div class="widgets">\${subsection.widgets.map((widget) => renderWidget(widget)).join("")}</div>
        </section>
      \`).join("")}
    </section>
  \`;
}

function renderRoute() {
  const route = parseRoute(window.location.pathname);
  if (route.kind === "chapter") {
    renderChapter(route.textbookId, route.chapterId);
    return;
  }
  if (route.kind === "textbook") {
    renderTextbook(route.textbookId);
    return;
  }
  renderHome();
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
  renderHome();
}

function navigateTextbook(textbookId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}\`);
  renderTextbook(textbookId);
}

function navigateChapter(textbookId, chapterId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  renderChapter(textbookId, chapterId);
}

function renderWidget(widget) {
  if (widget.kind === "blurb") {
    return \`<article class="widget"><h3>\${escapeHtml(widget.title)}</h3><div class="markdown">\${renderMarkdown(widget.props.body)}</div></article>\`;
  }
  return \`<article class="widget"><h3>\${escapeHtml(widget.title)}</h3><p>Unsupported widget: \${escapeHtml(widget.kind)}</p></article>\`;
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

function renderMarkdown(value) {
  return escapeHtml(value)
    .replace(/\\\`([^\\\`]+)\\\`/g, "<code>$1</code>")
    .replace(/\\$([^$]+)\\$/g, "<span class=\\"math\\">$1</span>")
    .split(/\\n{2,}/)
    .map((paragraph) => "<p>" + paragraph.replace(/\\n/g, "<br>") + "</p>")
    .join("");
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
