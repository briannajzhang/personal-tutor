import {
  rangesOverlap,
  rangesTouchOrOverlap,
  selectionFullyCovered,
  selectionHasUnsupportedText,
  splitHighlightRange
} from "../server/highlight-ranges.js";

const clientHighlightHelpers = [
  selectionHasUnsupportedText,
  selectionFullyCovered,
  splitHighlightRange,
  rangesOverlap,
  rangesTouchOrOverlap
];

export function highlightClientJs(): string {
  return clientHighlightHelpers.map((helper) => helper.toString()).join("\n\n");
}
