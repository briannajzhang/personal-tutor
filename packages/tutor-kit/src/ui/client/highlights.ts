export function highlightsClientJs(): string {
  return `
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

function bindHighlightEvents() {
  document.addEventListener("mouseup", () => {
    if (activeChapter) window.setTimeout(() => handleHighlightSelection(activeChapter), 0);
  });
  document.addEventListener("keyup", (event) => {
    if (event.key !== "Escape" && activeChapter) void handleHighlightSelection(activeChapter);
  });
  document.addEventListener("change", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.matches("[data-highlight-mode-toggle]")) {
      setHighlightModeEnabled(event.target.checked);
    }
  });
  document.addEventListener("click", handleHighlightListClick);
  document.addEventListener("keydown", (event) => {
    const remove = event.target instanceof Element ? event.target.closest("[data-highlight-list-remove]") : null;
    if (!remove || (event.key !== "Enter" && event.key !== " ") || !activeChapter) return;
    event.preventDefault();
    event.stopPropagation();
    void removeHighlight(activeChapter, remove.dataset.highlightListRemove);
  });
}

function handleHighlightListClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  const remove = target?.closest("[data-highlight-list-remove]");
  if (remove && activeChapter) {
    event.preventDefault();
    event.stopPropagation();
    void removeHighlight(activeChapter, remove.dataset.highlightListRemove);
    return;
  }
  const item = target?.closest("[data-highlight-list-item]");
  const highlightId = item?.dataset.highlightListItem;
  if (!highlightId) return;
  const mark = document.querySelector(\`[data-text-highlight="\${cssEscape(highlightId)}"]\`);
  if (mark) {
    mark.scrollIntoView({ block: "center", behavior: "smooth" });
    focusRenderedHighlight(mark);
  }
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
  refreshChapterHighlightUi();
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
  refreshChapterHighlightUi();
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

function refreshChapterHighlightUi() {
  applyChapterHighlights();
  renderChapterHighlightsList();
}

function clearRenderedHighlights() {
  document.querySelectorAll("[data-text-highlight]").forEach((mark) => {
    const parent = mark.parentNode;
    mark.replaceWith(...mark.childNodes);
    parent?.normalize();
  });
}

function applyChapterHighlights() {
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

function renderChapterHighlightsList() {
  const container = document.querySelector("[data-highlight-list]");
  if (!container) return;
  if (activeChapterHighlights.length === 0) {
    container.hidden = false;
    container.innerHTML = \`
      <div class="index-label">Highlights</div>
      \${renderHighlightModeToggle()}
      <div class="chapter-highlight-empty">No highlights yet.</div>
    \`;
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

function focusRenderedHighlight(mark) {
  document.querySelectorAll(".text-highlight.focused").forEach((element) => {
    element.classList.remove("focused");
  });
  mark.classList.add("focused");
  window.setTimeout(() => {
    mark.classList.remove("focused");
  }, 1100);
}
`;
}
