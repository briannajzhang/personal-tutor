import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  BaseBlock,
  BlockKind,
  CalloutBlock,
  CalloutProps,
  ChartBlock,
  ChartPoint,
  ChartType,
  CodingProblemAction,
  CodingProblemBlock,
  CodingProblemFile,
  CodeBlock,
  ComponentBlock,
  ComponentModule,
  DiagramBlock,
  DiagramProps,
  GlossaryBlock,
  HeadingBlock,
  HeadingProps,
  ImageBlock,
  ImageProps,
  JsonValue,
  ListBlock,
  ListProps,
  MathBlock,
  ParagraphBlock,
  ParagraphProps,
  QuizBlock,
  QuizChoice,
  QuizDifficulty,
  MatchingQuizPair,
  QuizMode,
  QuizQuestion,
  ChapterRole,
  SectionRole,
  Section,
  Subsection,
  Textbook,
  Chapter,
  TransformationArtifact,
  TransformationBlock,
  TransformationLayout,
  TutorBlock
} from "./types.js";
import { isJsonData } from "./validation.js";

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

interface ParagraphInput extends BlockInput, ParagraphProps {}

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

interface ImageInput extends BlockInput, ImageProps {}

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
  actions?: Array<CodingProblemCommandInput & { id: string }>;
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

function requireText(value: string, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
  return value;
}

function requireItems(value: string[], label: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must contain at least one item`);
  }
  return value.map((item, index) => requireText(item, `${label}[${index}]`));
}

function defineBlock<K extends BlockKind, Props>(kind: K, input: BlockInput, props: Props): BaseBlock<K, Props> {
  return { kind, id: requireText(input.id, `${kind}.id`), props };
}

export function subsection(input: SubsectionInput): Subsection {
  return {
    id: requireText(input.id, "subsection.id"),
    title: requireText(input.title, "subsection.title"),
    description: input.description,
    tags: input.tags ?? [],
    blocks: input.blocks ?? []
  };
}

export function section(input: SectionInput): Section {
  return {
    id: requireText(input.id, "section.id"),
    title: requireText(input.title, "section.title"),
    description: input.description,
    tags: input.tags ?? [],
    role: input.role,
    blocks: input.blocks ?? [],
    subsections: input.subsections ?? []
  };
}

export function chapter(input: ChapterInput): Chapter {
  return {
    id: requireText(input.id, "chapter.id"),
    title: requireText(input.title, "chapter.title"),
    description: input.description,
    tags: input.tags ?? [],
    role: input.role,
    sections: input.sections ?? []
  };
}

export function textbook(input: TextbookInput): Textbook {
  const id = requireText(input.id, "textbook.id");
  return {
    id,
    title: requireText(input.title, "textbook.title"),
    description: input.description,
    tags: input.tags ?? [],
    chapters: balanceTextbookQuizChoices(id, input.chapters ?? [])
  };
}

export function p(input: ParagraphInput): ParagraphBlock {
  return defineBlock("p", input, {
    body: requireText(input.body, "p.body")
  });
}

export function heading(input: HeadingInput): HeadingBlock {
  return defineBlock("heading", input, {
    text: requireText(input.text, "heading.text"),
    level: input.level ?? 4
  });
}

export function list(input: ListInput): ListBlock {
  return defineBlock("list", input, {
    style: input.style ?? "bullet",
    items: requireItems(input.items, "list.items")
  });
}

export function codeBlock(input: CodeBlockInput): CodeBlock {
  return defineBlock("codeBlock", input, {
    code: requireText(input.code, "codeBlock.code"),
    language: input.language
  });
}

export function mathBlock(input: MathBlockInput): MathBlock {
  return defineBlock("mathBlock", input, {
    body: requireText(input.body, "mathBlock.body")
  });
}

export function diagram(input: DiagramInput): DiagramBlock {
  return defineBlock("diagram", input, {
    title: input.title,
    syntax: input.syntax ?? "mermaid",
    body: requireText(input.body, "diagram.body")
  });
}

export function chart(input: ChartInput): ChartBlock {
  return defineBlock("chart", input, {
    title: requireText(input.title, "chart.title"),
    type: input.type,
    xLabel: input.xLabel,
    yLabel: input.yLabel,
    points: requireChartPoints(input.points, "chart.points")
  });
}

export function image(input: ImageInput): ImageBlock {
  return defineBlock("image", input, {
    src: requireText(input.src, "image.src"),
    alt: requireText(input.alt, "image.alt"),
    caption: input.caption,
    credit: input.credit
  });
}

export function componentModule<Props extends JsonValue = JsonValue>(baseUrl: string, path: string): ComponentModule<Props> {
  let sourcePath: string;
  try {
    sourcePath = fileURLToPath(new URL(requireText(path, "componentModule.path"), baseUrl));
  } catch {
    throw new Error("componentModule requires a valid file base URL and relative path");
  }
  if (!existsSync(sourcePath)) {
    throw new Error(`Component module does not exist: ${sourcePath}`);
  }
  return { kind: "component-module", sourcePath } as ComponentModule<Props>;
}

export function component<Props extends JsonValue = JsonValue>(input: ComponentInput<Props>): ComponentBlock<Props> {
  if (!input.module || input.module.kind !== "component-module" || typeof input.module.sourcePath !== "string") {
    throw new Error("component.module must come from componentModule()");
  }
  if (!isJsonData(input.props)) throw new Error("component.props must be JSON serializable");
  return defineBlock("component", input, {
    title: input.title,
    module: input.module,
    props: input.props
  });
}

export function callout(input: CalloutInput): CalloutBlock {
  return defineBlock("callout", input, {
    tone: input.tone ?? "note",
    title: input.title,
    body: requireText(input.body, "callout.body")
  });
}

export function glossary(input: GlossaryInput): GlossaryBlock {
  return defineBlock("glossary", input, {
    title: requireText(input.title ?? "Glossary", "glossary.title"),
    entries: requireGlossaryEntries(input.entries, "glossary.entries")
  });
}

export function transformation(input: TransformationInput): TransformationBlock {
  return defineBlock("transformation", input, {
    title: requireText(input.title, "transformation.title"),
    focus: requireText(input.focus, "transformation.focus"),
    layout: input.layout ?? "auto",
    inputLabel: requireText(input.inputLabel ?? "Input", "transformation.inputLabel"),
    operationLabel: requireText(input.operationLabel ?? "Operation", "transformation.operationLabel"),
    outputLabel: requireText(input.outputLabel ?? "Output", "transformation.outputLabel"),
    input: requireArtifacts(input.input, "transformation.input"),
    operation: normalizeTransformationArtifact(input.operation, "transformation.operation"),
    output: requireArtifacts(input.output, "transformation.output"),
    explanation: requireText(input.explanation, "transformation.explanation")
  });
}

export function codingProblem(input: CodingProblemInput): CodingProblemBlock {
  return defineBlock("codingProblem", input, {
    title: requireText(input.title, "codingProblem.title"),
    prompt: requireText(input.prompt, "codingProblem.prompt"),
    language: input.language ?? "python",
    files: input.files.map(normalizeProblemFile),
    setup: input.setup === undefined ? undefined : normalizeCodingAction("setup", input.setup, "Setup", "setup"),
    actions: normalizeCodingActions(input),
    verification: input.verification === undefined ? undefined : {
      actionId: requireText(input.verification.actionId, "codingProblem.verification.actionId"),
      referenceFiles: { ...input.verification.referenceFiles }
    },
    review: input.review ?? input.reviewPrompt
  });
}

export function quiz(input: QuizInput): QuizBlock {
  const preserveChoiceOrder = input.preserveChoiceOrder ?? false;
  return defineBlock("quiz", input, {
    title: requireText(input.title, "quiz.title"),
    mode: input.mode ?? "check",
    preserveChoiceOrder,
    questions: (preserveChoiceOrder
      ? input.questions.map(cloneQuizQuestion)
      : balanceQuizQuestions(input.id, input.questions)
    ).map(normalizeQuizQuestion)
  });
}

export function balancedQuiz(input: QuizInput): QuizBlock {
  return quiz({
    ...input,
    preserveChoiceOrder: false
  });
}

export function projectFiles(baseUrl: string, dir: string): {
  file(path: string, options?: CodingProblemFileOptions): CodingProblemFile;
  inline(path: string, content: string, options?: CodingProblemFileOptions): CodingProblemFile;
} {
  const root = resolve(dirname(fileURLToPath(baseUrl)), dir);
  return {
    file(path: string, options: CodingProblemFileOptions = {}): CodingProblemFile {
      const resolved = resolve(root, path);
      if (resolved !== root && !resolved.startsWith(root + sep)) {
        throw new Error(`Problem file escapes project directory: ${path}`);
      }
      return normalizeProblemFile({
        path,
        content: readFileSync(resolved, "utf8"),
        source: relative(dirname(fileURLToPath(baseUrl)), resolved).replaceAll("\\", "/"),
        sourcePath: resolved,
        ...options
      });
    },
    inline(path: string, content: string, options: CodingProblemFileOptions = {}): CodingProblemFile {
      return normalizeProblemFile({ path, content, ...options });
    }
  };
}

function normalizeQuizQuestion(input: QuizQuestionInput): QuizQuestion {
  if (input.kind === "matching") {
    return {
      kind: "matching",
      id: requireText(input.id, "quiz.questions[].id"),
      prompt: requireText(input.prompt, "quiz.questions[].prompt"),
      leftLabel: requireText(input.leftLabel ?? "Prompt", "quiz.questions[].leftLabel"),
      rightLabel: requireText(input.rightLabel ?? "Match", "quiz.questions[].rightLabel"),
      pairs: requireMatchingPairs(input.pairs, "quiz.questions[].pairs"),
      explanation: requireText(input.explanation, "quiz.questions[].explanation"),
      tags: input.tags ?? [],
      difficulty: input.difficulty
    };
  }

  return {
    kind: "multiple-choice",
    id: requireText(input.id, "quiz.questions[].id"),
    prompt: requireText(input.prompt, "quiz.questions[].prompt"),
    choices: input.choices.map(normalizeQuizChoice),
    answer: requireText(input.answer, "quiz.questions[].answer"),
    explanation: requireText(input.explanation, "quiz.questions[].explanation"),
    tags: input.tags ?? [],
    difficulty: input.difficulty
  };
}

function requireMatchingPairs(value: MatchingQuizPairInput[], label: string): MatchingQuizPair[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must contain at least one pair`);
  }
  return value.map((pair, index) => normalizeMatchingPair(pair, `${label}[${index}]`));
}

function normalizeMatchingPair(input: MatchingQuizPairInput, label: string): MatchingQuizPair {
  return {
    id: requireText(input.id, `${label}.id`),
    left: requireText(input.left, `${label}.left`),
    right: requireText(input.right, `${label}.right`),
    explanation: input.explanation === undefined ? undefined : requireText(input.explanation, `${label}.explanation`)
  };
}

function normalizeQuizChoice(input: QuizChoiceInput): QuizChoice {
  const choice: QuizChoice = {
    id: requireText(input.id, "quiz.questions[].choices[].id"),
    body: requireText(input.body, "quiz.questions[].choices[].body")
  };
  if (input.explanation !== undefined) {
    choice.explanation = requireText(input.explanation, "quiz.questions[].choices[].explanation");
  }
  return choice;
}

function requireGlossaryEntries(value: GlossaryEntryInput[], label: string): GlossaryEntryInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must contain at least one entry`);
  }
  return value.map((entry, index) => ({
    term: requireText(entry.term, `${label}[${index}].term`),
    definition: requireText(entry.definition, `${label}[${index}].definition`)
  }));
}

function requireChartPoints(value: ChartPointInput[], label: string): ChartPoint[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must contain at least one point`);
  }
  return value.map((point, index) => ({
    label: requireText(point.label, `${label}[${index}].label`),
    value: requireFiniteNumber(point.value, `${label}[${index}].value`)
  }));
}

function requireFiniteNumber(value: number, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
}

function balanceQuizQuestions(quizId: string, questions: QuizQuestionInput[]): QuizQuestionInput[] {
  const offset = stableHash(quizId) % 4;
  let eligibleIndex = 0;

  return questions.map((question) => {
    if (question.kind === "matching") {
      return cloneQuizQuestion(question);
    }

    if (question.choices.length !== 4) {
      return cloneQuizQuestion(question);
    }

    const answerIndex = question.choices.findIndex((choice) => choice.id === question.answer);
    if (answerIndex < 0) {
      return cloneQuizQuestion(question);
    }

    const targetPosition = (eligibleIndex + offset) % 4;
    eligibleIndex += 1;
    return {
      ...question,
      choices: reorderChoicesForAnswerPosition(question, quizId, targetPosition)
    };
  });
}

function balanceTextbookQuizChoices(textbookId: string, chapters: Chapter[]): Chapter[] {
  const counters: Record<QuizMode, number> = {
    check: 0,
    review: 0,
    "practice-test": 0
  };
  const offsets: Record<QuizMode, number> = {
    check: stableHash(`${textbookId}:check`) % 4,
    review: stableHash(`${textbookId}:review`) % 4,
    "practice-test": stableHash(`${textbookId}:practice-test`) % 4
  };
  let chaptersChanged = false;

  const balancedChapters = chapters.map((chapterValue) => {
    let chapterChanged = false;
    const sections = chapterValue.sections.map((sectionValue) => {
      const sectionBlocks = balanceContextualQuizBlocks(sectionValue.blocks, {
        textbookId,
        chapterId: chapterValue.id,
        sectionId: sectionValue.id,
        subsectionId: "section",
        counters,
        offsets
      });
      let sectionChanged = sectionBlocks !== sectionValue.blocks;
      const subsections = sectionValue.subsections.map((subsectionValue) => {
        const blocks = balanceContextualQuizBlocks(subsectionValue.blocks, {
          textbookId,
          chapterId: chapterValue.id,
          sectionId: sectionValue.id,
          subsectionId: subsectionValue.id,
          counters,
          offsets
        });
        if (blocks === subsectionValue.blocks) return subsectionValue;
        sectionChanged = true;
        return { ...subsectionValue, blocks };
      });

      if (!sectionChanged) return sectionValue;
      chapterChanged = true;
      return { ...sectionValue, blocks: sectionBlocks, subsections };
    });

    if (!chapterChanged) return chapterValue;
    chaptersChanged = true;
    return { ...chapterValue, sections };
  });

  return chaptersChanged ? balancedChapters : chapters;
}

interface QuizBalanceContext {
  textbookId: string;
  chapterId: string;
  sectionId: string;
  subsectionId: string;
  counters: Record<QuizMode, number>;
  offsets: Record<QuizMode, number>;
}

function balanceContextualQuizBlocks(blocks: TutorBlock[], context: QuizBalanceContext): TutorBlock[] {
  let blocksChanged = false;
  const balancedBlocks = blocks.map((block) => {
    if (block.kind !== "quiz") return block;
    const quizBlock = block as QuizBlock;
    if (quizBlock.props.preserveChoiceOrder) return block;

    const mode = quizBlock.props.mode;
    if (mode !== "check" && mode !== "review" && mode !== "practice-test") return block;
    let quizChanged = false;
    const questions = quizBlock.props.questions.map((question) => {
      if (question.kind !== "multiple-choice" || question.choices.length !== 4) return question;
      if (!question.choices.some((choice) => choice.id === question.answer)) return question;

      const targetPosition = (context.counters[mode] + context.offsets[mode]) % 4;
      context.counters[mode] += 1;
      const seed = JSON.stringify([
        context.textbookId,
        context.chapterId,
        context.sectionId,
        context.subsectionId,
        quizBlock.id,
        question.id
      ]);
      const choices = reorderNormalizedChoicesForAnswerPosition(question, seed, targetPosition);
      if (sameChoiceOrder(choices, question.choices)) return question;
      quizChanged = true;
      return { ...question, choices };
    });

    if (!quizChanged) return block;
    blocksChanged = true;
    return { ...quizBlock, props: { ...quizBlock.props, questions } };
  });

  return blocksChanged ? balancedBlocks : blocks;
}

function reorderNormalizedChoicesForAnswerPosition(
  question: Extract<QuizQuestion, { kind: "multiple-choice" }>,
  seed: string,
  targetPosition: number
): QuizChoice[] {
  const correctChoice = question.choices.find((choice) => choice.id === question.answer);
  if (correctChoice === undefined) return question.choices;

  const distractors = question.choices
    .filter((choice) => choice.id !== question.answer)
    .map((choice) => ({ ...choice }))
    .sort((left, right) => stableHash(`${seed}:${left.id}`) - stableHash(`${seed}:${right.id}`));
  const reordered: QuizChoice[] = [];

  for (let index = 0; index < question.choices.length; index += 1) {
    if (index === targetPosition) {
      reordered.push({ ...correctChoice });
    } else {
      const next = distractors.shift();
      if (next !== undefined) reordered.push(next);
    }
  }

  return reordered;
}

function sameChoiceOrder(left: QuizChoice[], right: QuizChoice[]): boolean {
  return left.every((choice, index) => choice.id === right[index]?.id);
}

function cloneQuizQuestion(question: QuizQuestionInput): QuizQuestionInput {
  if (question.kind === "matching") {
    return {
      ...question,
      pairs: question.pairs.map((pair) => ({ ...pair })),
      tags: question.tags === undefined ? undefined : [...question.tags]
    };
  }

  return {
    ...question,
    choices: question.choices.map((choice) => ({ ...choice })),
    tags: question.tags === undefined ? undefined : [...question.tags]
  };
}

function reorderChoicesForAnswerPosition(
  question: MultipleChoiceQuizQuestionInput,
  quizId: string,
  targetPosition: number
): QuizChoiceInput[] {
  const correctChoice = question.choices.find((choice) => choice.id === question.answer);
  if (correctChoice === undefined) {
    return question.choices.map((choice) => ({ ...choice }));
  }

  const seed = `${quizId}:${question.id}`;
  const distractors = question.choices
    .filter((choice) => choice.id !== question.answer)
    .map((choice) => ({ ...choice }))
    .sort((left, right) => stableHash(`${seed}:${left.id}`) - stableHash(`${seed}:${right.id}`));
  const reordered: QuizChoiceInput[] = [];

  for (let index = 0; index < question.choices.length; index += 1) {
    if (index === targetPosition) {
      reordered.push({ ...correctChoice });
    } else {
      const next = distractors.shift();
      if (next !== undefined) reordered.push(next);
    }
  }

  return reordered;
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function requireArtifacts(value: TransformationArtifact[], label: string): TransformationArtifact[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must contain at least one artifact`);
  }
  return value.map((artifact, index) => normalizeTransformationArtifact(artifact, `${label}[${index}]`));
}

function normalizeTransformationArtifact(
  artifact: TransformationArtifact,
  label: string
): TransformationArtifact {
  if (typeof artifact !== "object" || artifact === null || Array.isArray(artifact)) {
    throw new Error(`${label} must be an artifact`);
  }
  const artifactLabel = artifact.label === undefined ? undefined : requireText(artifact.label, `${label}.label`);
  if (artifact.format === "markdown" || artifact.format === "math") {
    return { label: artifactLabel, format: artifact.format, body: requireText(artifact.body, `${label}.body`) };
  }
  if (artifact.format === "code") {
    return {
      label: artifactLabel,
      format: "code",
      body: requireText(artifact.body, `${label}.body`),
      language: artifact.language
    };
  }
  if (artifact.format === "table") {
    return {
      label: artifactLabel,
      format: "table",
      columns: [...artifact.columns],
      rows: artifact.rows.map((row) => [...row])
    };
  }
  throw new Error(`${label}.format is invalid`);
}

function normalizeProblemFile(input: CodingProblemFileInput): CodingProblemFile {
  return {
    path: requireText(input.path, "codingProblem.files[].path"),
    content: String(input.content ?? ""),
    editable: input.editable ?? false,
    hidden: input.hidden ?? false,
    language: input.language,
    source: input.source,
    sourcePath: input.sourcePath
  };
}

function normalizeCodingActions(input: CodingProblemInput): CodingProblemAction[] {
  const actions = new Map<string, CodingProblemAction>();
  if (input.run !== undefined) addAction(actions, "run", input.run, "Run", "run");
  if (input.test !== undefined) addAction(actions, "test", input.test, "Test", "test");
  for (const [id, command] of Object.entries(input.commands ?? {})) {
    addAction(actions, id, command, titleCase(id), id);
  }
  for (const action of input.actions ?? []) {
    addAction(actions, action.id, action, action.label ?? titleCase(action.id), action.kind ?? action.id);
  }
  return [...actions.values()];
}

function addAction(
  actions: Map<string, CodingProblemAction>,
  id: string,
  value: CodingProblemCommandValue,
  label: string,
  kind: string
): void {
  actions.set(id, normalizeCodingAction(id, value, label, kind));
}

function normalizeCodingAction(
  id: string,
  value: CodingProblemCommandValue,
  label: string,
  kind: string
): CodingProblemAction {
  const input = typeof value === "string" ? { command: value } : value;
  return {
    id: requireText(id, "codingProblem.actions[].id"),
    label: requireText(input.label ?? label, "codingProblem.actions[].label"),
    command: requireText(input.command, "codingProblem.actions[].command"),
    kind: input.kind ?? kind,
    hidden: input.hidden ?? false
  };
}

function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
