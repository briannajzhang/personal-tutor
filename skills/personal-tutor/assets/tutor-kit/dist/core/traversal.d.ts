import type { Chapter, Section, Subsection, Textbook, TutorBlock } from "./types.js";
export declare function collectSectionBlocks(section: Section): TutorBlock[];
export declare function collectChapterBlocks(chapter: Chapter): TutorBlock[];
export declare function collectTextbookBlocks(textbook: Textbook): TutorBlock[];
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
