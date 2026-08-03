import type { CalloutBlock, CalloutProps, ChartBlock, ChartType, CodingProblemBlock, CodingProblemFile, CodeBlock, ComponentBlock, ComponentModule, DiagramBlock, DiagramProps, GlossaryBlock, HeadingBlock, HeadingProps, ImageBlock, ImageProps, JsonValue, ListBlock, ListProps, MathBlock, ParagraphBlock, ParagraphProps, QuizBlock, QuizDifficulty, QuizMode, ChapterRole, SectionRole, Section, Subsection, Textbook, Chapter, TransformationArtifact, TransformationBlock, TransformationLayout, TutorBlock } from "./types.js";
interface SubsectionInput {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    blocks?: TutorBlock[];
}
interface SectionInput extends SubsectionInput {
    role?: SectionRole;
    subsections?: Subsection[];
}
interface ChapterInput {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    role?: ChapterRole;
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
interface DiagramInput extends BlockInput {
    title?: string;
    syntax?: DiagramProps["syntax"];
    body: string;
}
interface ChartPointInput {
    label: string;
    value: number;
}
interface ChartInput extends BlockInput {
    title: string;
    type: ChartType;
    xLabel?: string;
    yLabel?: string;
    points: ChartPointInput[];
}
interface ImageInput extends BlockInput, ImageProps {
}
interface ComponentInput<Props extends JsonValue> extends BlockInput {
    title?: string;
    module: ComponentModule<Props>;
    props: Props;
}
interface CalloutInput extends BlockInput {
    tone?: CalloutProps["tone"];
    title?: string;
    body: string;
}
interface GlossaryEntryInput {
    term: string;
    definition: string;
}
interface GlossaryInput extends BlockInput {
    title?: string;
    entries: GlossaryEntryInput[];
}
interface TransformationInput extends BlockInput {
    title: string;
    focus: string;
    layout?: TransformationLayout;
    inputLabel?: string;
    operationLabel?: string;
    outputLabel?: string;
    input: TransformationArtifact[];
    operation: TransformationArtifact;
    output: TransformationArtifact[];
    explanation: string;
}
interface CodingProblemFileOptions {
    editable?: boolean;
    hidden?: boolean;
    language?: string;
}
interface CodingProblemFileInput extends CodingProblemFileOptions {
    path: string;
    content: string;
    source?: string;
    sourcePath?: string;
}
interface CodingProblemCommandInput {
    label?: string;
    command: string;
    kind?: string;
    hidden?: boolean;
}
type CodingProblemCommandValue = string | CodingProblemCommandInput;
interface CodingProblemInput extends BlockInput {
    title: string;
    prompt: string;
    language?: string;
    files: CodingProblemFileInput[];
    setup?: CodingProblemCommandValue;
    run?: CodingProblemCommandValue;
    test?: CodingProblemCommandValue;
    commands?: Record<string, CodingProblemCommandValue>;
    actions?: Array<CodingProblemCommandInput & {
        id: string;
    }>;
    verification?: {
        actionId: string;
        referenceFiles: Record<string, string>;
    };
    review?: string;
    reviewPrompt?: string;
}
interface QuizChoiceInput {
    id: string;
    body: string;
    explanation?: string;
}
interface MultipleChoiceQuizQuestionInput extends BlockInput {
    kind: "multiple-choice";
    prompt: string;
    choices: QuizChoiceInput[];
    answer: string;
    explanation: string;
    tags?: string[];
    difficulty?: QuizDifficulty;
}
interface MatchingQuizPairInput {
    id: string;
    left: string;
    right: string;
    explanation?: string;
}
interface MatchingQuizQuestionInput extends BlockInput {
    kind: "matching";
    prompt: string;
    leftLabel?: string;
    rightLabel?: string;
    pairs: MatchingQuizPairInput[];
    explanation: string;
    tags?: string[];
    difficulty?: QuizDifficulty;
}
type QuizQuestionInput = MultipleChoiceQuizQuestionInput | MatchingQuizQuestionInput;
interface QuizInput extends BlockInput {
    title: string;
    mode?: QuizMode;
    preserveChoiceOrder?: boolean;
    questions: QuizQuestionInput[];
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
export declare function diagram(input: DiagramInput): DiagramBlock;
export declare function chart(input: ChartInput): ChartBlock;
export declare function image(input: ImageInput): ImageBlock;
export declare function componentModule<Props extends JsonValue = JsonValue>(baseUrl: string, path: string): ComponentModule<Props>;
export declare function component<Props extends JsonValue = JsonValue>(input: ComponentInput<Props>): ComponentBlock<Props>;
export declare function callout(input: CalloutInput): CalloutBlock;
export declare function glossary(input: GlossaryInput): GlossaryBlock;
export declare function transformation(input: TransformationInput): TransformationBlock;
export declare function codingProblem(input: CodingProblemInput): CodingProblemBlock;
export declare function quiz(input: QuizInput): QuizBlock;
export declare function balancedQuiz(input: QuizInput): QuizBlock;
export declare function projectFiles(baseUrl: string, dir: string): {
    file(path: string, options?: CodingProblemFileOptions): CodingProblemFile;
    inline(path: string, content: string, options?: CodingProblemFileOptions): CodingProblemFile;
};
export {};
