import type {
  BlurbBlock,
  CalloutBlock,
  CalloutProps,
  CodeBlock,
  HeadingBlock,
  HeadingProps,
  ListBlock,
  ListProps,
  MathBlock,
  ParagraphBlock,
  ParagraphProps,
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
