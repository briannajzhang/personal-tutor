import { join } from "node:path";
import { resolveWorkspace } from "../compile/discover.js";
import {
  appendEvent,
  isStringRecord,
  readJsonFile,
  relativeDataPath,
  requireNonNegativeInteger,
  requireString,
  safeSegment,
  writeJsonFile
} from "./shared.js";

interface QuizStateRequest {
  textbookId?: unknown;
  chapterId?: unknown;
  quizId?: unknown;
  selectedAnswers?: unknown;
}

interface QuizAttemptRequest extends QuizStateRequest {
  score?: unknown;
  total?: unknown;
  responses?: unknown;
}

interface QuizAttempt {
  attempt: number;
  responses: Array<{ questionId: string; selectedAnswer: QuizAnswer; correct: boolean }>;
  score: number;
  total: number;
  submittedAt: string;
}

type QuizAnswer = string | Record<string, string>;

interface QuizState {
  selectedAnswers: Record<string, QuizAnswer>;
  submitted: boolean;
  score: number | null;
  total: number | null;
  attempt: number;
  attempts: QuizAttempt[];
  updatedAt: string | null;
}

const emptyState = (): QuizState => ({
  selectedAnswers: {},
  submitted: false,
  score: null,
  total: null,
  attempt: 0,
  attempts: [],
  updatedAt: null
});

export async function loadQuizState(cwd: string, query: URLSearchParams): Promise<QuizState & { statePath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const paths = quizPaths(workspace.cwd, workspace.dataDir, {
    textbookId: query.get("textbookId"),
    chapterId: query.get("chapterId"),
    quizId: query.get("quizId")
  });
  return { ...readState(paths.absolutePath), statePath: paths.path };
}

export async function saveQuizState(cwd: string, body: QuizStateRequest): Promise<QuizState & { statePath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const paths = quizPaths(workspace.cwd, workspace.dataDir, body);
  const previous = readState(paths.absolutePath);
  const next: QuizState = {
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

export async function submitQuizAttempt(cwd: string, body: QuizAttemptRequest): Promise<QuizState & { statePath: string }> {
  const workspace = await resolveWorkspace(cwd);
  const paths = quizPaths(workspace.cwd, workspace.dataDir, body);
  const previous = readState(paths.absolutePath);
  const attempt: QuizAttempt = {
    attempt: previous.attempt + 1,
    responses: responseList(body.responses),
    score: requireNonNegativeInteger(body.score, "score"),
    total: requireNonNegativeInteger(body.total, "total"),
    submittedAt: new Date().toISOString()
  };
  const next: QuizState = {
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

function quizPaths(cwd: string, dataDir: string, request: QuizStateRequest): { absolutePath: string; path: string } {
  const absolutePath = join(
    dataDir,
    "quiz-state",
    safeSegment(requireString(request.textbookId, "textbookId")),
    safeSegment(requireString(request.chapterId, "chapterId")),
    `${safeSegment(requireString(request.quizId, "quizId"))}.json`
  );
  return { absolutePath, path: relativeDataPath(cwd, absolutePath) };
}

function readState(path: string): QuizState {
  const parsed = readJsonFile<Partial<QuizState>>(path);
  if (!parsed) return emptyState();
  return {
    selectedAnswers: quizAnswerRecord(parsed.selectedAnswers),
    submitted: parsed.submitted === true,
    score: Number.isInteger(parsed.score) ? parsed.score as number : null,
    total: Number.isInteger(parsed.total) ? parsed.total as number : null,
    attempt: Number.isInteger(parsed.attempt) ? parsed.attempt as number : 0,
    attempts: Array.isArray(parsed.attempts) ? parsed.attempts as QuizAttempt[] : [],
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
  };
}

function writeState(path: string, state: QuizState): void {
  writeJsonFile(path, state);
}

function responseList(value: unknown): QuizAttempt["responses"] {
  if (!Array.isArray(value)) throw new Error("responses must be an array");
  return value.map((response, index) => {
    if (typeof response !== "object" || response === null || Array.isArray(response)) {
      throw new Error(`responses[${index}] must be an object`);
    }
    const record = response as Record<string, unknown>;
    return {
      questionId: requireString(record.questionId, `responses[${index}].questionId`),
      selectedAnswer: requireQuizAnswer(record.selectedAnswer, `responses[${index}].selectedAnswer`),
      correct: record.correct === true
    };
  });
}

function quizAnswerRecord(value: unknown): Record<string, QuizAnswer> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const entries: Array<[string, QuizAnswer]> = [];
  for (const [key, answer] of Object.entries(value)) {
    if (typeof answer === "string") {
      entries.push([key, answer]);
    } else if (isStringRecord(answer)) {
      entries.push([key, { ...answer }]);
    }
  }
  return Object.fromEntries(entries);
}

function requireQuizAnswer(value: unknown, label: string): QuizAnswer {
  if (typeof value === "string") return value;
  if (isStringRecord(value)) return { ...value };
  throw new Error(`${label} must be a string or string record`);
}
