import { type ProgressSummary } from "./progress.js";
interface BriefOptions {
    textbookId?: string;
}
export interface WorkspaceBrief {
    workspace: string;
    title: string;
    textbooks: Array<{
        id: string;
        title: string;
        file: string;
        chapters: Array<{
            id: string;
            title: string;
            role: string;
        }>;
        authoringFiles: string[];
    }>;
    issues: string[];
    progress: ProgressSummary;
}
export declare function createWorkspaceBrief(cwd: string, options?: BriefOptions): Promise<WorkspaceBrief>;
export declare function formatWorkspaceBrief(brief: WorkspaceBrief): string;
export {};
