export type BlockKind =
  | "p"
  | "heading"
  | "list"
  | "codeBlock"
  | "mathBlock"
  | "diagram"
  | "chart"
  | "image"
  | "component"
  | "callout"
  | "transformation"
  | "codingProblem"
  | "quiz"
  | "glossary"
  | "explanation"
  | "blurb"
  | (string & {});

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

export type JsonData = string | number | boolean | null | JsonData[] | JsonValue;

export interface JsonValue {
  [key: string]: JsonData;
}

export interface ComponentModule<Props extends JsonValue = JsonValue> {
  readonly kind: "component-module";
  readonly sourcePath: string;
  readonly __props?: Props;
}

export interface ComponentProps<Props extends JsonValue = JsonValue> {
  title?: string;
  module: ComponentModule<Props>;
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

export interface DiagramProps {
  title?: string;
  syntax: "mermaid";
  body: string;
}

export type ChartType = "bar" | "line";

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartProps {
  title: string;
  type: ChartType;
  xLabel?: string;
  yLabel?: string;
  points: ChartPoint[];
}

export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export type CalloutTone = "note" | "caution" | "key-idea";

export interface CalloutProps {
  tone: CalloutTone;
  body: string;
  title?: string;
}

export interface TransformationMarkdownArtifact {
  label?: string;
  format: "markdown";
  body: string;
}

export interface TransformationCodeArtifact {
  label?: string;
  format: "code";
  body: string;
  language?: string;
}

export interface TransformationMathArtifact {
  label?: string;
  format: "math";
  body: string;
}

export interface TransformationTableArtifact {
  label?: string;
  format: "table";
  columns: string[];
  rows: string[][];
}

export type TransformationArtifact =
  | TransformationMarkdownArtifact
  | TransformationCodeArtifact
  | TransformationMathArtifact
  | TransformationTableArtifact;

export type TransformationLayout = "auto" | "flow" | "compare";

export interface TransformationProps {
  title: string;
  focus: string;
  layout: TransformationLayout;
  inputLabel: string;
  operationLabel: string;
  outputLabel: string;
  input: TransformationArtifact[];
  operation: TransformationArtifact;
  output: TransformationArtifact[];
  explanation: string;
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
export type ChapterRole = "instruction" | "cumulative-checkpoint";
export type SectionRole = "instruction" | "practice" | "review" | "assessment";

export interface QuizChoice {
  id: string;
  body: string;
  explanation?: string;
}

export interface MultipleChoiceQuizQuestion {
  kind: "multiple-choice";
  id: string;
  prompt: string;
  choices: QuizChoice[];
  answer: string;
  explanation: string;
  tags?: string[];
  difficulty?: QuizDifficulty;
}

export interface MatchingQuizPair {
  id: string;
  left: string;
  right: string;
  explanation?: string;
}

export interface MatchingQuizQuestion {
  kind: "matching";
  id: string;
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  pairs: MatchingQuizPair[];
  explanation: string;
  tags?: string[];
  difficulty?: QuizDifficulty;
}

export type QuizQuestion = MultipleChoiceQuizQuestion | MatchingQuizQuestion;

export interface QuizProps {
  title: string;
  mode: QuizMode;
  questions: QuizQuestion[];
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface GlossaryProps {
  title: string;
  entries: GlossaryEntry[];
}

export type ParagraphBlock = BaseBlock<"p", ParagraphProps>;
export type HeadingBlock = BaseBlock<"heading", HeadingProps>;
export type ListBlock = BaseBlock<"list", ListProps>;
export type CodeBlock = BaseBlock<"codeBlock", CodeBlockProps>;
export type MathBlock = BaseBlock<"mathBlock", MathBlockProps>;
export type DiagramBlock = BaseBlock<"diagram", DiagramProps>;
export type ChartBlock = BaseBlock<"chart", ChartProps>;
export type ImageBlock = BaseBlock<"image", ImageProps>;
export type ComponentBlock<Props extends JsonValue = JsonValue> = BaseBlock<"component", ComponentProps<Props>>;
export type CalloutBlock = BaseBlock<"callout", CalloutProps>;
export type TransformationBlock = BaseBlock<"transformation", TransformationProps>;
export type CodingProblemBlock = BaseBlock<"codingProblem", CodingProblemProps>;
export type QuizBlock = BaseBlock<"quiz", QuizProps>;
export type GlossaryBlock = BaseBlock<"glossary", GlossaryProps>;

export type ExplanationBlock = BaseBlock<"explanation", ParagraphProps & { title?: string }>;
export type BlurbBlock = ExplanationBlock;

export type TutorBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | CodeBlock
  | MathBlock
  | DiagramBlock
  | ChartBlock
  | ImageBlock
  | ComponentBlock
  | CalloutBlock
  | TransformationBlock
  | CodingProblemBlock
  | QuizBlock
  | GlossaryBlock
  | ExplanationBlock
  | BaseBlock;

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
  role?: SectionRole;
  blocks: TutorBlock[];
  subsections: Subsection[];
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  role?: ChapterRole;
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
