import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { tsImport } from "tsx/esm/api";
import { validateTextbook } from "../core/validation.js";
export async function resolveWorkspace(cwd) {
    const root = resolve(cwd);
    const configPath = existsSync(join(root, "tutor.config.ts"))
        ? join(root, "tutor.config.ts")
        : null;
    let config = {};
    if (configPath) {
        const loaded = await tsImport(pathToFileURL(configPath).href, {
            parentURL: import.meta.url,
            tsconfig: findTsconfig(root) ?? false
        });
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
    const files = [];
    function walk(dir) {
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
export async function loadTextbooks(cwd) {
    const workspace = await resolveWorkspace(cwd);
    const tsconfig = findTsconfig(workspace.cwd) ?? false;
    const textbooks = [];
    const chapters = [];
    const issues = [];
    for (const file of discoverTextbookFiles(workspace.textbooksDir)) {
        try {
            const mod = await tsImport(pathToFileURL(file).href, {
                parentURL: import.meta.url,
                tsconfig
            });
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
                message: error instanceof Error ? error.message : String(error)
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
//# sourceMappingURL=discover.js.map