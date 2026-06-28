import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { resolveWorkspace } from "../compile/discover.js";
const emptyState = () => ({ highlights: [], updatedAt: null });
export async function loadHighlights(cwd, query) {
    const workspace = await resolveWorkspace(cwd);
    const paths = highlightPaths(workspace.cwd, workspace.dataDir, {
        textbookId: query.get("textbookId"),
        chapterId: query.get("chapterId")
    });
    return { ...readState(paths.absolutePath), statePath: paths.path };
}
export async function saveHighlight(cwd, body) {
    const workspace = await resolveWorkspace(cwd);
    const paths = highlightPaths(workspace.cwd, workspace.dataDir, body);
    const previous = readState(paths.absolutePath);
    const now = new Date().toISOString();
    const highlight = highlightFromRequest(body, now);
    const previousHighlight = previous.highlights.find((candidate) => candidate.id === highlight.id);
    const highlights = previousHighlight
        ? previous.highlights.map((candidate) => candidate.id === highlight.id ? highlight : candidate)
        : [...previous.highlights, highlight];
    const next = { highlights, updatedAt: now };
    writeState(paths.absolutePath, next);
    appendHighlightEvents(workspace.dataDir, previousHighlight, highlight);
    return { ...next, statePath: paths.path, highlight };
}
export async function deleteHighlight(cwd, body) {
    const workspace = await resolveWorkspace(cwd);
    const paths = highlightPaths(workspace.cwd, workspace.dataDir, body);
    const previous = readState(paths.absolutePath);
    const id = requireString(body.id, "id");
    const removed = previous.highlights.find((candidate) => candidate.id === id);
    const next = {
        highlights: previous.highlights.filter((candidate) => candidate.id !== id),
        updatedAt: new Date().toISOString()
    };
    writeState(paths.absolutePath, next);
    if (removed) {
        appendEvent(workspace.dataDir, {
            type: "highlight_deleted",
            textbookId: removed.textbookId,
            chapterId: removed.chapterId,
            blockId: removed.blockId,
            highlightId: removed.id,
            status: removed.status
        });
    }
    return { ...next, statePath: paths.path };
}
function highlightFromRequest(body, now) {
    const startOffset = requireNonNegativeInteger(body.startOffset, "startOffset");
    const endOffset = requireNonNegativeInteger(body.endOffset, "endOffset");
    if (endOffset <= startOffset)
        throw new Error("endOffset must be greater than startOffset");
    const createdAt = typeof body.createdAt === "string" && body.createdAt.trim().length > 0 ? body.createdAt : now;
    const note = optionalString(body.note);
    return {
        id: requireString(body.id, "id"),
        textbookId: requireString(body.textbookId, "textbookId"),
        chapterId: requireString(body.chapterId, "chapterId"),
        sectionId: requireString(body.sectionId, "sectionId"),
        subsectionId: optionalString(body.subsectionId),
        blockId: requireString(body.blockId, "blockId"),
        quote: requireString(body.quote, "quote"),
        startOffset,
        endOffset,
        prefix: stringValue(body.prefix),
        suffix: stringValue(body.suffix),
        color: highlightColor(body.color),
        status: highlightStatus(body.status),
        ...(note ? { note } : {}),
        createdAt,
        updatedAt: now
    };
}
function appendHighlightEvents(dataDir, previous, next) {
    if (!previous) {
        appendEvent(dataDir, {
            type: "highlight_created",
            textbookId: next.textbookId,
            chapterId: next.chapterId,
            blockId: next.blockId,
            highlightId: next.id,
            status: next.status
        });
        return;
    }
    if (previous.status !== next.status) {
        appendEvent(dataDir, {
            type: "highlight_status_changed",
            textbookId: next.textbookId,
            chapterId: next.chapterId,
            blockId: next.blockId,
            highlightId: next.id,
            previousStatus: previous.status,
            status: next.status
        });
    }
}
function highlightPaths(cwd, dataDir, request) {
    const absolutePath = join(dataDir, "highlights", safeSegment(requireString(request.textbookId, "textbookId")), `${safeSegment(requireString(request.chapterId, "chapterId"))}.json`);
    return { absolutePath, path: relative(cwd, absolutePath).replaceAll("\\", "/") };
}
function readState(path) {
    if (!existsSync(path))
        return emptyState();
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return {
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights.map(highlightFromStored).filter(Boolean) : [],
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
    };
}
function highlightFromStored(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return null;
    try {
        return highlightFromRequest(value, typeof value.updatedAt === "string" ? value.updatedAt : new Date().toISOString());
    }
    catch {
        return null;
    }
}
function writeState(path, state) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`);
}
function highlightColor(value) {
    if (value === "yellow" || value === undefined)
        return "yellow";
    throw new Error("color must be yellow");
}
function highlightStatus(value) {
    if (value === "attached" || value === "changed" || value === "unresolved")
        return value;
    throw new Error("status must be attached, changed, or unresolved");
}
function stringValue(value) {
    return typeof value === "string" ? value : "";
}
function optionalString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
function requireString(value, label) {
    if (typeof value !== "string" || value.trim().length === 0)
        throw new Error(`${label} is required`);
    return value;
}
function requireNonNegativeInteger(value, label) {
    if (!Number.isInteger(value) || value < 0)
        throw new Error(`${label} must be a non-negative integer`);
    return value;
}
function safeSegment(value) {
    return value.replace(/[^a-zA-Z0-9_.-]+/g, "_");
}
function appendEvent(dataDir, event) {
    mkdirSync(dataDir, { recursive: true });
    appendFileSync(join(dataDir, "events.jsonl"), `${JSON.stringify({ ...event, createdAt: new Date().toISOString() })}\n`);
}
//# sourceMappingURL=highlights.js.map