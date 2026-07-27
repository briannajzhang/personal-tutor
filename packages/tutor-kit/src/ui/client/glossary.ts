export function glossaryClientJs(): string {
  return `
async function renderTextbookGlossary(textbookId, token) {
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const entries = collectTextbookGlossaryEntries(textbook);
  if (entries.length === 0) {
    history.replaceState(history.state, "", "/textbooks/" + encodeURIComponent(textbookId));
    await renderTextbook(textbookId, token);
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

async function renderTextbookGlossaryStudy(textbookId, token) {
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const entries = collectTextbookGlossaryEntries(textbook);
  if (entries.length === 0) {
    history.replaceState(history.state, "", "/textbooks/" + encodeURIComponent(textbookId));
    await renderTextbook(textbookId, token);
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
`;
}
