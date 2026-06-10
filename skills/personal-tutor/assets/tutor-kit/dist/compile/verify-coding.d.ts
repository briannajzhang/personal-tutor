export interface CodingProblemVerificationResult {
    ok: boolean;
    output: string;
    problemCount: number;
    passedCount: number;
}
export declare function verifyCodingProblems(cwd: string, options?: {
    textbookId?: string;
}): Promise<CodingProblemVerificationResult>;
