import { join } from "node:path";
import { loadTextbooks, resolveWorkspace } from "../compile/discover.js";
import { appendEvent, readJsonFile, requireString, writeJsonFile } from "./shared.js";
export function loadReadingProgress(dataDir, textbookId) {
    const path = readingProgressPath(dataDir, textbookId);
    const parsed = readJsonFile(path);
    if (!parsed)
        return emptyReadingProgress();
    return {
        lastChapterId: optionalString(parsed.lastChapterId),
        lastHeadingId: optionalString(parsed.lastHeadingId),
        visitedChapterIds: stringList(parsed.visitedChapterIds),
        completedChapterIds: stringList(parsed.completedChapterIds)
    };
}
export function summarizeReadingProgress(state, textbook) {
    const chapterIds = new Set(textbook.chapters.map((chapter) => chapter.id));
    const visited = state.visitedChapterIds.filter((id) => chapterIds.has(id));
    const completed = state.completedChapterIds.filter((id) => chapterIds.has(id));
    const last = textbook.chapters.find((chapter) => chapter.id === state.lastChapterId) ?? null;
    const firstIncomplete = textbook.chapters.find((chapter) => !completed.includes(chapter.id)) ?? null;
    const continueChapter = last && !completed.includes(last.id) ? last : firstIncomplete;
    const total = textbook.chapters.length;
    return {
        visitedChapters: visited.length,
        completedChapters: completed.length,
        totalChapters: total,
        percent: total === 0 ? 0 : Math.round((completed.length / total) * 100),
        lastChapter: last ? {
            id: last.id,
            title: last.title,
            headingId: state.lastHeadingId
        } : null,
        continueChapter: continueChapter ? {
            id: continueChapter.id,
            title: continueChapter.title,
            headingId: continueChapter.id === last?.id ? state.lastHeadingId : null
        } : null,
        completedChapterIds: completed
    };
}
export async function updateReadingProgress(cwd, request) {
    const textbookId = strictSegment(requireString(request.textbookId, "textbookId"), "textbookId");
    const chapterId = strictSegment(requireString(request.chapterId, "chapterId"), "chapterId");
    const action = readingAction(request.action);
    const loaded = await loadTextbooks(cwd, { textbookId });
    if (loaded.issues.length > 0)
        throw new Error(loaded.issues.map((issue) => issue.message).join("\n"));
    const textbook = loaded.textbooks[0]?.textbook;
    if (!textbook)
        throw new Error(`Textbook not found: ${textbookId}`);
    const chapter = textbook.chapters.find((candidate) => candidate.id === chapterId);
    if (!chapter)
        throw new Error(`Chapter not found: ${textbookId}/${chapterId}`);
    const headingId = optionalString(request.headingId);
    if (headingId && !chapterHeadingIds(chapter).has(headingId)) {
        throw new Error(`Heading not found: ${textbookId}/${chapterId}#${headingId}`);
    }
    const workspace = await resolveWorkspace(cwd);
    const state = loadReadingProgress(workspace.dataDir, textbookId);
    const visited = new Set(state.visitedChapterIds);
    const completed = new Set(state.completedChapterIds);
    const wasVisited = visited.has(chapterId);
    const wasCompleted = completed.has(chapterId);
    visited.add(chapterId);
    if (action === "complete")
        completed.add(chapterId);
    if (action === "reopen")
        completed.delete(chapterId);
    const next = {
        lastChapterId: chapterId,
        lastHeadingId: headingId ?? (state.lastChapterId === chapterId ? state.lastHeadingId : null),
        visitedChapterIds: textbook.chapters.map(({ id }) => id).filter((id) => visited.has(id)),
        completedChapterIds: textbook.chapters.map(({ id }) => id).filter((id) => completed.has(id))
    };
    if (JSON.stringify(next) !== JSON.stringify(state)) {
        writeJsonFile(readingProgressPath(workspace.dataDir, textbookId), next);
    }
    if (!wasVisited) {
        appendEvent(workspace.dataDir, { type: "chapter_visited", textbookId, chapterId });
    }
    if (action === "complete" && !wasCompleted) {
        appendEvent(workspace.dataDir, { type: "chapter_completed", textbookId, chapterId });
    }
    if (action === "reopen" && wasCompleted) {
        appendEvent(workspace.dataDir, { type: "chapter_reopened", textbookId, chapterId });
    }
    return { summary: summarizeReadingProgress(next, textbook) };
}
function emptyReadingProgress() {
    return {
        lastChapterId: null,
        lastHeadingId: null,
        visitedChapterIds: [],
        completedChapterIds: []
    };
}
function readingProgressPath(dataDir, textbookId) {
    return join(dataDir, "reading-progress", `${strictSegment(textbookId, "textbookId")}.json`);
}
function strictSegment(value, label) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(value)) {
        throw new Error(`${label} is invalid`);
    }
    return value;
}
function stringList(value) {
    if (!Array.isArray(value))
        return [];
    return [...new Set(value.filter((entry) => typeof entry === "string" && entry.length > 0))];
}
function optionalString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function readingAction(value) {
    if (value === "visit" || value === "complete" || value === "reopen")
        return value;
    throw new Error("action must be visit, complete, or reopen");
}
function chapterHeadingIds(chapter) {
    return new Set(chapter.sections.flatMap((section) => [
        section.id,
        ...section.subsections.map((subsection) => subsection.id)
    ]));
}
//# sourceMappingURL=reading-progress.js.map