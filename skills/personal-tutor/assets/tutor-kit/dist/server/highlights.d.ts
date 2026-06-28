type HighlightColor = "yellow";
type HighlightStatus = "attached" | "changed" | "unresolved";
interface HighlightRequest {
    id?: unknown;
    textbookId?: unknown;
    chapterId?: unknown;
    sectionId?: unknown;
    subsectionId?: unknown;
    blockId?: unknown;
    quote?: unknown;
    startOffset?: unknown;
    endOffset?: unknown;
    prefix?: unknown;
    suffix?: unknown;
    color?: unknown;
    status?: unknown;
    note?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
}
export interface Highlight {
    id: string;
    textbookId: string;
    chapterId: string;
    sectionId: string;
    subsectionId?: string;
    blockId: string;
    quote: string;
    startOffset: number;
    endOffset: number;
    prefix: string;
    suffix: string;
    color: HighlightColor;
    status: HighlightStatus;
    note?: string;
    createdAt: string;
    updatedAt: string;
}
interface HighlightState {
    highlights: Highlight[];
    updatedAt: string | null;
}
export declare function loadHighlights(cwd: string, query: URLSearchParams): Promise<HighlightState & {
    statePath: string;
}>;
export declare function saveHighlight(cwd: string, body: HighlightRequest): Promise<HighlightState & {
    statePath: string;
    highlight: Highlight;
}>;
export declare function deleteHighlight(cwd: string, body: HighlightRequest): Promise<HighlightState & {
    statePath: string;
}>;
export {};
