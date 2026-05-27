import type {
  BlurbProps,
  BlurbWidget,
  Chapter,
  Section,
  Subsection,
  Textbook,
  TutorWidget
} from "./types.js";

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

function requireText(value: string, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
  return value;
}

export function subsection(input: SubsectionInput): Subsection {
  return {
    id: requireText(input.id, "subsection.id"),
    title: requireText(input.title, "subsection.title"),
    description: input.description,
    tags: input.tags ?? [],
    widgets: input.widgets ?? []
  };
}

export function section(input: SectionInput): Section {
  return {
    id: requireText(input.id, "section.id"),
    title: requireText(input.title, "section.title"),
    description: input.description,
    tags: input.tags ?? [],
    widgets: input.widgets ?? [],
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

export function blurb(input: BlurbInput): BlurbWidget {
  return {
    kind: "blurb",
    id: requireText(input.id, "blurb.id"),
    title: requireText(input.title, "blurb.title"),
    props: {
      body: requireText(input.body, "blurb.body")
    }
  };
}
