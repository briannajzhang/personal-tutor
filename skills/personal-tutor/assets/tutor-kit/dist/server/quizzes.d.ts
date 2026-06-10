interface QuizStateRequest {
    textbookId?: unknown;
    chapterId?: unknown;
    quizId?: unknown;
    selectedAnswers?: unknown;
}
interface QuizAttemptRequest extends QuizStateRequest {
    score?: unknown;
    total?: unknown;
    responses?: unknown;
}
interface QuizAttempt {
    attempt: number;
    responses: Array<{
        questionId: string;
        selectedAnswer: string;
        correct: boolean;
    }>;
    score: number;
    total: number;
    submittedAt: string;
}
interface QuizState {
    selectedAnswers: Record<string, string>;
    submitted: boolean;
    score: number | null;
    total: number | null;
    attempt: number;
    attempts: QuizAttempt[];
    updatedAt: string | null;
}
export declare function loadQuizState(cwd: string, query: URLSearchParams): Promise<QuizState & {
    statePath: string;
}>;
export declare function saveQuizState(cwd: string, body: QuizStateRequest): Promise<QuizState & {
    statePath: string;
}>;
export declare function submitQuizAttempt(cwd: string, body: QuizAttemptRequest): Promise<QuizState & {
    statePath: string;
}>;
export {};
