import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdirSync, appendFileSync, createReadStream, watch, type FSWatcher } from "node:fs";
import { join } from "node:path";
import { html } from "../ui/app.js";
import { katexCssPath, katexFontPath, katexJsPath } from "../ui/katex-assets.js";
import { monacoAssetPath } from "../ui/monaco-assets.js";
import { invalidateWorkspaceCaches, loadTextbooks, resolveWorkspace, type WorkspacePaths } from "../compile/discover.js";
import { summarizeChapter, summarizeTextbook } from "../core/validation.js";
import { loadCodingDraft, loadCodingFeedback, runCodingProblem, saveCodingDraft } from "./coding.js";
import { loadQuizState, saveQuizState, submitQuizAttempt } from "./quizzes.js";

export interface DevServerOptions {
  cwd: string;
  port: number;
}

export async function startDevServer(options: DevServerOptions): Promise<{ url: string; close: () => Promise<void> }> {
  const workspace = await resolveWorkspace(options.cwd);
  mkdirSync(workspace.dataDir, { recursive: true });
  const watchers = watchWorkspace(workspace);

  const server = createServer(async (request, response) => {
    try {
      await handleRequest(workspace.cwd, request, response);
    } catch (error) {
      response.statusCode = 500;
      response.setHeader("content-type", "text/plain; charset=utf-8");
      response.end(error instanceof Error ? error.stack : String(error));
    }
  });

  await new Promise<void>((resolve) => server.listen(options.port, resolve));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : options.port;

  return {
    url: `http://localhost:${port}`,
    close: () => new Promise((resolve, reject) => {
      closeWatchers(watchers);
      server.close((error) => error ? reject(error) : resolve());
      server.closeIdleConnections?.();
      server.closeAllConnections?.();
    })
  };
}

async function handleRequest(cwd: string, request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", "http://localhost");

  const katexFontMatch = url.pathname.match(/^\/__tutor-assets\/katex\/fonts\/([^/]+)$/);
  if (request.method === "GET" && katexFontMatch) {
    sendFile(response, katexFontPath(decodeURIComponent(katexFontMatch[1] ?? "")));
    return;
  }

  if (request.method === "GET" && url.pathname === "/__tutor-assets/katex/katex.min.css") {
    sendFile(response, katexCssPath());
    return;
  }

  if (request.method === "GET" && url.pathname === "/__tutor-assets/katex/katex.min.js") {
    sendFile(response, katexJsPath());
    return;
  }

  const monacoMatch = url.pathname.match(/^\/__tutor-assets\/monaco\/vs\/(.+)$/);
  if (request.method === "GET" && monacoMatch) {
    sendFile(response, monacoAssetPath(decodeURIComponent(monacoMatch[1] ?? "")));
    return;
  }

  if (request.method === "GET" && url.pathname === "/") {
    const workspace = await resolveWorkspace(cwd);
    send(response, 200, "text/html; charset=utf-8", html(workspace.title));
    return;
  }

  if (request.method === "GET" && url.pathname === "/favicon.ico") {
    response.statusCode = 204;
    response.setHeader("connection", "close");
    response.end();
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/textbooks") {
    const loaded = await loadTextbooks(cwd);
    if (loaded.issues.length > 0) {
      sendJson(response, 422, { issues: loaded.issues });
      return;
    }
    sendJson(response, 200, loaded.textbooks.map(({ textbook }) => {
      const summary = summarizeTextbook(textbook);
      return {
        id: textbook.id,
        title: textbook.title,
        description: textbook.description,
        tags: textbook.tags ?? [],
        chapterCount: summary.chapters,
        sectionCount: summary.sections,
        subsectionCount: summary.subsections,
        blockCount: summary.blocks
      };
    }));
    return;
  }

  const textbookMatch = url.pathname.match(/^\/api\/textbooks\/([^/]+)$/);
  if (request.method === "GET" && textbookMatch) {
    const id = decodeURIComponent(textbookMatch[1] ?? "");
    const loaded = await loadTextbooks(cwd);
    if (loaded.issues.length > 0) {
      sendJson(response, 422, { issues: loaded.issues });
      return;
    }
    const found = loaded.textbooks.find(({ textbook }) => textbook.id === id);
    if (!found) {
      sendJson(response, 404, { error: `Textbook not found: ${id}` });
      return;
    }
    sendJson(response, 200, found.textbook);
    return;
  }

  const chapterMatch = url.pathname.match(/^\/api\/textbooks\/([^/]+)\/chapters\/([^/]+)$/);
  if (request.method === "GET" && chapterMatch) {
    const textbookId = decodeURIComponent(chapterMatch[1] ?? "");
    const chapterId = decodeURIComponent(chapterMatch[2] ?? "");
    const loaded = await loadTextbooks(cwd);
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
    sendJson(response, 200, {
      ...found.chapter,
      textbookId: found.textbookId,
      textbookTitle: found.textbookTitle,
      previousChapter: previousChapter ? { id: previousChapter.id, title: previousChapter.title } : null,
      nextChapter: nextChapter ? { id: nextChapter.id, title: nextChapter.title } : null,
      sectionCount: summary.sections,
      subsectionCount: summary.subsections,
      blockCount: summary.blocks
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/events") {
    const workspace = await resolveWorkspace(cwd);
    const payload = await readJson(request);
    mkdirSync(workspace.dataDir, { recursive: true });
    appendFileSync(
      join(workspace.dataDir, "events.jsonl"),
      `${JSON.stringify({ ...payload, createdAt: new Date().toISOString() })}\n`
    );
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

  if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
    const workspace = await resolveWorkspace(cwd);
    const status = isKnownAppPath(url.pathname) ? 200 : 404;
    send(response, status, "text/html; charset=utf-8", html(workspace.title));
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function isKnownAppPath(pathname: string): boolean {
  const parts = decodePathParts(pathname);
  if (!parts) return false;
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "textbooks")) return true;
  if (parts.length === 2 && parts[0] === "textbooks" && Boolean(parts[1])) return true;
  if (parts.length === 3 && parts[0] === "textbooks" && Boolean(parts[1]) && parts[2] === "glossary") return true;
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
  response.setHeader("connection", "close");
  response.setHeader("content-type", contentType);
  response.end(body);
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  send(response, status, "application/json; charset=utf-8", JSON.stringify(body, null, 2));
}

function sendFile(response: ServerResponse, path: string): void {
  response.statusCode = 200;
  response.setHeader("connection", "close");
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

function contentType(path: string): string {
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".json")) return "application/json; charset=utf-8";
  if (path.endsWith(".woff2")) return "font/woff2";
  if (path.endsWith(".woff")) return "font/woff";
  if (path.endsWith(".ttf")) return "font/ttf";
  return "application/octet-stream";
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
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
    return [watch(path, options, invalidate)];
  } catch (error) {
    if (!options?.recursive) return [];
    try {
      return [watch(path, invalidate)];
    } catch {
      return [];
    }
  }
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
