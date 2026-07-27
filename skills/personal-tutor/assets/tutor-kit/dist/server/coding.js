import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { loadTextbooks, resolveWorkspace } from "../compile/discover.js";
import { runShell, writeProblemFiles } from "../core/command-runner.js";
import { collectChapterBlocks } from "../core/traversal.js";
import { appendEvent, isStringRecord, requireString, safeSegment, writeJsonFile } from "./shared.js";
export async function runCodingProblem(cwd, body) {
    const workspace = await resolveWorkspace(cwd);
    const { problem, chapter } = await findCodingProblem(cwd, body);
    const actionId = requireString(body.actionId, "actionId");
    const action = problem.props.actions.find((candidate) => candidate.id === actionId);
    if (!action)
        throw new Error(`Coding action not found: ${actionId}`);
    const edits = editableFiles(problem, body.files);
    const tempDir = mkdtempSync(join(tmpdir(), "tutor-code-"));
    try {
        writeProblemFiles(tempDir, problem.props.files, edits);
        const setup = problem.props.setup
            ? await runShell(problem.props.setup.command, tempDir, problem.props.language, workspace.codeRunner)
            : undefined;
        if (setup && (setup.exitCode !== 0 || setup.timedOut)) {
            const result = {
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
    }
    finally {
        rmSync(tempDir, { recursive: true, force: true });
    }
}
function appendRunEvent(dataDir, body, chapter, problem, actionId, edits, result) {
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
export async function loadCodingDraft(cwd, query) {
    const workspace = await resolveWorkspace(cwd);
    const textbookId = requireString(query.get("textbookId"), "textbookId");
    const chapterId = requireString(query.get("chapterId"), "chapterId");
    const blockId = requireString(query.get("blockId"), "blockId");
    const paths = codingDataPaths(workspace.cwd, workspace.dataDir, textbookId, chapterId, blockId);
    if (!existsSync(paths.draftAbsolutePath)) {
        return { files: {}, ...publicCodingDataPaths(paths) };
    }
    const parsed = JSON.parse(readFileSync(paths.draftAbsolutePath, "utf8"));
    return {
        files: isStringRecord(parsed.files) ? parsed.files : {},
        ...publicCodingDataPaths(paths)
    };
}
export async function saveCodingDraft(cwd, body) {
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
export async function loadCodingFeedback(cwd, query) {
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
async function findCodingProblem(cwd, body) {
    const textbookId = requireString(body.textbookId, "textbookId");
    const chapterId = requireString(body.chapterId, "chapterId");
    const blockId = requireString(body.blockId, "blockId");
    const loaded = await loadTextbooks(cwd, { textbookId });
    if (loaded.issues.length > 0) {
        throw new Error(`Cannot load textbooks: ${JSON.stringify(loaded.issues)}`);
    }
    const chapter = loaded.chapters.find((candidate) => (candidate.textbookId === textbookId && candidate.chapter.id === chapterId));
    if (!chapter)
        throw new Error(`Chapter not found: ${textbookId}/${chapterId}`);
    const problem = collectChapterBlocks(chapter.chapter).find((block) => (block.id === blockId && block.kind === "codingProblem"));
    if (!problem)
        throw new Error(`Coding problem not found: ${blockId}`);
    return { problem, chapter };
}
function editableFiles(problem, files) {
    const edits = isStringRecord(files) ? files : {};
    const allowed = new Set(problem.props.files.filter((file) => file.editable).map((file) => file.path));
    return Object.fromEntries(Object.entries(edits).filter(([path]) => allowed.has(path)));
}
function codingDataPaths(cwd, dataDir, textbookId, chapterId, blockId) {
    const draftAbsolutePath = join(dataDir, "drafts", safeSegment(textbookId), safeSegment(chapterId), `${safeSegment(blockId)}.json`);
    const feedbackAbsolutePath = join(dataDir, "feedback", safeSegment(textbookId), safeSegment(chapterId), `${safeSegment(blockId)}.md`);
    return {
        draftAbsolutePath,
        feedbackAbsolutePath,
        draftPath: relative(cwd, draftAbsolutePath).replaceAll("\\", "/"),
        feedbackPath: relative(cwd, feedbackAbsolutePath).replaceAll("\\", "/")
    };
}
function publicCodingDataPaths(paths) {
    return {
        draftPath: paths.draftPath,
        feedbackPath: paths.feedbackPath,
        draftAbsolutePath: paths.draftAbsolutePath,
        feedbackAbsolutePath: paths.feedbackAbsolutePath
    };
}
