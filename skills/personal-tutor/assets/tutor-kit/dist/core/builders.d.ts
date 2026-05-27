import type { BlurbBlock, CalloutBlock, CalloutProps, CodeBlock, HeadingBlock, HeadingProps, ListBlock, ListProps, MathBlock, ParagraphBlock, ParagraphProps, Section, Subsection, Textbook, Chapter, TutorBlock } from "./types.js";
interface SubsectionInput {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    blocks?: TutorBlock[];
    widgets?: TutorBlock[];
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
interface BlockInput {
    id: string;
}
interface ParagraphInput extends BlockInput, ParagraphProps {
}
interface HeadingInput extends BlockInput {
    text: string;
    level?: HeadingProps["level"];
}
interface ListInput extends BlockInput {
    items: string[];
    style?: ListProps["style"];
}
interface CodeBlockInput extends BlockInput {
    code: string;
    language?: string;
}
interface MathBlockInput extends BlockInput {
    body: string;
}
interface CalloutInput extends BlockInput {
    tone?: CalloutProps["tone"];
    title?: string;
    body: string;
}
interface LegacyExplanationInput extends ParagraphInput {
    title?: string;
}
export declare function subsection(input: SubsectionInput): Subsection;
export declare function section(input: SectionInput): Section;
export declare function chapter(input: ChapterInput): Chapter;
export declare function textbook(input: TextbookInput): Textbook;
export declare function p(input: ParagraphInput): ParagraphBlock;
export declare function heading(input: HeadingInput): HeadingBlock;
export declare function list(input: ListInput): ListBlock;
export declare function codeBlock(input: CodeBlockInput): CodeBlock;
export declare function mathBlock(input: MathBlockInput): MathBlock;
export declare function callout(input: CalloutInput): CalloutBlock;
export declare function explanation(input: LegacyExplanationInput): BlurbBlock;
export declare function blurb(input: LegacyExplanationInput): BlurbBlock;
export {};
