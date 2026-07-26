import type { ValidationIssue } from "../core/types.js";
export declare function reportDevTextbookIssues(cwd: string, report?: (message: string) => void): Promise<void>;
export declare function formatDevTextbookIssues(issues: ValidationIssue[]): string;
