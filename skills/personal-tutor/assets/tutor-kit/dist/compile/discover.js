import { existsSync, lstatSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { register } from "tsx/esm/api";
import { validateTextbook } from "../core/validation.js";
const workspaceLoadPromises = new Map();
const textbookLoadPromises = new Map();
const workspaceCache = new Map();
const textbookCache = new Map();
let importNamespaceCounter = 0;
export async function resolveWorkspace(cwd) {
    const root = resolve(cwd);
    const cachedWorkspace = workspaceCache.get(root);
    if (cachedWorkspace)
        return cachedWorkspace;
    const cached = workspaceLoadPromises.get(root);
    if (cached)
        return cached;
    const loadPromise = loadWorkspace(root);
    workspaceLoadPromises.set(root, loadPromise);
    try {
        const workspace = await loadPromise;
        workspaceCache.set(root, workspace);
        return workspace;
    }
    finally {
        workspaceLoadPromises.delete(root);
    }
}
async function loadWorkspace(root) {
    const importer = createTsImporter(findTsconfig(root) ?? false);
    try {
        return await loadWorkspaceWithImporter(root, importer);
    }
    finally {
        await importer.unregister();
    }
}
async function loadWorkspaceWithImporter(root, importer) {
    const configPath = existsSync(join(root, "tutor.config.ts"))
        ? join(root, "tutor.config.ts")
        : null;
    let config = {};
    if (configPath) {
        try {
            const loaded = await importTsModule(importer, pathToFileURL(configPath).href, import.meta.url);
            config = loaded.default ?? {};
        }
        catch (error) {
            throw new Error(`Failed to load tutor config ${configPath}: ${formatLoadError(error)}`);
        }
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
export function findTsconfig(cwd) {
    const candidate = join(cwd, "tsconfig.json");
    return existsSync(candidate) ? candidate : null;
}
export function discoverTextbookFiles(textbooksDir) {
    return discoverFiles(textbooksDir, /(^|\/)textbook\.tsx?$/);
}
function discoverFiles(rootDir, pattern) {
    if (!existsSync(rootDir))
        return [];
    const files = new Set();
    const visitedDirs = new Set();
    function walk(dir) {
        const canonicalDir = realpathSync(dir);
        if (visitedDirs.has(canonicalDir))
            return;
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
export async function loadTextbooks(cwd, options = {}) {
    const root = resolve(cwd);
    if (options.textbookId)
        return loadTextbooksUncached(root, options.textbookId);
    const cachedTextbooks = textbookCache.get(root);
    if (cachedTextbooks)
        return cachedTextbooks;
    const cached = textbookLoadPromises.get(root);
    if (cached)
        return cached;
    const loadPromise = loadTextbooksUncached(root);
    textbookLoadPromises.set(root, loadPromise);
    try {
        const loaded = await loadPromise;
        textbookCache.set(root, loaded);
        return loaded;
    }
    finally {
        textbookLoadPromises.delete(root);
    }
}
async function loadTextbooksUncached(cwd, textbookId) {
    const tsconfig = findTsconfig(cwd) ?? false;
    const importer = createTsImporter(tsconfig);
    try {
        const workspace = await loadWorkspaceWithImporter(cwd, importer);
        const textbooks = [];
        const chapters = [];
        const issues = [];
        const files = discoverTextbookFiles(workspace.textbooksDir).filter((file) => (!textbookId || file === join(workspace.textbooksDir, textbookId, "textbook.ts") || file === join(workspace.textbooksDir, textbookId, "textbook.tsx")));
        if (textbookId && files.length === 0) {
            issues.push({ message: `Textbook not found: ${textbookId}` });
        }
        for (const file of files) {
            try {
                const mod = await importTsModule(importer, pathToFileURL(file).href, import.meta.url);
                const textbook = mod.default;
                const textbookIssues = validateTextbook(textbook, file);
                if (textbookIssues.length > 0) {
                    issues.push(...textbookIssues);
                    continue;
                }
                const loadedTextbook = { file, textbook: textbook };
                textbooks.push(loadedTextbook);
                for (const chapter of loadedTextbook.textbook.chapters) {
                    chapters.push({
                        file,
                        chapter,
                        textbookId: loadedTextbook.textbook.id,
                        textbookTitle: loadedTextbook.textbook.title
                    });
                }
            }
            catch (error) {
                issues.push({
                    file,
                    message: formatLoadError(error)
                });
            }
        }
        const textbookIds = new Map();
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
        const chapterIds = new Map();
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
    finally {
        await importer.unregister();
    }
}
function formatLoadError(error) {
    if (error instanceof Error) {
        return error.stack ?? error.message;
    }
    return String(error);
}
export function invalidateWorkspaceCaches(cwd) {
    const root = resolve(cwd);
    workspaceLoadPromises.delete(root);
    textbookLoadPromises.delete(root);
    workspaceCache.delete(root);
    textbookCache.delete(root);
}
export function clearWorkspaceCaches() {
    workspaceLoadPromises.clear();
    textbookLoadPromises.clear();
    workspaceCache.clear();
    textbookCache.clear();
}
function createTsImporter(tsconfig) {
    if (hasTsxPreload()) {
        return {
            import(specifier) {
                const separator = specifier.includes("?") ? "&" : "?";
                return import(`${specifier}${separator}tutor-kit-import=${importNamespaceCounter += 1}`);
            },
            async unregister() { }
        };
    }
    return register({
        namespace: `tutor-kit-${importNamespaceCounter += 1}`,
        tsconfig
    });
}
function hasTsxPreload() {
    return process.execArgv.some((arg, index, args) => (arg === "tsx" ||
        arg === "tsx/esm" ||
        arg.startsWith("--import=tsx") ||
        (arg === "--import" && (args[index + 1] === "tsx" || args[index + 1] === "tsx/esm"))));
}
async function importTsModule(importer, specifier, parentURL) {
    return importer.import(specifier, parentURL);
}
//# sourceMappingURL=discover.js.map