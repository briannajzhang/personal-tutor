import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdirSync, createReadStream, existsSync, realpathSync, watch, type FSWatcher } from "node:fs";
import { relative, resolve } from "node:path";
import { appAssetVersion, appCss, appJs, html } from "../ui/app.js";
import { wizardIconPath } from "../ui/brand-assets.js";
import { katexCssPath, katexFontPath, katexJsPath } from "../ui/katex-assets.js";
import { mermaidAssetPath, mermaidJsPath } from "../ui/mermaid-assets.js";
import { monacoAssetPath } from "../ui/monaco-assets.js";
import { invalidateWorkspaceCaches, loadTextbooks, resolveWorkspace, type WorkspacePaths } from "../compile/discover.js";
import { summarizeChapter, summarizeTextbook } from "../core/traversal.js";
import type { ValidationIssue } from "../core/types.js";
import { loadCodingDraft, loadCodingFeedback, runCodingProblem, saveCodingDraft } from "./coding.js";
import { loadGlossaryStudyState, saveGlossaryStudyState, submitGlossaryStudyRating } from "./glossary-study.js";
import { deleteHighlight, loadHighlights, saveHighlight } from "./highlights.js";
import { loadQuizState, saveQuizState, submitQuizAttempt } from "./quizzes.js";
import { loadReadingProgress, summarizeReadingProgress, updateReadingProgress } from "./reading-progress.js";
import { appendEvent } from "./shared.js";
import {
  collectComponentRecords,
  ComponentRegistry,
  createComponentViteServer,
  serializeChapterComponents,
  serializeTextbookComponents
} from "../components/system.js";

export interface DevServerOptions {
  cwd: string;
  port: number;
}

const maxJsonBodyBytes = 1_000_000;

export async function startDevServer(options: DevServerOptions): Promise<{ url: string; close: () => Promise<void> }> {
  const workspace = await resolveWorkspace(options.cwd);
  mkdirSync(workspace.dataDir, { recursive: true });
  const componentRegistry = new ComponentRegistry();
  const server = createServer();
  const watchers: FSWatcher[] = [];
  let vite: Awaited<ReturnType<typeof createComponentViteServer>> | undefined;

  try {
    vite = await createComponentViteServer(workspace.cwd, componentRegistry, server);
    server.on("request", (request, response) => {
      vite!.middlewares(request, response, () => {
        void handleRequest(workspace.cwd, componentRegistry, request, response).catch((error) => {
          if (response.writableEnded) return;
          const status = error instanceof RequestError ? error.status : 500;
          response.statusCode = status;
          response.setHeader("content-type", "text/plain; charset=utf-8");
          response.end(status === 500 && error instanceof Error ? error.stack : String(error));
        });
      });
    });
    await listen(server, options.port);
    watchers.push(...watchWorkspace(workspace));
  } catch (error) {
    closeWatchers(watchers);
    await vite?.close().catch(() => {});
    if (server.listening) await closeServer(server).catch(() => {});
    throw error;
  }

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : options.port;
  let closePromise: Promise<void> | undefined;

  return {
    url: `http://localhost:${port}`,
    close: () => closePromise ??= (async () => {
      closeWatchers(watchers);
      try {
        await vite.close();
      } finally {
        await closeServer(server);
      }
    })()
  };
}

async function handleRequest(
  cwd: string,
  componentRegistry: ComponentRegistry,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (request.method === "GET" && url.pathname === "/__tutor-assets/app.css") {
    sendAppAsset(response, url, "text/css; charset=utf-8", appCss);
    return;
  }

  if (request.method === "GET" && url.pathname === "/__tutor-assets/app.js") {
    sendAppAsset(response, url, "text/javascript; charset=utf-8", appJs);
    return;
  }

  const katexFontMatch = url.pathname.match(/^\/__tutor-assets\/katex\/fonts\/([^/]+)$/);
  if (request.method === "GET" && katexFontMatch) {
    sendFile(response, katexFontPath(decodeURIComponent(katexFontMatch[1] ?? "")));
    return;
  }

  if (request.method === "GET" && url.pathname === "/__tutor-assets/katex/katex.min.css") {
    sendFile(response, katexCssPath());
    return;
  }

  if (request.method === "GET" && url.pathname === "/__tutor-assets/brand/wizard-icon.png") {
    sendFile(response, wizardIconPath());
    return;
  }

  if (request.method === "GET" && url.pathname === "/__tutor-assets/katex/katex.min.js") {
    sendFile(response, katexJsPath());
    return;
  }

  if (request.method === "GET" && url.pathname === "/__tutor-assets/mermaid/mermaid.esm.min.mjs") {
    sendFile(response, mermaidJsPath());
    return;
  }

  const mermaidMatch = url.pathname.match(/^\/__tutor-assets\/mermaid\/(.+)$/);
  if (request.method === "GET" && mermaidMatch) {
    sendFile(response, mermaidAssetPath(decodeURIComponent(mermaidMatch[1] ?? "")));
    return;
  }

  const monacoMatch = url.pathname.match(/^\/__tutor-assets\/monaco\/vs\/(.+)$/);
  if (request.method === "GET" && monacoMatch) {
    sendFile(response, monacoAssetPath(decodeURIComponent(monacoMatch[1] ?? "")));
    return;
  }

  const textbookAssetMatch = url.pathname.match(/^\/__tutor-assets\/textbooks\/([^/]+)\/(.+)$/);
  if (request.method === "GET" && textbookAssetMatch) {
    const workspace = await resolveWorkspace(cwd);
    const assetPath = resolveTextbookAssetPath(
      workspace,
      decodeURIComponent(textbookAssetMatch[1] ?? ""),
      decodeURIComponent(textbookAssetMatch[2] ?? "")
    );
    if (!assetPath) {
      send(response, 404, "text/plain; charset=utf-8", "Not found");
      return;
    }
    sendFile(response, assetPath);
    return;
  }

  if (request.method === "GET" && url.pathname === "/") {
    const workspace = await resolveWorkspace(cwd);
    send(response, 200, "text/html; charset=utf-8", html(workspace.title));
    return;
  }

  if (request.method === "GET" && url.pathname === "/favicon.ico") {
    sendFile(response, wizardIconPath());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/textbooks") {
    const workspace = await resolveWorkspace(cwd);
    const loaded = await loadTextbooks(cwd);
    const entries: Array<Record<string, unknown>> = loaded.textbooks.map(({ textbook }) => {
      const summary = summarizeTextbook(textbook);
      return {
        status: "ready",
        id: textbook.id,
        title: textbook.title,
        description: textbook.description,
        tags: textbook.tags ?? [],
        chapterCount: summary.chapters,
        sectionCount: summary.sections,
        subsectionCount: summary.subsections,
        blockCount: summary.blocks,
        progress: summarizeReadingProgress(loadReadingProgress(workspace.dataDir, textbook.id), textbook)
      };
    });
    for (const [id, issue] of firstIssueByTextbook(loaded.issues)) {
      entries.push({
        status: "error",
        id,
        title: titleFromId(id),
        description: conciseIssue(issue.message),
        file: issue.file,
        chapterCount: 0
      });
    }
    entries.sort((left, right) => String(left.title).localeCompare(String(right.title)));
    sendJson(response, 200, entries);
    return;
  }

  const textbookMatch = url.pathname.match(/^\/api\/textbooks\/([^/]+)$/);
  if (request.method === "GET" && textbookMatch) {
    const id = decodeURIComponent(textbookMatch[1] ?? "");
    const loaded = await loadWithComponents(cwd, componentRegistry, { textbookId: id });
    if (loaded.issues.length > 0) {
      sendJson(response, 422, { issues: loaded.issues });
      return;
    }
    const found = loaded.textbooks.find(({ textbook }) => textbook.id === id);
    if (!found) {
      sendJson(response, 404, { error: `Textbook not found: ${id}` });
      return;
    }
    const workspace = await resolveWorkspace(cwd);
    sendJson(response, 200, {
      ...serializeTextbookComponents(cwd, componentRegistry, found.textbook),
      readingProgress: summarizeReadingProgress(loadReadingProgress(workspace.dataDir, id), found.textbook)
    });
    return;
  }

  const chapterMatch = url.pathname.match(/^\/api\/textbooks\/([^/]+)\/chapters\/([^/]+)$/);
  if (request.method === "GET" && chapterMatch) {
    const textbookId = decodeURIComponent(chapterMatch[1] ?? "");
    const chapterId = decodeURIComponent(chapterMatch[2] ?? "");
    const loaded = await loadWithComponents(cwd, componentRegistry, { textbookId });
    if (loaded.issues.length > 0) {
      sendJson(response, 422, { issues: loaded.issues });
      return;
    }
    const found = loaded.chapters.find(({ textbookId: candidateTextbookId, chapter }) => (
      candidateTextbookId === textbookId && chapter.id === chapterId
    ));
    if (!found) {
      sendJson(response, 404, { error: `Chapter not found: ${textbookId}/${chapterId}` });
      return;
    }
    const textbook = loaded.textbooks.find(({ textbook: candidate }) => candidate.id === textbookId)?.textbook;
    const chapterIndex = textbook?.chapters.findIndex((chapter) => chapter.id === chapterId) ?? -1;
    const previousChapter = chapterIndex > 0 ? textbook?.chapters[chapterIndex - 1] : undefined;
    const nextChapter = textbook && chapterIndex >= 0 ? textbook.chapters[chapterIndex + 1] : undefined;
    const summary = summarizeChapter(found.chapter);
    const workspace = await resolveWorkspace(cwd);
    const chapterCompleted = loadReadingProgress(workspace.dataDir, textbookId).completedChapterIds.includes(chapterId);
    sendJson(response, 200, {
      ...serializeChapterComponents(cwd, componentRegistry, found.chapter),
      textbookId: found.textbookId,
      textbookTitle: found.textbookTitle,
      previousChapter: previousChapter ? { id: previousChapter.id, title: previousChapter.title } : null,
      nextChapter: nextChapter ? { id: nextChapter.id, title: nextChapter.title } : null,
      sectionCount: summary.sections,
      subsectionCount: summary.subsections,
      blockCount: summary.blocks,
      chapterCompleted
    });
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/reading-progress") {
    sendJson(response, 200, await updateReadingProgress(cwd, await readJson(request)));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/events") {
    const workspace = await resolveWorkspace(cwd);
    const payload = await readJson(request);
    appendEvent(workspace.dataDir, payload);
    sendJson(response, 201, { ok: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/coding/run") {
    sendJson(response, 200, await runCodingProblem(cwd, await readJson(request)));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/coding/draft") {
    sendJson(response, 200, await loadCodingDraft(cwd, url.searchParams));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/coding/feedback") {
    sendJson(response, 200, await loadCodingFeedback(cwd, url.searchParams));
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/coding/draft") {
    sendJson(response, 200, await saveCodingDraft(cwd, await readJson(request)));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/quiz/state") {
    sendJson(response, 200, await loadQuizState(cwd, url.searchParams));
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/quiz/state") {
    sendJson(response, 200, await saveQuizState(cwd, await readJson(request)));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/quiz/attempt") {
    sendJson(response, 201, await submitQuizAttempt(cwd, await readJson(request)));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/glossary-study/state") {
    sendJson(response, 200, await loadGlossaryStudyState(cwd, url.searchParams));
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/glossary-study/state") {
    sendJson(response, 200, await saveGlossaryStudyState(cwd, await readJson(request)));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/glossary-study/rating") {
    sendJson(response, 201, await submitGlossaryStudyRating(cwd, await readJson(request)));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/highlights") {
    sendJson(response, 200, await loadHighlights(cwd, url.searchParams));
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/highlights") {
    sendJson(response, 200, await saveHighlight(cwd, await readJson(request)));
    return;
  }

  if (request.method === "DELETE" && url.pathname === "/api/highlights") {
    sendJson(response, 200, await deleteHighlight(cwd, await readJson(request)));
    return;
  }

  if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
    const workspace = await resolveWorkspace(cwd);
    const status = isKnownAppPath(url.pathname) ? 200 : 404;
    send(response, status, "text/html; charset=utf-8", html(workspace.title));
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

async function loadWithComponents(
  cwd: string,
  registry: ComponentRegistry,
  options: { textbookId?: string } = {}
) {
  const loaded = await loadTextbooks(cwd, options);
  if (loaded.issues.length === 0) {
    try {
      const records = collectComponentRecords(cwd, loaded.textbooks);
      if (options.textbookId) registry.merge(records);
      else registry.replace(records);
    } catch (error) {
      return {
        ...loaded,
        issues: [...loaded.issues, {
          textbookId: options.textbookId,
          message: error instanceof Error ? error.message : String(error)
        }]
      };
    }
  }
  return loaded;
}

function firstIssueByTextbook(issues: ValidationIssue[]): Map<string, ValidationIssue> {
  const grouped = new Map<string, ValidationIssue>();
  for (const issue of issues) {
    const id = issue.textbookId ?? "unknown";
    if (!grouped.has(id)) grouped.set(id, issue);
  }
  return grouped;
}

function titleFromId(id: string): string {
  return id.split("-").filter(Boolean).map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ") || "Unknown textbook";
}

function conciseIssue(message: string): string {
  return message.split("\n").find((line) => line.trim().length > 0)?.trim() ?? "This textbook could not be loaded.";
}

function isKnownAppPath(pathname: string): boolean {
  const parts = decodePathParts(pathname);
  if (!parts) return false;
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "textbooks")) return true;
  if (parts.length === 2 && parts[0] === "textbooks" && Boolean(parts[1])) return true;
  if (parts.length === 3 && parts[0] === "textbooks" && Boolean(parts[1]) && parts[2] === "glossary") return true;
  if (parts.length === 4 && parts[0] === "textbooks" && Boolean(parts[1]) && parts[2] === "glossary" && parts[3] === "study") return true;
  if (parts.length === 4 && parts[0] === "textbooks" && Boolean(parts[1]) && parts[2] === "chapters" && Boolean(parts[3])) return true;
  return false;
}

function decodePathParts(pathname: string): string[] | null {
  try {
    return pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return null;
  }
}

function send(response: ServerResponse, status: number, contentType: string, body: string): void {
  response.statusCode = status;
  response.setHeader("content-type", contentType);
  response.end(body);
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  send(response, status, "application/json; charset=utf-8", JSON.stringify(body));
}

function sendFile(response: ServerResponse, path: string): void {
  response.statusCode = 200;
  response.setHeader("content-type", contentType(path));
  createReadStream(path)
    .on("error", () => {
      if (!response.headersSent) {
        response.statusCode = 404;
        response.setHeader("content-type", "text/plain; charset=utf-8");
      }
      response.end("Not found");
    })
    .pipe(response);
}

function sendAppAsset(response: ServerResponse, url: URL, contentType: string, body: string): void {
  response.setHeader(
    "cache-control",
    url.searchParams.get("v") === appAssetVersion
      ? "public, max-age=31536000, immutable"
      : "no-cache"
  );
  send(response, 200, contentType, body);
}

function resolveTextbookAssetPath(workspace: WorkspacePaths, textbookId: string, assetPath: string): string | null {
  if (!isSafePathPart(textbookId)) return null;
  if (!assetPath.startsWith("assets/")) return null;
  if (assetPath.includes("\\") || assetPath.includes("\0")) return null;
  if (assetPath.split("/").some((part) => !isSafePathPart(part))) return null;

  const textbookRoot = resolve(workspace.textbooksDir, textbookId);
  const target = resolve(textbookRoot, assetPath);
  if (!isInside(textbookRoot, target)) return null;

  if (existsSync(target) && existsSync(textbookRoot)) {
    const realRoot = realpathSync(textbookRoot);
    const realTarget = realpathSync(target);
    if (!isInside(realRoot, realTarget)) return null;
  }

  return target;
}

function isSafePathPart(value: string): boolean {
  return value !== "" && value !== "." && value !== ".." && !value.includes("/") && !value.includes("\\") && !value.includes("\0");
}

function isInside(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === "" || (!path.startsWith("..") && !path.startsWith("/") && !path.match(/^[a-zA-Z]:/));
}

function contentType(path: string): string {
  const lowerPath = path.toLowerCase();
  if (lowerPath.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (lowerPath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (lowerPath.endsWith(".css")) return "text/css; charset=utf-8";
  if (lowerPath.endsWith(".json")) return "application/json; charset=utf-8";
  if (lowerPath.endsWith(".png")) return "image/png";
  if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) return "image/jpeg";
  if (lowerPath.endsWith(".gif")) return "image/gif";
  if (lowerPath.endsWith(".webp")) return "image/webp";
  if (lowerPath.endsWith(".svg")) return "image/svg+xml";
  if (lowerPath.endsWith(".avif")) return "image/avif";
  if (lowerPath.endsWith(".woff2")) return "font/woff2";
  if (lowerPath.endsWith(".woff")) return "font/woff";
  if (lowerPath.endsWith(".ttf")) return "font/ttf";
  return "application/octet-stream";
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > maxJsonBodyBytes) {
    request.resume();
    throw new RequestError(413, `JSON body exceeds ${maxJsonBodyBytes} bytes`);
  }
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxJsonBodyBytes) {
      throw new RequestError(413, `JSON body exceeds ${maxJsonBodyBytes} bytes`);
    }
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.concat(chunks, totalBytes).toString("utf8"));
  } catch {
    throw new RequestError(400, "Request body must contain valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new RequestError(400, "Request body must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

class RequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

function listen(server: ReturnType<typeof createServer>, port: number): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const onError = (error: Error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolvePromise();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, "127.0.0.1");
  });
}

function closeServer(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    server.close((error) => error ? reject(error) : resolvePromise());
    server.closeIdleConnections?.();
    server.closeAllConnections?.();
  });
}

function watchWorkspace(workspace: WorkspacePaths): FSWatcher[] {
  const watchers: FSWatcher[] = [];
  const invalidate = () => invalidateWorkspaceCaches(workspace.cwd);

  watchers.push(...watchTarget(workspace.textbooksDir, { recursive: true }, invalidate));

  if (workspace.configPath) {
    watchers.push(...watchTarget(workspace.configPath, undefined, invalidate));
  }

  return watchers;
}

function watchTarget(
  path: string,
  options: { recursive?: boolean } | undefined,
  invalidate: () => void
): FSWatcher[] {
  try {
    return [watchWithErrorHandler(path, options, invalidate)];
  } catch (error) {
    if (!options?.recursive) return [];
    try {
      return [watchWithErrorHandler(path, undefined, invalidate)];
    } catch {
      return [];
    }
  }
}

function watchWithErrorHandler(
  path: string,
  options: { recursive?: boolean } | undefined,
  invalidate: () => void
): FSWatcher {
  const watcher = options ? watch(path, options, invalidate) : watch(path, invalidate);
  watcher.on("error", () => {
    try {
      watcher.close();
    } catch {
      // Ignore unavailable file watching; requests still reload workspace state.
    }
  });
  return watcher;
}

function closeWatchers(watchers: FSWatcher[]): void {
  for (const watcher of watchers) {
    try {
      watcher.close();
    } catch {
      // Ignore watcher shutdown errors during server close.
    }
  }
}
