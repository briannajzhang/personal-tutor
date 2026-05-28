interface CodingRequestBase {
    textbookId?: unknown;
    chapterId?: unknown;
    blockId?: unknown;
}
interface CodingRunRequest extends CodingRequestBase {
    actionId?: unknown;
    files?: unknown;
}
interface CodingDraftRequest extends CodingRequestBase {
    files?: unknown;
}
interface ShellResult {
    exitCode: number | null;
    signal: string | null;
    stdout: string;
    stderr: string;
    timedOut: boolean;
    durationMs: number;
    truncated: boolean;
}
interface RunResult extends ShellResult {
    ok: boolean;
    actionId: string;
    setup?: ShellResult;
}
export declare function runCodingProblem(cwd: string, body: CodingRunRequest): Promise<RunResult>;
export declare function loadCodingDraft(cwd: string, query: URLSearchParams): Promise<{
    files: Record<string, string>;
    draftPath: string;
    feedbackPath: string;
    draftAbsolutePath: string;
    feedbackAbsolutePath: string;
}>;
export declare function saveCodingDraft(cwd: string, body: CodingDraftRequest): Promise<{
    ok: true;
    draftPath: string;
    feedbackPath: string;
    draftAbsolutePath: string;
    feedbackAbsolutePath: string;
}>;
export declare function loadCodingFeedback(cwd: string, query: URLSearchParams): Promise<{
    feedback: string;
    feedbackPath: string;
}>;
export {};
