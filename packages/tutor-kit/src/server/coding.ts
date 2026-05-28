import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { loadTextbooks, resolveWorkspace } from "../compile/discover.js";
import type { CodeRunnerConfig, CodingProblemBlock, CodingProblemFile, LoadedChapter, TutorBlock } from "../core/types.js";

interface CodingRequestBase {
  textbookId?: unknown;
  chapterId?: unknown;
  blockId?: unknown;
}

interface CodingRunRequest extends CodingRequestBase {
  actionId?: unknown;
  files?: unknown;
}

interface CodingDraftRequest extends CodingRequestBase {
  files?: unknown;
}

interface ShellResult {
  exitCode: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
  truncated: boolean;
}

interface RunResult extends ShellResult {
  ok: boolean;
  actionId: string;
  setup?: ShellResult;
}

const defaultRunner = {
  timeoutMs: 8000,
  maxOutputBytes: 65536
};

const defaultRuntimeCommands: Record<string, { envVar: string; command: string }> = {
  python: { envVar: "PYTHON", command: "python3" },
  javascript: { envVar: "NODE", command: "node" },
  typescript: { envVar: "TSX", command: "tsx" },
  cpp: { envVar: "CXX", command: "c++" }
};

export async function runCodingProblem(cwd: string, body: CodingRunRequest): Promise<RunResult> {
  const workspace = await resolveWorkspace(cwd);
  const { problem, chapter } = await findCodingProblem(cwd, body);
  const actionId = requireString(body.actionId, "actionId");
  const action = problem.props.actions.find((candidate) => candidate.id === actionId);
  if (!action) throw new Error(`Coding action not found: ${actionId}`);

  const edits = editableFiles(problem, body.files);
  const tempDir = mkdtempSync(join(tmpdir(), "tutor-code-"));
  try {
    writeProblemFiles(tempDir, problem.props.files, edits);
    const setup = problem.props.setup
      ? await runShell(problem.props.setup.command, tempDir, problem.props.language, workspace.codeRunner)
      : undefined;

    if (setup && (setup.exitCode !== 0 || setup.timedOut)) {
      const result: RunResult = {
        ok: false,
        actionId,
        setup,
        exitCode: null,
        signal: null,
        stdout: "",
        stderr: "",
        timedOut: setup.timedOut,
        durationMs: setup.durationMs,
        truncated: setup.truncated
      };
      appendRunEvent(workspace.dataDir, body, chapter, problem, actionId, edits, result);
      return result;
    }

    const result = await runShell(action.command, tempDir, problem.props.language, workspace.codeRunner);
    const runResult = { ...result, setup, ok: result.exitCode === 0 && !result.timedOut, actionId };
    appendRunEvent(workspace.dataDir, body, chapter, problem, actionId, edits, runResult);
    return runResult;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function appendRunEvent(
  dataDir: string,
  body: CodingRunRequest,
  chapter: LoadedChapter,
  problem: CodingProblemBlock,
  actionId: string,
  edits: Record<string, string>,
  result: RunResult
): void {
  appendEvent(dataDir, {
    type: "coding_action_ran",
    textbookId: body.textbookId,
    chapterId: chapter.chapter.id,
    blockId: problem.id,
    actionId,
    language: problem.props.language,
    exitCode: result.exitCode,
    signal: result.signal,
    timedOut: result.timedOut,
    durationMs: result.durationMs,
    truncated: result.truncated,
    setupExitCode: result.setup?.exitCode,
    setupTimedOut: result.setup?.timedOut,
    files: edits
  });
}

export async function loadCodingDraft(cwd: string, query: URLSearchParams): Promise<{
  files: Record<string, string>;
  draftPath: string;
  feedbackPath: string;
  draftAbsolutePath: string;
  feedbackAbsolutePath: string;
}> {
  const workspace = await resolveWorkspace(cwd);
  const textbookId = requireString(query.get("textbookId"), "textbookId");
  const chapterId = requireString(query.get("chapterId"), "chapterId");
  const blockId = requireString(query.get("blockId"), "blockId");
  const paths = codingDataPaths(workspace.cwd, workspace.dataDir, textbookId, chapterId, blockId);
  if (!existsSync(paths.draftAbsolutePath)) {
    return { files: {}, ...publicCodingDataPaths(paths) };
  }
  const parsed = JSON.parse(readFileSync(paths.draftAbsolutePath, "utf8")) as { files?: unknown };
  return {
    files: isStringRecord(parsed.files) ? parsed.files : {},
    ...publicCodingDataPaths(paths)
  };
}

export async function saveCodingDraft(cwd: string, body: CodingDraftRequest): Promise<{
  ok: true;
  draftPath: string;
  feedbackPath: string;
  draftAbsolutePath: string;
  feedbackAbsolutePath: string;
}> {
  const workspace = await resolveWorkspace(cwd);
  const { problem, chapter } = await findCodingProblem(cwd, body);
  const textbookId = requireString(body.textbookId, "textbookId");
  const files = editableFiles(problem, body.files);
  const paths = codingDataPaths(workspace.cwd, workspace.dataDir, textbookId, chapter.chapter.id, problem.id);
  mkdirSync(dirname(paths.draftAbsolutePath), { recursive: true });
  writeFileSync(paths.draftAbsolutePath, `${JSON.stringify({ files, updatedAt: new Date().toISOString() }, null, 2)}\n`);
  appendEvent(workspace.dataDir, {
    type: "coding_draft_saved",
    textbookId,
    chapterId: chapter.chapter.id,
    blockId: problem.id
  });
  return { ok: true, ...publicCodingDataPaths(paths) };
}

export async function loadCodingFeedback(cwd: string, query: URLSearchParams): Promise<{ feedback: string; feedbackPath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const textbookId = requireString(query.get("textbookId"), "textbookId");
  const chapterId = requireString(query.get("chapterId"), "chapterId");
  const blockId = requireString(query.get("blockId"), "blockId");
  const paths = codingDataPaths(workspace.cwd, workspace.dataDir, textbookId, chapterId, blockId);
  return {
    feedback: existsSync(paths.feedbackAbsolutePath) ? readFileSync(paths.feedbackAbsolutePath, "utf8") : "",
    feedbackPath: paths.feedbackPath
  };
}

function writeProblemFiles(root: string, files: CodingProblemFile[], edits: Record<string, string>): void {
  for (const file of files) {
    const target = resolve(root, file.path);
    if (target !== root && !target.startsWith(root + sep)) {
      throw new Error(`Coding problem file escapes temp directory: ${file.path}`);
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.editable && edits[file.path] !== undefined ? edits[file.path] : file.content);
  }
}

async function runShell(
  command: string,
  cwd: string,
  language: string,
  config: CodeRunnerConfig
): Promise<ShellResult> {
  const timeoutMs = config.timeoutMs ?? defaultRunner.timeoutMs;
  const maxOutputBytes = config.maxOutputBytes ?? defaultRunner.maxOutputBytes;
  const env = runnerEnv(language, config);
  const startedAt = Date.now();
  let stdout = "";
  let stderr = "";
  let truncated = false;
  let timedOut = false;

  return await new Promise((resolvePromise) => {
    const child = spawn(command, {
      cwd,
      env,
      shell: true
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      const result = appendLimited(stdout, chunk, maxOutputBytes);
      stdout = result.output;
      truncated = truncated || result.truncated;
    });

    child.stderr.on("data", (chunk) => {
      const result = appendLimited(stderr, chunk, maxOutputBytes);
      stderr = result.output;
      truncated = truncated || result.truncated;
    });

    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolvePromise({
        exitCode,
        signal,
        stdout,
        stderr,
        timedOut,
        durationMs: Date.now() - startedAt,
        truncated
      });
    });
  });
}

function runnerEnv(language: string, config: CodeRunnerConfig): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const [runtime, preset] of Object.entries(defaultRuntimeCommands)) {
    env[preset.envVar] = config.runtimes?.[runtime]?.command ?? preset.command;
  }
  const runtimeConfig = config.runtimes?.[language];
  if (runtimeConfig?.command) {
    env[language.toUpperCase().replace(/[^A-Z0-9]+/g, "_")] = runtimeConfig.command;
  }
  Object.assign(env, runtimeConfig?.env ?? {});
  return env;
}

function appendLimited(current: string, chunk: Buffer, limit: number): { output: string; truncated: boolean } {
  const combined = Buffer.concat([Buffer.from(current), chunk]);
  if (combined.length <= limit) return { output: combined.toString("utf8"), truncated: false };
  return { output: combined.subarray(0, limit).toString("utf8"), truncated: true };
}

async function findCodingProblem(
  cwd: string,
  body: CodingRequestBase
): Promise<{ problem: CodingProblemBlock; chapter: LoadedChapter }> {
  const textbookId = requireString(body.textbookId, "textbookId");
  const chapterId = requireString(body.chapterId, "chapterId");
  const blockId = requireString(body.blockId, "blockId");
  const loaded = await loadTextbooks(cwd);
  if (loaded.issues.length > 0) {
    throw new Error(`Cannot load textbooks: ${JSON.stringify(loaded.issues)}`);
  }
  const chapter = loaded.chapters.find((candidate) => (
    candidate.textbookId === textbookId && candidate.chapter.id === chapterId
  ));
  if (!chapter) throw new Error(`Chapter not found: ${textbookId}/${chapterId}`);
  const problem = collectBlocks(chapter.chapter).find((block): block is CodingProblemBlock => (
    block.id === blockId && block.kind === "codingProblem"
  ));
  if (!problem) throw new Error(`Coding problem not found: ${blockId}`);
  return { problem, chapter };
}

function collectBlocks(chapter: LoadedChapter["chapter"]): TutorBlock[] {
  const blocks: TutorBlock[] = [];
  for (const section of chapter.sections) {
    blocks.push(...section.blocks);
    for (const subsection of section.subsections) {
      blocks.push(...subsection.blocks);
    }
  }
  return blocks;
}

function editableFiles(problem: CodingProblemBlock, files: unknown): Record<string, string> {
  const edits = isStringRecord(files) ? files : {};
  const allowed = new Set(problem.props.files.filter((file) => file.editable).map((file) => file.path));
  return Object.fromEntries(Object.entries(edits).filter(([path]) => allowed.has(path)));
}

function codingDataPaths(
  cwd: string,
  dataDir: string,
  textbookId: string,
  chapterId: string,
  blockId: string
): {
  draftAbsolutePath: string;
  feedbackAbsolutePath: string;
  draftPath: string;
  feedbackPath: string;
} {
  const draftAbsolutePath = join(dataDir, "drafts", safeSegment(textbookId), safeSegment(chapterId), `${safeSegment(blockId)}.json`);
  const feedbackAbsolutePath = join(dataDir, "feedback", safeSegment(textbookId), safeSegment(chapterId), `${safeSegment(blockId)}.md`);
  return {
    draftAbsolutePath,
    feedbackAbsolutePath,
    draftPath: relative(cwd, draftAbsolutePath).replaceAll("\\", "/"),
    feedbackPath: relative(cwd, feedbackAbsolutePath).replaceAll("\\", "/")
  };
}

function publicCodingDataPaths(paths: ReturnType<typeof codingDataPaths>): {
  draftPath: string;
  feedbackPath: string;
  draftAbsolutePath: string;
  feedbackAbsolutePath: string;
} {
  return {
    draftPath: paths.draftPath,
    feedbackPath: paths.feedbackPath,
    draftAbsolutePath: paths.draftAbsolutePath,
    feedbackAbsolutePath: paths.feedbackAbsolutePath
  };
}

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]+/g, "_");
}

function appendEvent(dataDir: string, event: Record<string, unknown>): void {
  mkdirSync(dataDir, { recursive: true });
  appendFileSync(join(dataDir, "events.jsonl"), `${JSON.stringify({ ...event, createdAt: new Date().toISOString() })}\n`);
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
  return value;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string");
}
