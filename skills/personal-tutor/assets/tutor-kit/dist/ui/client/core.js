export function coreClientJs() {
    return `
let textbooks = [];
const glossaryStudyStates = new Map();
let activeChapter = null;
let activeChapterHighlights = [];
let highlightModeEnabled = false;
let highlightSelectionController = null;
const codingStates = new Map();
const quizStates = new Map();
let monacoReady = null;
let mermaidReady = null;
let routeToken = 0;

async function load() {
  window.addEventListener("popstate", () => { void renderRoute(); });
  window.addEventListener("resize", handleViewportResize);
  await renderRoute();
}

function handleViewportResize() {
  scheduleTransformationLayouts();
  syncChapterToolsDisclosure();
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(parseResponseError(body) || response.statusText || "Request failed");
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return response.json();
}

async function loadTextbook(textbookId) {
  return fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}\`);
}

async function renderHome() {
  const token = beginRouteLoad("Loading textbooks...");
  textbooks = await fetchJson("/api/textbooks");
  if (token !== routeToken) return;
  const readyTextbooks = textbooks.filter((textbook) => textbook.status !== "error");
  const totalChapters = readyTextbooks.reduce((sum, textbook) => sum + textbook.chapterCount, 0);
  const repairCount = textbooks.length - readyTextbooks.length;
  const meta = textbooks.length === 0
    ? "No textbooks yet"
    : \`\${readyTextbooks.length} ready / \${totalChapters} chapters\${repairCount ? \` / \${repairCount} needs repair\` : ""}\`;
  document.querySelector("#main").innerHTML = \`
    <section>
      <div class="page-head">
        <h1>\${escapeHtml(document.title)}</h1>
        <div class="meta">\${escapeHtml(meta)}</div>
      </div>
      \${textbooks.length === 0 ? renderEmptyTextbooks() : renderTextbookRows()}
    </section>
  \`;
  document.querySelectorAll("[data-textbook]").forEach((button) => {
    button.addEventListener("click", () => navigateTextbook(button.dataset.textbook));
  });
  document.querySelectorAll("[data-continue-textbook]").forEach((button) => {
    button.addEventListener("click", () => navigateChapter(
      button.dataset.continueTextbook,
      button.dataset.continueChapter,
      true,
      button.dataset.continueHeading
    ));
  });
  finishRouteLoad(token);
}

function renderTextbookRows() {
  return \`
      <div class="rows">
        \${textbooks.map((textbook) => textbook.status === "error"
          ? renderBrokenTextbookRow(textbook)
          : renderReadyTextbookRow(textbook)).join("")}
      </div>
  \`;
}

function renderReadyTextbookRow(textbook) {
  const progress = textbook.progress;
  const complete = progress.totalChapters > 0 && progress.completedChapters === progress.totalChapters;
  const progressLabel = complete ? "Complete" : \`\${progress.completedChapters} of \${progress.totalChapters} chapters complete\`;
  const continueChapter = progress.continueChapter;
  return \`
    <article class="library-row">
      <button class="library-row-main" type="button" data-textbook="\${escapeAttr(textbook.id)}">
        <span class="row-title">\${escapeHtml(textbook.title)}</span>
        \${textbook.description ? \`<span class="row-description">\${escapeHtml(textbook.description)}</span>\` : ""}
      </button>
      <div class="library-row-side">
        <span class="row-count">\${textbook.chapterCount} chapters</span>
        <div class="course-progress" aria-label="\${escapeAttr(progressLabel)}">
          <span class="course-progress-rail"><span style="width: \${progress.percent}%"></span></span>
          <span class="course-progress-label">\${escapeHtml(progressLabel)}</span>
        </div>
        \${continueChapter ? \`<button class="course-continue" type="button" data-continue-textbook="\${escapeAttr(textbook.id)}" data-continue-chapter="\${escapeAttr(continueChapter.id)}" data-continue-heading="\${escapeAttr(continueChapter.headingId ?? "")}">\${progress.visitedChapters ? "Continue" : "Start"}</button>\` : ""}
      </div>
    </article>
  \`;
}

function renderBrokenTextbookRow(textbook) {
  return \`
    <article class="library-row library-row-error">
      <div>
        <span class="repair-label">Needs repair</span>
        <span class="row-title">\${escapeHtml(textbook.title)}</span>
        <span class="row-description">\${escapeHtml(textbook.description)}</span>
        \${textbook.file ? \`<code class="repair-path">\${escapeHtml(textbook.file)}</code>\` : ""}
      </div>
    </article>
  \`;
}

function renderEmptyTextbooks() {
  return \`
    <div class="empty-state">
      <div>
        <div class="empty-kicker">Library is empty</div>
        <h2 class="empty-title">Generate your first textbook</h2>
        <p class="empty-copy">This workspace has no registered Tutor Kit textbooks yet. Published chapters will appear here once a textbook module is added.</p>
      </div>
      <div class="empty-prompt" aria-label="Expected textbook source">
        <span class="empty-prompt-label">Expected source</span>
        <code>textbooks/&lt;textbook-id&gt;/textbook.ts</code>
      </div>
    </div>
  \`;
}

async function renderTextbook(textbookId) {
  const token = beginRouteLoad("Loading textbook...");
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const glossaryEntries = collectTextbookGlossaryEntries(textbook);
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: textbook.title }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(textbook.title)}</h1>
      </div>
      \${renderCourseProgressPanel(textbook)}
      \${renderTextbookTabs("chapters", textbook.chapters.length, glossaryEntries.length)}
      <div class="rows textbook-chapter-rows">
        \${textbook.chapters.map((chapter) => {
          const sectionCount = chapter.sections.length;
          const subsectionCount = chapter.sections.reduce((sum, section) => sum + section.subsections.length, 0);
          const completed = textbook.readingProgress.completedChapterIds.includes(chapter.id);
          return \`
            <button class="row" data-chapter="\${escapeAttr(chapter.id)}">
              <span>
                <span class="row-title">\${escapeHtml(chapter.title)}</span>
                \${chapter.description ? \`<span class="row-description">\${escapeHtml(chapter.description)}</span>\` : ""}
              </span>
              <span class="row-count">\${completed ? "Complete / " : ""}\${sectionCount} sections / \${subsectionCount} subsections</span>
            </button>
          \`;
        }).join("")}
      </div>
    </section>
  \`;
  document.querySelectorAll("[data-chapter]").forEach((button) => {
    button.addEventListener("click", () => navigateChapter(textbook.id, button.dataset.chapter));
  });
  bindTextbookTabs(textbook.id);
  document.querySelector("[data-course-continue]")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    navigateChapter(textbook.id, button.dataset.chapter, true, button.dataset.heading);
  });
  bindCrumbs();
  finishRouteLoad(token);
}

function renderCourseProgressPanel(textbook) {
  const progress = textbook.readingProgress;
  if (!progress || progress.totalChapters === 0) return "";
  const complete = progress.completedChapters === progress.totalChapters;
  const next = progress.continueChapter;
  return \`
    <aside class="course-progress-panel" aria-label="Course progress">
      <div>
        <span class="course-progress-kicker">Course progress</span>
        <strong>\${complete ? "All chapters complete" : \`\${progress.completedChapters} of \${progress.totalChapters} chapters complete\`}</strong>
        <span class="course-progress-rail"><span style="width: \${progress.percent}%"></span></span>
      </div>
      \${next ? \`<button class="course-continue" type="button" data-course-continue data-chapter="\${escapeAttr(next.id)}" data-heading="\${escapeAttr(next.headingId ?? "")}">\${progress.visitedChapters ? "Continue" : "Start"} <span>\${escapeHtml(next.title)}</span></button>\` : ""}
    </aside>
  \`;
}
`;
}
//# sourceMappingURL=core.js.map