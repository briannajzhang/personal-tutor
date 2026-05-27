import type { BlurbProps, BlurbWidget, Chapter, Section, Subsection, Textbook, TutorWidget } from "./types.js";
interface SubsectionInput {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    widgets?: TutorWidget[];
}
interface SectionInput extends SubsectionInput {
    subsections?: Subsection[];
}
interface ChapterInput {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    sections?: Section[];
}
interface TextbookInput {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    chapters?: Chapter[];
}
interface BlurbInput extends BlurbProps {
    id: string;
    title: string;
}
export declare function subsection(input: SubsectionInput): Subsection;
export declare function section(input: SectionInput): Section;
export declare function chapter(input: ChapterInput): Chapter;
export declare function textbook(input: TextbookInput): Textbook;
export declare function blurb(input: BlurbInput): BlurbWidget;
export {};
