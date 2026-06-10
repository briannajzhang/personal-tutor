export type BlockKind = "p" | "heading" | "list" | "codeBlock" | "mathBlock" | "callout" | "codingProblem" | "quiz" | "explanation" | "blurb" | (string & {});
export interface CodeRuntimeConfig {
    command?: string;
    env?: Record<string, string>;
    monacoLanguage?: string;
}
export interface CodeRunnerConfig {
    timeoutMs?: number;
    maxOutputBytes?: number;
    runtimes?: Record<string, CodeRuntimeConfig>;
}
export interface TutorConfig {
    title?: string;
    textbooksDir?: string;
    dataDir?: string;
    codeRunner?: CodeRunnerConfig;
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
export interface CodingProblemFile {
    path: string;
    content: string;
    editable: boolean;
    hidden: boolean;
    language?: string;
    source?: string;
    sourcePath?: string;
}
export interface CodingProblemAction {
    id: string;
    label: string;
    command: string;
    kind: string;
    hidden: boolean;
}
export interface CodingProblemVerification {
    actionId: string;
    referenceFiles: Record<string, string>;
}
export interface CodingProblemProps {
    title: string;
    prompt: string;
    language: string;
    files: CodingProblemFile[];
    setup?: CodingProblemAction;
    actions: CodingProblemAction[];
    verification?: CodingProblemVerification;
    review?: string;
}
export type QuizMode = "check" | "review" | "practice-test";
export type QuizDifficulty = "easy" | "medium" | "hard";
export interface QuizChoice {
    id: string;
    body: string;
}
export interface QuizQuestion {
    id: string;
    prompt: string;
    choices: QuizChoice[];
    answer: string;
    explanation: string;
    tags?: string[];
    difficulty?: QuizDifficulty;
}
export interface QuizProps {
    title: string;
    mode: QuizMode;
    questions: QuizQuestion[];
}
export type ParagraphBlock = BaseBlock<"p", ParagraphProps>;
export type HeadingBlock = BaseBlock<"heading", HeadingProps>;
export type ListBlock = BaseBlock<"list", ListProps>;
export type CodeBlock = BaseBlock<"codeBlock", CodeBlockProps>;
export type MathBlock = BaseBlock<"mathBlock", MathBlockProps>;
export type CalloutBlock = BaseBlock<"callout", CalloutProps>;
export type CodingProblemBlock = BaseBlock<"codingProblem", CodingProblemProps>;
export type QuizBlock = BaseBlock<"quiz", QuizProps>;
export type ExplanationBlock = BaseBlock<"explanation", ParagraphProps & {
    title?: string;
}>;
export type BlurbBlock = ExplanationBlock;
export type TutorBlock = ParagraphBlock | HeadingBlock | ListBlock | CodeBlock | MathBlock | CalloutBlock | CodingProblemBlock | QuizBlock | ExplanationBlock | BaseBlock;
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
