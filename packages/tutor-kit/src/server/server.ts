import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdirSync, appendFileSync, createReadStream } from "node:fs";
import { join } from "node:path";
import { html } from "../ui/app.js";
import { katexFontPath } from "../ui/katex-assets.js";
import { loadTextbooks, resolveWorkspace } from "../compile/discover.js";
import { summarizeChapter, summarizeTextbook } from "../core/validation.js";

export interface DevServerOptions {
  cwd: string;
  port: number;
}

export async function startDevServer(options: DevServerOptions): Promise<{ url: string; close: () => Promise<void> }> {
  const workspace = await resolveWorkspace(options.cwd);
  mkdirSync(workspace.dataDir, { recursive: true });

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
      server.close((error) => error ? reject(error) : resolve());
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

  if (request.method === "GET" && url.pathname === "/") {
    const workspace = await resolveWorkspace(cwd);
    send(response, 200, "text/html; charset=utf-8", html(workspace.title));
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
    const summary = summarizeChapter(found.chapter);
    sendJson(response, 200, {
      ...found.chapter,
      textbookId: found.textbookId,
      textbookTitle: found.textbookTitle,
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

  if (request.method === "GET" && !url.pathname.startsWith("/api/")) {
    const workspace = await resolveWorkspace(cwd);
    send(response, 200, "text/html; charset=utf-8", html(workspace.title));
    return;
  }

  sendJson(response, 404, { error: "Not found" });
}

function send(response: ServerResponse, status: number, contentType: string, body: string): void {
  response.statusCode = status;
  response.setHeader("content-type", contentType);
  response.end(body);
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  send(response, status, "application/json; charset=utf-8", JSON.stringify(body, null, 2));
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

function contentType(path: string): string {
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
