import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { tsImport } from "tsx/esm/api";
import type { CodeRunnerConfig, LoadedChapter, LoadedTextbook, TutorConfig, ValidationIssue } from "../core/types.js";
import { validateTextbook } from "../core/validation.js";

export interface WorkspacePaths {
  cwd: string;
  configPath: string | null;
  textbooksDir: string;
  dataDir: string;
  title: string;
  codeRunner: CodeRunnerConfig;
}

export interface TextbookLoadResult {
  textbooks: LoadedTextbook[];
  chapters: LoadedChapter[];
  issues: ValidationIssue[];
}

export async function resolveWorkspace(cwd: string): Promise<WorkspacePaths> {
  const root = resolve(cwd);
  const configPath = existsSync(join(root, "tutor.config.ts"))
    ? join(root, "tutor.config.ts")
    : null;

  let config: TutorConfig = {};
  if (configPath) {
    const loaded = await tsImport(pathToFileURL(configPath).href, {
      parentURL: import.meta.url,
      tsconfig: findTsconfig(root) ?? false
    }) as { default?: TutorConfig };
    config = loaded.default ?? {};
  }

  return {
    cwd: root,
    configPath,
    textbooksDir: resolve(root, config.textbooksDir ?? "textbooks"),
    dataDir: resolve(root, config.dataDir ?? "tutor-data"),
    title: config.title ?? "Study",
    codeRunner: config.codeRunner ?? {}
  };
}

export function findTsconfig(cwd: string): string | null {
  const candidate = join(cwd, "tsconfig.json");
  return existsSync(candidate) ? candidate : null;
}

export function discoverTextbookFiles(textbooksDir: string): string[] {
  return discoverFiles(textbooksDir, /(^|\/)textbook\.tsx?$/);
}

function discoverFiles(rootDir: string, pattern: RegExp): string[] {
  if (!existsSync(rootDir)) return [];
  const files: string[] = [];

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (pattern.test(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return files.sort();
}

export async function loadTextbooks(cwd: string): Promise<TextbookLoadResult> {
  const workspace = await resolveWorkspace(cwd);
  const tsconfig = findTsconfig(workspace.cwd) ?? false;
  const textbooks: LoadedTextbook[] = [];
  const chapters: LoadedChapter[] = [];
  const issues: ValidationIssue[] = [];

  for (const file of discoverTextbookFiles(workspace.textbooksDir)) {
    try {
      const mod = await tsImport(pathToFileURL(file).href, {
        parentURL: import.meta.url,
        tsconfig
      }) as { default?: unknown };
      const textbook = mod.default;
      const textbookIssues = validateTextbook(textbook, file);
      if (textbookIssues.length > 0) {
        issues.push(...textbookIssues);
        continue;
      }
      const loadedTextbook = { file, textbook: textbook as LoadedTextbook["textbook"] };
      textbooks.push(loadedTextbook);
      for (const chapter of loadedTextbook.textbook.chapters) {
        chapters.push({
          file,
          chapter,
          textbookId: loadedTextbook.textbook.id,
          textbookTitle: loadedTextbook.textbook.title
        });
      }
    } catch (error) {
      issues.push({
        file,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const textbookIds = new Map<string, string>();
  for (const loaded of textbooks) {
    const previous = textbookIds.get(loaded.textbook.id);
    if (previous) {
      issues.push({
        file: loaded.file,
        path: "id",
        message: `Duplicate textbook id: ${loaded.textbook.id} also used by ${previous}`
      });
    }
    textbookIds.set(loaded.textbook.id, loaded.file);
  }

  const chapterIds = new Map<string, string>();
  for (const loaded of chapters) {
    const key = `${loaded.textbookId}/${loaded.chapter.id}`;
    const previous = chapterIds.get(key);
    if (previous) {
      issues.push({
        file: loaded.file,
        path: "chapters",
        message: `Duplicate chapter id in textbook ${loaded.textbookId}: ${loaded.chapter.id} also used by ${previous}`
      });
    }
    chapterIds.set(key, loaded.file);
  }

  return { textbooks, chapters, issues };
}
