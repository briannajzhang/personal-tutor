export type BlockKind = "p" | "heading" | "list" | "codeBlock" | "mathBlock" | "callout" | "explanation" | "blurb" | (string & {});
export interface TutorConfig {
    title?: string;
    textbooksDir?: string;
    dataDir?: string;
}
export interface BaseBlock<K extends BlockKind = BlockKind, Props = unknown> {
    kind: K;
    id: string;
    props: Props;
}
export interface ParagraphProps {
    body: string;
}
export interface HeadingProps {
    text: string;
    level: 4 | 5;
}
export interface ListProps {
    style: "bullet" | "number";
    items: string[];
}
export interface CodeBlockProps {
    code: string;
    language?: string;
}
export interface MathBlockProps {
    body: string;
}
export type CalloutTone = "note" | "caution" | "key-idea";
export interface CalloutProps {
    tone: CalloutTone;
    body: string;
    title?: string;
}
export type ParagraphBlock = BaseBlock<"p", ParagraphProps>;
export type HeadingBlock = BaseBlock<"heading", HeadingProps>;
export type ListBlock = BaseBlock<"list", ListProps>;
export type CodeBlock = BaseBlock<"codeBlock", CodeBlockProps>;
export type MathBlock = BaseBlock<"mathBlock", MathBlockProps>;
export type CalloutBlock = BaseBlock<"callout", CalloutProps>;
export type ExplanationBlock = BaseBlock<"explanation", ParagraphProps & {
    title?: string;
}>;
export type BlurbBlock = ExplanationBlock;
export type TutorBlock = ParagraphBlock | HeadingBlock | ListBlock | CodeBlock | MathBlock | CalloutBlock | ExplanationBlock | BaseBlock;
export interface Subsection {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    blocks: TutorBlock[];
}
export interface Section {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    blocks: TutorBlock[];
    subsections: Subsection[];
}
export interface Chapter {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    sections: Section[];
}
export interface Textbook {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    chapters: Chapter[];
}
export interface TextbookModule {
    default?: Textbook;
}
export interface ValidationIssue {
    file?: string;
    path?: string;
    message: string;
}
export interface LoadedChapter {
    file: string;
    textbookId: string;
    textbookTitle: string;
    chapter: Chapter;
}
export interface LoadedTextbook {
    file: string;
    textbook: Textbook;
}
