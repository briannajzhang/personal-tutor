import type {
  Chapter,
  Section,
  Subsection,
  Textbook,
  ValidationIssue
} from "./types.js";

const calloutTones = new Set(["note", "caution", "key-idea"]);
const listStyles = new Set(["bullet", "number"]);
const headingLevels = new Set([4, 5]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function issue(message: string, path: string, file?: string): ValidationIssue {
  return { file, path, message };
}

export function validateTextbook(value: unknown, file?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [issue("Textbook export must be an object.", "default", file)];
  }

  if (!hasText(value.id)) issues.push(issue("Textbook id is required.", "id", file));
  if (!hasText(value.title)) issues.push(issue("Textbook title is required.", "title", file));
  if (!Array.isArray(value.chapters)) {
    issues.push(issue("Textbook chapters must be an array.", "chapters", file));
    return issues;
  }

  const chapterIds = new Set<string>();
  for (const [index, chapter] of value.chapters.entries()) {
    issues.push(...validateChapter(chapter, file).map((chapterIssue) => ({
      ...chapterIssue,
      path: `chapters[${index}]${chapterIssue.path ? `.${chapterIssue.path}` : ""}`
    })));
    if (isRecord(chapter) && hasText(chapter.id)) {
      if (chapterIds.has(chapter.id)) {
        issues.push(issue(`Duplicate chapter id in textbook: ${chapter.id}`, `chapters[${index}].id`, file));
      }
      chapterIds.add(chapter.id);
    }
  }

  return issues;
}

export function validateChapter(value: unknown, file?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [issue("Chapter must be an object.", "", file)];
  }

  if (!hasText(value.id)) issues.push(issue("Chapter id is required.", "id", file));
  if (!hasText(value.title)) issues.push(issue("Chapter title is required.", "title", file));
  if (!Array.isArray(value.sections)) {
    issues.push(issue("Chapter sections must be an array.", "sections", file));
    return issues;
  }

  const sectionIds = new Set<string>();
  for (const [index, section] of value.sections.entries()) {
    issues.push(...validateSection(section, file).map((sectionIssue) => ({
      ...sectionIssue,
      path: `sections[${index}]${sectionIssue.path ? `.${sectionIssue.path}` : ""}`
    })));
    if (isRecord(section) && hasText(section.id)) {
      if (sectionIds.has(section.id)) {
        issues.push(issue(`Duplicate section id in chapter: ${section.id}`, `sections[${index}].id`, file));
      }
      sectionIds.add(section.id);
    }
  }

  return issues;
}

export function validateSection(value: unknown, file?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [issue("Section must be an object.", "", file)];
  }

  if (!hasText(value.id)) issues.push(issue("Section id is required.", "id", file));
  if (!hasText(value.title)) issues.push(issue("Section title is required.", "title", file));
  validateBlockList(value.blocks, "blocks", file, issues);

  if (!Array.isArray(value.subsections)) {
    issues.push(issue("Section subsections must be an array.", "subsections", file));
    return issues;
  }

  const subsectionIds = new Set<string>();
  for (const [index, subsection] of value.subsections.entries()) {
    issues.push(...validateSubsection(subsection, file).map((subsectionIssue) => ({
      ...subsectionIssue,
      path: `subsections[${index}]${subsectionIssue.path ? `.${subsectionIssue.path}` : ""}`
    })));
    if (isRecord(subsection) && hasText(subsection.id)) {
      if (subsectionIds.has(subsection.id)) {
        issues.push(issue(`Duplicate subsection id in section: ${subsection.id}`, `subsections[${index}].id`, file));
      }
      subsectionIds.add(subsection.id);
    }
  }

  return issues;
}

export function validateSubsection(value: unknown, file?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!isRecord(value)) {
    return [issue("Subsection must be an object.", "", file)];
  }

  if (!hasText(value.id)) issues.push(issue("Subsection id is required.", "id", file));
  if (!hasText(value.title)) issues.push(issue("Subsection title is required.", "title", file));
  validateBlockList(value.blocks, "blocks", file, issues);

  return issues;
}

function validateBlockList(
  blocks: unknown,
  path: string,
  file: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!Array.isArray(blocks)) {
    issues.push(issue("Blocks must be an array.", path, file));
    return;
  }

  const blockIds = new Set<string>();
  for (const [index, block] of blocks.entries()) {
    validateBlock(block, `${path}[${index}]`, file, issues);
    if (isRecord(block) && hasText(block.id)) {
      if (blockIds.has(block.id)) {
        issues.push(issue(`Duplicate block id: ${block.id}`, `${path}[${index}].id`, file));
      }
      blockIds.add(block.id);
    }
  }
}

export function validateBlock(
  block: unknown,
  path: string,
  file: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!isRecord(block)) {
    issues.push(issue("Block must be an object.", path, file));
    return;
  }

  if (!hasText(block.id)) issues.push(issue("Block id is required.", `${path}.id`, file));
  if (!hasText(block.kind)) issues.push(issue("Block kind is required.", `${path}.kind`, file));
  if (!isRecord(block.props)) {
    issues.push(issue("Block props must be an object.", `${path}.props`, file));
    return;
  }

  if (block.kind === "p" || block.kind === "explanation" || block.kind === "blurb") {
    validateTextProp(block.props.body, `${path}.props.body`, file, issues);
    return;
  }

  if (block.kind === "heading") {
    validateTextProp(block.props.text, `${path}.props.text`, file, issues);
    if (!headingLevels.has(block.props.level as number)) {
      issues.push(issue("Heading level must be 4 or 5.", `${path}.props.level`, file));
    }
    return;
  }

  if (block.kind === "list") {
    if (!listStyles.has(block.props.style as string)) {
      issues.push(issue("List style must be bullet or number.", `${path}.props.style`, file));
    }
    if (!Array.isArray(block.props.items) || block.props.items.length === 0) {
      issues.push(issue("List items must be a non-empty array.", `${path}.props.items`, file));
    } else {
      block.props.items.forEach((item, index) => validateTextProp(item, `${path}.props.items[${index}]`, file, issues));
    }
    return;
  }

  if (block.kind === "codeBlock") {
    if (!hasText(block.props.code)) issues.push(issue("Code block code is required.", `${path}.props.code`, file));
    if (block.props.language !== undefined && typeof block.props.language !== "string") {
      issues.push(issue("Code block language must be a string.", `${path}.props.language`, file));
    }
    return;
  }

  if (block.kind === "mathBlock") {
    if (!hasText(block.props.body)) issues.push(issue("Math block body is required.", `${path}.props.body`, file));
    return;
  }

  if (block.kind === "callout") {
    if (!calloutTones.has(block.props.tone as string)) {
      issues.push(issue("Callout tone must be note, caution, or key-idea.", `${path}.props.tone`, file));
    }
    if (block.props.title !== undefined && typeof block.props.title !== "string") {
      issues.push(issue("Callout title must be a string.", `${path}.props.title`, file));
    }
    validateTextProp(block.props.body, `${path}.props.body`, file, issues);
    return;
  }

  if (block.kind === "codingProblem") {
    validateCodingProblem(block.props, `${path}.props`, file, issues);
  }
}

function validateCodingProblem(
  props: Record<string, unknown>,
  path: string,
  file: string | undefined,
  issues: ValidationIssue[]
): void {
  validateTextProp(props.title, `${path}.title`, file, issues);
  validateTextProp(props.prompt, `${path}.prompt`, file, issues);
  if (props.language !== undefined && typeof props.language !== "string") {
    issues.push(issue("Coding problem language must be a string.", `${path}.language`, file));
  }

  if (!Array.isArray(props.files) || props.files.length === 0) {
    issues.push(issue("Coding problem files must be a non-empty array.", `${path}.files`, file));
  } else {
    const filePaths = new Set<string>();
    let editableCount = 0;
    props.files.forEach((problemFile, index) => {
      const filePath = `${path}.files[${index}]`;
      if (!isRecord(problemFile)) {
        issues.push(issue("Coding problem file must be an object.", filePath, file));
        return;
      }
      if (!hasText(problemFile.path)) {
        issues.push(issue("Coding problem file path is required.", `${filePath}.path`, file));
      } else {
        validateProblemPath(problemFile.path, `${filePath}.path`, file, issues);
        if (filePaths.has(problemFile.path)) {
          issues.push(issue(`Duplicate coding problem file path: ${problemFile.path}`, `${filePath}.path`, file));
        }
        filePaths.add(problemFile.path);
      }
      if (typeof problemFile.content !== "string") {
        issues.push(issue("Coding problem file content must be a string.", `${filePath}.content`, file));
      }
      if (problemFile.editable !== undefined && typeof problemFile.editable !== "boolean") {
        issues.push(issue("Coding problem file editable must be a boolean.", `${filePath}.editable`, file));
      }
      if (problemFile.hidden !== undefined && typeof problemFile.hidden !== "boolean") {
        issues.push(issue("Coding problem file hidden must be a boolean.", `${filePath}.hidden`, file));
      }
      if (problemFile.language !== undefined && typeof problemFile.language !== "string") {
        issues.push(issue("Coding problem file language must be a string.", `${filePath}.language`, file));
      }
      if (problemFile.editable === true) editableCount += 1;
    });
    if (editableCount === 0) {
      issues.push(issue("Coding problem must contain at least one editable file.", `${path}.files`, file));
    }
  }

  if (!Array.isArray(props.actions) || props.actions.length === 0) {
    issues.push(issue("Coding problem actions must be a non-empty array.", `${path}.actions`, file));
    return;
  }

  if (props.setup !== undefined) {
    validateCodingAction(props.setup, `${path}.setup`, file, issues);
  }

  const actionIds = new Set<string>();
  props.actions.forEach((action, index) => {
    const actionPath = `${path}.actions[${index}]`;
    if (validateCodingAction(action, actionPath, file, issues)) {
      if (actionIds.has(action.id)) {
        issues.push(issue(`Duplicate coding problem action id: ${action.id}`, `${actionPath}.id`, file));
      }
      actionIds.add(action.id);
    }
  });
}

function validateCodingAction(
  action: unknown,
  path: string,
  file: string | undefined,
  issues: ValidationIssue[]
): action is { id: string } {
  if (!isRecord(action)) {
    issues.push(issue("Coding problem action must be an object.", path, file));
    return false;
  }
  if (!hasText(action.id)) {
    issues.push(issue("Coding problem action id is required.", `${path}.id`, file));
  }
  if (!hasText(action.label)) issues.push(issue("Coding problem action label is required.", `${path}.label`, file));
  if (!hasText(action.command)) issues.push(issue("Coding problem action command is required.", `${path}.command`, file));
  if (action.kind !== undefined && typeof action.kind !== "string") {
    issues.push(issue("Coding problem action kind must be a string.", `${path}.kind`, file));
  }
  if (action.hidden !== undefined && typeof action.hidden !== "boolean") {
    issues.push(issue("Coding problem action hidden must be a boolean.", `${path}.hidden`, file));
  }
  return hasText(action.id);
}

function validateProblemPath(
  value: string,
  path: string,
  file: string | undefined,
  issues: ValidationIssue[]
): void {
  const parts = value.split("/");
  if (
    value.startsWith("/") ||
    value.includes("\\") ||
    parts.some((part) => part === "" || part === "." || part === "..")
  ) {
    issues.push(issue("Coding problem file paths must be relative forward-slash paths without . or ..", path, file));
  }
}

function validateTextProp(
  value: unknown,
  path: string,
  file: string | undefined,
  issues: ValidationIssue[]
): void {
  if (!hasText(value)) {
    issues.push(issue("Text is required.", path, file));
    return;
  }
  validateMarkupText(value, path, file, issues);
}

function validateMarkupText(
  value: string,
  path: string,
  file: string | undefined,
  issues: ValidationIssue[]
): void {
  const dollarCount = [...value.matchAll(/(?<!\\)\$/g)].length;
  if (dollarCount % 2 !== 0) {
    issues.push(issue("Markdown/LaTeX has an unmatched $ delimiter.", path, file));
  }

  const fenceCount = [...value.matchAll(/```/g)].length;
  if (fenceCount % 2 !== 0) {
    issues.push(issue("Markdown has an unmatched code fence.", path, file));
  }
}

export function summarizeSubsection(subsection: Subsection): { blocks: number } {
  return { blocks: subsection.blocks.length };
}

export function summarizeSection(section: Section): { subsections: number; blocks: number } {
  let blocks = section.blocks.length;
  for (const subsection of section.subsections) {
    blocks += summarizeSubsection(subsection).blocks;
  }
  return { subsections: section.subsections.length, blocks };
}

export function summarizeChapter(chapter: Chapter): { sections: number; subsections: number; blocks: number } {
  let subsections = 0;
  let blocks = 0;
  for (const section of chapter.sections) {
    const summary = summarizeSection(section);
    subsections += summary.subsections;
    blocks += summary.blocks;
  }
  return { sections: chapter.sections.length, subsections, blocks };
}

export function summarizeTextbook(textbook: Textbook): {
  chapters: number;
  sections: number;
  subsections: number;
  blocks: number;
} {
  let sections = 0;
  let subsections = 0;
  let blocks = 0;
  for (const chapter of textbook.chapters) {
    const summary = summarizeChapter(chapter);
    sections += summary.sections;
    subsections += summary.subsections;
    blocks += summary.blocks;
  }
  return { chapters: textbook.chapters.length, sections, subsections, blocks };
}
