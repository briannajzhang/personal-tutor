export function coreClientJs(): string {
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

async function renderHome(token) {
  textbooks = await fetchJson("/api/textbooks");
  if (token !== routeToken) return;
  const readyTextbooks = textbooks.filter((textbook) => textbook.status !== "error");
  const repairCount = textbooks.length - readyTextbooks.length;
  const meta = textbooks.length === 0
    ? "No textbooks yet"
    : repairCount > 0
      ? \`\${formatCount(repairCount, "course")} \${repairCount === 1 ? "needs" : "need"} repair\`
      : "";
  document.querySelector("#main").innerHTML = \`
    <section>
      <div class="page-head page-head-library">
        <div class="library-brand">
          <img class="library-brand-mark" src="/__tutor-assets/brand/wizard-icon.png" alt="" width="48" height="48" />
          <h1>\${escapeHtml(document.title)}</h1>
        </div>
        \${meta ? \`<div class="meta">\${escapeHtml(meta)}</div>\` : ""}
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
  document.querySelectorAll("[data-review-textbook]").forEach((button) => {
    button.addEventListener("click", () => navigateTextbook(button.dataset.reviewTextbook));
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
  const progressLabel = renderCourseListProgressLabel(progress);
  const continueChapter = progress.continueChapter;
  const actionLabel = complete ? "Review" : progress.visitedChapters > 0 ? "Continue" : "Start";
  const action = complete
    ? \`<button class="textbook-row-action" type="button" data-review-textbook="\${escapeAttr(textbook.id)}">\${actionLabel} &rarr;</button>\`
    : continueChapter
      ? \`<button class="textbook-row-action" type="button" data-continue-textbook="\${escapeAttr(textbook.id)}" data-continue-chapter="\${escapeAttr(continueChapter.id)}" data-continue-heading="\${escapeAttr(continueChapter.headingId ?? "")}">\${actionLabel} &rarr;</button>\`
      : "";
  return \`
    <article class="library-row">
      <div class="library-row-main">
        <div class="library-row-title-line">
          <button class="library-row-title-button" type="button" data-textbook="\${escapeAttr(textbook.id)}">
            <span class="row-title">\${escapeHtml(textbook.title)}</span>
          </button>
        </div>
        \${textbook.description ? \`<span class="row-description">\${escapeHtml(textbook.description)}</span>\` : ""}
        <span class="course-progress-label">\${progressLabel}\${action ? \`<span class="course-progress-separator" aria-hidden="true">·</span>\${action}\` : ""}</span>
        \${shouldRenderListProgressBar(progress) ? renderProgressBar(progress, formatChaptersComplete(progress.completedChapters, progress.totalChapters), "course-progress-list") : ""}
      </div>
      <span class="row-count library-row-count">\${formatCount(textbook.chapterCount, "chapter")}</span>
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

async function renderTextbook(textbookId, token) {
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const glossaryEntries = collectTextbookGlossaryEntries(textbook);
  const nextChapterId = firstIncompleteChapterId(textbook);
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: textbook.title }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(textbook.title)}</h1>
      </div>
      \${renderTextbookTabs("chapters", textbook.chapters.length, glossaryEntries.length)}
      \${renderChapterProgressBlock(textbook)}
      <div class="rows textbook-chapter-rows">
        \${textbook.chapters.map((chapter) => {
          const sectionCount = chapter.sections.length;
          const subsectionCount = chapter.sections.reduce((sum, section) => sum + section.subsections.length, 0);
          const completed = textbook.readingProgress.completedChapterIds.includes(chapter.id);
          const nextUp = !completed && chapter.id === nextChapterId;
          return \`
            <button class="row" data-chapter="\${escapeAttr(chapter.id)}">
              <span>
                <span class="row-title">\${escapeHtml(chapter.title)}</span>
                \${chapter.description ? \`<span class="row-description">\${escapeHtml(chapter.description)}</span>\` : ""}
              </span>
              <span class="row-meta-stack">
                <span class="row-count">\${renderChapterRowMeta(sectionCount, subsectionCount)}</span>
                \${renderChapterRowStatus(completed, nextUp)}
              </span>
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
  bindCrumbs();
  finishRouteLoad(token);
}

function renderChapterProgressBlock(textbook) {
  const progress = textbook.readingProgress;
  if (!progress || progress.totalChapters === 0) return "";
  const progressLabel = formatChaptersComplete(progress.completedChapters, progress.totalChapters);
  return \`
    <div class="chapter-progress-block">
      <span class="chapter-progress-count"><span class="chapter-progress-label">Progress</span> <span class="chapter-progress-separator" aria-hidden="true">·</span> \${escapeHtml(progressLabel)}</span>
    </div>
  \`;
}

function formatCount(count, singular, plural = \`\${singular}s\`) {
  return \`\${count} \${count === 1 ? singular : plural}\`;
}

function formatChaptersComplete(completed, total) {
  return \`\${completed} of \${total} \${total === 1 ? "chapter" : "chapters"} complete\`;
}

function renderCourseListProgressLabel(progress) {
  const complete = progress.totalChapters > 0 && progress.completedChapters === progress.totalChapters;
  if (complete) return \`<span class="progress-check" aria-hidden="true">✓</span> Complete · \${formatCount(progress.totalChapters, "chapter")}\`;
  const prefix = progress.visitedChapters > 0 ? "In progress · " : "Not started · ";
  return \`\${prefix}\${escapeHtml(formatChaptersComplete(progress.completedChapters, progress.totalChapters))}\`;
}

function shouldRenderListProgressBar(progress) {
  return progress.totalChapters > 1 && progress.completedChapters > 0 && progress.completedChapters < progress.totalChapters;
}

function renderProgressBar(progress, label, className = "") {
  return \`
    <span class="course-progress \${escapeAttr(className)}" role="progressbar" aria-label="\${escapeAttr(label)}" aria-valuemin="0" aria-valuemax="\${progress.totalChapters}" aria-valuenow="\${progress.completedChapters}">
      <span class="course-progress-rail"><span style="width: \${progress.percent}%"></span></span>
    </span>
  \`;
}

function firstIncompleteChapterId(textbook) {
  return textbook.chapters.find((chapter) => !textbook.readingProgress.completedChapterIds.includes(chapter.id))?.id ?? "";
}

function renderChapterRowStatus(completed, nextUp = false) {
  if (completed) return \`<span class="chapter-row-status">Complete</span>\`;
  if (nextUp) return \`<span class="chapter-row-status next-up-label">NEXT UP</span>\`;
  return "";
}

function renderChapterRowMeta(sectionCount, subsectionCount) {
  return \`\${formatCount(sectionCount, "section")} / \${formatCount(subsectionCount, "subsection")}\`;
}
`;
}
