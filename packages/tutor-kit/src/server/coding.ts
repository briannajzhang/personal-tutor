import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { loadTextbooks, resolveWorkspace } from "../compile/discover.js";
import type { CodingProblemBlock, LoadedChapter } from "../core/types.js";
import { runShell, writeProblemFiles, type ShellResult } from "../core/command-runner.js";
import { collectChapterBlocks } from "../core/traversal.js";
import { appendEvent, isStringRecord, requireString, safeSegment, writeJsonFile } from "./shared.js";

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

interface RunResult extends ShellResult {
  ok: boolean;
  actionId: string;
  setup?: ShellResult;
}

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
  writeJsonFile(paths.draftAbsolutePath, { files, updatedAt: new Date().toISOString() });
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

async function findCodingProblem(
  cwd: string,
  body: CodingRequestBase
): Promise<{ problem: CodingProblemBlock; chapter: LoadedChapter }> {
  const textbookId = requireString(body.textbookId, "textbookId");
  const chapterId = requireString(body.chapterId, "chapterId");
  const blockId = requireString(body.blockId, "blockId");
  const loaded = await loadTextbooks(cwd, { textbookId });
  if (loaded.issues.length > 0) {
    throw new Error(`Cannot load textbooks: ${JSON.stringify(loaded.issues)}`);
  }
  const chapter = loaded.chapters.find((candidate) => (
    candidate.textbookId === textbookId && candidate.chapter.id === chapterId
  ));
  if (!chapter) throw new Error(`Chapter not found: ${textbookId}/${chapterId}`);
  const problem = collectChapterBlocks(chapter.chapter).find((block): block is CodingProblemBlock => (
    block.id === blockId && block.kind === "codingProblem"
  ));
  if (!problem) throw new Error(`Coding problem not found: ${blockId}`);
  return { problem, chapter };
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
