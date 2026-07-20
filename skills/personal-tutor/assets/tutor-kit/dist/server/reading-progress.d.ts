import type { Textbook } from "../core/types.js";
export interface ReadingProgressState {
    lastChapterId: string | null;
    lastHeadingId: string | null;
    visitedChapterIds: string[];
    completedChapterIds: string[];
}
export interface ReadingProgressSummary {
    visitedChapters: number;
    completedChapters: number;
    totalChapters: number;
    percent: number;
    lastChapter: {
        id: string;
        title: string;
        headingId: string | null;
    } | null;
    continueChapter: {
        id: string;
        title: string;
        headingId: string | null;
    } | null;
    completedChapterIds: string[];
}
interface ReadingProgressRequest {
    textbookId?: unknown;
    chapterId?: unknown;
    headingId?: unknown;
    action?: unknown;
}
export declare function loadReadingProgress(dataDir: string, textbookId: string): ReadingProgressState;
export declare function summarizeReadingProgress(state: ReadingProgressState, textbook: Textbook): ReadingProgressSummary;
export declare function updateReadingProgress(cwd: string, request: ReadingProgressRequest): Promise<{
    summary: ReadingProgressSummary;
}>;
export {};
