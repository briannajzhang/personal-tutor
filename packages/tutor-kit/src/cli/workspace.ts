import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import {
  configTemplate,
  packageJsonTemplate,
  registryTemplate,
  tsconfigTemplate,
  welcomeTextbookTemplate,
  welcomeChapterTemplate
} from "../templates/workspace.js";
import {
  blurbWidgetTemplate,
  chapterTemplate,
  textbookTemplate
} from "../templates/widgets.js";

export interface WriteResult {
  created: string[];
  skipped: string[];
}

export interface InitWorkspaceOptions {
  packageSpec?: string;
}

export function initWorkspace(cwd: string, options: InitWorkspaceOptions = {}): WriteResult {
  const result: WriteResult = { created: [], skipped: [] };
  ensureDir(cwd);
  ensureDir(join(cwd, "textbooks", "getting-started", "chapters"));
  ensureDir(join(cwd, "tutor", "widgets"));
  ensureDir(join(cwd, "tutor-data"));

  writeIfMissing(join(cwd, "package.json"), packageJsonTemplate(options.packageSpec), result);
  writeIfMissing(join(cwd, "tsconfig.json"), tsconfigTemplate(), result);
  writeIfMissing(join(cwd, "tutor.config.ts"), configTemplate(), result);
  writeIfMissing(join(cwd, "textbooks", "getting-started", "textbook.ts"), welcomeTextbookTemplate(), result);
  writeIfMissing(join(cwd, "textbooks", "getting-started", "chapters", "welcome.chapter.ts"), welcomeChapterTemplate(), result);
  writeIfMissing(join(cwd, "tutor", "registry.ts"), registryTemplate(), result);
  writeIfMissing(join(cwd, "tutor", "widgets", "blurb.tsx"), blurbWidgetTemplate(), result);
  writeIfMissing(join(cwd, "tutor-data", "events.jsonl"), "", result);

  return result;
}

export function addTextbook(cwd: string, id: string, title: string): WriteResult {
  const result: WriteResult = { created: [], skipped: [] };
  ensureDir(join(cwd, "textbooks", id, "chapters"));
  writeIfMissing(join(cwd, "textbooks", id, "textbook.ts"), textbookTemplate(id, title), result);
  return result;
}

export function addChapter(cwd: string, textbookId: string, id: string, title: string): WriteResult {
  const result: WriteResult = { created: [], skipped: [] };
  ensureDir(join(cwd, "textbooks", textbookId, "chapters"));
  writeIfMissing(join(cwd, "textbooks", textbookId, "chapters", `${id}.chapter.ts`), chapterTemplate(id, title), result);
  return result;
}

export function addWidget(cwd: string, kind: string): WriteResult {
  const result: WriteResult = { created: [], skipped: [] };
  ensureDir(join(cwd, "tutor", "widgets"));

  if (kind === "blurb") {
    writeIfMissing(join(cwd, "tutor", "widgets", "blurb.tsx"), blurbWidgetTemplate(), result);
    return result;
  }

  throw new Error(`Unknown widget "${kind}". Available widgets: blurb.`);
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function writeIfMissing(path: string, contents: string, result: WriteResult): void {
  if (existsSync(path)) {
    result.skipped.push(path);
    return;
  }
  writeFileSync(path, contents);
  result.created.push(path);
}

export function printWriteResult(action: string, result: WriteResult): string {
  const lines = [action];
  for (const file of result.created) lines.push(`- created ${basename(file)}`);
  for (const file of result.skipped) lines.push(`- skipped existing ${basename(file)}`);
  return lines.join("\n");
}
