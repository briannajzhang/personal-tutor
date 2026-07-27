import { resolveWorkspace } from "../compile/discover.js";
import {
  appendEvent,
  jsonStatePaths,
  readJsonFile,
  requireString,
  writeJsonFile
} from "./shared.js";

type GlossaryRatingValue = "again" | "knew-it";
type GlossaryStudySet = "all" | "starred";

interface GlossaryStudyStateRequest {
  textbookId?: unknown;
  starredTermIds?: unknown;
  lastStudySet?: unknown;
  currentCardIndex?: unknown;
  cardOrder?: unknown;
  currentTermId?: unknown;
  sessionCompleted?: unknown;
}

interface GlossaryStudyRatingRequest {
  textbookId?: unknown;
  termId?: unknown;
  rating?: unknown;
}

interface GlossaryTermRating {
  rating: GlossaryRatingValue;
  reviewedAt: string;
  reviewCount: number;
  againCount: number;
  knewItCount: number;
}

interface GlossaryStudyState {
  starredTermIds: string[];
  ratings: Record<string, GlossaryTermRating>;
  lastStudySet: GlossaryStudySet;
  currentCardIndex: number;
  cardOrder: string[];
  currentTermId: string | null;
  sessionCompleted: boolean;
  updatedAt: string | null;
}

const emptyState = (): GlossaryStudyState => ({
  starredTermIds: [],
  ratings: {},
  lastStudySet: "all",
  currentCardIndex: 0,
  cardOrder: [],
  currentTermId: null,
  sessionCompleted: false,
  updatedAt: null
});

export async function loadGlossaryStudyState(cwd: string, query: URLSearchParams): Promise<GlossaryStudyState & { statePath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const paths = glossaryStudyPaths(workspace.cwd, workspace.dataDir, {
    textbookId: query.get("textbookId")
  });
  return { ...readState(paths.absolutePath), statePath: paths.path };
}

export async function saveGlossaryStudyState(cwd: string, body: GlossaryStudyStateRequest): Promise<GlossaryStudyState & { statePath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const paths = glossaryStudyPaths(workspace.cwd, workspace.dataDir, body);
  const previous = readState(paths.absolutePath);
  const starredTermIds = stringList(body.starredTermIds);
  const now = new Date().toISOString();
  const next: GlossaryStudyState = {
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

export async function submitGlossaryStudyRating(cwd: string, body: GlossaryStudyRatingRequest): Promise<GlossaryStudyState & { statePath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const paths = glossaryStudyPaths(workspace.cwd, workspace.dataDir, body);
  const previous = readState(paths.absolutePath);
  const termId = requireString(body.termId, "termId");
  const rating = glossaryRating(body.rating);
  const now = new Date().toISOString();
  const priorRating = previous.ratings[termId];
  const nextRating: GlossaryTermRating = {
    rating,
    reviewedAt: now,
    reviewCount: (priorRating?.reviewCount ?? 0) + 1,
    againCount: (priorRating?.againCount ?? 0) + (rating === "again" ? 1 : 0),
    knewItCount: (priorRating?.knewItCount ?? 0) + (rating === "knew-it" ? 1 : 0)
  };
  const next: GlossaryStudyState = {
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

function glossaryStudyPaths(cwd: string, dataDir: string, request: GlossaryStudyStateRequest | GlossaryStudyRatingRequest): { absolutePath: string; path: string } {
  return jsonStatePaths(cwd, dataDir, "glossary-study-state", [[request.textbookId, "textbookId"]]);
}

function readState(path: string): GlossaryStudyState {
  const parsed = readJsonFile<Partial<GlossaryStudyState>>(path);
  if (!parsed) return emptyState();
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

function appendStarEvents(dataDir: string, textbookId: string, previous: string[], next: string[]): void {
  const previousSet = new Set(previous);
  const nextSet = new Set(next);
  const added = next.filter((termId) => !previousSet.has(termId));
  const removed = previous.filter((termId) => !nextSet.has(termId));
  if (added.length === 0 && removed.length === 0) return;
  appendEvent(dataDir, {
    type: "glossary_stars_updated",
    textbookId,
    added,
    removed,
    starredTermIds: next
  });
}

function ratingRecord(value: unknown): Record<string, GlossaryTermRating> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const entries: Array<[string, GlossaryTermRating]> = [];
  for (const [termId, rating] of Object.entries(value)) {
    if (typeof rating !== "object" || rating === null || Array.isArray(rating)) continue;
    const record = rating as Record<string, unknown>;
    if (record.rating !== "again" && record.rating !== "knew-it") continue;
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

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string" || entry.trim().length === 0 || seen.has(entry)) continue;
    seen.add(entry);
    result.push(entry);
  }
  return result;
}

function glossaryRating(value: unknown): GlossaryRatingValue {
  if (value === "again" || value === "knew-it") return value;
  throw new Error("rating must be again or knew-it");
}

function glossaryStudySet(value: unknown, fallback: GlossaryStudySet): GlossaryStudySet {
  return value === "starred" || value === "all" ? value : fallback;
}

function optionalString(value: unknown, fallback: string | null): string | null {
  if (value === null) return null;
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function nonNegativeInteger(value: unknown, fallback: number): number {
  return Number.isInteger(value) && (value as number) >= 0 ? value as number : fallback;
}
