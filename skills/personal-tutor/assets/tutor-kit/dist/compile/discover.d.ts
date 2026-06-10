import type { CodeRunnerConfig, LoadedChapter, LoadedTextbook, ValidationIssue } from "../core/types.js";
export interface WorkspacePaths {
    cwd: string;
    configPath: string | null;
    textbooksDir: string;
    dataDir: string;
    title: string;
    codeRunner: CodeRunnerConfig;
}
export interface TextbookLoadResult {
    textbooks: LoadedTextbook[];
    chapters: LoadedChapter[];
    issues: ValidationIssue[];
}
export declare function resolveWorkspace(cwd: string): Promise<WorkspacePaths>;
export declare function findTsconfig(cwd: string): string | null;
export declare function discoverTextbookFiles(textbooksDir: string): string[];
export declare function loadTextbooks(cwd: string, options?: {
    textbookId?: string;
}): Promise<TextbookLoadResult>;
export declare function invalidateWorkspaceCaches(cwd: string): void;
export declare function clearWorkspaceCaches(): void;
