import type { CompileResult } from "../compile/compile.js";
import type { CodingProblemVerificationResult } from "../compile/verify-coding.js";
export declare function recordDoctorEvidence(cwd: string, textbookId: string, compile: CompileResult, verification?: CodingProblemVerificationResult): Promise<string>;
