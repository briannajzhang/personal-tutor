import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHighlightBlockSelections,
  classifyHighlightSelection,
  normalizeHighlightRange,
  rangesOverlap,
  rangesTouchOrOverlap,
  selectionFullyCovered,
  selectionContainsUnsupportedText,
  selectionHasUnsupportedText,
  splitHighlightRange,
  touchedHighlightRanges
} from "../packages/tutor-kit/dist/server/highlight-ranges.js";

test("highlight range helpers distinguish overlap from adjacency", () => {
  assert.equal(rangesOverlap({ startOffset: 0, endOffset: 5 }, { startOffset: 5, endOffset: 10 }), false);
  assert.equal(rangesTouchOrOverlap({ startOffset: 0, endOffset: 5 }, { startOffset: 5, endOffset: 10 }), true);
  assert.equal(rangesOverlap({ startOffset: 0, endOffset: 6 }, { startOffset: 5, endOffset: 10 }), true);
});

test("highlight selection classification handles unhighlighted, full, and partial selections", () => {
  const ranges = [
    { id: "a", startOffset: 0, endOffset: 5 },
    { id: "b", startOffset: 5, endOffset: 10 }
  ];
  assert.equal(classifyHighlightSelection({ startOffset: 10, endOffset: 14 }, ranges), "unhighlighted");
  assert.equal(classifyHighlightSelection({ startOffset: 2, endOffset: 8 }, ranges), "fully-highlighted");
  assert.equal(classifyHighlightSelection({ startOffset: 2, endOffset: 12 }, ranges), "partial-overlap");
  assert.equal(selectionFullyCovered({ startOffset: 2, endOffset: 8 }, ranges), true);
  assert.equal(selectionFullyCovered({ startOffset: 2, endOffset: 12 }, ranges), false);
});

test("highlight range split supports left, right, middle, and exact removal", () => {
  const range = { id: "a", startOffset: 10, endOffset: 30 };
  assert.deepEqual(splitHighlightRange(range, { startOffset: 10, endOffset: 18 }), [
    { startOffset: 18, endOffset: 30 }
  ]);
  assert.deepEqual(splitHighlightRange(range, { startOffset: 20, endOffset: 30 }), [
    { startOffset: 10, endOffset: 20 }
  ]);
  assert.deepEqual(splitHighlightRange(range, { startOffset: 15, endOffset: 25 }), [
    { startOffset: 10, endOffset: 15 },
    { startOffset: 25, endOffset: 30 }
  ]);
  assert.deepEqual(splitHighlightRange(range, { startOffset: 10, endOffset: 30 }), []);
});

test("touched highlight ranges include adjacent ranges for merge behavior", () => {
  const ranges = [
    { id: "a", startOffset: 0, endOffset: 5 },
    { id: "b", startOffset: 8, endOffset: 10 }
  ];
  assert.deepEqual(touchedHighlightRanges({ startOffset: 5, endOffset: 8 }, ranges).map((range) => range.id), ["a", "b"]);
});

test("highlight range normalization handles right-to-left equivalent offsets", () => {
  assert.deepEqual(normalizeHighlightRange(12, 4), { startOffset: 4, endOffset: 12 });
});

test("multi-block highlight selections split into block-local records", () => {
  assert.deepEqual(buildHighlightBlockSelections([
    { blockId: "a", plainText: "first paragraph", startOffset: 6, endOffset: 15, sectionId: "s1" },
    { blockId: "b", plainText: "second paragraph", startOffset: 0, endOffset: 6, sectionId: "s1" }
  ]), [
    {
      blockId: "a",
      sectionId: "s1",
      subsectionId: undefined,
      quote: "paragraph",
      startOffset: 6,
      endOffset: 15,
      prefix: "first ",
      suffix: ""
    },
    {
      blockId: "b",
      sectionId: "s1",
      subsectionId: undefined,
      quote: "second",
      startOffset: 0,
      endOffset: 6,
      prefix: "",
      suffix: " paragraph"
    }
  ]);
});

test("unsupported selection detection ignores whitespace but rejects real unsupported text", () => {
  assert.equal(selectionContainsUnsupportedText([
    { text: "highlightable", supported: true },
    { text: "\n  ", supported: false }
  ]), false);
  assert.equal(selectionContainsUnsupportedText([
    { text: "highlightable", supported: true },
    { text: "code", supported: false }
  ]), true);
});

test("selection unsupported gap detection allows whitespace around supported snippets", () => {
  assert.equal(selectionHasUnsupportedText("first paragraph\n\nsecond paragraph", ["first paragraph", "second paragraph"]), false);
  assert.equal(selectionHasUnsupportedText("first paragraph code second paragraph", ["first paragraph", "second paragraph"]), true);
  assert.equal(selectionHasUnsupportedText("first paragraph", ["first paragraph"]), false);
});
