import { existsSync, lstatSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { register, type NamespacedUnregister } from "tsx/esm/api";
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

const workspaceLoadPromises = new Map<string, Promise<WorkspacePaths>>();
const textbookLoadPromises = new Map<string, Promise<TextbookLoadResult>>();
const workspaceCache = new Map<string, WorkspacePaths>();
const textbookCache = new Map<string, TextbookLoadResult>();
// Re-registering scoped tsx ESM hooks can leave Node blocked in makeSyncRequest.
// Keep one importer per tsconfig alive for the lifetime of this Tutor process.
const tsImporters = new Map<false | string, NamespacedUnregister>();
let importNamespaceCounter = 0;

export async function resolveWorkspace(cwd: string): Promise<WorkspacePaths> {
  const root = resolve(cwd);
  const cachedWorkspace = workspaceCache.get(root);
  if (cachedWorkspace) return cachedWorkspace;

  const cached = workspaceLoadPromises.get(root);
  if (cached) return cached;

  const loadPromise = loadWorkspace(root);
  workspaceLoadPromises.set(root, loadPromise);
  try {
    const workspace = await loadPromise;
    if (workspaceLoadPromises.get(root) === loadPromise) {
      workspaceCache.set(root, workspace);
    }
    return workspace;
  } finally {
    if (workspaceLoadPromises.get(root) === loadPromise) {
      workspaceLoadPromises.delete(root);
    }
  }
}

async function loadWorkspace(root: string): Promise<WorkspacePaths> {
  const importer = createTsImporter(findTsconfig(root) ?? false);
  try {
    return await loadWorkspaceWithImporter(root, importer);
  } finally {
    await importer.unregister();
  }
}

async function loadWorkspaceWithImporter(
  root: string,
  importer: ReturnType<typeof createTsImporter>
): Promise<WorkspacePaths> {
  const configPath = existsSync(join(root, "tutor.config.ts"))
    ? join(root, "tutor.config.ts")
    : null;

  let config: TutorConfig = {};
  if (configPath) {
    try {
      const loaded = await importTsModule(importer, pathToFileURL(configPath).href, import.meta.url) as { default?: TutorConfig };
      config = loaded.default ?? {};
    } catch (error) {
      throw new Error(`Failed to load tutor config ${configPath}: ${formatLoadError(error)}`);
    }
  }

  return {
    cwd: root,
    configPath,
    textbooksDir: resolve(root, config.textbooksDir ?? "textbooks"),
    dataDir: resolve(root, config.dataDir ?? "tutor-data"),
    title: config.title ?? "Courses",
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
  const files = new Set<string>();
  const visitedDirs = new Set<string>();

  function walk(dir: string): void {
    const canonicalDir = realpathSync(dir);
    if (visitedDirs.has(canonicalDir)) return;
    visitedDirs.add(canonicalDir);

    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = lstatSync(fullPath);
      if (stat.isSymbolicLink()) {
        const targetPath = realpathSync(fullPath);
        const targetStat = statSync(targetPath);
        if (targetStat.isDirectory()) {
          walk(targetPath);
          continue;
        }
        if (pattern.test(fullPath)) {
          files.add(fullPath);
        }
        continue;
      }
      if (stat.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (pattern.test(fullPath)) {
        files.add(fullPath);
      }
    }
  }

  walk(rootDir);
  return [...files].sort();
}

export async function loadTextbooks(cwd: string, options: { textbookId?: string } = {}): Promise<TextbookLoadResult> {
  const root = resolve(cwd);
  const cacheKey = textbookLoadCacheKey(root, options.textbookId);
  const cachedTextbooks = textbookCache.get(cacheKey);
  if (cachedTextbooks) return cachedTextbooks;

  const cached = textbookLoadPromises.get(cacheKey);
  if (cached) return cached;

  const loadPromise = loadTextbooksUncached(root, options.textbookId);
  textbookLoadPromises.set(cacheKey, loadPromise);
  try {
    const loaded = await loadPromise;
    if (textbookLoadPromises.get(cacheKey) === loadPromise) {
      textbookCache.set(cacheKey, loaded);
    }
    return loaded;
  } finally {
    if (textbookLoadPromises.get(cacheKey) === loadPromise) {
      textbookLoadPromises.delete(cacheKey);
    }
  }
}

async function loadTextbooksUncached(cwd: string, textbookId?: string): Promise<TextbookLoadResult> {
  const tsconfig = findTsconfig(cwd) ?? false;
  const importer = createTsImporter(tsconfig);
  try {
    const workspace = await loadWorkspaceWithImporter(cwd, importer);
    const textbooks: LoadedTextbook[] = [];
    const chapters: LoadedChapter[] = [];
    const issues: ValidationIssue[] = [];

    const files = discoverTextbookFiles(workspace.textbooksDir).filter((file) => (
      !textbookId || file === join(workspace.textbooksDir, textbookId, "textbook.ts") || file === join(workspace.textbooksDir, textbookId, "textbook.tsx")
    ));
    if (textbookId && files.length === 0) {
      issues.push({ textbookId, message: `Textbook not found: ${textbookId}` });
    }
    for (const file of files) {
      const directoryId = textbookDirectoryId(workspace.textbooksDir, file);
      try {
        const mod = await importTsModule(importer, pathToFileURL(file).href, import.meta.url) as { default?: unknown };
        const textbook = mod.default;
        const textbookIssues = validateTextbook(textbook, file);
        if (textbookIssues.length > 0) {
          issues.push(...textbookIssues.map((issue) => ({ ...issue, textbookId: directoryId })));
          continue;
        }
        if ((textbook as LoadedTextbook["textbook"]).id !== directoryId) {
          issues.push({
            textbookId: directoryId,
            file,
            path: "id",
            message: `Textbook id must match its directory: expected ${directoryId}`
          });
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
          textbookId: directoryId,
          file,
          message: formatLoadError(error)
        });
      }
    }

    const textbookIds = new Map<string, string>();
    for (const loaded of textbooks) {
      const previous = textbookIds.get(loaded.textbook.id);
      if (previous) {
        issues.push({
          textbookId: loaded.textbook.id,
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
          textbookId: loaded.textbookId,
          file: loaded.file,
          path: "chapters",
          message: `Duplicate chapter id in textbook ${loaded.textbookId}: ${loaded.chapter.id} also used by ${previous}`
        });
      }
      chapterIds.set(key, loaded.file);
    }

    return { textbooks, chapters, issues };
  } finally {
    await importer.unregister();
  }
}

function textbookDirectoryId(textbooksDir: string, file: string): string {
  const path = relative(textbooksDir, file);
  return path.split(sep)[0] ?? "unknown";
}

function formatLoadError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}

export function invalidateWorkspaceCaches(cwd: string): void {
  const root = resolve(cwd);
  workspaceLoadPromises.delete(root);
  workspaceCache.delete(root);
  clearTextbookLoadCache(root);
}

export function clearWorkspaceCaches(): void {
  workspaceLoadPromises.clear();
  textbookLoadPromises.clear();
  workspaceCache.clear();
  textbookCache.clear();
}

function textbookLoadCacheKey(root: string, textbookId?: string): string {
  return textbookId ? `${root}\0${textbookId}` : root;
}

function clearTextbookLoadCache(root: string): void {
  for (const key of textbookLoadPromises.keys()) {
    if (key === root || key.startsWith(`${root}\0`)) textbookLoadPromises.delete(key);
  }
  for (const key of textbookCache.keys()) {
    if (key === root || key.startsWith(`${root}\0`)) textbookCache.delete(key);
  }
}

function createTsImporter(tsconfig: false | string) {
  if (hasTsxPreload()) {
    return {
      import(specifier: string): Promise<unknown> {
        const separator = specifier.includes("?") ? "&" : "?";
        return import(`${specifier}${separator}tutor-kit-import=${importNamespaceCounter += 1}`);
      },
      async unregister(): Promise<void> {}
    };
  }
  let importer = tsImporters.get(tsconfig);
  if (!importer) {
    importer = register({
      namespace: `tutor-kit-${importNamespaceCounter += 1}`,
      tsconfig
    });
    tsImporters.set(tsconfig, importer);
  }
  return {
    import(specifier: string, parentURL: string): Promise<unknown> {
      return importer.import(specifier, parentURL);
    },
    async unregister(): Promise<void> {}
  };
}

function hasTsxPreload(): boolean {
  return process.execArgv.some((arg, index, args) => (
    arg === "tsx" ||
    arg === "tsx/esm" ||
    arg.startsWith("--import=tsx") ||
    (arg === "--import" && (args[index + 1] === "tsx" || args[index + 1] === "tsx/esm"))
  ));
}

async function importTsModule(
  importer: ReturnType<typeof createTsImporter>,
  specifier: string,
  parentURL: string
): Promise<unknown> {
  return importer.import(specifier, parentURL);
}
