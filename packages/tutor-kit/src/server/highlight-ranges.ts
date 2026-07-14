export interface HighlightRange {
  id: string;
  startOffset: number;
  endOffset: number;
}

export interface HighlightBlockSelectionInput {
  blockId: string;
  plainText: string;
  startOffset: number;
  endOffset: number;
  sectionId?: string;
  subsectionId?: string;
}

export interface HighlightBlockSelection {
  blockId: string;
  quote: string;
  startOffset: number;
  endOffset: number;
  prefix: string;
  suffix: string;
  sectionId?: string;
  subsectionId?: string;
}

export interface HighlightSelectionPart {
  text: string;
  supported: boolean;
}

export type SelectionClassification = "unhighlighted" | "fully-highlighted" | "partial-overlap";

export function normalizeHighlightRange(startOffset: number, endOffset: number): Pick<HighlightRange, "startOffset" | "endOffset"> {
  return {
    startOffset: Math.min(startOffset, endOffset),
    endOffset: Math.max(startOffset, endOffset)
  };
}

export function buildHighlightBlockSelections(inputs: HighlightBlockSelectionInput[]): HighlightBlockSelection[] {
  return inputs.flatMap((input) => {
    const range = normalizeHighlightRange(input.startOffset, input.endOffset);
    const quote = input.plainText.slice(range.startOffset, range.endOffset);
    if (!quote.trim()) return [];
    return [{
      blockId: input.blockId,
      sectionId: input.sectionId,
      subsectionId: input.subsectionId,
      quote,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      prefix: input.plainText.slice(Math.max(0, range.startOffset - 32), range.startOffset),
      suffix: input.plainText.slice(range.endOffset, Math.min(input.plainText.length, range.endOffset + 32))
    }];
  });
}

export function selectionContainsUnsupportedText(parts: HighlightSelectionPart[]): boolean {
  return parts.some((part) => !part.supported && part.text.trim().length > 0);
}

export function selectionHasUnsupportedText(selectedText: string, supportedTexts: string[]): boolean {
  let cursor = 0;
  for (const supportedText of supportedTexts) {
    if (!supportedText) continue;
    const index = selectedText.indexOf(supportedText, cursor);
    if (index === -1) return selectedText.trim().length > 0;
    if (selectedText.slice(cursor, index).trim()) return true;
    cursor = index + supportedText.length;
  }
  return selectedText.slice(cursor).trim().length > 0;
}

export function rangesOverlap(left: Pick<HighlightRange, "startOffset" | "endOffset">, right: Pick<HighlightRange, "startOffset" | "endOffset">): boolean {
  return left.startOffset < right.endOffset && right.startOffset < left.endOffset;
}

export function rangesTouchOrOverlap(left: Pick<HighlightRange, "startOffset" | "endOffset">, right: Pick<HighlightRange, "startOffset" | "endOffset">): boolean {
  return left.startOffset <= right.endOffset && right.startOffset <= left.endOffset;
}

export function classifyHighlightSelection(selection: Pick<HighlightRange, "startOffset" | "endOffset">, ranges: HighlightRange[]): SelectionClassification {
  const overlapping = ranges.filter((range) => rangesOverlap(selection, range));
  if (overlapping.length === 0) return "unhighlighted";
  return selectionFullyCovered(selection, overlapping) ? "fully-highlighted" : "partial-overlap";
}

export function touchedHighlightRanges(selection: Pick<HighlightRange, "startOffset" | "endOffset">, ranges: HighlightRange[]): HighlightRange[] {
  return ranges.filter((range) => rangesTouchOrOverlap(selection, range));
}

export function splitHighlightRange(highlight: HighlightRange, removal: Pick<HighlightRange, "startOffset" | "endOffset">): Array<Omit<HighlightRange, "id">> {
  const pieces: Array<Omit<HighlightRange, "id">> = [];
  const leftEnd = Math.max(highlight.startOffset, Math.min(removal.startOffset, highlight.endOffset));
  const rightStart = Math.min(highlight.endOffset, Math.max(removal.endOffset, highlight.startOffset));
  if (highlight.startOffset < leftEnd) {
    pieces.push({ startOffset: highlight.startOffset, endOffset: leftEnd });
  }
  if (rightStart < highlight.endOffset) {
    pieces.push({ startOffset: rightStart, endOffset: highlight.endOffset });
  }
  return pieces;
}

export function selectionFullyCovered(selection: Pick<HighlightRange, "startOffset" | "endOffset">, ranges: HighlightRange[]): boolean {
  const sorted = ranges
    .filter((range) => rangesOverlap(selection, range))
    .map((range) => ({
      startOffset: Math.max(selection.startOffset, range.startOffset),
      endOffset: Math.min(selection.endOffset, range.endOffset)
    }))
    .sort((left, right) => left.startOffset - right.startOffset);
  let coveredUntil = selection.startOffset;
  for (const range of sorted) {
    if (range.startOffset > coveredUntil) return false;
    coveredUntil = Math.max(coveredUntil, range.endOffset);
    if (coveredUntil >= selection.endOffset) return true;
  }
  return coveredUntil >= selection.endOffset;
}
