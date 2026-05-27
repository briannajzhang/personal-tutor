export { blurb, chapter, section, subsection, textbook } from "./core/builders.js";
export { validateChapter, validateSection, validateSubsection, validateTextbook, summarizeChapter, summarizeSection, summarizeSubsection, summarizeTextbook } from "./core/validation.js";
export { builtInWidgetRegistry } from "./registry/index.js";
export type { BaseWidget, BlurbProps, BlurbWidget, Chapter, LoadedChapter, LoadedTextbook, Section, Subsection, Textbook, TextbookModule, TutorConfig, TutorWidget, ValidationIssue, WidgetKind } from "./core/types.js";
