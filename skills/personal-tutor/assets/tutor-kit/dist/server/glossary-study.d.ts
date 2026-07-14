type GlossaryRatingValue = "again" | "knew-it";
type GlossaryStudySet = "all" | "starred";
interface GlossaryStudyStateRequest {
    textbookId?: unknown;
    starredTermIds?: unknown;
    lastStudySet?: unknown;
    currentCardIndex?: unknown;
    cardOrder?: unknown;
    currentTermId?: unknown;
    sessionCompleted?: unknown;
}
interface GlossaryStudyRatingRequest {
    textbookId?: unknown;
    termId?: unknown;
    rating?: unknown;
}
interface GlossaryTermRating {
    rating: GlossaryRatingValue;
    reviewedAt: string;
    reviewCount: number;
    againCount: number;
    knewItCount: number;
}
interface GlossaryStudyState {
    starredTermIds: string[];
    ratings: Record<string, GlossaryTermRating>;
    lastStudySet: GlossaryStudySet;
    currentCardIndex: number;
    cardOrder: string[];
    currentTermId: string | null;
    sessionCompleted: boolean;
    updatedAt: string | null;
}
export declare function loadGlossaryStudyState(cwd: string, query: URLSearchParams): Promise<GlossaryStudyState & {
    statePath: string;
}>;
export declare function saveGlossaryStudyState(cwd: string, body: GlossaryStudyStateRequest): Promise<GlossaryStudyState & {
    statePath: string;
}>;
export declare function submitGlossaryStudyRating(cwd: string, body: GlossaryStudyRatingRequest): Promise<GlossaryStudyState & {
    statePath: string;
}>;
export {};
