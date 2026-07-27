import { resolveWorkspace } from "../compile/discover.js";
import { appendEvent, jsonStatePaths, readJsonFile, requireString, writeJsonFile } from "./shared.js";
const emptyState = () => ({
    starredTermIds: [],
    ratings: {},
    lastStudySet: "all",
    currentCardIndex: 0,
    cardOrder: [],
    currentTermId: null,
    sessionCompleted: false,
    updatedAt: null
});
export async function loadGlossaryStudyState(cwd, query) {
    const workspace = await resolveWorkspace(cwd);
    const paths = glossaryStudyPaths(workspace.cwd, workspace.dataDir, {
        textbookId: query.get("textbookId")
    });
    return { ...readState(paths.absolutePath), statePath: paths.path };
}
export async function saveGlossaryStudyState(cwd, body) {
    const workspace = await resolveWorkspace(cwd);
    const paths = glossaryStudyPaths(workspace.cwd, workspace.dataDir, body);
    const previous = readState(paths.absolutePath);
    const starredTermIds = stringList(body.starredTermIds);
    const now = new Date().toISOString();
    const next = {
        ...previous,
        starredTermIds,
        lastStudySet: glossaryStudySet(body.lastStudySet, previous.lastStudySet),
        currentCardIndex: nonNegativeInteger(body.currentCardIndex, previous.currentCardIndex),
        cardOrder: body.cardOrder === undefined ? previous.cardOrder : stringList(body.cardOrder),
        currentTermId: optionalString(body.currentTermId, previous.currentTermId),
        sessionCompleted: typeof body.sessionCompleted === "boolean" ? body.sessionCompleted : previous.sessionCompleted,
        updatedAt: now
    };
    writeJsonFile(paths.absolutePath, next);
    appendStarEvents(workspace.dataDir, requireString(body.textbookId, "textbookId"), previous.starredTermIds, starredTermIds);
    return { ...next, statePath: paths.path };
}
export async function submitGlossaryStudyRating(cwd, body) {
    const workspace = await resolveWorkspace(cwd);
    const paths = glossaryStudyPaths(workspace.cwd, workspace.dataDir, body);
    const previous = readState(paths.absolutePath);
    const termId = requireString(body.termId, "termId");
    const rating = glossaryRating(body.rating);
    const now = new Date().toISOString();
    const priorRating = previous.ratings[termId];
    const nextRating = {
        rating,
        reviewedAt: now,
        reviewCount: (priorRating?.reviewCount ?? 0) + 1,
        againCount: (priorRating?.againCount ?? 0) + (rating === "again" ? 1 : 0),
        knewItCount: (priorRating?.knewItCount ?? 0) + (rating === "knew-it" ? 1 : 0)
    };
    const next = {
        ...previous,
        ratings: { ...previous.ratings, [termId]: nextRating },
        updatedAt: now
    };
    writeJsonFile(paths.absolutePath, next);
    appendEvent(workspace.dataDir, {
        type: "glossary_card_rated",
        textbookId: requireString(body.textbookId, "textbookId"),
        termId,
        rating,
        reviewCount: nextRating.reviewCount
    });
    return { ...next, statePath: paths.path };
}
function glossaryStudyPaths(cwd, dataDir, request) {
    return jsonStatePaths(cwd, dataDir, "glossary-study-state", [[request.textbookId, "textbookId"]]);
}
function readState(path) {
    const parsed = readJsonFile(path);
    if (!parsed)
        return emptyState();
    return {
        starredTermIds: stringList(parsed.starredTermIds),
        ratings: ratingRecord(parsed.ratings),
        lastStudySet: glossaryStudySet(parsed.lastStudySet, "all"),
        currentCardIndex: nonNegativeInteger(parsed.currentCardIndex, 0),
        cardOrder: stringList(parsed.cardOrder),
        currentTermId: optionalString(parsed.currentTermId, null),
        sessionCompleted: parsed.sessionCompleted === true,
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
    };
}
function appendStarEvents(dataDir, textbookId, previous, next) {
    const previousSet = new Set(previous);
    const nextSet = new Set(next);
    const added = next.filter((termId) => !previousSet.has(termId));
    const removed = previous.filter((termId) => !nextSet.has(termId));
    if (added.length === 0 && removed.length === 0)
        return;
    appendEvent(dataDir, {
        type: "glossary_stars_updated",
        textbookId,
        added,
        removed,
        starredTermIds: next
    });
}
function ratingRecord(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return {};
    const entries = [];
    for (const [termId, rating] of Object.entries(value)) {
        if (typeof rating !== "object" || rating === null || Array.isArray(rating))
            continue;
        const record = rating;
        if (record.rating !== "again" && record.rating !== "knew-it")
            continue;
        entries.push([termId, {
                rating: record.rating,
                reviewedAt: typeof record.reviewedAt === "string" ? record.reviewedAt : "",
                reviewCount: nonNegativeInteger(record.reviewCount, 0),
                againCount: nonNegativeInteger(record.againCount, 0),
                knewItCount: nonNegativeInteger(record.knewItCount, 0)
            }]);
    }
    return Object.fromEntries(entries);
}
function stringList(value) {
    if (!Array.isArray(value))
        return [];
    const seen = new Set();
    const result = [];
    for (const entry of value) {
        if (typeof entry !== "string" || entry.trim().length === 0 || seen.has(entry))
            continue;
        seen.add(entry);
        result.push(entry);
    }
    return result;
}
function glossaryRating(value) {
    if (value === "again" || value === "knew-it")
        return value;
    throw new Error("rating must be again or knew-it");
}
function glossaryStudySet(value, fallback) {
    return value === "starred" || value === "all" ? value : fallback;
}
function optionalString(value, fallback) {
    if (value === null)
        return null;
    return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}
function nonNegativeInteger(value, fallback) {
    return Number.isInteger(value) && value >= 0 ? value : fallback;
}
