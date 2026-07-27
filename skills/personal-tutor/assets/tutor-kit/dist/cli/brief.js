import { existsSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { loadTextbooks, resolveWorkspace } from "../compile/discover.js";
import { summarizeProgress } from "./progress.js";
const authoringFileNames = [
    "course.md",
    "prompt.md",
    "curriculum-map.md",
    "chapter-specs.md",
    "materials-index.md",
    "source-notes.md",
    "review-notes.md",
    "compile-result.md"
];
export async function createWorkspaceBrief(cwd, options = {}) {
    const workspace = await resolveWorkspace(cwd);
    const loaded = await loadTextbooks(cwd, options);
    const memoryPath = join(workspace.cwd, "memory.md");
    return {
        workspace: workspace.cwd,
        title: workspace.title,
        memoryFile: existsSync(memoryPath) && statSync(memoryPath).isFile()
            ? relative(workspace.cwd, memoryPath).replaceAll("\\", "/")
            : null,
        textbooks: loaded.textbooks.map(({ file, textbook }) => {
            const root = dirname(file);
            return {
                id: textbook.id,
                title: textbook.title,
                file: relative(workspace.cwd, file).replaceAll("\\", "/"),
                chapters: textbook.chapters.map((chapter) => ({
                    id: chapter.id,
                    title: chapter.title,
                    role: chapter.role ?? "instruction"
                })),
                authoringFiles: authoringFileNames
                    .map((name) => join(root, name))
                    .filter((path) => existsSync(path) && statSync(path).size > 0)
                    .map((path) => relative(workspace.cwd, path).replaceAll("\\", "/"))
            };
        }),
        issues: loaded.issues.map((issue) => issue.message),
        progress: await summarizeProgress(cwd, options)
    };
}
export function formatWorkspaceBrief(brief) {
    const lines = [
        "Tutor brief",
        `workspace: ${brief.workspace}`,
        `title: ${brief.title}`,
        `learner memory: ${brief.memoryFile ?? "missing"}`
    ];
    if (brief.textbooks.length === 0)
        lines.push("textbooks: none");
    for (const textbook of brief.textbooks) {
        lines.push(`textbook ${textbook.id}: ${textbook.title}`);
        lines.push(`  source: ${textbook.file}`);
        lines.push(`  chapters: ${textbook.chapters.length === 0 ? "none" : textbook.chapters.map(({ id, title }) => `${id} (${title})`).join(", ")}`);
        lines.push(`  authoring: ${textbook.authoringFiles.length === 0 ? "none" : textbook.authoringFiles.join(", ")}`);
    }
    if (brief.issues.length > 0)
        lines.push(...brief.issues.map((issue) => `issue: ${singleLine(issue)}`));
    lines.push(`learner activity: ${brief.progress.eventCount} events; last ${brief.progress.lastActivity ?? "none"}`);
    if (brief.progress.weakTags.length > 0) {
        lines.push(`weak tags: ${brief.progress.weakTags.map(({ tag, misses }) => `${tag} (${misses})`).join(", ")}`);
    }
    lines.push(`suggested next move: ${brief.progress.nextMove}`);
    return lines.join("\n");
}
function singleLine(value) {
    return value.replace(/\s+/g, " ").trim();
}
