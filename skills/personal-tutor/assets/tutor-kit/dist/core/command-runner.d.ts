import type { CodeRunnerConfig, CodingProblemFile } from "./types.js";
export interface ShellResult {
    exitCode: number | null;
    signal: string | null;
    stdout: string;
    stderr: string;
    timedOut: boolean;
    durationMs: number;
    truncated: boolean;
}
export declare function runShell(command: string, cwd: string, language: string, config: CodeRunnerConfig): Promise<ShellResult>;
export declare function writeProblemFiles(root: string, files: CodingProblemFile[], replacements?: Record<string, string>): void;
