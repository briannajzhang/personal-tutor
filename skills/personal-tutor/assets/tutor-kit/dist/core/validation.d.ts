import type { ValidationIssue } from "./types.js";
export { summarizeChapter, summarizeSection, summarizeSubsection, summarizeTextbook } from "./traversal.js";
export declare function validateTextbook(value: unknown, file?: string): ValidationIssue[];
export declare function validateChapter(value: unknown, file?: string): ValidationIssue[];
export declare function validateSection(value: unknown, file?: string): ValidationIssue[];
export declare function validateSubsection(value: unknown, file?: string): ValidationIssue[];
export declare function validateBlock(block: unknown, path: string, file: string | undefined, issues: ValidationIssue[]): void;
