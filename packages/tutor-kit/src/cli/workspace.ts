import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  configTemplate,
  packageJsonTemplate,
  registryTemplate,
  tsconfigTemplate,
  welcomeTextbookTemplate,
  welcomeChapterTemplate,
  welcomeProblemMainTemplate,
  welcomeProblemSolutionTemplate,
  welcomeProblemTestsTemplate
} from "../templates/workspace.js";
import {
  coreBlocksTemplate,
  chapterTemplate,
  textbookTemplate
} from "../templates/blocks.js";

export interface WriteResult {
  created: string[];
  skipped: string[];
}

export interface InitWorkspaceOptions {
  packageSpec?: string;
  starter?: boolean;
}

export function initWorkspace(cwd: string, options: InitWorkspaceOptions = {}): WriteResult {
  const result: WriteResult = { created: [], skipped: [] };
  ensureDir(cwd);
  ensureDir(join(cwd, "textbooks"));
  ensureDir(join(cwd, "tutor", "blocks"));
  ensureDir(join(cwd, "tutor-data"));

  const packageSpec = options.packageSpec ?? inferPackageSpec();
  writeIfMissing(join(cwd, "package.json"), packageJsonTemplate(packageSpec), result);
  linkLocalPackage(cwd, packageSpec, result);
  writeIfMissing(join(cwd, "tsconfig.json"), tsconfigTemplate(), result);
  writeIfMissing(join(cwd, "tutor.config.ts"), configTemplate(), result);
  if (options.starter) {
    ensureDir(join(cwd, "textbooks", "getting-started", "chapters"));
    ensureDir(join(cwd, "textbooks", "getting-started", "chapters", "problems", "classify-workspace-paths"));
    writeIfMissing(join(cwd, "textbooks", "getting-started", "textbook.ts"), welcomeTextbookTemplate(), result);
    writeIfMissing(join(cwd, "textbooks", "getting-started", "chapters", "welcome.chapter.ts"), welcomeChapterTemplate(), result);
    writeIfMissing(join(cwd, "textbooks", "getting-started", "chapters", "problems", "classify-workspace-paths", "main.py"), welcomeProblemMainTemplate(), result);
    writeIfMissing(join(cwd, "textbooks", "getting-started", "chapters", "problems", "classify-workspace-paths", "solution.py"), welcomeProblemSolutionTemplate(), result);
    writeIfMissing(join(cwd, "textbooks", "getting-started", "chapters", "problems", "classify-workspace-paths", "tests.py"), welcomeProblemTestsTemplate(), result);
  }
  writeIfMissing(join(cwd, "tutor", "registry.ts"), registryTemplate(), result);
  writeIfMissing(join(cwd, "tutor", "blocks", "core.tsx"), coreBlocksTemplate(), result);
  writeIfMissing(join(cwd, "tutor-data", "events.jsonl"), "", result);

  return result;
}

export function addTextbook(cwd: string, id: string, title: string): WriteResult {
  const result: WriteResult = { created: [], skipped: [] };
  ensureDir(join(cwd, "textbooks", id, "chapters"));
  writeIfMissing(join(cwd, "textbooks", id, "textbook.ts"), textbookTemplate(id, title), result);
  writeIfMissing(join(cwd, "textbooks", id, "prompt.md"), "# Prompt\n\n", result);
  writeIfMissing(join(cwd, "textbooks", id, "curriculum-map.md"), `# Curriculum Map: ${title}\n\n`, result);
  writeIfMissing(join(cwd, "textbooks", id, "chapter-specs.md"), "# Chapter Specs\n\n", result);
  writeIfMissing(join(cwd, "textbooks", id, "review-notes.md"), "# Review Notes\n\n", result);
  writeIfMissing(join(cwd, "textbooks", id, "compile-result.md"), "# Compile Result\n\n", result);
  return result;
}

export function addChapter(cwd: string, textbookId: string, id: string, title: string): WriteResult {
  const result: WriteResult = { created: [], skipped: [] };
  ensureDir(join(cwd, "textbooks", textbookId, "chapters"));
  writeIfMissing(join(cwd, "textbooks", textbookId, "chapters", `${id}.chapter.ts`), chapterTemplate(id, title), result);
  return result;
}

export function addBlock(cwd: string, kind: string): WriteResult {
  const result: WriteResult = { created: [], skipped: [] };
  ensureDir(join(cwd, "tutor", "blocks"));

  if (["p", "heading", "list", "codeBlock", "mathBlock", "diagram", "chart", "callout", "transformation", "glossary", "quiz", "codingProblem", "core"].includes(kind)) {
    writeIfMissing(join(cwd, "tutor", "blocks", "core.tsx"), coreBlocksTemplate(), result);
    return result;
  }

  throw new Error(`Unknown block "${kind}". Available blocks: p, heading, list, codeBlock, mathBlock, diagram, chart, callout, transformation, glossary, quiz, codingProblem.`);
}

export function addWidget(cwd: string, kind: string): WriteResult {
  return addBlock(cwd, kind);
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

function inferPackageSpec(): string {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  try {
    const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    if (packageJson.name === "tutor-kit") return pathToFileURL(root).href;
  } catch {
    // Fall back below when running from an unusual bundle layout.
  }
  return "tutor-kit";
}

function linkLocalPackage(cwd: string, packageSpec: string, result: WriteResult): void {
  if (!packageSpec.startsWith("file:")) return;
  const target = filePackagePath(cwd, packageSpec);
  if (!target || !existsSync(target)) return;

  const nodeModules = join(cwd, "node_modules");
  const link = join(nodeModules, "tutor-kit");
  ensureDir(nodeModules);
  if (existsSync(link)) {
    result.skipped.push(link);
    return;
  }
  symlinkSync(target, link, "dir");
  result.created.push(link);
}

function filePackagePath(cwd: string, packageSpec: string): string | null {
  const raw = packageSpec.slice("file:".length);
  if (!raw) return null;
  if (raw.startsWith("/") || raw.startsWith("//")) return fileURLToPath(packageSpec);
  return resolve(cwd, raw);
}
