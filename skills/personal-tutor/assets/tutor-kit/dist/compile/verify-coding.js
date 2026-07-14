import { mkdtempSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { loadTextbooks, resolveWorkspace } from "./discover.js";
import { runShell, writeProblemFiles } from "../core/command-runner.js";
import { collectChapterBlocks } from "../core/traversal.js";
export async function verifyCodingProblems(cwd, options = {}) {
    const workspace = await resolveWorkspace(cwd);
    const loaded = await loadTextbooks(cwd, options);
    if (loaded.issues.length > 0) {
        return failure(0, loaded.issues.map((issue) => issue.message));
    }
    const problems = loaded.chapters.flatMap((loadedChapter) => (collectChapterBlocks(loadedChapter.chapter)
        .filter((block) => block.kind === "codingProblem")
        .map((problem) => ({
        label: `${loadedChapter.textbookId}/${loadedChapter.chapter.id}/${problem.id}`,
        problem
    }))));
    const messages = [];
    let passedCount = 0;
    for (const candidate of problems) {
        const result = await verifyProblem(candidate.problem, workspace.codeRunner);
        messages.push(`${result.ok ? "PASS" : "FAIL"} ${candidate.label}: ${result.message}`);
        if (result.ok)
            passedCount += 1;
    }
    return {
        ok: passedCount === problems.length,
        output: [
            passedCount === problems.length ? "Coding problem verification passed" : "Coding problem verification failed",
            `- scope: ${options.textbookId ? `textbook ${options.textbookId}` : "full workspace"}`,
            `- ${passedCount}/${problems.length} coding problems verified`,
            ...messages.map((message) => `- ${message}`)
        ].join("\n"),
        problemCount: problems.length,
        passedCount
    };
}
async function verifyProblem(problem, config) {
    const verification = problem.props.verification;
    if (!verification)
        return { ok: false, message: "missing verification metadata" };
    const action = problem.props.actions.find((candidate) => candidate.id === verification.actionId);
    if (!action)
        return { ok: false, message: `verification action not found: ${verification.actionId}` };
    const starter = await runVariant(problem, action.command, {}, config);
    if (starter.setupFailed)
        return { ok: false, message: `starter setup/runtime failed: ${formatShell(starter.result)}` };
    if (starter.result.timedOut)
        return { ok: false, message: "starter verification timed out" };
    if (starter.result.exitCode === 0)
        return { ok: false, message: "starter unexpectedly passed" };
    const referenceFiles = Object.fromEntries(Object.entries(verification.referenceFiles).map(([target, source]) => {
        const reference = problem.props.files.find((file) => file.path === source);
        return [target, reference?.content ?? ""];
    }));
    const reference = await runVariant(problem, action.command, referenceFiles, config);
    if (reference.setupFailed)
        return { ok: false, message: `reference setup/runtime failed: ${formatShell(reference.result)}` };
    if (reference.result.timedOut)
        return { ok: false, message: "reference verification timed out" };
    if (reference.result.exitCode !== 0)
        return { ok: false, message: `reference solution failed: ${formatShell(reference.result)}` };
    return { ok: true, message: "starter failed as expected; reference solution passed" };
}
async function runVariant(problem, command, overlays, config) {
    const root = mkdtempSync(resolve(tmpdir(), "tutor-verify-"));
    try {
        writeProblemFiles(root, problem.props.files, overlays);
        if (problem.props.setup) {
            const setup = await runShell(problem.props.setup.command, root, problem.props.language, config);
            if (setup.exitCode !== 0 || setup.timedOut)
                return { setupFailed: true, result: setup };
        }
        return { setupFailed: false, result: await runShell(command, root, problem.props.language, config) };
    }
    finally {
        rmSync(root, { recursive: true, force: true });
    }
}
function formatShell(result) {
    return result.stderr.trim() || result.stdout.trim() || `exit code ${result.exitCode}`;
}
function failure(problemCount, messages) {
    return {
        ok: false,
        output: ["Coding problem verification failed", ...messages.map((message) => `- ${message}`)].join("\n"),
        problemCount,
        passedCount: 0
    };
}
//# sourceMappingURL=verify-coding.js.map