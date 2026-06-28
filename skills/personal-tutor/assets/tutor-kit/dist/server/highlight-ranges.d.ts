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
export declare function normalizeHighlightRange(startOffset: number, endOffset: number): Pick<HighlightRange, "startOffset" | "endOffset">;
export declare function buildHighlightBlockSelections(inputs: HighlightBlockSelectionInput[]): HighlightBlockSelection[];
export declare function selectionContainsUnsupportedText(parts: HighlightSelectionPart[]): boolean;
export declare function selectionHasUnsupportedText(selectedText: string, supportedTexts: string[]): boolean;
export declare function rangesOverlap(left: Pick<HighlightRange, "startOffset" | "endOffset">, right: Pick<HighlightRange, "startOffset" | "endOffset">): boolean;
export declare function rangesTouchOrOverlap(left: Pick<HighlightRange, "startOffset" | "endOffset">, right: Pick<HighlightRange, "startOffset" | "endOffset">): boolean;
export declare function classifyHighlightSelection(selection: Pick<HighlightRange, "startOffset" | "endOffset">, ranges: HighlightRange[]): SelectionClassification;
export declare function touchedHighlightRanges(selection: Pick<HighlightRange, "startOffset" | "endOffset">, ranges: HighlightRange[]): HighlightRange[];
export declare function splitHighlightRange(highlight: HighlightRange, removal: Pick<HighlightRange, "startOffset" | "endOffset">): Array<Omit<HighlightRange, "id">>;
