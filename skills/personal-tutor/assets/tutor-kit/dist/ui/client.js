import { highlightClientJs } from "./highlight-client.js";
export function clientJs() {
    return `
${highlightClientJs()}

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
  const totalChapters = textbooks.reduce((sum, textbook) => sum + textbook.chapterCount, 0);
  const meta = textbooks.length === 0 ? "No textbooks yet" : \`\${textbooks.length} textbooks / \${totalChapters} chapters\`;
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
  finishRouteLoad(token);
}

function renderTextbookRows() {
  return \`
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
      \${renderTextbookTabs("chapters", textbook.chapters.length, glossaryEntries.length)}
      <div class="rows textbook-chapter-rows">
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
  bindTextbookTabs(textbook.id);
  bindCrumbs();
  finishRouteLoad(token);
}

async function renderTextbookGlossary(textbookId) {
  const token = beginRouteLoad("Loading glossary...");
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const entries = collectTextbookGlossaryEntries(textbook);
  if (entries.length === 0) {
    history.replaceState(history.state, "", "/textbooks/" + encodeURIComponent(textbookId));
    await renderTextbook(textbookId);
    return;
  }
  const studyState = await loadGlossaryStudyState(textbook.id);
  if (token !== routeToken) return;
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: textbook.title, action: "textbook", textbookId },
        { label: "Glossary" }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(textbook.title)}</h1>
      </div>
      \${renderTextbookTabs("glossary", textbook.chapters.length, entries.length)}
      \${renderTextbookGlossaryView(textbook.id, entries, studyState)}
    </section>
  \`;
  bindCrumbs();
  bindTextbookTabs(textbook.id);
  bindTextbookGlossaryControls(textbook.id, entries);
  finishRouteLoad(token);
}

async function renderTextbookGlossaryStudy(textbookId) {
  const token = beginRouteLoad("Loading study session...");
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const entries = collectTextbookGlossaryEntries(textbook);
  if (entries.length === 0) {
    history.replaceState(history.state, "", "/textbooks/" + encodeURIComponent(textbookId));
    await renderTextbook(textbookId);
    return;
  }
  const studyState = await loadGlossaryStudyState(textbook.id);
  if (token !== routeToken) return;
  const requestedSet = new URLSearchParams(window.location.search).get("set") === "starred" ? "starred" : "all";
  const studySet = requestedSet === "starred" && studyState.starredTermIds.length === 0 ? "all" : requestedSet;
  if (!studyState.session || studyState.session.studySet !== studySet) {
    startGlossaryStudySession(textbook.id, entries, studySet, undefined, {
      resume: studyState.lastStudySet === studySet,
      render: false
    });
  }
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: textbook.title, action: "textbook", textbookId },
        { label: "Glossary", action: "glossary", textbookId },
        { label: "Flashcards" }
      ])}
      <div class="page-head">
        <h1>Flashcards</h1>
        <div class="meta" data-glossary-study-top-progress>\${renderGlossaryStudyProgressLabel(entries, studyState)}</div>
      </div>
      \${renderGlossaryStudyPage(textbook.id, entries, studyState)}
    </section>
  \`;
  bindCrumbs();
  bindGlossaryStudyPageControls(textbook.id, entries);
  finishRouteLoad(token);
}

function renderTextbookTabs(activeTab, chapterCount, glossaryCount) {
  return \`
    <nav class="textbook-tabs" aria-label="Textbook views">
      <button class="textbook-tab \${activeTab === "chapters" ? "active" : ""}" type="button" data-textbook-tab="chapters">
        Chapters · \${chapterCount}
      </button>
      \${glossaryCount > 0 ? \`
      <button class="textbook-tab \${activeTab === "glossary" ? "active" : ""}" type="button" data-textbook-tab="glossary">
        Glossary · \${glossaryCount}
      </button>
      \` : ""}
    </nav>
  \`;
}

function bindTextbookTabs(textbookId) {
  document.querySelectorAll("[data-textbook-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.textbookTab === "glossary") {
        navigateTextbookGlossary(textbookId);
        return;
      }
      navigateTextbook(textbookId);
    });
  });
}

function renderTextbookGlossaryView(textbookId, entries, studyState) {
  if (entries.length === 0) {
    return renderTextbookGlossaryEmpty();
  }
  return \`
    <div data-glossary-view>
      \${renderGlossaryBrowseView(entries, studyState)}
    </div>
  \`;
}

function renderGlossaryStudyLauncher(studyState, glossaryCount = 0) {
  const starredCount = studyState.starredTermIds.length;
  return \`
    <div class="glossary-study-launcher">
      <button class="glossary-study-button" type="button" data-glossary-study-menu-toggle aria-expanded="false">Flashcards ▾</button>
      <div class="glossary-study-menu" data-glossary-study-menu hidden>
        <button type="button" data-glossary-study-launch="all">
          <span>Study all terms</span>
          <span class="glossary-study-menu-count">\${glossaryCount}</span>
        </button>
        <button type="button" data-glossary-study-launch="starred" \${starredCount === 0 ? "disabled" : ""}>
          <span>Study starred terms</span>
          <span class="glossary-study-menu-count">\${starredCount}</span>
        </button>
      </div>
    </div>
  \`;
}

function renderTextbookGlossaryEmpty() {
  return \`
    <div class="glossary-empty">
      <div>
        <div class="empty-kicker">No glossary terms</div>
        <h2 class="empty-title">This textbook does not have glossary terms yet</h2>
        <p class="empty-copy">Glossary terms are collected from chapter glossary blocks when they exist.</p>
      </div>
    </div>
  \`;
}

function renderGlossaryBrowseView(entries, studyState) {
  return \`
    <div class="glossary-toolbar">
      <div class="glossary-page-actions" data-glossary-page-actions>
        \${renderGlossaryStudyLauncher(studyState, entries.length)}
      </div>
      <input class="glossary-search" type="search" placeholder="Search glossary" aria-label="Search glossary terms" data-glossary-search />
    </div>
    <div class="glossary-results" data-glossary-results>
      \${renderTextbookGlossaryResults(entries, studyState)}
    </div>
  \`;
}

function renderTextbookGlossaryResults(entries, studyState) {
  if (entries.length === 0) {
    return \`
      <div class="empty-state">
        <div>
          <div class="empty-kicker">No matches</div>
          <h2 class="empty-title">No glossary terms match this search</h2>
          <p class="empty-copy">Search checks glossary terms only.</p>
        </div>
      </div>
    \`;
  }

  const groups = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last && last.chapterId === entry.chapterId) {
      last.entries.push(entry);
    } else {
      groups.push({ chapterId: entry.chapterId, chapterTitle: entry.chapterTitle, sourceHref: entry.sourceHref, entries: [entry] });
    }
  }

  return groups.map((group) => \`
    <section class="glossary-chapter-group">
      <div class="glossary-group-head">
        <h2 class="glossary-group-title">
          <a class="glossary-group-title-link" href="\${escapeAttr(group.sourceHref)}" data-glossary-source aria-label="Open source glossary for \${escapeAttr(group.chapterTitle)}">\${escapeHtml(group.chapterTitle)}</a>
        </h2>
      </div>
      <dl class="glossary-aggregate-list">
        \${group.entries.map((entry) => \`
          <div class="glossary-aggregate-entry" data-glossary-entry="\${escapeAttr(entry.id)}">
            <dt class="glossary-term">\${renderInlineMarkdown(entry.term)}</dt>
            <dd class="glossary-definition">
              \${renderInlineMarkdown(entry.definition)}
            </dd>
            \${renderGlossaryStarButton(entry, studyState)}
          </div>
        \`).join("")}
      </dl>
    </section>
  \`).join("");
}

function renderGlossaryStarButton(entry, studyState) {
  const starred = isGlossaryTermStarred(studyState, entry.id);
  return \`
    <button class="glossary-star \${starred ? "is-starred" : ""}" type="button" data-glossary-star="\${escapeAttr(entry.id)}" data-glossary-term="\${escapeAttr(entry.term)}" aria-pressed="\${starred ? "true" : "false"}" aria-label="\${starred ? "Unstar" : "Star"} \${escapeAttr(entry.term)}" title="\${starred ? "Unstar term" : "Star term"}">
      \${starred ? "★" : "☆"}
    </button>
  \`;
}

function renderGlossaryStudyPage(textbookId, entries, studyState) {
  return \`
    <div class="glossary-study-page" data-glossary-study-page>
      <div class="glossary-study-layout">
        <aside class="glossary-study-options desktop" data-glossary-study-options aria-label="Flashcard options">
          \${renderGlossaryStudyOptions(entries, studyState)}
        </aside>
        <details class="glossary-study-options mobile" data-glossary-study-options>
          <summary class="glossary-study-options-title">Options</summary>
          \${renderGlossaryStudyOptions(entries, studyState, { includeTitle: false })}
        </details>
        <div class="glossary-study-main" data-glossary-study-view>
          \${renderGlossaryStudySession(textbookId, entries, studyState)}
        </div>
      </div>
    </div>
  \`;
}

function renderGlossaryStudyOptions(entries, studyState, options = {}) {
  const session = ensureGlossaryStudySession(entries, studyState);
  normalizeGlossarySessionOptions(session);
  const starredCount = entries.filter((entry) => isGlossaryTermStarred(studyState, entry.id)).length;
  return \`
    <div class="glossary-study-options-groups">
      <div class="glossary-study-option-group">
        <div class="glossary-study-option-label">Study set</div>
        <div class="glossary-segmented-control" role="group" aria-label="Study set">
          <button class="glossary-segment \${session.studySet === "all" ? "is-selected" : ""}" type="button" data-glossary-deck-option="all" aria-pressed="\${session.studySet === "all" ? "true" : "false"}">All</button>
          <button class="glossary-segment \${session.studySet === "starred" ? "is-selected" : ""}" type="button" data-glossary-deck-option="starred" aria-pressed="\${session.studySet === "starred" ? "true" : "false"}" \${starredCount === 0 ? "disabled" : ""}>Starred</button>
        </div>
      </div>
      <div class="glossary-study-option-group">
        <div class="glossary-study-option-label">Prompt side</div>
        <div class="glossary-segmented-control \${session.showBoth ? "is-disabled" : ""}" role="group" aria-label="Prompt side" \${session.showBoth ? 'aria-disabled="true"' : ""}>
          <button class="glossary-segment \${session.promptMode === "term-first" ? "is-selected" : ""}" type="button" data-glossary-prompt-option="term-first" aria-pressed="\${session.promptMode === "term-first" ? "true" : "false"}" \${session.showBoth ? "disabled" : ""}>Term</button>
          <button class="glossary-segment \${session.promptMode === "definition-first" ? "is-selected" : ""}" type="button" data-glossary-prompt-option="definition-first" aria-pressed="\${session.promptMode === "definition-first" ? "true" : "false"}" \${session.showBoth ? "disabled" : ""}>Definition</button>
        </div>
      </div>
      <div class="glossary-study-option-group">
        <label class="glossary-toggle-row">
          <span class="glossary-toggle-label">Show both sides</span>
          <input class="glossary-toggle-input" type="checkbox" data-glossary-show-both \${session.showBoth ? "checked" : ""}>
        </label>
      </div>
      <div class="glossary-study-option-group">
        <label class="glossary-toggle-row">
          <span class="glossary-toggle-label">Track progress</span>
          <input class="glossary-toggle-input" type="checkbox" data-glossary-track-toggle \${session.trackingEnabled ? "checked" : ""}>
        </label>
      </div>
      <div class="glossary-study-option-group session-action">
        <button class="glossary-study-option restart" type="button" data-glossary-restart>Restart session</button>
      </div>
    </div>
  \`;
}

function renderGlossaryStudyProgressLabel(entries, studyState) {
  const progress = glossaryStudyProgressMetrics(entries, studyState);
  if (progress.total === 0) return "0 terms";
  return \`\${progress.current} of \${progress.total} terms\`;
}

function glossaryStudyProgressMetrics(entries, studyState) {
  const session = ensureGlossaryStudySession(entries, studyState);
  const progressCardIds = glossaryStudyProgressCardIds(entries, studyState);
  const total = progressCardIds.length;
  const currentCardId = session.index < session.cardIds.length ? session.cardIds[session.index] : null;
  const currentIndex = currentCardId ? progressCardIds.indexOf(currentCardId) : -1;
  const current = total === 0
    ? 0
    : session.completed
      ? total
      : currentIndex >= 0
        ? currentIndex + 1
        : Math.min(session.index + 1, total);
  return { current, total };
}

function glossaryStudyProgressCardIds(entries, studyState) {
  const session = ensureGlossaryStudySession(entries, studyState);
  if (session.studySet !== "starred" || session.label !== "starred terms") return session.cardIds;
  const currentCardId = session.index < session.cardIds.length ? session.cardIds[session.index] : null;
  const entryIds = new Set(entries.map((entry) => entry.id));
  const starredIds = new Set(entries
    .filter((entry) => isGlossaryTermStarred(studyState, entry.id))
    .map((entry) => entry.id));
  return session.cardIds.filter((termId) => entryIds.has(termId) && (starredIds.has(termId) || termId === currentCardId));
}

function renderGlossaryStudySession(textbookId, entries, studyState) {
  const session = ensureGlossaryStudySession(entries, studyState);
  normalizeGlossarySessionRatings(session);
  const cards = session.cardIds.map((termId) => entries.find((entry) => entry.id === termId)).filter(Boolean);
  if (cards.length === 0) {
    return \`
      <div class="glossary-study-stage">
        \${renderGlossaryStudyFinishSpacer()}
        <div class="glossary-study-finish">
          <div class="glossary-study-finish-body">
            <h2 class="empty-title">No terms in this study set</h2>
            <p class="empty-copy">Star terms in Browse mode to build a custom study set.</p>
            <div class="glossary-study-finish-actions">
              <button class="glossary-action" type="button" data-glossary-back>Browse terms</button>
            </div>
          </div>
        </div>
      </div>
    \`;
  }
  if (session.completed) {
    return renderGlossaryStudyFinish(textbookId, entries, studyState);
  }
  if (session.index >= cards.length) {
    session.index = Math.max(cards.length - 1, 0);
  }
  if (typeof session.trackingEnabled !== "boolean") {
    session.trackingEnabled = false;
  }
  normalizeGlossarySessionOptions(session);
  const entry = cards[session.index];
  const counts = glossarySessionRatingCounts(session);
  const currentRating = glossarySessionRatingFor(session, entry.id);
  const progressMetrics = glossaryStudyProgressMetrics(entries, studyState);
  const trackingEnabled = session.trackingEnabled === true;
  const ratedCount = counts.again + counts.known;
  const positionProgress = progressMetrics.total > 0 ? Math.round((Math.max(progressMetrics.current - 1, 0) / progressMetrics.total) * 100) : 0;
  const ratingProgress = progressMetrics.total > 0 ? Math.round((Math.min(ratedCount, progressMetrics.total) / progressMetrics.total) * 100) : 0;
  const progress = trackingEnabled ? Math.max(ratingProgress, positionProgress) : positionProgress;
  const isFirst = session.index === 0;
  const isLast = session.index >= cards.length - 1;
  return \`
    <div class="glossary-study-stage">
      <div class="glossary-study-status \${trackingEnabled ? "is-tracking" : "is-placeholder"}" \${trackingEnabled ? "" : 'aria-hidden="true"'}>
        <div class="glossary-study-controls">
          <div class="glossary-study-scoreboard">
            <div class="glossary-study-score again">
              <span class="glossary-study-score-value">\${trackingEnabled ? counts.again : 0}</span>
              <span>still learning</span>
            </div>
            <div class="glossary-study-score known">
              <span class="glossary-study-score-value">\${trackingEnabled ? counts.known : 0}</span>
              <span>known</span>
            </div>
          </div>
        </div>
        <div class="glossary-study-progress-bar" aria-hidden="true">
          <div class="glossary-study-progress-fill" style="--glossary-progress: \${progress}%"></div>
        </div>
      </div>
      <div class="glossary-card \${session.showBoth ? "is-showing-both" : ""}" data-glossary-card="\${escapeAttr(entry.id)}">
        \${renderGlossaryStarButton(entry, studyState)}
        <button class="glossary-card-body" type="button" data-glossary-card-toggle aria-label="\${session.showBoth ? "Showing term and definition" : session.revealed ? "Hide definition" : "Reveal definition"}">
          \${renderGlossaryCardContent(entry, session)}
        </button>
      </div>
      <div class="glossary-card-controls">
        <div class="glossary-card-nav \${trackingEnabled ? "is-tracking" : "is-browsing"}" aria-label="\${trackingEnabled ? "Flashcard rating" : "Flashcard navigation"}">
          \${trackingEnabled
            ? \`<button class="glossary-rate-button again \${currentRating === "again" ? "is-selected" : ""}" type="button" data-glossary-rate="again" aria-pressed="\${currentRating === "again" ? "true" : "false"}" aria-label="still learning">
                <span class="glossary-rate-icon" aria-hidden="true">×</span>
              </button>\`
            : \`<button class="glossary-action glossary-nav-arrow previous" type="button" data-glossary-prev aria-label="Previous card" title="Previous card" \${isFirst ? "disabled" : ""}>←</button>\`}
          \${trackingEnabled
            ? \`<button class="glossary-rate-button known \${currentRating === "knew-it" ? "is-selected" : ""}" type="button" data-glossary-rate="knew-it" aria-pressed="\${currentRating === "knew-it" ? "true" : "false"}" aria-label="know">
                <span class="glossary-rate-icon" aria-hidden="true">✓</span>
              </button>\`
            : \`<button class="glossary-action glossary-nav-arrow next" type="button" data-glossary-next aria-label="\${isLast ? "Complete flashcards" : "Next card"}" title="\${isLast ? "Complete flashcards" : "Next card"}">→</button>\`}
        </div>
      </div>
    </div>
  \`;
}

function renderGlossaryCardContent(entry, session) {
  const term = \`<div class="glossary-card-term">\${renderInlineMarkdown(entry.term)}</div>\`;
  const definition = \`<div class="glossary-card-definition">\${renderInlineMarkdown(entry.definition)}</div>\`;
  if (session.showBoth) {
    return \`
      <div class="glossary-card-content glossary-card-both">
        \${term}
        \${definition}
      </div>
    \`;
  }
  const showingDefinition = session.promptMode === "term-first" ? session.revealed : !session.revealed;
  return \`
    <div class="glossary-card-content \${session.revealed ? "glossary-card-revealed" : "glossary-card-prompt"}">
      \${showingDefinition ? definition : term}
    </div>
  \`;
}

function renderGlossaryStudyFinish(textbookId, entries, studyState) {
  const session = studyState.session;
  normalizeGlossarySessionOptions(session);
  normalizeGlossarySessionRatings(session);
  const stillLearningIds = glossarySessionStillLearningIds(studyState);
  const counts = glossarySessionRatingCounts(session);
  if (session.trackingEnabled !== true) {
    return \`
      <div class="glossary-study-stage">
        \${renderGlossaryStudyFinishSpacer()}
        <div class="glossary-study-finish">
          <div class="glossary-study-finish-body">
            <h2 class="empty-title">\${session.cardIds.length} terms reviewed</h2>
            <div class="glossary-study-finish-actions">
              <button class="glossary-action" type="button" data-glossary-restart>Restart</button>
              <button class="glossary-action" type="button" data-glossary-back>Browse terms</button>
            </div>
          </div>
        </div>
      </div>
    \`;
  }
  return \`
    <div class="glossary-study-stage">
      \${renderGlossaryStudyFinishSpacer()}
      <div class="glossary-study-finish">
        <div class="glossary-study-finish-body">
          <h2 class="empty-title">\${session.cardIds.length} terms reviewed</h2>
          <div class="glossary-study-finish-stats">
            <span>\${counts.known} known</span>
            <span class="glossary-study-score-separator" aria-hidden="true">·</span>
            <span>\${counts.again} still learning</span>
          </div>
          <div class="glossary-study-finish-actions">
            \${stillLearningIds.length > 0 ? '<button class="glossary-action" type="button" data-glossary-review-again>Continue learning</button>' : ""}
            <button class="glossary-action" type="button" data-glossary-restart>Restart</button>
            <button class="glossary-action" type="button" data-glossary-back>Browse terms</button>
          </div>
        </div>
      </div>
    </div>
  \`;
}

function renderGlossaryStudyFinishSpacer() {
  return \`
    <div class="glossary-study-status is-finished" aria-hidden="true">
      <div class="glossary-study-controls">
        <div class="glossary-study-scoreboard">
          <div class="glossary-study-score again"><span class="glossary-study-score-value">0</span><span>still learning</span></div>
          <div class="glossary-study-score known"><span class="glossary-study-score-value">0</span><span>known</span></div>
        </div>
      </div>
      <div class="glossary-study-progress-bar">
        <div class="glossary-study-progress-fill" style="--glossary-progress: 0%"></div>
      </div>
    </div>
  \`;
}

function bindTextbookGlossaryControls(textbookId, entries) {
  bindGlossaryStudyLauncher(textbookId);
  bindGlossaryDynamicControls(textbookId, entries);
}

function bindGlossaryDynamicControls(textbookId, entries) {
  bindTextbookGlossarySearch(textbookId, entries);
  bindGlossaryStarControls(textbookId, entries);
  bindGlossarySourceLinks();
}

function bindTextbookGlossarySearch(textbookId, entries) {
  const input = document.querySelector("[data-glossary-search]");
  const results = document.querySelector("[data-glossary-results]");
  if (!input || !results) return;
  input.addEventListener("input", () => {
    const studyState = getGlossaryStudyState(textbookId);
    const query = normalizeGlossarySearch(input.value);
    const filtered = query
      ? entries.filter((entry) => entry.searchText.includes(query))
      : entries;
    results.innerHTML = renderTextbookGlossaryResults(filtered, studyState);
    bindGlossarySourceLinks();
    bindGlossaryStarControls(textbookId, entries);
  });
}

function bindGlossaryStudyLauncher(textbookId) {
  const toggle = document.querySelector("[data-glossary-study-menu-toggle]");
  const menu = document.querySelector("[data-glossary-study-menu]");
  if (toggle && menu) {
    const handleOutsideClick = () => closeMenu();
    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      document.removeEventListener("click", handleOutsideClick);
    };
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
        return;
      }
      toggle.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      document.addEventListener("click", handleOutsideClick);
    });
    menu.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }
  document.querySelectorAll("[data-glossary-study-launch]").forEach((button) => {
    button.addEventListener("click", () => {
      const studySet = button.dataset.glossaryStudyLaunch === "starred" ? "starred" : "all";
      navigateTextbookGlossaryStudy(textbookId, studySet);
    });
  });
}

function bindGlossaryStudyPageControls(textbookId, entries) {
  const card = document.querySelector("[data-glossary-card-toggle]");
  if (card) {
    card.addEventListener("click", () => {
      toggleCurrentGlossaryCardReveal(textbookId, entries);
    });
  }
  document.querySelectorAll("[data-glossary-rate]").forEach((button) => {
    button.addEventListener("click", () => {
      const rating = button.dataset.glossaryRate === "again" ? "again" : "knew-it";
      markCurrentGlossaryCardRating(textbookId, entries, rating);
    });
  });
  document.querySelectorAll("[data-glossary-deck-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const studySet = button.dataset.glossaryDeckOption === "starred" ? "starred" : "all";
      const state = getGlossaryStudyState(textbookId);
      if (studySet === state.session?.studySet) return;
      startGlossaryStudySession(textbookId, entries, studySet, undefined, glossarySessionOptions(state.session));
    });
  });
  document.querySelectorAll("[data-glossary-prompt-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = getGlossaryStudyState(textbookId);
      if (!state.session) return;
      state.session.promptMode = button.dataset.glossaryPromptOption === "definition-first" ? "definition-first" : "term-first";
      renderGlossaryStudyPageContent(textbookId, entries);
    });
  });
  document.querySelectorAll("[data-glossary-show-both]").forEach((control) => {
    control.addEventListener("change", () => {
      const state = getGlossaryStudyState(textbookId);
      if (!state.session) return;
      state.session.showBoth = control instanceof HTMLInputElement
        ? control.checked
        : control.dataset.glossaryShowBoth === "true";
      state.session.revealed = false;
      renderGlossaryStudyPageContent(textbookId, entries);
    });
  });
  document.querySelectorAll("[data-glossary-track-toggle]").forEach((control) => {
    control.addEventListener("change", () => {
      const state = getGlossaryStudyState(textbookId);
      if (!state.session) return;
      state.session.trackingEnabled = control instanceof HTMLInputElement
        ? control.checked
        : control.dataset.glossaryTrackToggle === "track";
      renderGlossaryStudyPageContent(textbookId, entries);
    });
  });
  const previous = document.querySelector("[data-glossary-prev]");
  if (previous) {
    previous.addEventListener("click", () => {
      moveGlossaryStudyCard(textbookId, entries, -1);
    });
  }
  const next = document.querySelector("[data-glossary-next]");
  if (next) {
    next.addEventListener("click", () => {
      moveGlossaryStudyCard(textbookId, entries, 1);
    });
  }
  document.querySelectorAll("[data-glossary-restart]").forEach((restart) => {
    restart.addEventListener("click", () => {
      const state = getGlossaryStudyState(textbookId);
      const completedReview = state.session?.label === "again terms";
      const reviewFinishedClean = completedReview
        && state.session?.trackingEnabled === true
        && glossarySessionStillLearningIds(state).length === 0;
      const forcedTermIds = completedReview && !reviewFinishedClean ? state.session.cardIds : undefined;
      const studySet = reviewFinishedClean ? "all" : state.studySet === "starred" ? "starred" : "all";
      startGlossaryStudySession(textbookId, entries, studySet, forcedTermIds, glossarySessionOptions(state.session));
    });
  });
  const reviewAgain = document.querySelector("[data-glossary-review-again]");
  if (reviewAgain) {
    reviewAgain.addEventListener("click", () => {
      const state = getGlossaryStudyState(textbookId);
      const reviewIds = glossarySessionStillLearningIds(state);
      startGlossaryStudySession(textbookId, entries, "all", reviewIds, { ...glossarySessionOptions(state.session), trackingEnabled: true });
    });
  }
  document.querySelectorAll("[data-glossary-back]").forEach((button) => {
    if (button.dataset.glossaryBackBound === "true") return;
    button.dataset.glossaryBackBound = "true";
    button.addEventListener("click", () => navigateTextbookGlossary(textbookId));
  });
  bindGlossaryStarControls(textbookId, entries);
}

function toggleCurrentGlossaryCardReveal(textbookId, entries) {
  const state = getGlossaryStudyState(textbookId);
  if (!state.session) return;
  normalizeGlossarySessionOptions(state.session);
  if (state.session.showBoth) return;
  state.session.revealed = !state.session.revealed;
  renderGlossaryStudyPageContent(textbookId, entries);
}

function bindGlossaryStarControls(textbookId, entries) {
  document.querySelectorAll("[data-glossary-star]").forEach((button) => {
    button.addEventListener("click", () => {
      const termId = button.dataset.glossaryStar;
      if (!termId) return;
      toggleGlossaryStar(textbookId, termId, entries);
    });
  });
}

function renderGlossaryInteractiveView(textbookId, entries) {
  const container = document.querySelector("[data-glossary-view]");
  if (!container) return;
  const state = getGlossaryStudyState(textbookId);
  container.innerHTML = renderGlossaryBrowseView(entries, state);
  bindGlossaryDynamicControls(textbookId, entries);
  updateGlossaryStudyLauncher(textbookId, entries);
}

function renderGlossaryStudyPageContent(textbookId, entries) {
  const state = getGlossaryStudyState(textbookId);
  reconcileGlossaryStarredSession(entries, state);
  const container = document.querySelector("[data-glossary-study-view]");
  if (container) {
    container.innerHTML = renderGlossaryStudySession(textbookId, entries, state);
  }
  const progress = document.querySelector("[data-glossary-study-top-progress]");
  if (progress) {
    progress.textContent = renderGlossaryStudyProgressLabel(entries, state);
  }
  document.querySelectorAll("[data-glossary-study-options]").forEach((container) => {
    const includeTitle = !container.classList.contains("mobile");
    if (container instanceof HTMLDetailsElement) {
      const wasOpen = container.open;
      container.innerHTML = \`<summary class="glossary-study-options-title">Options</summary>\${renderGlossaryStudyOptions(entries, state, { includeTitle: false })}\`;
      container.open = wasOpen;
    } else {
      container.innerHTML = renderGlossaryStudyOptions(entries, state, { includeTitle });
    }
  });
  bindGlossaryStudyPageControls(textbookId, entries);
}

function updateGlossaryStudyLauncher(textbookId, entries = []) {
  const container = document.querySelector("[data-glossary-page-actions]");
  if (!container) return;
  container.innerHTML = renderGlossaryStudyLauncher(getGlossaryStudyState(textbookId), entries.length);
  bindGlossaryStudyLauncher(textbookId);
}

async function loadGlossaryStudyState(textbookId) {
  if (glossaryStudyStates.has(textbookId)) return glossaryStudyStates.get(textbookId);
  const state = emptyGlossaryStudyState(textbookId);
  glossaryStudyStates.set(textbookId, state);
  try {
    const persisted = await fetchJson(\`/api/glossary-study/state?textbookId=\${encodeURIComponent(textbookId)}\`);
    state.starredTermIds = Array.isArray(persisted.starredTermIds) ? persisted.starredTermIds : [];
    state.ratings = persisted.ratings ?? {};
    state.studySet = persisted.lastStudySet === "starred" ? "starred" : "all";
    state.lastStudySet = state.studySet;
    state.currentCardIndex = Number.isInteger(persisted.currentCardIndex) ? persisted.currentCardIndex : 0;
    state.cardOrder = Array.isArray(persisted.cardOrder) ? persisted.cardOrder : [];
    state.currentTermId = typeof persisted.currentTermId === "string" ? persisted.currentTermId : null;
    state.sessionCompleted = persisted.sessionCompleted === true;
  } catch {
    // Study persistence is a convenience; the glossary remains usable without it.
  }
  return state;
}

function getGlossaryStudyState(textbookId) {
  if (!glossaryStudyStates.has(textbookId)) {
    glossaryStudyStates.set(textbookId, emptyGlossaryStudyState(textbookId));
  }
  return glossaryStudyStates.get(textbookId);
}

function emptyGlossaryStudyState(textbookId) {
  return {
    textbookId,
    studySet: "all",
    lastStudySet: "all",
    starredTermIds: [],
    ratings: {},
    currentCardIndex: 0,
    cardOrder: [],
    currentTermId: null,
    sessionCompleted: false,
    session: null
  };
}

function ensureGlossaryStudySession(entries, state) {
  if (!state.session) {
    state.session = newGlossaryStudySession(entries, state, state.studySet === "starred" ? "starred" : "all");
  }
  normalizeGlossarySessionOptions(state.session);
  return state.session;
}

function normalizeGlossarySessionOptions(session) {
  if (!session) return;
  if (session.promptMode !== "definition-first") {
    session.promptMode = "term-first";
  }
  session.showBoth = session.showBoth === true;
  session.trackingEnabled = session.trackingEnabled === true;
}

function glossarySessionOptions(session) {
  normalizeGlossarySessionOptions(session);
  return {
    trackingEnabled: session?.trackingEnabled === true,
    promptMode: session?.promptMode === "definition-first" ? "definition-first" : "term-first",
    showBoth: session?.showBoth === true
  };
}

function reconcileGlossaryStarredSession(entries, state) {
  const session = state.session;
  if (!session || session.studySet !== "starred" || session.label !== "starred terms") return;
  const currentCardId = session.index < session.cardIds.length ? session.cardIds[session.index] : null;
  const entryIds = new Set(entries.map((entry) => entry.id));
  const starredIds = entries
    .filter((entry) => isGlossaryTermStarred(state, entry.id))
    .map((entry) => entry.id);
  const starredIdsSet = new Set(starredIds);
  const priorCards = session.cardIds.slice(0, session.index)
    .filter((termId) => starredIdsSet.has(termId));
  const activeCards = new Set(priorCards);
  const nextCardIds = [...priorCards];
  let nextIndex = nextCardIds.length;
  if (currentCardId && entryIds.has(currentCardId)) {
    nextIndex = nextCardIds.length;
    nextCardIds.push(currentCardId);
    activeCards.add(currentCardId);
  }
  const existingFuture = session.cardIds.slice(session.index + 1)
    .filter((termId) => starredIdsSet.has(termId) && !activeCards.has(termId));
  existingFuture.forEach((termId) => activeCards.add(termId));
  const newFuture = starredIds
    .filter((termId) => !activeCards.has(termId));
  session.cardIds = [...nextCardIds, ...existingFuture, ...shuffleGlossaryCards(newFuture)];
  session.index = session.cardIds.length === 0 ? 0 : Math.min(nextIndex, session.cardIds.length - 1);
  state.currentCardIndex = session.index;
  if (session.index > session.cardIds.length) {
    session.index = session.cardIds.length;
    state.currentCardIndex = session.index;
  }
}

function startGlossaryStudySession(textbookId, entries, studySet, forcedTermIds, options = {}) {
  const state = getGlossaryStudyState(textbookId);
  const currentOptions = glossarySessionOptions(state.session);
  const nextOptions = {
    ...currentOptions,
    ...options
  };
  const nextStudySet = studySet === "starred" ? "starred" : "all";
  const resume = options.resume === true && state.lastStudySet === nextStudySet;
  const initialIndex = resume ? state.currentCardIndex : 0;
  state.studySet = nextStudySet;
  state.lastStudySet = state.studySet;
  state.session = newGlossaryStudySession(entries, state, state.studySet, forcedTermIds, { ...nextOptions, initialIndex, resume });
  state.currentCardIndex = state.session.index;
  void saveGlossaryStudyState(textbookId);
  if (options.render !== false) {
    renderGlossaryStudyPageContent(textbookId, entries);
  }
}

function newGlossaryStudySession(entries, state, studySet, forcedTermIds, options = {}) {
  const forced = Array.isArray(forcedTermIds) ? new Set(forcedTermIds) : null;
  const starred = new Set(state.starredTermIds);
  const cards = entries.filter((entry) => forced
    ? forced.has(entry.id)
    : studySet === "starred" ? starred.has(entry.id) : true);
  const eligibleCardIds = cards.map((entry) => entry.id);
  const eligibleCards = new Set(eligibleCardIds);
  const savedOrder = options.resume === true
    ? state.cardOrder.filter((termId) => eligibleCards.has(termId))
    : [];
  const savedCards = new Set(savedOrder);
  const missingCardIds = eligibleCardIds.filter((termId) => !savedCards.has(termId));
  const cardIds = savedOrder.length > 0
    ? [...savedOrder, ...shuffleGlossaryCards(missingCardIds)]
    : shuffleGlossaryCards(eligibleCardIds);
  const savedTermIndex = options.resume === true && state.currentTermId
    ? cardIds.indexOf(state.currentTermId)
    : -1;
  const initialIndex = Number.isInteger(options.initialIndex) && options.initialIndex > 0 ? options.initialIndex : 0;
  return {
    studySet,
    label: forced ? "again terms" : studySet === "starred" ? "starred terms" : "all terms",
    cardIds,
    index: savedTermIndex >= 0
      ? savedTermIndex
      : Math.max(0, Math.min(initialIndex, Math.max(cardIds.length - 1, 0))),
    revealed: false,
    completed: options.resume === true && state.sessionCompleted === true && missingCardIds.length === 0,
    trackingEnabled: options.trackingEnabled === true,
    promptMode: options.promptMode === "definition-first" ? "definition-first" : "term-first",
    showBoth: options.showBoth === true,
    ratings: {}
  };
}

function shuffleGlossaryCards(cardIds) {
  const shuffled = [...cardIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

function moveGlossaryStudyCard(textbookId, entries, direction) {
  const state = getGlossaryStudyState(textbookId);
  const session = state.session;
  if (!session || session.index >= session.cardIds.length) return;
  if (direction > 0 && session.index >= session.cardIds.length - 1) {
    session.completed = true;
    session.revealed = false;
    state.currentCardIndex = session.index;
    void saveGlossaryStudyState(textbookId);
    renderGlossaryStudyPageContent(textbookId, entries);
    return;
  }
  const nextIndex = Math.max(0, Math.min(session.cardIds.length - 1, session.index + direction));
  if (nextIndex === session.index) return;
  session.index = nextIndex;
  session.revealed = false;
  session.completed = false;
  state.currentCardIndex = session.index;
  void saveGlossaryStudyState(textbookId);
  renderGlossaryStudyPageContent(textbookId, entries);
}

function markCurrentGlossaryCardRating(textbookId, entries, rating) {
  const state = getGlossaryStudyState(textbookId);
  const session = state.session;
  if (!session || session.index >= session.cardIds.length) return;
  const termId = session.cardIds[session.index];
  const ratings = normalizeGlossarySessionRatings(session);
  ratings[termId] = rating;
  updateLocalGlossaryRating(state, termId, rating);
  if (session.trackingEnabled === true) {
    if (session.index >= session.cardIds.length - 1) {
      session.completed = true;
    } else {
      session.index += 1;
      session.completed = false;
    }
    session.revealed = false;
    state.currentCardIndex = session.index;
  }
  void persistGlossaryRatingAndState(textbookId, termId, rating);
  renderGlossaryStudyPageContent(textbookId, entries);
}

async function persistGlossaryRatingAndState(textbookId, termId, rating) {
  await submitGlossaryStudyRating(textbookId, termId, rating);
  await saveGlossaryStudyState(textbookId);
}

function normalizeGlossarySessionRatings(session) {
  if (!session) return {};
  if (Array.isArray(session.ratings)) {
    session.ratings = session.ratings.reduce((ratings, item) => {
      if (item?.termId && (item.rating === "again" || item.rating === "knew-it")) {
        ratings[item.termId] = item.rating;
      }
      return ratings;
    }, {});
  }
  if (!isRecordObject(session.ratings)) {
    session.ratings = {};
  }
  return session.ratings;
}

function glossarySessionRatingFor(session, termId) {
  const ratings = normalizeGlossarySessionRatings(session);
  return ratings[termId] === "again" || ratings[termId] === "knew-it" ? ratings[termId] : null;
}

function glossarySessionRatingCounts(session) {
  const ratings = normalizeGlossarySessionRatings(session);
  const counts = { again: 0, known: 0, unrated: 0 };
  for (const termId of session.cardIds) {
    const rating = ratings[termId];
    if (rating === "again") {
      counts.again += 1;
    } else if (rating === "knew-it") {
      counts.known += 1;
    } else {
      counts.unrated += 1;
    }
  }
  return counts;
}

function updateLocalGlossaryRating(state, termId, rating) {
  const previous = state.ratings[termId] ?? { reviewCount: 0, againCount: 0, knewItCount: 0 };
  state.ratings[termId] = {
    rating,
    reviewedAt: new Date().toISOString(),
    reviewCount: previous.reviewCount + 1,
    againCount: previous.againCount + (rating === "again" ? 1 : 0),
    knewItCount: previous.knewItCount + (rating === "knew-it" ? 1 : 0)
  };
}

function glossarySessionStillLearningIds(state) {
  if (!state.session) return [];
  const ratings = normalizeGlossarySessionRatings(state.session);
  return state.session.cardIds.filter((termId) => ratings[termId] === "again");
}

function toggleGlossaryStar(textbookId, termId, entries) {
  const state = getGlossaryStudyState(textbookId);
  const starred = new Set(state.starredTermIds);
  if (starred.has(termId)) {
    starred.delete(termId);
  } else {
    starred.add(termId);
  }
  state.starredTermIds = [...starred];
  void saveGlossaryStudyState(textbookId);
  if (document.querySelector("[data-glossary-study-page]") && Array.isArray(entries)) {
    renderGlossaryStudyPageContent(textbookId, entries);
  } else if (Array.isArray(entries)) {
    renderGlossaryInteractiveView(textbookId, entries);
  } else {
    updateGlossaryStarButtons(textbookId);
  }
}

function updateGlossaryStarButtons(textbookId) {
  const state = getGlossaryStudyState(textbookId);
  document.querySelectorAll("[data-glossary-star]").forEach((button) => {
    const termId = button.dataset.glossaryStar;
    if (!termId) return;
    const starred = isGlossaryTermStarred(state, termId);
    button.classList.toggle("is-starred", starred);
    button.setAttribute("aria-pressed", starred ? "true" : "false");
    button.setAttribute("aria-label", (starred ? "Unstar" : "Star") + " " + (button.dataset.glossaryTerm ?? "term"));
    button.setAttribute("title", starred ? "Unstar term" : "Star term");
    button.textContent = starred ? "★" : "☆";
  });
}

async function saveGlossaryStudyState(textbookId) {
  const state = getGlossaryStudyState(textbookId);
  const session = state.session;
  const currentTermId = session && session.index < session.cardIds.length
    ? session.cardIds[session.index]
    : state.currentTermId;
  try {
    await fetchJson("/api/glossary-study/state", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId,
        starredTermIds: state.starredTermIds,
        lastStudySet: state.studySet,
        currentCardIndex: state.currentCardIndex,
        cardOrder: session?.cardIds ?? state.cardOrder,
        currentTermId,
        sessionCompleted: session?.completed === true
      })
    });
  } catch {
    // Study persistence is a convenience; local UI state remains usable.
  }
}

async function submitGlossaryStudyRating(textbookId, termId, rating) {
  try {
    await fetchJson("/api/glossary-study/rating", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ textbookId, termId, rating })
    });
  } catch {
    // The local session can continue even if the rating save fails.
  }
}

function isGlossaryTermStarred(studyState, termId) {
  return studyState.starredTermIds.includes(termId);
}

function bindGlossarySourceLinks() {
  document.querySelectorAll("[data-glossary-source]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      history.pushState({}, "", href);
      void renderRoute();
    });
  });
}

async function renderChapter(textbookId, chapterId) {
  const token = beginRouteLoad("Loading chapter...");
  const chapter = await fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  if (token !== routeToken) return;
  const glossaryStudyState = await loadGlossaryStudyState(textbookId);
  if (token !== routeToken) return;
  const highlightState = await loadChapterHighlights(textbookId, chapterId);
  if (token !== routeToken) return;
  activeChapter = chapter;
  activeChapterHighlights = highlightState.highlights;
  const renderContext = { textbookId, chapter, glossaryStudyState };
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
          <details data-chapter-tools open>
            <summary class="chapter-tools-summary">
              <span>Chapter tools</span>
              <span class="chapter-tools-summary-meta">Contents and highlights</span>
            </summary>
            <div class="chapter-tools-body">
              <div class="index-label">Contents</div>
              <div class="index-list">
                \${chapter.sections.map((section) => \`
                  <a class="index-link" href="#\${escapeAttr(anchorId(section.id))}">\${escapeHtml(section.title)}</a>
                  \${section.subsections.map((subsection) => \`
                    <a class="index-link subsection" href="#\${escapeAttr(anchorId(subsection.id))}">\${escapeHtml(subsection.title)}</a>
                  \`).join("")}
              \`).join("")}
              </div>
              <div class="chapter-highlights" data-highlight-list hidden></div>
            </div>
          </details>
        </aside>
        <div class="chapter-content">
          \${chapter.sections.map((section) => renderSection(section, renderContext)).join("")}
          \${renderChapterNavigation(chapter)}
        </div>
      </div>
    </section>
  \`;
  syncChapterToolsDisclosure();
  bindCrumbs();
  bindChapterIndex();
  bindChapterNavigation(textbookId);
  bindGlossaryOverviewLinks();
  bindGlossaryStarControls(textbookId);
  bindHighlighter(chapter);
  applyChapterHighlights(chapter);
  renderChapterHighlightsList(chapter);
  bindQuizzes(chapter);
  bindCodingProblems(chapter);
  scheduleTransformationLayouts();
  void renderDiagrams();
  if (document.fonts?.ready) void document.fonts.ready.then(scheduleTransformationLayouts);
  finishRouteLoad(token);
  scrollToHashTarget(window.location.hash, "auto");
}

function syncChapterToolsDisclosure() {
  const disclosure = document.querySelector("[data-chapter-tools]");
  if (!disclosure) return;
  const compact = window.matchMedia?.("(max-width: 860px)").matches ?? window.innerWidth <= 860;
  if (disclosure.dataset.compact === String(compact)) return;
  disclosure.dataset.compact = String(compact);
  disclosure.open = !compact;
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

function renderSection(section, context) {
  const sectionContext = { ...context, section, subsection: null };
  return \`
    <section class="chapter-section" id="\${escapeAttr(anchorId(section.id))}">
      <h2 class="section-title"\${highlightUnsupportedAttrs()}>\${escapeHtml(section.title)}</h2>
      \${section.description ? \`<div class="markdown"\${highlightUnsupportedAttrs()}><p>\${escapeHtml(section.description)}</p></div>\` : ""}
      <div class="blocks">\${section.blocks.map((block) => renderBlock(block, sectionContext)).join("")}</div>
      \${section.subsections.map((subsection) => \`
        <section class="subsection-block" id="\${escapeAttr(anchorId(subsection.id))}">
          <h3 class="subsection-title"\${highlightUnsupportedAttrs()}>\${escapeHtml(subsection.title)}</h3>
          \${subsection.description ? \`<div class="markdown"\${highlightUnsupportedAttrs()}><p>\${escapeHtml(subsection.description)}</p></div>\` : ""}
          <div class="blocks">\${subsection.blocks.map((block) => renderBlock(block, { ...context, section, subsection })).join("")}</div>
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
    if (route.kind === "textbookGlossaryStudy") {
      await renderTextbookGlossaryStudy(route.textbookId);
      return;
    }
    if (route.kind === "textbookGlossary") {
      await renderTextbookGlossary(route.textbookId);
      return;
    }
    if (route.kind === "textbook") {
      await renderTextbook(route.textbookId);
      return;
    }
    if (route.kind === "notFound") {
      routeToken += 1;
      finishRouteLoad(routeToken);
      renderNotFoundPage({
        title: "Page not found",
        message: \`No route matches \${route.path}. Return to your textbook library to keep studying.\`
      });
      return;
    }
    await renderHome();
  } catch (error) {
    finishRouteLoad();
    if (isNotFoundError(error)) {
      renderNotFoundPage(notFoundDetails(route));
      return;
    }
    renderRouteError(error);
  }
}

function parseRoute(pathname) {
  let parts;
  try {
    parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return { kind: "notFound", path: pathname };
  }
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "textbooks")) {
    return { kind: "home" };
  }
  if (parts.length === 4 && parts[0] === "textbooks" && parts[1] && parts[2] === "chapters" && parts[3]) {
    return { kind: "chapter", textbookId: parts[1], chapterId: parts[3] };
  }
  if (parts.length === 4 && parts[0] === "textbooks" && parts[1] && parts[2] === "glossary" && parts[3] === "study") {
    return { kind: "textbookGlossaryStudy", textbookId: parts[1] };
  }
  if (parts.length === 3 && parts[0] === "textbooks" && parts[1] && parts[2] === "glossary") {
    return { kind: "textbookGlossary", textbookId: parts[1] };
  }
  if (parts.length === 2 && parts[0] === "textbooks" && parts[1]) {
    return { kind: "textbook", textbookId: parts[1] };
  }
  return { kind: "notFound", path: pathname };
}

function navigateHome() {
  history.pushState({}, "", "/");
  void renderRoute();
}

function navigateTextbook(textbookId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}\`);
  void renderRoute();
}

function navigateTextbookGlossary(textbookId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/glossary\`);
  void renderRoute();
}

function navigateTextbookGlossaryStudy(textbookId, studySet = "all") {
  const safeStudySet = studySet === "starred" ? "starred" : "all";
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/glossary/study?set=\${safeStudySet}\`);
  void renderRoute();
}

function bindGlossaryOverviewLinks() {
  document.querySelectorAll("[data-glossary-overview]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const textbookId = link.dataset.glossaryOverview;
      if (!textbookId) return;
      event.preventDefault();
      navigateTextbookGlossary(textbookId);
    });
  });
}

function navigateChapter(textbookId, chapterId, scrollToTop = false) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  if (scrollToTop) window.scrollTo({ top: 0, behavior: "auto" });
  void renderRoute();
}

function renderBlock(block, context) {
  if (block.kind === "p" || block.kind === "explanation" || block.kind === "blurb") {
    const title = block.props.title ? \`<h4 class="local-heading">\${escapeHtml(block.props.title)}</h4>\` : "";
    return \`<article class="block">\${title}<div class="markdown"\${highlightAnchorAttrs(block, context)}>\${renderMarkdown(block.props.body)}</div></article>\`;
  }
  if (block.kind === "heading") {
    return \`<h\${block.props.level} class="local-heading level-\${block.props.level}"\${highlightUnsupportedAttrs()}>\${escapeHtml(block.props.text)}</h\${block.props.level}>\`;
  }
  if (block.kind === "list") {
    const tag = block.props.style === "number" ? "ol" : "ul";
    return \`<div class="block markdown"\${highlightAnchorAttrs(block, context)}><\${tag}>\${block.props.items.map((item) => \`<li>\${renderInlineMarkdown(item)}</li>\`).join("")}</\${tag}></div>\`;
  }
  if (block.kind === "codeBlock") {
    const language = block.props.language ? \` data-language="\${escapeAttr(block.props.language)}"\` : "";
    return \`<pre class="code-block"\${language}\${highlightUnsupportedAttrs()}><code>\${escapeHtml(block.props.code)}</code></pre>\`;
  }
  if (block.kind === "mathBlock") {
    return \`<div class="math-block"\${highlightUnsupportedAttrs()}>\${renderMath(block.props.body, true)}</div>\`;
  }
  if (block.kind === "diagram") {
    return renderDiagram(block);
  }
  if (block.kind === "chart") {
    return renderChart(block);
  }
  if (block.kind === "image") {
    return renderImage(block, context);
  }
  if (block.kind === "callout") {
    const title = block.props.title ? block.props.title : block.props.tone.replace("-", " ");
    return \`<aside class="callout \${escapeAttr(block.props.tone)}"><div class="callout-title"\${highlightUnsupportedAttrs()}>\${escapeHtml(title)}</div><div class="markdown"\${highlightAnchorAttrs(block, context)}>\${renderMarkdown(block.props.body)}</div></aside>\`;
  }
  if (block.kind === "glossary") {
    return renderGlossary(block, context);
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
  return \`<article class="block"\${highlightUnsupportedAttrs()}><div class="markdown"><p>Unsupported block: \${escapeHtml(block.kind)}</p></div></article>\`;
}

function highlightAnchorAttrs(block, context) {
  const sectionId = context?.section?.id ?? "";
  const subsectionId = context?.subsection?.id ?? "";
  return [
    ' data-highlight-anchor="true"',
    \` data-highlight-block="\${escapeAttr(block.id)}"\`,
    \` data-highlight-section="\${escapeAttr(sectionId)}"\`,
    subsectionId ? \` data-highlight-subsection="\${escapeAttr(subsectionId)}"\` : ""
  ].join("");
}

function highlightUnsupportedAttrs() {
  return ' data-highlight-unsupported="true"';
}

function renderDiagram(block) {
  const title = block.props.title
    ? \`<h4 class="diagram-title">\${escapeHtml(block.props.title)}</h4>\`
    : "";
  return \`
    <article class="block diagram" data-diagram="\${escapeAttr(block.id)}"\${highlightUnsupportedAttrs()}>
      \${title}
      <div class="diagram-body" data-diagram-body>
        <pre class="diagram-source code-block" data-diagram-source>\${escapeHtml(block.props.body)}</pre>
      </div>
    </article>
  \`;
}

async function renderDiagrams() {
  const diagrams = [...document.querySelectorAll("[data-diagram]")];
  if (diagrams.length === 0) return;
  let mermaid;
  try {
    mermaid = await loadMermaid();
  } catch (error) {
    diagrams.forEach((element) => renderDiagramError(element, error));
    return;
  }
  for (const element of diagrams) {
    if (element.dataset.diagramRendered === "true") continue;
    const source = element.querySelector("[data-diagram-source]")?.textContent ?? "";
    const target = element.querySelector("[data-diagram-body]");
    if (!target || !source.trim()) continue;
    try {
      const id = "diagram_" + stableHash(element.dataset.diagram + ":" + source);
      await mermaid.parse(source, { suppressErrors: false });
      const result = await mermaid.render(id, source, target);
      target.innerHTML = result.svg;
      result.bindFunctions?.(target);
      element.dataset.diagramRendered = "true";
    } catch (error) {
      renderDiagramError(element, error);
    }
  }
}

function renderDiagramError(element, error) {
  const target = element.querySelector("[data-diagram-body]");
  const source = element.querySelector("[data-diagram-source]")?.textContent ?? "";
  if (!target) return;
  target.innerHTML = \`
    <div class="diagram-error">Diagram could not be rendered.</div>
    <pre class="diagram-source code-block">\${escapeHtml(source || String(error?.message ?? error ?? ""))}</pre>
  \`;
  element.dataset.diagramRendered = "error";
}

function renderChart(block) {
  return \`
    <article class="block chart"\${highlightUnsupportedAttrs()}>
      <h4 class="chart-title">\${escapeHtml(block.props.title)}</h4>
      <div class="chart-body">\${renderChartSvg(block.props)}</div>
    </article>
  \`;
}

function renderImage(block, context) {
  const src = imageAssetUrl(block.props.src, context);
  const caption = block.props.caption ? escapeHtml(block.props.caption) : "";
  const credit = block.props.credit ? \`<span class="image-block-credit">\${escapeHtml(block.props.credit)}</span>\` : "";
  const separator = caption && credit ? " " : "";
  const figcaption = caption || credit
    ? \`<figcaption class="image-block-caption">\${caption}\${separator}\${credit}</figcaption>\`
    : "";
  return \`
    <figure class="block image-block"\${highlightUnsupportedAttrs()}>
      <img class="image-block-media" src="\${escapeAttr(src)}" alt="\${escapeAttr(block.props.alt)}" loading="lazy" decoding="async">
      \${figcaption}
    </figure>
  \`;
}

function imageAssetUrl(src, context) {
  if (!isTextbookAssetSrc(src)) return "";
  const textbookId = context?.textbookId ?? "";
  if (!textbookId) return "";
  return \`/__tutor-assets/textbooks/\${encodeURIComponent(textbookId)}/\${encodeAssetPath(src)}\`;
}

function isTextbookAssetSrc(src) {
  if (typeof src !== "string" || !src.startsWith("assets/")) return false;
  if (src.includes("\\\\") || src.includes("\\0")) return false;
  return !src.split("/").some((part) => part === "" || part === "." || part === "..");
}

function encodeAssetPath(src) {
  return src.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function renderChartSvg(props) {
  const points = Array.isArray(props.points)
    ? props.points
      .map((point) => ({
        label: String(point?.label ?? ""),
        value: Number(point?.value)
      }))
      .filter((point) => point.label.trim() && Number.isFinite(point.value))
    : [];
  if (points.length === 0) {
    return \`<div class="diagram-error">Chart has no valid points.</div>\`;
  }

  const width = 720;
  const height = 340;
  const margin = { top: 24, right: 26, bottom: 70, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const scale = chartScale(props, points);
  const minValue = scale.minValue;
  const maxValue = scale.maxValue;
  const yForValue = (value) => margin.top + ((maxValue - value) / (maxValue - minValue)) * plotHeight;
  const zeroY = yForValue(0);
  const ticks = scale.ticks;
  const chartContent = props.type === "line"
    ? renderLineChart(points, margin, plotWidth, plotHeight, yForValue)
    : renderBarChart(points, margin, plotWidth, zeroY, yForValue);
  const xLabel = props.xLabel ? \`<text class="chart-axis-label" x="\${width / 2}" y="\${height - 10}" text-anchor="middle">\${escapeHtml(props.xLabel)}</text>\` : "";
  const yLabel = props.yLabel ? \`<text class="chart-axis-label" x="16" y="\${height / 2}" text-anchor="middle" transform="rotate(-90 16 \${height / 2})">\${escapeHtml(props.yLabel)}</text>\` : "";

  return \`
    <svg class="chart-svg" viewBox="0 0 \${width} \${height}" role="img" aria-label="\${escapeAttr(props.title)}">
      <title>\${escapeHtml(props.title)}</title>
      \${ticks.map((tick) => {
        const y = yForValue(tick);
        return \`
          <line class="chart-grid" x1="\${margin.left}" y1="\${formatNumber(y)}" x2="\${width - margin.right}" y2="\${formatNumber(y)}"></line>
          <text class="chart-value" x="\${margin.left - 10}" y="\${formatNumber(y + 4)}" text-anchor="end">\${escapeHtml(formatTick(tick))}</text>
        \`;
      }).join("")}
      <line class="chart-axis" x1="\${margin.left}" y1="\${formatNumber(margin.top)}" x2="\${margin.left}" y2="\${formatNumber(height - margin.bottom)}"></line>
      <line class="chart-axis" x1="\${margin.left}" y1="\${formatNumber(zeroY)}" x2="\${width - margin.right}" y2="\${formatNumber(zeroY)}"></line>
      \${chartContent}
      \${xLabel}
      \${yLabel}
    </svg>
  \`;
}

function renderBarChart(points, margin, plotWidth, zeroY, yForValue) {
  const step = plotWidth / points.length;
  const barWidth = Math.max(10, Math.min(64, step * 0.58));
  return points.map((point, index) => {
    const centerX = margin.left + step * index + step / 2;
    const y = yForValue(point.value);
    const top = Math.min(y, zeroY);
    const height = Math.abs(zeroY - y);
    return \`
      <rect class="chart-bar" x="\${formatNumber(centerX - barWidth / 2)}" y="\${formatNumber(top)}" width="\${formatNumber(barWidth)}" height="\${formatNumber(height)}"></rect>
      <text class="chart-label" x="\${formatNumber(centerX)}" y="\${formatNumber(zeroY + 18)}" text-anchor="middle">\${escapeHtml(truncateChartLabel(point.label))}</text>
    \`;
  }).join("");
}

function renderLineChart(points, margin, plotWidth, plotHeight, yForValue) {
  const xForIndex = (index) => points.length === 1
    ? margin.left + plotWidth / 2
    : margin.left + (index / (points.length - 1)) * plotWidth;
  const path = points.map((point, index) => {
    const command = index === 0 ? "M" : "L";
    return command + formatNumber(xForIndex(index)) + " " + formatNumber(yForValue(point.value));
  }).join(" ");
  return \`
    <path class="chart-line" d="\${escapeAttr(path)}"></path>
    \${points.map((point, index) => {
      const x = xForIndex(index);
      return \`
        <circle class="chart-point" cx="\${formatNumber(x)}" cy="\${formatNumber(yForValue(point.value))}" r="4"></circle>
        <text class="chart-label" x="\${formatNumber(x)}" y="\${formatNumber(margin.top + plotHeight + 22)}" text-anchor="middle">\${escapeHtml(truncateChartLabel(point.label))}</text>
      \`;
    }).join("")}
  \`;
}

function chartScale(props, points) {
  const values = points.map((point) => point.value);
  const rawMin = Math.min(0, ...values);
  const rawMax = Math.max(0, ...values);
  if (isPercentChart(props, values)) {
    return { minValue: 0, maxValue: 100, ticks: [0, 25, 50, 75, 100] };
  }
  const ticks = chartTicks(rawMin, rawMax);
  return {
    minValue: ticks[0],
    maxValue: ticks[ticks.length - 1],
    ticks
  };
}

function isPercentChart(props, values) {
  const yLabel = String(props?.yLabel ?? "").toLowerCase();
  if (!yLabel.includes("%") && !yLabel.includes("percent")) return false;
  return values.every((value) => value >= 0 && value <= 100);
}

function chartTicks(minValue, maxValue) {
  if (minValue === maxValue) {
    minValue -= 1;
    maxValue += 1;
  }
  const step = niceChartStep(maxValue - minValue);
  const start = Math.floor(minValue / step) * step;
  const end = Math.ceil(maxValue / step) * step;
  const ticks = [];
  for (let tick = start; tick <= end + step / 2; tick += step) {
    ticks.push(normalizeChartTick(tick));
  }
  return ticks.length >= 2 ? ticks : [start, start + step].map(normalizeChartTick);
}

function niceChartStep(range) {
  const targetSteps = 5;
  const roughStep = Math.abs(range) / targetSteps;
  if (!Number.isFinite(roughStep) || roughStep === 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const magnitude = 10 ** exponent;
  const fraction = roughStep / magnitude;
  let niceFraction = 10;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  return niceFraction * magnitude;
}

function normalizeChartTick(value) {
  if (Object.is(value, -0)) return 0;
  return Math.round(value * 1e12) / 1e12;
}

function formatTick(value) {
  if (Math.abs(value) >= 100) return String(Math.round(value));
  if (Math.abs(value) >= 10) return String(Math.round(value * 10) / 10);
  return String(Math.round(value * 100) / 100);
}

function truncateChartLabel(value) {
  const label = String(value ?? "");
  return label.length > 14 ? label.slice(0, 13) + "..." : label;
}

function formatNumber(value) {
  return String(Math.round(value * 100) / 100);
}

async function loadChapterHighlights(textbookId, chapterId) {
  try {
    const state = await fetchJson(\`/api/highlights?textbookId=\${encodeURIComponent(textbookId)}&chapterId=\${encodeURIComponent(chapterId)}\`);
    return {
      highlights: Array.isArray(state.highlights) ? state.highlights : [],
      statePath: state.statePath
    };
  } catch {
    return { highlights: [], statePath: "" };
  }
}

function bindHighlighter(chapter) {
  highlightSelectionController?.abort();
  highlightSelectionController = new AbortController();
  refreshHighlightModeAffordances();
  document.addEventListener("mouseup", () => {
    window.setTimeout(() => handleHighlightSelection(chapter), 0);
  }, { signal: highlightSelectionController.signal });
  document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") return;
    void handleHighlightSelection(chapter);
  }, { signal: highlightSelectionController.signal });
}

function setHighlightModeEnabled(enabled) {
  highlightModeEnabled = enabled;
  refreshHighlightModeAffordances();
  updateHighlightModeControl();
}

function highlightModeHelpText() {
  return "Select text to save or remove highlights.";
}

function updateHighlightModeControl() {
  document.querySelectorAll("[data-highlight-mode-toggle]").forEach((input) => {
    if (input instanceof HTMLInputElement) input.checked = highlightModeEnabled;
  });
  document.querySelectorAll("[data-highlight-mode-tooltip]").forEach((tooltip) => {
    tooltip.setAttribute("aria-label", highlightModeHelpText());
    tooltip.setAttribute("data-tooltip", highlightModeHelpText());
  });
}

function refreshHighlightModeAffordances() {
  const content = document.querySelector(".chapter-content");
  content?.classList.toggle("highlight-mode-active", highlightModeEnabled);
  document.querySelectorAll("[data-highlight-unsupported]").forEach((element) => {
    if (highlightModeEnabled) {
      element.setAttribute("title", "This area can't be highlighted.");
    } else {
      element.removeAttribute("title");
    }
  });
}

async function handleHighlightSelection(chapter) {
  if (!highlightModeEnabled) return;
  const parsed = parseHighlightSelection(chapter);
  if (!parsed || parsed.kind === "empty") {
    return;
  }
  if (parsed.kind === "unsupported") {
    window.getSelection()?.removeAllRanges();
    return;
  }
  await applyHighlightModeSelections(chapter, parsed.selections);
}

function parseHighlightSelection(chapter) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return { kind: "empty" };
  const range = selection.getRangeAt(0);
  const content = document.querySelector(".chapter-content");
  if (!content || !rangeIntersectsNode(range, content)) return { kind: "empty" };
  const anchorSelections = [...content.querySelectorAll("[data-highlight-anchor]")]
    .filter((anchor) => rangeIntersectsNode(range, anchor))
    .map((anchor) => selectedHighlightAnchorRange(range, anchor))
    .filter(Boolean);
  const supportedTexts = anchorSelections.map(({ selectedText }) => selectedText).filter(Boolean);
  if (selectionHasUnsupportedText(range.toString(), supportedTexts)) return { kind: "unsupported" };
  const selections = anchorSelections
    .map(({ anchor, startOffset, endOffset }) => highlightSelectionForRange(chapter, anchor, startOffset, endOffset))
    .filter(Boolean);
  if (selections.length === 0) return { kind: "empty" };
  return {
    kind: "selection",
    selections
  };
}

function selectedHighlightAnchorRange(range, anchor) {
  const plainText = anchor.textContent ?? "";
  const startOffset = anchor.contains(range.startContainer)
    ? textOffset(anchor, range.startContainer, range.startOffset)
    : 0;
  const endOffset = anchor.contains(range.endContainer)
    ? textOffset(anchor, range.endContainer, range.endOffset)
    : plainText.length;
  const firstOffset = Math.min(startOffset, endOffset);
  const lastOffset = Math.max(startOffset, endOffset);
  const selectedText = plainText.slice(firstOffset, lastOffset);
  if (!selectedText.trim()) return null;
  return { anchor, startOffset: firstOffset, endOffset: lastOffset, selectedText };
}

function highlightSelectionForRange(chapter, anchor, startOffset, endOffset) {
  const firstOffset = Math.min(startOffset, endOffset);
  const lastOffset = Math.max(startOffset, endOffset);
  const plainText = anchor.textContent ?? "";
  const quote = plainText.slice(firstOffset, lastOffset);
  if (!quote.trim()) return null;
  return {
    textbookId: chapter.textbookId,
    chapterId: chapter.id,
    sectionId: anchor.dataset.highlightSection,
    subsectionId: anchor.dataset.highlightSubsection,
    blockId: anchor.dataset.highlightBlock,
    quote,
    startOffset: firstOffset,
    endOffset: lastOffset,
    prefix: plainText.slice(Math.max(0, firstOffset - 32), firstOffset),
    suffix: plainText.slice(lastOffset, Math.min(plainText.length, lastOffset + 32))
  };
}

async function applyHighlightModeSelections(chapter, selections) {
  for (const selection of selections) {
    await applyHighlightModeSelection(chapter, selection);
  }
  window.getSelection()?.removeAllRanges();
  refreshChapterHighlightUi(chapter);
}

async function applyHighlightModeSelection(chapter, selection) {
  const classification = classifyHighlightSelection(selection);
  if (classification === "fully-highlighted") {
    await removeSelectedHighlightRanges(chapter, selection);
  } else {
    const now = new Date().toISOString();
    await saveMergedHighlight(chapter, highlightForSelection(selection, now));
  }
}

function rangeIntersectsNode(range, node) {
  try {
    return range.intersectsNode(node);
  } catch {
    return false;
  }
}

function highlightForSelection(selection, now) {
  const overlapping = touchedHighlights(selection);
  const anchor = document.querySelector(\`[data-highlight-anchor][data-highlight-block="\${cssEscape(selection.blockId)}"]\`);
  const plainText = anchor?.textContent ?? "";
  const base = overlapping.sort((left, right) => left.startOffset - right.startOffset)[0];
  const startOffset = Math.min(selection.startOffset, ...overlapping.map((highlight) => highlight.startOffset));
  const endOffset = Math.max(selection.endOffset, ...overlapping.map((highlight) => highlight.endOffset));
  return {
    id: base?.id ?? \`highlight_\${Date.now()}_\${Math.random().toString(36).slice(2, 8)}\`,
    textbookId: selection.textbookId,
    chapterId: selection.chapterId,
    sectionId: selection.sectionId,
    subsectionId: selection.subsectionId,
    blockId: selection.blockId,
    quote: plainText.slice(startOffset, endOffset),
    startOffset,
    endOffset,
    prefix: plainText.slice(Math.max(0, startOffset - 32), startOffset),
    suffix: plainText.slice(endOffset, Math.min(plainText.length, endOffset + 32)),
    color: "yellow",
    status: "attached",
    createdAt: base?.createdAt ?? now,
    updatedAt: now
  };
}

function overlappingHighlights(selection) {
  return activeChapterHighlights.filter((highlight) => (
    highlight.status === "attached" &&
    highlight.blockId === selection.blockId &&
    Number.isInteger(highlight.startOffset) &&
    Number.isInteger(highlight.endOffset) &&
    rangesOverlap(highlight, selection)
  ));
}

function touchedHighlights(selection) {
  return activeChapterHighlights.filter((highlight) => (
    highlight.status === "attached" &&
    highlight.blockId === selection.blockId &&
    Number.isInteger(highlight.startOffset) &&
    Number.isInteger(highlight.endOffset) &&
    rangesTouchOrOverlap(highlight, selection)
  ));
}

async function saveMergedHighlight(chapter, highlight) {
  const mergedIds = touchedHighlights(highlight).map((candidate) => candidate.id).filter((id) => id !== highlight.id);
  await saveHighlight(highlight);
  for (const id of mergedIds) {
    await deleteHighlightOnServer(chapter, id);
  }
}

async function removeSelectedHighlightRanges(chapter, selection) {
  const overlaps = overlappingHighlights(selection);
  for (const highlight of overlaps) {
    await deleteHighlightOnServer(chapter, highlight.id);
  }
  for (const highlight of overlaps) {
    for (const piece of splitHighlightRange(highlight, selection)) {
      await saveHighlight(highlightWithRange(highlight, piece));
    }
  }
}

function highlightWithRange(base, range) {
  const anchor = document.querySelector(\`[data-highlight-anchor][data-highlight-block="\${cssEscape(base.blockId)}"]\`);
  const plainText = anchor?.textContent ?? "";
  return {
    ...base,
    id: \`\${base.id}_part_\${range.startOffset}_\${range.endOffset}\`,
    quote: plainText.slice(range.startOffset, range.endOffset),
    startOffset: range.startOffset,
    endOffset: range.endOffset,
    prefix: plainText.slice(Math.max(0, range.startOffset - 32), range.startOffset),
    suffix: plainText.slice(range.endOffset, Math.min(plainText.length, range.endOffset + 32)),
    updatedAt: new Date().toISOString()
  };
}

function classifyHighlightSelection(selection) {
  const overlaps = overlappingHighlights(selection);
  if (overlaps.length === 0) return "unhighlighted";
  return selectionFullyCovered(selection, overlaps) ? "fully-highlighted" : "partial-overlap";
}

async function saveHighlight(highlight) {
  const response = await fetchJson("/api/highlights", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(highlight)
  });
  activeChapterHighlights = Array.isArray(response.highlights) ? response.highlights : activeChapterHighlights;
  return response;
}

async function removeHighlight(chapter, highlightId) {
  if (!highlightId) return;
  await deleteHighlightOnServer(chapter, highlightId);
  refreshChapterHighlightUi(chapter);
}

async function deleteHighlightOnServer(chapter, highlightId) {
  const response = await fetchJson("/api/highlights", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: chapter.textbookId,
      chapterId: chapter.id,
      id: highlightId
    })
  });
  activeChapterHighlights = Array.isArray(response.highlights) ? response.highlights : activeChapterHighlights;
  return response;
}

function refreshChapterHighlightUi(chapter) {
  applyChapterHighlights(chapter);
  renderChapterHighlightsList(chapter);
}

function clearRenderedHighlights() {
  document.querySelectorAll("[data-text-highlight]").forEach((mark) => {
    const parent = mark.parentNode;
    mark.replaceWith(...mark.childNodes);
    parent?.normalize();
  });
}

function applyChapterHighlights(chapter) {
  clearRenderedHighlights();
  const nextHighlights = [];
  for (const highlight of activeChapterHighlights) {
    const applied = applyChapterHighlight(highlight);
    nextHighlights.push(applied);
    if (applied.status !== highlight.status) {
      void saveHighlight(applied);
    }
  }
  activeChapterHighlights = nextHighlights;
}

function applyChapterHighlight(highlight) {
  const anchor = document.querySelector(\`[data-highlight-anchor][data-highlight-block="\${cssEscape(highlight.blockId)}"]\`);
  if (!anchor) return { ...highlight, status: "unresolved" };
  const plainText = anchor.textContent ?? "";
  const resolved = resolveHighlightRange(highlight, plainText);
  if (!resolved) return { ...highlight, status: "changed" };
  wrapTextRange(anchor, resolved.startOffset, resolved.endOffset, highlight.id);
  return {
    ...highlight,
    startOffset: resolved.startOffset,
    endOffset: resolved.endOffset,
    status: "attached"
  };
}

function resolveHighlightRange(highlight, plainText) {
  const quote = String(highlight.quote ?? "");
  if (!quote) return null;
  if (
    Number.isInteger(highlight.startOffset) &&
    Number.isInteger(highlight.endOffset) &&
    plainText.slice(highlight.startOffset, highlight.endOffset) === quote
  ) {
    return { startOffset: highlight.startOffset, endOffset: highlight.endOffset };
  }
  const matches = allTextMatches(plainText, quote);
  if (matches.length === 0) return null;
  if (matches.length === 1) {
    return { startOffset: matches[0], endOffset: matches[0] + quote.length };
  }
  const scored = matches.map((startOffset) => {
    const endOffset = startOffset + quote.length;
    let score = 0;
    if (highlight.prefix && plainText.slice(Math.max(0, startOffset - highlight.prefix.length), startOffset).endsWith(highlight.prefix)) score += 1;
    if (highlight.suffix && plainText.slice(endOffset, endOffset + highlight.suffix.length).startsWith(highlight.suffix)) score += 1;
    if (Number.isInteger(highlight.startOffset) && Math.abs(startOffset - highlight.startOffset) <= 24) score += 1;
    return { startOffset, endOffset, score };
  }).sort((left, right) => right.score - left.score);
  return scored[0].score > 0 ? scored[0] : null;
}

function allTextMatches(text, quote) {
  const matches = [];
  let cursor = 0;
  while (cursor < text.length) {
    const index = text.indexOf(quote, cursor);
    if (index === -1) break;
    matches.push(index);
    cursor = index + Math.max(quote.length, 1);
  }
  return matches;
}

function wrapTextRange(root, startOffset, endOffset, highlightId) {
  const segments = textNodeHighlightSegments(root, startOffset, endOffset);
  for (const segment of segments.reverse()) {
    wrapTextNodeSegment(segment.node, segment.startOffset, segment.endOffset, highlightId);
  }
  return segments.length > 0;
}

function textNodeHighlightSegments(root, startOffset, endOffset) {
  const firstOffset = Math.max(0, Math.min(startOffset, endOffset));
  const lastOffset = Math.max(0, Math.max(startOffset, endOffset));
  if (firstOffset === lastOffset) return [];
  const segments = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue ?? "";
    const nextOffset = offset + text.length;
    if (offset < lastOffset && nextOffset > firstOffset) {
      const segmentStart = Math.max(firstOffset, offset) - offset;
      const segmentEnd = Math.min(lastOffset, nextOffset) - offset;
      if (segmentStart < segmentEnd) {
        segments.push({ node, startOffset: segmentStart, endOffset: segmentEnd });
      }
    }
    offset = nextOffset;
  }
  return segments;
}

function wrapTextNodeSegment(node, startOffset, endOffset, highlightId) {
  const text = node.nodeValue ?? "";
  const firstOffset = Math.max(0, Math.min(startOffset, text.length));
  const lastOffset = Math.max(firstOffset, Math.min(endOffset, text.length));
  if (firstOffset === lastOffset) return false;
  const range = document.createRange();
  range.setStart(node, firstOffset);
  range.setEnd(node, lastOffset);
  const mark = document.createElement("mark");
  mark.className = "text-highlight";
  mark.dataset.textHighlight = highlightId;
  range.surroundContents(mark);
  return true;
}

function textOffset(root, container, offset) {
  const range = document.createRange();
  range.setStart(root, 0);
  range.setEnd(container, offset);
  return range.toString().length;
}

function renderChapterHighlightsList(chapter) {
  const container = document.querySelector("[data-highlight-list]");
  if (!container) return;
  if (activeChapterHighlights.length === 0) {
    container.hidden = false;
    container.innerHTML = \`
      <div class="index-label">Highlights</div>
      \${renderHighlightModeToggle()}
      <div class="chapter-highlight-empty">No highlights yet.</div>
    \`;
    bindHighlightModeToggle();
    return;
  }
  container.hidden = false;
  container.innerHTML = \`
    <div class="index-label">Highlights</div>
    \${renderHighlightModeToggle()}
    <div class="chapter-highlight-list">
      \${activeChapterHighlights.map((highlight) => \`
        <button class="chapter-highlight-item \${escapeAttr(highlight.status)}" type="button" data-highlight-list-item="\${escapeAttr(highlight.id)}">
          <span>
            <span class="chapter-highlight-quote">“\${escapeHtml(highlight.quote)}”</span>
            \${highlight.status === "attached" ? "" : \`<span class="chapter-highlight-status">\${highlight.status === "unresolved" ? "Source text no longer exists" : "Source text changed"}</span>\`}
          </span>
          <span class="chapter-highlight-remove" role="button" tabindex="0" data-highlight-list-remove="\${escapeAttr(highlight.id)}" aria-label="Remove highlight">×</span>
        </button>
      \`).join("")}
    </div>
  \`;
  bindHighlightModeToggle();
  container.querySelectorAll("[data-highlight-list-item]").forEach((button) => {
    button.addEventListener("click", () => {
      const highlightId = button.dataset.highlightListItem;
      const mark = document.querySelector(\`[data-text-highlight="\${cssEscape(highlightId)}"]\`);
      if (mark) {
        mark.scrollIntoView({ block: "center", behavior: "smooth" });
        focusRenderedHighlight(mark);
      }
    });
  });
  container.querySelectorAll("[data-highlight-list-remove]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void removeHighlight(chapter, button.dataset.highlightListRemove);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      void removeHighlight(chapter, button.dataset.highlightListRemove);
    });
  });
}

function renderHighlightModeToggle() {
  return \`
    <div class="highlight-mode-toggle">
      <div class="highlight-mode-row">
        <label class="highlight-mode-switch glossary-toggle-row">
          <input class="glossary-toggle-input" type="checkbox" data-highlight-mode-toggle \${highlightModeEnabled ? "checked" : ""} />
          <span class="highlight-mode-switch-label glossary-toggle-label">Highlight mode</span>
        </label>
        <button class="highlight-mode-tooltip" type="button" data-highlight-mode-tooltip data-tooltip="\${escapeAttr(highlightModeHelpText())}" aria-label="\${escapeAttr(highlightModeHelpText())}">i</button>
      </div>
    </div>
  \`;
}

function bindHighlightModeToggle() {
  const input = document.querySelector("[data-highlight-mode-toggle]");
  if (!(input instanceof HTMLInputElement)) return;
  input.addEventListener("change", () => {
    setHighlightModeEnabled(input.checked === true);
  });
}

function focusRenderedHighlight(mark) {
  document.querySelectorAll(".text-highlight.focused").forEach((element) => {
    element.classList.remove("focused");
  });
  mark.classList.add("focused");
  window.setTimeout(() => {
    mark.classList.remove("focused");
  }, 1100);
}

function renderGlossary(block, context) {
  const title = block.props.title || "Glossary";
  const entries = Array.isArray(block.props.entries) ? block.props.entries : [];
  const textbookId = context?.textbookId;
  const titleMarkup = textbookId
    ? \`<a class="glossary-title-link" href="/textbooks/\${encodeURIComponent(textbookId)}/glossary" data-glossary-overview="\${escapeAttr(textbookId)}">\${escapeHtml(title)}</a>\`
    : escapeHtml(title);
  return \`
    <article class="block glossary" id="\${escapeAttr(blockAnchorId(block.id))}"\${highlightUnsupportedAttrs()}>
      <h4 class="glossary-title">\${titleMarkup}</h4>
      <dl class="glossary-list">
        \${entries.map((entry) => {
          const term = String(entry?.term ?? "");
          const glossaryEntry = context?.chapter && context?.glossaryStudyState
            ? { id: glossaryEntryId(context.chapter.id, block.id, term), term }
            : null;
          return \`
          <div class="glossary-entry">
            <dt class="glossary-term">\${renderInlineMarkdown(term)}</dt>
            <dd class="glossary-definition">\${renderInlineMarkdown(entry?.definition ?? "")}</dd>
            \${glossaryEntry ? renderGlossaryStarButton(glossaryEntry, context.glossaryStudyState) : ""}
          </div>
        \`;
        }).join("")}
      </dl>
    </article>
  \`;
}

function renderTransformation(block) {
  return \`
    <article class="block transformation layout-\${escapeAttr(block.props.layout)}" data-transformation="\${escapeAttr(block.id)}" data-transformation-layout="\${escapeAttr(block.props.layout)}"\${highlightUnsupportedAttrs()}>
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
    <article class="block quiz" data-quiz="\${escapeAttr(block.id)}"\${highlightUnsupportedAttrs()}>
      <div class="quiz-head">
        <h4 class="quiz-title">\${escapeHtml(block.props.title)}</h4>
        <div class="quiz-meta">\${escapeHtml(formatQuizMode(block.props.mode))} / \${block.props.questions.length} questions</div>
      </div>
      <form class="quiz-form">
        \${block.props.questions.map((question, index) => renderQuizQuestion(block, question, index)).join("")}
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

function renderQuizQuestion(block, question, index) {
  if (isMatchingQuestion(question)) return renderMatchingQuestion(block, question, index);
  const title = renderQuizQuestionTitle(block, question, index);
  return \`
    <fieldset class="quiz-question" data-quiz-question="\${escapeAttr(question.id)}" data-quiz-kind="choice" data-quiz-answer="\${escapeAttr(question.answer)}">
      <div class="quiz-question-title">\${title}</div>
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
  \`;
}

function renderMatchingQuestion(block, question, index) {
  const options = matchingOptions(block, question);
  const title = renderQuizQuestionTitle(block, question, index);
  return \`
    <fieldset class="quiz-question" data-quiz-question="\${escapeAttr(question.id)}" data-quiz-kind="matching">
      <div class="quiz-question-title">\${title}</div>
      <div class="quiz-matching">
        <div class="quiz-matching-head">
          <span>\${escapeHtml(question.leftLabel ?? "Prompt")}</span>
          <span>\${escapeHtml(question.rightLabel ?? "Match")}</span>
          <span aria-hidden="true"></span>
        </div>
        \${question.pairs.map((pair) => \`
          <div class="quiz-match-row" data-quiz-match-pair="\${escapeAttr(pair.id)}" data-quiz-match-answer="\${escapeAttr(pair.id)}">
            <div class="quiz-match-left">\${renderInlineMarkdown(pair.left)}</div>
            <select class="quiz-match-select" data-quiz-match-select aria-label="Choose match for \${escapeAttr(pair.left)}">
              <option value="">Choose...</option>
              \${options.map((option) => \`<option value="\${escapeAttr(option.id)}">\${escapeHtml(option.right)}</option>\`).join("")}
            </select>
            <span class="quiz-match-result" data-quiz-match-result></span>
          </div>
        \`).join("")}
      </div>
      <div class="quiz-explanation markdown" data-quiz-explanation hidden>\${renderMarkdown(question.explanation)}</div>
    </fieldset>
  \`;
}

function renderQuizQuestionTitle(block, question, index) {
  const prompt = renderInlineMarkdown(question.prompt);
  if (block.props.questions.length === 1) return prompt;
  return \`\${index + 1}. \${prompt}\`;
}

function matchingOptions(block, question) {
  return question.pairs
    .map((option) => ({ id: option.id, right: option.right }))
    .sort((left, right) => stableHash(\`\${block.id}:\${question.id}:\${left.id}\`) - stableHash(\`\${block.id}:\${question.id}:\${right.id}\`));
}

function isMatchingQuestion(question) {
  return question?.kind === "matching";
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
  bindMatchingBoards(element, state);
  const checkButton = element.querySelector("[data-quiz-check]");
  const resetButton = element.querySelector("[data-quiz-reset]");
  if (checkButton) {
    checkButton.addEventListener("click", () => checkQuizAnswers(state));
  }
  if (resetButton) {
    resetButton.addEventListener("click", () => resetQuiz(state));
  }
}

function bindMatchingBoards(element, state) {
  element.querySelectorAll('[data-quiz-kind="matching"]').forEach((questionElement) => {
    questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
      select.addEventListener("change", () => {
        if (state.submitted) return;
        const questionId = questionElement.dataset.quizQuestion;
        if (!questionId) return;
        normalizeMatchingSelections(questionElement);
        const selected = matchingSelection(questionElement);
        updateMatchingSelectOptions(questionElement);
        if (Object.keys(selected).length > 0) {
          state.selectedAnswers[questionId] = selected;
        } else {
          delete state.selectedAnswers[questionId];
        }
        void saveQuizSelections(state);
      });
    });
  });
}

async function checkQuizAnswers(state) {
  const { element, block, chapter } = state;
  let correct = 0;
  const responses = [];
  for (const question of block.props.questions) {
    const questionElement = element.querySelector(\`[data-quiz-question="\${cssEscape(question.id)}"]\`);
    if (!questionElement) continue;
    const isCorrect = isMatchingQuestion(question)
      ? checkMatchingQuestion(questionElement, question, state, responses)
      : checkChoiceQuestion(questionElement, question, state, responses);
    if (isCorrect) correct += 1;
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

function checkChoiceQuestion(questionElement, question, state, responses) {
  const selected = questionElement.querySelector("input:checked")?.value;
  const isCorrect = selected === question.answer;
  if (selected) {
    state.selectedAnswers[question.id] = selected;
    responses.push({ questionId: question.id, selectedAnswer: selected, correct: isCorrect });
  }
  applyChoiceFeedback(questionElement, question, selected);
  return isCorrect;
}

function applyChoiceFeedback(questionElement, question, selected) {
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

function checkMatchingQuestion(questionElement, question, state, responses) {
  normalizeMatchingSelections(questionElement);
  updateMatchingSelectOptions(questionElement);
  const selected = matchingSelection(questionElement);
  const hasSelection = Object.keys(selected).length > 0;
  const isCorrect = matchingQuestionCorrect(question, selected);
  if (hasSelection) {
    state.selectedAnswers[question.id] = selected;
    responses.push({ questionId: question.id, selectedAnswer: selected, correct: isCorrect });
  } else {
    delete state.selectedAnswers[question.id];
  }
  applyMatchingFeedback(questionElement, question, selected);
  return isCorrect;
}

function matchingSelection(questionElement) {
  const selected = {};
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const value = row.querySelector("[data-quiz-match-select]")?.value;
    if (pairId && value) selected[pairId] = value;
  });
  return selected;
}

function normalizeMatchingSelections(questionElement) {
  const used = new Set();
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    const value = select.value;
    if (!value) return;
    if (used.has(value)) {
      select.value = "";
      return;
    }
    used.add(value);
  });
}

function updateMatchingSelectOptions(questionElement) {
  const selectedBySelect = new Map();
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    if (select.value) selectedBySelect.set(select, select.value);
  });
  const selectedValues = new Set(selectedBySelect.values());
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    const currentValue = selectedBySelect.get(select) ?? "";
    select.querySelectorAll("option").forEach((option) => {
      option.disabled = Boolean(option.value) && option.value !== currentValue && selectedValues.has(option.value);
    });
  });
}

function renderMatchingAssignments(questionElement, selectedAnswer) {
  const selected = isRecordObject(selectedAnswer) ? selectedAnswer : {};
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const select = row.querySelector("[data-quiz-match-select]");
    if (!pairId || !select) return;
    select.value = selected[pairId] ?? "";
    if (select.value !== (selected[pairId] ?? "")) {
      select.value = "";
    }
  });
  normalizeMatchingSelections(questionElement);
  updateMatchingSelectOptions(questionElement);
  return matchingSelection(questionElement);
}

function matchingQuestionCorrect(question, selected) {
  if (!isRecordObject(selected)) return false;
  return question.pairs.every((pair) => selected[pair.id] === pair.id);
}

function applyMatchingFeedback(questionElement, question, selectedAnswer) {
  const selected = renderMatchingAssignments(questionElement, selectedAnswer);
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const answer = row.dataset.quizMatchAnswer;
    const selectedRight = pairId ? selected[pairId] : undefined;
    const isCorrect = Boolean(selectedRight) && selectedRight === answer;
    row.classList.toggle("correct", isCorrect);
    row.classList.toggle("incorrect", !isCorrect);
    row.classList.remove("selected");
    const result = row.querySelector("[data-quiz-match-result]");
    if (result) {
      result.textContent = isCorrect ? "✓" : "!";
      result.setAttribute("aria-label", isCorrect ? "Correct" : "Incorrect");
    }
  });
  delete questionElement.dataset.quizActivePair;
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    select.disabled = true;
  });
  const explanation = questionElement.querySelector("[data-quiz-explanation]");
  if (explanation) explanation.hidden = false;
}

function resetQuiz(state) {
  const { element } = state;
  state.selectedAnswers = {};
  state.submitted = false;
  element.querySelectorAll("input").forEach((input) => {
    input.checked = false;
    input.disabled = false;
  });
  element.querySelectorAll("[data-quiz-kind='matching']").forEach((questionElement) => {
    delete questionElement.dataset.quizActivePair;
    questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
      select.disabled = false;
    });
    renderMatchingAssignments(questionElement, {});
  });
  element.querySelectorAll("[data-quiz-choice]").forEach((choiceElement) => {
    choiceElement.classList.remove("correct", "incorrect");
  });
  element.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    row.classList.remove("correct", "incorrect", "selected");
  });
  element.querySelectorAll("[data-quiz-match-result]").forEach((result) => {
    result.textContent = "";
    result.removeAttribute("aria-label");
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
    if (typeof answer === "string") {
      const input = state.element.querySelector(\`[data-quiz-question="\${cssEscape(questionId)}"] input[value="\${cssEscape(answer)}"]\`);
      if (input) input.checked = true;
    } else if (isRecordObject(answer)) {
      const questionElement = state.element.querySelector(\`[data-quiz-question="\${cssEscape(questionId)}"][data-quiz-kind="matching"]\`);
      if (questionElement) {
        const normalized = renderMatchingAssignments(questionElement, answer);
        if (Object.keys(normalized).length > 0) {
          state.selectedAnswers[questionId] = normalized;
        } else {
          delete state.selectedAnswers[questionId];
        }
      }
    }
  }
  if (persisted.submitted) {
    void checkQuizAnswersLocally(state, persisted.score, persisted.total);
  }
}

function checkQuizAnswersLocally(state, persistedScore, persistedTotal) {
  const { element, block } = state;
  for (const question of block.props.questions) {
    const questionElement = element.querySelector(\`[data-quiz-question="\${cssEscape(question.id)}"]\`);
    if (!questionElement) continue;
    if (isMatchingQuestion(question)) {
      applyMatchingFeedback(questionElement, question, state.selectedAnswers[question.id]);
    } else {
      applyChoiceFeedback(questionElement, question, state.selectedAnswers[question.id]);
    }
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
    <article class="block coding-problem" data-coding-problem="\${escapeAttr(block.id)}"\${highlightUnsupportedAttrs()}>
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

function collectTextbookGlossaryEntries(textbook) {
  const entries = [];
  for (const chapter of textbook.chapters ?? []) {
    for (const section of chapter.sections ?? []) {
      collectGlossaryEntriesFromBlocks(entries, textbook, chapter, section, section.blocks ?? []);
      for (const subsection of section.subsections ?? []) {
        collectGlossaryEntriesFromBlocks(entries, textbook, chapter, section, subsection.blocks ?? [], subsection);
      }
    }
  }
  return entries;
}

function collectGlossaryEntriesFromBlocks(entries, textbook, chapter, section, blocks, subsection) {
  for (const block of blocks) {
    if (block?.kind !== "glossary") continue;
    const glossaryTitle = block.props?.title || "Glossary";
    const sourceHref = \`/textbooks/\${encodeURIComponent(textbook.id)}/chapters/\${encodeURIComponent(chapter.id)}#\${encodeURIComponent(blockAnchorId(block.id))}\`;
    for (const entry of block.props?.entries ?? []) {
      const term = String(entry?.term ?? "");
      const definition = String(entry?.definition ?? "");
      entries.push({
        id: glossaryEntryId(chapter.id, block.id, term),
        term,
        definition,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        sectionId: section.id,
        sectionTitle: section.title,
        subsectionId: subsection?.id,
        subsectionTitle: subsection?.title,
        blockId: block.id,
        glossaryTitle,
        sourceHref,
        searchText: normalizeGlossarySearch(term)
      });
    }
  }
}

function normalizeGlossarySearch(value) {
  return String(value ?? "").trim().toLowerCase();
}

function glossaryEntryId(chapterId, blockId, term) {
  const normalizedTerm = normalizeGlossarySearch(term)
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "term";
  return [chapterId, blockId, normalizedTerm].map((part) => String(part).replace(/[^a-zA-Z0-9_.-]+/g, "_")).join(":");
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

function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import("/__tutor-assets/mermaid/mermaid.esm.min.mjs")
      .then((module) => {
        const mermaid = module.default ?? module;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          suppressErrorRendering: true
        });
        return mermaid;
      });
  }
  return mermaidReady;
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
          const attrs = item.action === "textbook" || item.action === "glossary"
            ? \`data-nav="\${escapeAttr(item.action)}" data-textbook="\${escapeAttr(item.textbookId ?? "")}"\`
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
        return;
      }
      if (button.dataset.nav === "glossary" && button.dataset.textbook) {
        navigateTextbookGlossary(button.dataset.textbook);
      }
    });
  });
}

function renderNotFoundPage(details = {}) {
  const title = details.title ?? "Page not found";
  const message = details.message ?? "That page does not exist in this Tutor Kit workspace.";
  const actionLabel = textbooks.length === 0 ? "Go home" : "Back to textbooks";
  document.querySelector("#main").innerHTML = \`
    <section class="not-found">
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: "Not found" }
      ])}
      <div class="not-found-panel">
        <div>
          <div class="not-found-kicker">404 not found</div>
          <h1>\${escapeHtml(title)}</h1>
          <p class="not-found-copy">\${escapeHtml(message)}</p>
          <div class="not-found-actions">
            <button class="not-found-action" data-nav="home">\${escapeHtml(actionLabel)}</button>
          </div>
        </div>
        <div class="not-found-code" aria-hidden="true">404</div>
      </div>
    </section>
  \`;
  bindCrumbs();
}

function notFoundDetails(route) {
  if (route.kind === "chapter") {
    return {
      title: "Chapter not found",
      message: \`No chapter matches \${route.textbookId}/\${route.chapterId}. It may have been renamed, removed, or not generated yet.\`
    };
  }
  if (route.kind === "textbook") {
    return {
      title: "Textbook not found",
      message: \`No textbook matches \${route.textbookId}. It may have been renamed, removed, or not generated yet.\`
    };
  }
  return {
    title: "Page not found",
    message: \`No route matches \${route.path ?? window.location.pathname}. Return to your textbook library to keep studying.\`
  };
}

function isNotFoundError(error) {
  return error?.status === 404;
}

function parseResponseError(body) {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.error === "string") return parsed.error;
    if (Array.isArray(parsed.issues)) return parsed.issues.map((issue) => issue.message ?? String(issue)).join("\\n");
  } catch {
    // Use the plain response body below.
  }
  return String(body ?? "").trim();
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

function blockAnchorId(value) {
  return \`block-\${anchorId(value)}\`;
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

function isRecordObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableHash(value) {
  const source = String(value ?? "");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

load().catch((error) => {
  document.querySelector("#main").innerHTML = \`<section><div class="page-head"><h1>Unable to load</h1></div><pre>\${escapeHtml(error.stack || error.message)}</pre></section>\`;
});
`;
}
//# sourceMappingURL=client.js.map