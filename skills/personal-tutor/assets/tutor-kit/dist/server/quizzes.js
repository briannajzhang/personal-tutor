import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { resolveWorkspace } from "../compile/discover.js";
const emptyState = () => ({
    selectedAnswers: {},
    submitted: false,
    score: null,
    total: null,
    attempt: 0,
    attempts: [],
    updatedAt: null
});
export async function loadQuizState(cwd, query) {
    const workspace = await resolveWorkspace(cwd);
    const paths = quizPaths(workspace.cwd, workspace.dataDir, {
        textbookId: query.get("textbookId"),
        chapterId: query.get("chapterId"),
        quizId: query.get("quizId")
    });
    return { ...readState(paths.absolutePath), statePath: paths.path };
}
export async function saveQuizState(cwd, body) {
    const workspace = await resolveWorkspace(cwd);
    const paths = quizPaths(workspace.cwd, workspace.dataDir, body);
    const previous = readState(paths.absolutePath);
    const next = {
        ...previous,
        selectedAnswers: quizAnswerRecord(body.selectedAnswers),
        submitted: false,
        score: null,
        total: null,
        updatedAt: new Date().toISOString()
    };
    writeState(paths.absolutePath, next);
    return { ...next, statePath: paths.path };
}
export async function submitQuizAttempt(cwd, body) {
    const workspace = await resolveWorkspace(cwd);
    const paths = quizPaths(workspace.cwd, workspace.dataDir, body);
    const previous = readState(paths.absolutePath);
    const attempt = {
        attempt: previous.attempt + 1,
        responses: responseList(body.responses),
        score: requireNonNegativeInteger(body.score, "score"),
        total: requireNonNegativeInteger(body.total, "total"),
        submittedAt: new Date().toISOString()
    };
    const next = {
        selectedAnswers: quizAnswerRecord(body.selectedAnswers),
        submitted: true,
        score: attempt.score,
        total: attempt.total,
        attempt: attempt.attempt,
        attempts: [...previous.attempts, attempt],
        updatedAt: attempt.submittedAt
    };
    writeState(paths.absolutePath, next);
    appendEvent(workspace.dataDir, {
        type: "quiz_checked",
        textbookId: requireString(body.textbookId, "textbookId"),
        chapterId: requireString(body.chapterId, "chapterId"),
        quizId: requireString(body.quizId, "quizId"),
        attempt: attempt.attempt,
        score: attempt.score,
        total: attempt.total,
        responses: attempt.responses
    });
    return { ...next, statePath: paths.path };
}
function quizPaths(cwd, dataDir, request) {
    const absolutePath = join(dataDir, "quiz-state", safeSegment(requireString(request.textbookId, "textbookId")), safeSegment(requireString(request.chapterId, "chapterId")), `${safeSegment(requireString(request.quizId, "quizId"))}.json`);
    return { absolutePath, path: relative(cwd, absolutePath).replaceAll("\\", "/") };
}
function readState(path) {
    if (!existsSync(path))
        return emptyState();
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return {
        selectedAnswers: quizAnswerRecord(parsed.selectedAnswers),
        submitted: parsed.submitted === true,
        score: Number.isInteger(parsed.score) ? parsed.score : null,
        total: Number.isInteger(parsed.total) ? parsed.total : null,
        attempt: Number.isInteger(parsed.attempt) ? parsed.attempt : 0,
        attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
    };
}
function writeState(path, state) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`);
}
function responseList(value) {
    if (!Array.isArray(value))
        throw new Error("responses must be an array");
    return value.map((response, index) => {
        if (typeof response !== "object" || response === null || Array.isArray(response)) {
            throw new Error(`responses[${index}] must be an object`);
        }
        const record = response;
        return {
            questionId: requireString(record.questionId, `responses[${index}].questionId`),
            selectedAnswer: requireQuizAnswer(record.selectedAnswer, `responses[${index}].selectedAnswer`),
            correct: record.correct === true
        };
    });
}
function quizAnswerRecord(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return {};
    const entries = [];
    for (const [key, answer] of Object.entries(value)) {
        if (typeof answer === "string") {
            entries.push([key, answer]);
        }
        else if (isStringRecord(answer)) {
            entries.push([key, { ...answer }]);
        }
    }
    return Object.fromEntries(entries);
}
function requireQuizAnswer(value, label) {
    if (typeof value === "string")
        return value;
    if (isStringRecord(value))
        return { ...value };
    throw new Error(`${label} must be a string or string record`);
}
function isStringRecord(value) {
    return typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.values(value).every((entry) => typeof entry === "string");
}
function requireString(value, label) {
    if (typeof value !== "string" || value.trim().length === 0)
        throw new Error(`${label} is required`);
    return value;
}
function requireNonNegativeInteger(value, label) {
    if (!Number.isInteger(value) || value < 0)
        throw new Error(`${label} must be a non-negative integer`);
    return value;
}
function safeSegment(value) {
    return value.replace(/[^a-zA-Z0-9_.-]+/g, "_");
}
function appendEvent(dataDir, event) {
    mkdirSync(dataDir, { recursive: true });
    appendFileSync(join(dataDir, "events.jsonl"), `${JSON.stringify({ ...event, createdAt: new Date().toISOString() })}\n`);
}
//# sourceMappingURL=quizzes.js.map