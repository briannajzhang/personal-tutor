import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { loadTextbooks, resolveWorkspace } from "./discover.js";
const defaultRunner = { timeoutMs: 8000, maxOutputBytes: 65536 };
const defaultRuntimeCommands = {
    python: { envVar: "PYTHON", command: "python3" },
    javascript: { envVar: "NODE", command: "node" },
    typescript: { envVar: "TSX", command: "tsx" },
    cpp: { envVar: "CXX", command: "c++" }
};
export async function verifyCodingProblems(cwd, options = {}) {
    const workspace = await resolveWorkspace(cwd);
    const loaded = await loadTextbooks(cwd, options);
    if (loaded.issues.length > 0) {
        return failure(0, loaded.issues.map((issue) => issue.message));
    }
    const problems = loaded.chapters.flatMap((loadedChapter) => (collectBlocks(loadedChapter.chapter)
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
        writeFiles(root, problem.props.files, overlays);
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
function writeFiles(root, files, overlays) {
    for (const file of files) {
        const target = resolve(root, file.path);
        if (target !== root && !target.startsWith(root + sep))
            throw new Error(`Coding problem file escapes temp directory: ${file.path}`);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, overlays[file.path] ?? file.content);
    }
}
async function runShell(command, cwd, language, config) {
    const timeoutMs = config.timeoutMs ?? defaultRunner.timeoutMs;
    const maxOutputBytes = config.maxOutputBytes ?? defaultRunner.maxOutputBytes;
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    return await new Promise((resolvePromise) => {
        const child = spawn(command, { cwd, env: runnerEnv(language, config), shell: true });
        const timer = setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
        }, timeoutMs);
        child.stdout.on("data", (chunk) => { stdout = appendLimited(stdout, chunk, maxOutputBytes); });
        child.stderr.on("data", (chunk) => { stderr = appendLimited(stderr, chunk, maxOutputBytes); });
        child.on("close", (exitCode, signal) => {
            clearTimeout(timer);
            resolvePromise({ exitCode, signal, stdout, stderr, timedOut });
        });
    });
}
function runnerEnv(language, config) {
    const env = { ...process.env };
    for (const [runtime, preset] of Object.entries(defaultRuntimeCommands)) {
        env[preset.envVar] = config.runtimes?.[runtime]?.command ?? preset.command;
    }
    Object.assign(env, config.runtimes?.[language]?.env ?? {});
    return env;
}
function appendLimited(current, chunk, limit) {
    const combined = Buffer.concat([Buffer.from(current), chunk]);
    return combined.subarray(0, limit).toString("utf8");
}
function formatShell(result) {
    return result.stderr.trim() || result.stdout.trim() || `exit code ${result.exitCode}`;
}
function collectBlocks(chapter) {
    return chapter.sections.flatMap((section) => [
        ...section.blocks,
        ...section.subsections.flatMap((subsection) => subsection.blocks)
    ]);
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