import type { Chapter, Section, Subsection, Textbook, ValidationIssue } from "./types.js";
export declare function validateTextbook(value: unknown, file?: string): ValidationIssue[];
export declare function validateChapter(value: unknown, file?: string): ValidationIssue[];
export declare function validateSection(value: unknown, file?: string): ValidationIssue[];
export declare function validateSubsection(value: unknown, file?: string): ValidationIssue[];
export declare function validateBlock(block: unknown, path: string, file: string | undefined, issues: ValidationIssue[]): void;
export declare function summarizeSubsection(subsection: Subsection): {
    blocks: number;
};
export declare function summarizeSection(section: Section): {
    subsections: number;
    blocks: number;
};
export declare function summarizeChapter(chapter: Chapter): {
    sections: number;
    subsections: number;
    blocks: number;
};
export declare function summarizeTextbook(textbook: Textbook): {
    chapters: number;
    sections: number;
    subsections: number;
    blocks: number;
};
