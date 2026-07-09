import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

test.afterEach(() => {
  clearWorkspaceCaches();
});

function assertMatchingQuizAssets(page: string) {
  for (const pattern of [
    /quiz-matching/,
    /data-quiz-match-select/,
    /data-quiz-match-result/,
    /renderQuizQuestionTitle/,
    /normalizeMatchingSelections/,
    /updateMatchingSelectOptions/,
    /checkMatchingQuestion/,
    /stableHash/
  ]) {
    assert.match(page, pattern);
  }

  for (const pattern of [
    /data-quiz-match-correct/,
    /Correct: /,
    /data-quiz-match-explanation/,
    /data-quiz-match-slot/,
    /data-quiz-match-bank/,
    /data-quiz-match-option/
  ]) {
    assert.doesNotMatch(page, pattern);
  }
}

function assertGlossaryAssets(page: string) {
  for (const pattern of [
    /renderGlossary/,
    /renderTextbookGlossary/,
    /loadTextbook/,
    /textbookCache/,
    /glossaryStudyStates/,
    /collectTextbookGlossaryEntries/,
    /glossaryEntryId/,
    /bindTextbookGlossarySearch/,
    /bindTextbookGlossaryControls/,
    /bindGlossaryStarControls\(textbookId\)/,
    /glossary-list/,
    /glossary-title-link/,
    /glossary-term/,
    /glossary-definition/,
    /glossary-aggregate-entry/,
    /renderTextbookGlossaryStudy/,
    /renderGlossaryStudyPage/,
    /navigateTextbookGlossaryStudy/,
    /textbookGlossaryStudy/,
    /glossary-study-launcher/,
    /glossary-study-menu/,
    /glossary-study-page/,
    /glossary-study-scoreboard/,
    /glossary-study-progress-bar/,
    /glossary-study-progress-fill/,
    /glossary-card-body/,
    /data-glossary-star/,
    /data-glossary-term/,
    /data-glossary-study-launch="all"/,
    /data-glossary-study-launch="starred"/,
    /Flashcards/,
    /Flashcards ▾/,
    /Study all terms/,
    /Study starred terms/,
    /Browse terms/,
    /still learning/,
    /known/,
    /Track progress/,
    /Flashcard options/,
    /Options/,
    /Study set/,
    /Prompt side/,
    /Show both sides/,
    /Restart session/,
    /terms reviewed/,
    /No terms in this study set/,
    /data-glossary-deck-option="all"[^>]*>All/,
    /data-glossary-deck-option="starred"[^>]*>Starred/,
    /glossary-segmented-control/,
    /glossary-segment/,
    /glossary-toggle-row/,
    /glossary-toggle-input/,
    /Previous/,
    /Next/,
    /unrated/,
    /glossary-rate-button/,
    /data-glossary-card-toggle/,
    /data-glossary-rate="again"/,
    /data-glossary-rate="knew-it"/,
    /data-glossary-deck-option/,
    /data-glossary-prompt-option/,
    /data-glossary-show-both/,
    /data-glossary-track-toggle/,
    /trackingEnabled/,
    /promptMode/,
    /showBoth/,
    /preserveCurrentIndex/,
    /glossaryStudyProgressCardIds/,
    /persistGlossaryRatingAndState/,
    /await submitGlossaryStudyRating/,
    /data-glossary-prev/,
    /data-glossary-next/,
    /Continue learning/,
    /studySet === state\.session\?\.studySet/,
    /reviewFinishedClean/,
    /glossarySessionStillLearningIds\(state\)\.length === 0/,
    /reconcileGlossaryStarredSession/,
    /renderGlossary\(block, context\)/,
    /glossaryEntryId\(context\.chapter\.id, block\.id, term\)/,
    /\/api\/glossary-study\/state/,
    /\/api\/glossary-study\/rating/,
    /glossary-empty/,
    /glossary-group-title-link/,
    /Open source glossary for/,
    /This textbook does not have glossary terms yet/,
    /Glossary terms are collected from chapter glossary blocks when they exist\./,
    /glossaryCount > 0/,
    /history\.replaceState\(history\.state, "", "\/textbooks\/" \+ encodeURIComponent\(textbookId\)\)/,
    /await renderTextbook\(textbookId\);/,
    /Chapters ·/,
    /Glossary ·/,
    /searchText: normalizeGlossarySearch\(term\)/,
    /data-glossary-search/,
    /data-glossary-source/,
    /data-glossary-overview/,
    /bindGlossaryOverviewLinks/,
    /textbook-tabs/,
    /blockAnchorId/,
    /\.glossary-term code/,
    /\.glossary-definition code/
  ]) {
    assert.match(page, pattern);
  }

  assert.match(page, /\.glossary-star \{[^}]*border: 0;/);
  assert.doesNotMatch(page, /\.glossary-star \{[^}]*border: 1px/);
  assert.doesNotMatch(page, /data-glossary="/);
  assert.doesNotMatch(page, /sourceLabel/);
  assert.doesNotMatch(page, /Open glossary/);
  assert.doesNotMatch(page, /glossary-mode-tab/);
  assert.doesNotMatch(page, /data-glossary-mode="browse"/);
  assert.doesNotMatch(page, /data-glossary-mode="study"/);
  assert.doesNotMatch(page, /Chapter glossary blocks will appear here/);
  assert.doesNotMatch(page, /Source block/);
  assert.doesNotMatch(page, /glossary\(\{ entries: \[\.\.\.\] \}\)/);
}

function assertHighlightAssets(page: string) {
  for (const pattern of [
    /data-highlight-anchor/,
    /data-highlight-block/,
    /data-highlight-section/,
    /data-highlight-list/,
    /chapter-highlights/,
    /text-highlight/,
    /loadChapterHighlights/,
    /bindHighlighter/,
    /applyChapterHighlights/,
    /resolveHighlightRange/,
    /textNodeHighlightSegments/,
    /wrapTextNodeSegment/,
    /highlightModeEnabled/,
    /handleHighlightSelection/,
    /parseHighlightSelection/,
    /selectedHighlightAnchorRange/,
    /highlightSelectionForRange/,
    /selectionHasUnsupportedText/,
    /applyHighlightModeSelections/,
    /refreshHighlightModeAffordances/,
    /highlight-mode-active/,
    /data-highlight-unsupported/,
    /This area can't be highlighted/,
    /highlightSelectionController/,
    /document\.addEventListener\("mouseup"/,
    /classifyHighlightSelection/,
    /removeSelectedHighlightRanges/,
    /splitHighlightRange/,
    /selectionFullyCovered/,
    /rangesTouchOrOverlap/,
    /applyHighlightModeSelection/,
    /renderHighlightModeToggle/,
    /data-highlight-mode-toggle/,
    /Highlight mode/,
    /\.page-head \{\n\s*display: flex;\n\s*align-items: end;/,
    /margin-bottom: 34px;/,
    /<h1>\$\{escapeHtml\(chapter\.title\)\}<\/h1>\s*<div class="meta">/,
    /highlight-mode-row/,
    /<input class="glossary-toggle-input" type="checkbox" data-highlight-mode-toggle[^>]*>\s*<span class="highlight-mode-switch-label glossary-toggle-label">Highlight mode<\/span>/,
    /highlight-mode-switch/,
    /highlight-mode-tooltip/,
    /highlight-mode-tooltip::after/,
    /data-highlight-mode-tooltip/,
    /data-tooltip="\$\{escapeAttr\(highlightModeHelpText\(\)\)\}"/,
    /content: attr\(data-tooltip\)/,
    /bottom: calc\(100% \+ 7px\);/,
    /left: 50%;/,
    /transform: translate\(-50%, 2px\);/,
    /aria-label="\$\{escapeAttr\(highlightModeHelpText\(\)\)\}"/,
    />i<\/button>/,
    /padding: 10px 12px;/,
    /\.chapter-highlight-quote \{[^}]*color: var\(--muted\);/,
    /min-width: 20px;/,
    /<div class="index-label">Highlights<\/div>\s*\$\{renderHighlightModeToggle\(\)\}\s*<div class="chapter-highlight-empty">No highlights yet\.<\/div>/,
    /<div class="index-label">Highlights<\/div>\s*\$\{renderHighlightModeToggle\(\)\}\s*<div class="chapter-highlight-list">/,
    /bindHighlightModeToggle\(\);/,
    /No highlights yet\./,
    /Select text to save or remove highlights/,
    /highlightModeHelpText/,
    /updateHighlightModeControl/,
    /setHighlightModeEnabled\(input\.checked === true\)/,
    /focusRenderedHighlight/,
    /\.text-highlight\.focused/,
    /saveMergedHighlight/,
    /refreshChapterHighlightUi/,
    /clearRenderedHighlights/,
    /removeHighlight/,
    /\/api\/highlights/,
    /Source text changed/,
    /Source text no longer exists/
  ]) {
    assert.match(page, pattern);
  }

  for (const pattern of [
    /range\.extractContents\(\)/,
    /highlight-toolbar/,
    /highlight-popover/,
    /data-highlight-create/,
    /data-highlight-remove-active/,
    /createHighlightFromSelection/,
    /showHighlightPopover/,
    /data-highlight-hint/,
    /showHighlightHint/,
    /Select within one paragraph or block/,
    /selectedTextNodeRange/,
    /createTreeWalker\(content/,
    /compareBoundaryPoints/,
    /cloneRange/,
    /highlightCount === 1 \? "highlight" : "highlights"/,
    /\.page-head \{\n\s*position: relative;/,
    /chapter-head-tools/,
    /chapter-highlight-mode/,
    /highlight-mode-panel/,
    /chapter-highlight-panel/,
    /chapter-highlight-count/,
    /chapter-highlight-help/,
    /data-highlight-mode-help/,
    /help\.hidden = !highlightModeEnabled/,
    /title="\$\{escapeAttr\(highlightModeHelpText\(\)\)\}"/,
    /Saved ·/,
    /Saved highlights ·/,
    /highlight-mode-state/,
    /data-highlight-mode-state/,
    /stateText = highlightModeEnabled \? "On" : "Off"/,
    /\.text-highlight:hover/,
    /cursor: pointer;\n\s*padding: 1px 2px;/
  ]) {
    assert.doesNotMatch(page, pattern);
  }
}

test("dev server exposes textbooks, chapters, and appends events", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const chaptersDir = join(dir, "textbooks", "getting-started", "chapters");
  const welcomePath = join(chaptersDir, "welcome.chapter.ts");
  const welcomeChapter = readFileSync(welcomePath, "utf8");
  writeFileSync(
    join(chaptersDir, "practice.chapter.ts"),
    welcomeChapter.replace('id: "welcome"', 'id: "practice"').replace("Chapter 1: Welcome", "Chapter 2: Practice")
  );
  writeFileSync(
    join(chaptersDir, "review.chapter.ts"),
    welcomeChapter.replace('id: "welcome"', 'id: "review"').replace("Chapter 1: Welcome", "Chapter 3: Review")
  );
  writeFileSync(join(dir, "textbooks", "getting-started", "textbook.ts"), `import { textbook } from "tutor-kit";
import welcome from "./chapters/welcome.chapter.js";
import practice from "./chapters/practice.chapter.js";
import review from "./chapters/review.chapter.js";

export default textbook({
  id: "getting-started",
  title: "Getting Started",
  description: "A starter textbook for checking Tutor Kit.",
  tags: ["starter"],
  chapters: [welcome, practice, review]
});
`);

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const textbooks = await fetchJson(`${server.url}/api/textbooks`);
    assert.equal(Array.isArray(textbooks), true);
    assert.equal(textbooks[0].id, "getting-started");

    const page = await fetchText(`${server.url}/textbooks/getting-started/chapters/welcome`);
    assert.match(page, /katex/);
    assert.match(page, /chapter-navigation/);
    assert.match(page, /data-chapter-navigation/);
    assert.match(page, /bindChapterNavigation/);
    assert.match(page, /bindChapterIndex/);
    assert.match(page, /scrollToHashTarget/);
    assert.match(page, /grid-template-columns: 1fr/);
    assert.match(page, /renderTransformation/);
    assert.match(page, /renderDiagram/);
    assert.match(page, /renderDiagrams/);
    assert.match(page, /loadMermaid/);
    assert.match(page, /mermaid\.esm\.min\.mjs/);
    assert.match(page, /renderChart/);
    assert.match(page, /renderChartSvg/);
    assert.match(page, /chart-svg/);
    assert.match(page, /diagram-source/);
    assert.match(page, /transformation-stages/);
    assert.match(page, /transformation-table/);
    assert.match(page, /transformation-focus/);
    assert.match(page, /data-transformation-layout/);
    assert.match(page, /updateTransformationLayouts/);
    assert.match(page, /auto-hybrid/);
    assert.match(page, /transformationStageOverflows/);
    assert.match(page, /inputOverflow \|\| outputOverflow/);
    assert.match(page, /operationOverflow/);
    assert.match(page, /data-transformation-stage/);
    assert.match(page, /renderInlineEmphasis/);
    assert.match(page, /<strong>/);
    assert.match(page, /<em>/);
    assertMatchingQuizAssets(page);
    assertGlossaryAssets(page);
    assertHighlightAssets(page);
    assert.match(page, /document\.fonts\?\.ready/);
    assert.match(page, /renderNotFoundPage/);
    assert.match(page, /Page not found/);
    assert.match(page, /Generate your first textbook/);

    const glossaryPage = await fetchText(`${server.url}/textbooks/getting-started/glossary`);
    assert.match(glossaryPage, /renderTextbookGlossary/);
    assert.match(glossaryPage, /data-glossary-results/);

    const glossaryStudyResponse = await fetch(`${server.url}/textbooks/getting-started/glossary/study?set=all`);
    const glossaryStudyPage = await glossaryStudyResponse.text();
    assert.equal(glossaryStudyResponse.status, 200);
    assert.match(glossaryStudyPage, /renderTextbookGlossaryStudy/);

    const missingPageResponse = await fetch(`${server.url}/missing-route`);
    const missingPage = await missingPageResponse.text();
    assert.equal(missingPageResponse.status, 404);
    assert.match(missingPage, /renderNotFoundPage/);
    assert.match(missingPage, /404 not found/);

    const malformedPathResponse = await fetch(`${server.url}/textbooks/%E0%A4%A`);
    await malformedPathResponse.text();
    assert.equal(malformedPathResponse.status, 404);

    const fontResponse = await fetch(`${server.url}/__tutor-assets/katex/fonts/KaTeX_Main-Regular.woff2`);
    assert.equal(fontResponse.status, 200);
    assert.equal(fontResponse.headers.get("content-type"), "font/woff2");

    const mermaidResponse = await fetch(`${server.url}/__tutor-assets/mermaid/mermaid.esm.min.mjs`);
    assert.equal(mermaidResponse.status, 200);
    assert.equal(mermaidResponse.headers.get("content-type"), "text/javascript; charset=utf-8");
    const mermaidSource = await mermaidResponse.text();
    const mermaidChunkPath = mermaidSource.match(/from"\.\/([^"]+\.mjs)"/)?.[1]
      ?? mermaidSource.match(/import"\.\/([^"]+\.mjs)"/)?.[1];
    assert.ok(mermaidChunkPath, "expected Mermaid bundle to reference at least one chunk");
    const mermaidChunkResponse = await fetch(`${server.url}/__tutor-assets/mermaid/${mermaidChunkPath}`);
    assert.equal(mermaidChunkResponse.status, 200);
    assert.equal(mermaidChunkResponse.headers.get("content-type"), "text/javascript; charset=utf-8");
    await mermaidChunkResponse.text();
    await fontResponse.arrayBuffer();

    const katexCssResponse = await fetch(`${server.url}/__tutor-assets/katex/katex.min.css`);
    assert.equal(katexCssResponse.status, 200);
    assert.match(katexCssResponse.headers.get("content-type") ?? "", /css/);
    await katexCssResponse.text();

    const katexJsResponse = await fetch(`${server.url}/__tutor-assets/katex/katex.min.js`);
    assert.equal(katexJsResponse.status, 200);
    assert.match(katexJsResponse.headers.get("content-type") ?? "", /javascript/);
    await katexJsResponse.text();

    const monacoResponse = await fetch(`${server.url}/__tutor-assets/monaco/vs/loader.js`);
    assert.equal(monacoResponse.status, 200);
    assert.match(monacoResponse.headers.get("content-type") ?? "", /javascript/);
    await monacoResponse.text();

    const textbookResponse = await fetchJson(`${server.url}/api/textbooks/getting-started`);
    assert.equal(textbookResponse.title, "Getting Started");

    const chapterResponse = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/welcome`);
    assert.equal(chapterResponse.title, "Chapter 1: Welcome");
    assert.equal(chapterResponse.textbookId, "getting-started");
    assert.equal(chapterResponse.previousChapter, null);
    assert.deepEqual(chapterResponse.nextChapter, { id: "practice", title: "Chapter 2: Practice" });

    const middleChapterResponse = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/practice`);
    assert.deepEqual(middleChapterResponse.previousChapter, { id: "welcome", title: "Chapter 1: Welcome" });
    assert.deepEqual(middleChapterResponse.nextChapter, { id: "review", title: "Chapter 3: Review" });

    const finalChapterResponse = await fetchJson(`${server.url}/api/textbooks/getting-started/chapters/review`);
    assert.deepEqual(finalChapterResponse.previousChapter, { id: "practice", title: "Chapter 2: Practice" });
    assert.equal(finalChapterResponse.nextChapter, null);

    const eventResponse = await fetchJson(`${server.url}/api/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "test_event" })
    });
    assert.equal(eventResponse.ok, true);
  } finally {
    await server.close();
  }
});

test("dev server includes concise empty state for workspaces without textbooks", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir);
  linkTutorKit(dir);

  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const textbooks = await fetchJson(`${server.url}/api/textbooks`);
    assert.deepEqual(textbooks, []);

    const page = await fetchText(`${server.url}/`);
    assert.match(page, /Library is empty/);
    assert.match(page, /Generate your first textbook/);
    assert.match(page, /This workspace has no registered Tutor Kit textbooks yet/);
    assert.match(page, /textbooks\/&lt;textbook-id&gt;\/textbook\.ts/);
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) {
    assert.fail(await response.text());
  }
  return response.json();
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    assert.fail(await response.text());
  }
  return response.text();
}
