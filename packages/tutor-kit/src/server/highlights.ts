import { resolveWorkspace } from "../compile/discover.js";
import {
  appendEvent,
  jsonStatePaths,
  readJsonFile,
  requireNonNegativeInteger,
  requireString,
  writeJsonFile
} from "./shared.js";

type HighlightColor = "yellow";
type HighlightStatus = "attached" | "changed" | "unresolved";

interface HighlightRequest {
  id?: unknown;
  textbookId?: unknown;
  chapterId?: unknown;
  sectionId?: unknown;
  subsectionId?: unknown;
  blockId?: unknown;
  quote?: unknown;
  startOffset?: unknown;
  endOffset?: unknown;
  prefix?: unknown;
  suffix?: unknown;
  color?: unknown;
  status?: unknown;
  note?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Highlight {
  id: string;
  textbookId: string;
  chapterId: string;
  sectionId: string;
  subsectionId?: string;
  blockId: string;
  quote: string;
  startOffset: number;
  endOffset: number;
  prefix: string;
  suffix: string;
  color: HighlightColor;
  status: HighlightStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface HighlightState {
  highlights: Highlight[];
  updatedAt: string | null;
}

const emptyState = (): HighlightState => ({ highlights: [], updatedAt: null });

export async function loadHighlights(cwd: string, query: URLSearchParams): Promise<HighlightState & { statePath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const paths = highlightPaths(workspace.cwd, workspace.dataDir, {
    textbookId: query.get("textbookId"),
    chapterId: query.get("chapterId")
  });
  return { ...readState(paths.absolutePath), statePath: paths.path };
}

export async function saveHighlight(cwd: string, body: HighlightRequest): Promise<HighlightState & { statePath: string; highlight: Highlight }> {
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
  writeJsonFile(paths.absolutePath, next);
  appendHighlightEvents(workspace.dataDir, previousHighlight, highlight);
  return { ...next, statePath: paths.path, highlight };
}

export async function deleteHighlight(cwd: string, body: HighlightRequest): Promise<HighlightState & { statePath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const paths = highlightPaths(workspace.cwd, workspace.dataDir, body);
  const previous = readState(paths.absolutePath);
  const id = requireString(body.id, "id");
  const removed = previous.highlights.find((candidate) => candidate.id === id);
  const next = {
    highlights: previous.highlights.filter((candidate) => candidate.id !== id),
    updatedAt: new Date().toISOString()
  };
  writeJsonFile(paths.absolutePath, next);
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

function highlightFromRequest(body: HighlightRequest, now: string): Highlight {
  const startOffset = requireNonNegativeInteger(body.startOffset, "startOffset");
  const endOffset = requireNonNegativeInteger(body.endOffset, "endOffset");
  if (endOffset <= startOffset) throw new Error("endOffset must be greater than startOffset");
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

function appendHighlightEvents(dataDir: string, previous: Highlight | undefined, next: Highlight): void {
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

function highlightPaths(cwd: string, dataDir: string, request: Pick<HighlightRequest, "textbookId" | "chapterId">): { absolutePath: string; path: string } {
  return jsonStatePaths(cwd, dataDir, "highlights", [
    [request.textbookId, "textbookId"],
    [request.chapterId, "chapterId"]
  ]);
}

function readState(path: string): HighlightState {
  const parsed = readJsonFile<Partial<HighlightState>>(path);
  if (!parsed) return emptyState();
  return {
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights.map(highlightFromStored).filter(Boolean) as Highlight[] : [],
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
  };
}

function highlightFromStored(value: unknown): Highlight | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  try {
    return highlightFromRequest(value as HighlightRequest, typeof (value as Highlight).updatedAt === "string" ? (value as Highlight).updatedAt : new Date().toISOString());
  } catch {
    return null;
  }
}

function highlightColor(value: unknown): HighlightColor {
  if (value === "yellow" || value === undefined) return "yellow";
  throw new Error("color must be yellow");
}

function highlightStatus(value: unknown): HighlightStatus {
  if (value === "attached" || value === "changed" || value === "unresolved") return value;
  throw new Error("status must be attached, changed, or unresolved");
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}
