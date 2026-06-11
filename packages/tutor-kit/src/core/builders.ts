import { readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  BlurbBlock,
  CalloutBlock,
  CalloutProps,
  CodingProblemAction,
  CodingProblemBlock,
  CodingProblemFile,
  CodingProblemProps,
  CodeBlock,
  HeadingBlock,
  HeadingProps,
  ListBlock,
  ListProps,
  MathBlock,
  ParagraphBlock,
  ParagraphProps,
  QuizBlock,
  QuizChoice,
  QuizDifficulty,
  QuizMode,
  QuizQuestion,
  ChapterRole,
  SectionRole,
  Section,
  Subsection,
  Textbook,
  Chapter,
  TutorBlock
} from "./types.js";

interface SubsectionInput {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  blocks?: TutorBlock[];
  widgets?: TutorBlock[];
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

interface CalloutInput extends BlockInput {
  tone?: CalloutProps["tone"];
  title?: string;
  body: string;
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
}

interface QuizQuestionInput extends BlockInput {
  prompt: string;
  choices: QuizChoiceInput[];
  answer: string;
  explanation: string;
  tags?: string[];
  difficulty?: QuizDifficulty;
}

interface QuizInput extends BlockInput {
  title: string;
  mode?: QuizMode;
  questions: QuizQuestionInput[];
}

interface LegacyExplanationInput extends ParagraphInput {
  title?: string;
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

export function subsection(input: SubsectionInput): Subsection {
  return {
    id: requireText(input.id, "subsection.id"),
    title: requireText(input.title, "subsection.title"),
    description: input.description,
    tags: input.tags ?? [],
    blocks: input.blocks ?? input.widgets ?? []
  };
}

export function section(input: SectionInput): Section {
  return {
    id: requireText(input.id, "section.id"),
    title: requireText(input.title, "section.title"),
    description: input.description,
    tags: input.tags ?? [],
    role: input.role,
    blocks: input.blocks ?? input.widgets ?? [],
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
  return {
    id: requireText(input.id, "textbook.id"),
    title: requireText(input.title, "textbook.title"),
    description: input.description,
    tags: input.tags ?? [],
    chapters: input.chapters ?? []
  };
}

export function p(input: ParagraphInput): ParagraphBlock {
  return {
    kind: "p",
    id: requireText(input.id, "p.id"),
    props: {
      body: requireText(input.body, "p.body")
    }
  };
}

export function heading(input: HeadingInput): HeadingBlock {
  return {
    kind: "heading",
    id: requireText(input.id, "heading.id"),
    props: {
      text: requireText(input.text, "heading.text"),
      level: input.level ?? 4
    }
  };
}

export function list(input: ListInput): ListBlock {
  return {
    kind: "list",
    id: requireText(input.id, "list.id"),
    props: {
      style: input.style ?? "bullet",
      items: requireItems(input.items, "list.items")
    }
  };
}

export function codeBlock(input: CodeBlockInput): CodeBlock {
  return {
    kind: "codeBlock",
    id: requireText(input.id, "codeBlock.id"),
    props: {
      code: requireText(input.code, "codeBlock.code"),
      language: input.language
    }
  };
}

export function mathBlock(input: MathBlockInput): MathBlock {
  return {
    kind: "mathBlock",
    id: requireText(input.id, "mathBlock.id"),
    props: {
      body: requireText(input.body, "mathBlock.body")
    }
  };
}

export function callout(input: CalloutInput): CalloutBlock {
  return {
    kind: "callout",
    id: requireText(input.id, "callout.id"),
    props: {
      tone: input.tone ?? "note",
      title: input.title,
      body: requireText(input.body, "callout.body")
    }
  };
}

export function codingProblem(input: CodingProblemInput): CodingProblemBlock {
  return {
    kind: "codingProblem",
    id: requireText(input.id, "codingProblem.id"),
    props: {
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
    }
  };
}

export function quiz(input: QuizInput): QuizBlock {
  return {
    kind: "quiz",
    id: requireText(input.id, "quiz.id"),
    props: {
      title: requireText(input.title, "quiz.title"),
      mode: input.mode ?? "check",
      questions: input.questions.map(normalizeQuizQuestion)
    }
  };
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
  return {
    id: requireText(input.id, "quiz.questions[].id"),
    prompt: requireText(input.prompt, "quiz.questions[].prompt"),
    choices: input.choices.map(normalizeQuizChoice),
    answer: requireText(input.answer, "quiz.questions[].answer"),
    explanation: requireText(input.explanation, "quiz.questions[].explanation"),
    tags: input.tags ?? [],
    difficulty: input.difficulty
  };
}

function normalizeQuizChoice(input: QuizChoiceInput): QuizChoice {
  return {
    id: requireText(input.id, "quiz.questions[].choices[].id"),
    body: requireText(input.body, "quiz.questions[].choices[].body")
  };
}

export function explanation(input: LegacyExplanationInput): BlurbBlock {
  return {
    kind: "explanation",
    id: requireText(input.id, "explanation.id"),
    props: {
      title: input.title,
      body: requireText(input.body, "explanation.body")
    }
  };
}

export function blurb(input: LegacyExplanationInput): BlurbBlock {
  return explanation(input);
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
