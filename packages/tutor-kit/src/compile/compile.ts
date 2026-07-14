import { join, relative, resolve } from "node:path";
import { existsSync } from "node:fs";
import { loadTextbooks, resolveWorkspace } from "./discover.js";
import { typecheckWorkspace } from "./typecheck.js";
import { summarizeTextbook } from "../core/traversal.js";

export interface CompileResult {
  ok: boolean;
  output: string;
  textbookCount: number;
  chapterCount: number;
  sectionCount: number;
  subsectionCount: number;
  blockCount: number;
  widgetCount: number;
}

export async function compileWorkspace(cwd: string, options: { textbookId?: string } = {}): Promise<CompileResult> {
  const root = resolve(cwd);
  const workspace = await resolveWorkspace(root);
  const targetedEntry = options.textbookId
    ? ["textbook.ts", "textbook.tsx"].map((file) => join(workspace.textbooksDir, options.textbookId!, file)).find(existsSync)
    : undefined;
  if (options.textbookId && !targetedEntry) {
    return emptyFailure(`Textbook not found: ${options.textbookId}`);
  }
  const typecheck = typecheckWorkspace(root, targetedEntry ? [targetedEntry] : undefined);
  if (!typecheck.ok) {
    return {
      ok: false,
      output: formatFailure("TypeScript failed", typecheck.messages),
      textbookCount: 0,
      chapterCount: 0,
      sectionCount: 0,
      subsectionCount: 0,
      blockCount: 0,
      widgetCount: 0
    };
  }

  const loaded = await loadTextbooks(root, options);
  if (loaded.issues.length > 0) {
    const messages = loaded.issues.map((issue) => {
      const file = issue.file ? relative(root, issue.file) : "workspace";
      const path = issue.path ? ` ${issue.path}` : "";
      return `${file}${path} - ${issue.message}`;
    });
    return {
      ok: false,
      output: formatFailure("Tutor validation failed", messages),
      textbookCount: 0,
      chapterCount: 0,
      sectionCount: 0,
      subsectionCount: 0,
      blockCount: 0,
      widgetCount: 0
    };
  }

  let sectionCount = 0;
  let subsectionCount = 0;
  let blockCount = 0;
  for (const loadedTextbook of loaded.textbooks) {
    const summary = summarizeTextbook(loadedTextbook.textbook);
    sectionCount += summary.sections;
    subsectionCount += summary.subsections;
    blockCount += summary.blocks;
  }

  return {
    ok: true,
    output: [
      "Tutor compile passed",
      `- scope: ${options.textbookId ? `textbook ${options.textbookId}` : "full workspace"}`,
      `- ${loaded.textbooks.length} textbooks`,
      `- ${loaded.chapters.length} chapters`,
      `- ${sectionCount} sections`,
      `- ${subsectionCount} subsections`,
      `- ${blockCount} blocks`
    ].join("\n"),
    textbookCount: loaded.textbooks.length,
    chapterCount: loaded.chapters.length,
    sectionCount,
    subsectionCount,
    blockCount,
    widgetCount: blockCount
  };
}

function emptyFailure(message: string): CompileResult {
  return {
    ok: false,
    output: formatFailure("Tutor validation failed", [message]),
    textbookCount: 0,
    chapterCount: 0,
    sectionCount: 0,
    subsectionCount: 0,
    blockCount: 0,
    widgetCount: 0
  };
}

function formatFailure(title: string, messages: string[]): string {
  return [
    "Tutor compile failed",
    "",
    title,
    ...messages.map((message) => `- ${message}`)
  ].join("\n");
}
