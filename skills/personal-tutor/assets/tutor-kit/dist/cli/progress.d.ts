import { type ReadingProgressSummary } from "../server/reading-progress.js";
interface ProgressOptions {
    textbookId?: string;
}
interface QuizProgress {
    textbookId: string;
    chapterId: string;
    quizId: string;
    attempts: number;
    latestScore: number;
    total: number;
    bestScore: number;
    missedQuestionIds: string[];
}
interface CodingProgress {
    textbookId: string;
    chapterId: string;
    blockId: string;
    attempts: number;
    passed: boolean;
}
export interface ProgressSummary {
    textbookId?: string;
    eventCount: number;
    invalidEventCount: number;
    lastActivity: string | null;
    quizzes: QuizProgress[];
    weakTags: Array<{
        tag: string;
        misses: number;
    }>;
    coding: CodingProgress[];
    glossaryAgain: Array<{
        termId: string;
        count: number;
    }>;
    openHighlights: number;
    reading: Array<ReadingProgressSummary & {
        textbookId: string;
    }>;
    nextMove: string;
}
export declare function summarizeProgress(cwd: string, options?: ProgressOptions): Promise<ProgressSummary>;
export declare function formatProgress(summary: ProgressSummary): string;
export {};
