import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadTextbooks, resolveWorkspace } from "../compile/discover.js";
import type { LoadedChapter, QuizBlock, TutorBlock } from "../core/types.js";
import { loadReadingProgress, summarizeReadingProgress, type ReadingProgressSummary } from "../server/reading-progress.js";

interface ProgressOptions {
  textbookId?: string;
}

interface QuizProgress {
  textbookId: string;
  chapterId: string;
  quizId: string;
  attempts: number;
  latestScore: number;
  total: number;
  bestScore: number;
  missedQuestionIds: string[];
}

interface CodingProgress {
  textbookId: string;
  chapterId: string;
  blockId: string;
  attempts: number;
  passed: boolean;
}

export interface ProgressSummary {
  textbookId?: string;
  eventCount: number;
  invalidEventCount: number;
  lastActivity: string | null;
  quizzes: QuizProgress[];
  weakTags: Array<{ tag: string; misses: number }>;
  coding: CodingProgress[];
  glossaryAgain: Array<{ termId: string; count: number }>;
  openHighlights: number;
  reading: Array<ReadingProgressSummary & { textbookId: string }>;
  nextMove: string;
}

interface EventRecord extends Record<string, unknown> {
  type?: string;
  textbookId?: string;
  chapterId?: string;
  createdAt?: string;
}

export async function summarizeProgress(cwd: string, options: ProgressOptions = {}): Promise<ProgressSummary> {
  const workspace = await resolveWorkspace(cwd);
  const { events, invalidCount } = readEvents(join(workspace.dataDir, "events.jsonl"));
  const filtered = events.filter((event) => !options.textbookId || event.textbookId === options.textbookId);
  const loaded = await loadTextbooks(cwd, options);
  const questionTags = loadQuestionTags(loaded.chapters);
  const quizzes = summarizeQuizzes(filtered);
  const weakTags = summarizeWeakTags(filtered, questionTags);
  const coding = summarizeCoding(filtered);
  const glossaryAgain = summarizeGlossary(filtered);
  const openHighlights = countOpenHighlights(filtered);
  const reading = loaded.textbooks.map(({ textbook }) => ({
    textbookId: textbook.id,
    ...summarizeReadingProgress(loadReadingProgress(workspace.dataDir, textbook.id), textbook)
  }));

  return {
    textbookId: options.textbookId,
    eventCount: filtered.length,
    invalidEventCount: invalidCount,
    lastActivity: latestTimestamp(filtered),
    quizzes,
    weakTags,
    coding,
    glossaryAgain,
    openHighlights,
    reading,
    nextMove: chooseNextMove(filtered.length, weakTags, coding, glossaryAgain)
  };
}

export function formatProgress(summary: ProgressSummary): string {
  const lines = [
    "Tutor progress",
    `scope: ${summary.textbookId ? `textbook ${summary.textbookId}` : "full workspace"}`,
    `events: ${summary.eventCount}`,
    `last activity: ${summary.lastActivity ?? "none"}`
  ];

  if (summary.quizzes.length > 0) {
    lines.push("quizzes:");
    for (const quiz of summary.quizzes) {
      lines.push(`  ${quiz.textbookId}/${quiz.chapterId}/${quiz.quizId}: latest ${quiz.latestScore}/${quiz.total}, best ${quiz.bestScore}/${quiz.total}, ${quiz.attempts} attempts`);
    }
  }
  for (const reading of summary.reading) {
    const continueLabel = reading.continueChapter ? `, continue: ${reading.continueChapter.title}` : "";
    lines.push(`reading ${reading.textbookId}: ${reading.completedChapters}/${reading.totalChapters} chapters complete (${reading.percent}%)${continueLabel}`);
  }
  if (summary.weakTags.length > 0) {
    lines.push(`weak tags: ${summary.weakTags.map(({ tag, misses }) => `${tag} (${misses})`).join(", ")}`);
  }
  const failedCoding = summary.coding.filter((item) => !item.passed);
  if (summary.coding.length > 0) {
    lines.push(`coding: ${summary.coding.length - failedCoding.length} passing, ${failedCoding.length} needing work`);
  }
  if (summary.glossaryAgain.length > 0) {
    lines.push(`glossary review: ${summary.glossaryAgain.map(({ termId, count }) => `${termId} (${count})`).join(", ")}`);
  }
  if (summary.openHighlights > 0) lines.push(`open highlights: ${summary.openHighlights}`);
  if (summary.invalidEventCount > 0) lines.push(`ignored invalid events: ${summary.invalidEventCount}`);
  lines.push(`next move: ${summary.nextMove}`);
  return lines.join("\n");
}

function readEvents(path: string): { events: EventRecord[]; invalidCount: number } {
  if (!existsSync(path)) return { events: [], invalidCount: 0 };
  const events: EventRecord[] = [];
  let invalidCount = 0;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as unknown;
      if (isRecord(parsed)) events.push(parsed as EventRecord);
      else invalidCount += 1;
    } catch {
      invalidCount += 1;
    }
  }
  return { events, invalidCount };
}

function loadQuestionTags(chapters: LoadedChapter[]): Map<string, string[]> {
  const tags = new Map<string, string[]>();
  for (const candidate of chapters) {
    for (const block of collectBlocks(candidate.chapter.sections)) {
      if (!isQuizBlock(block)) continue;
      for (const question of block.props.questions) {
        tags.set(questionKey(candidate.textbookId, candidate.chapter.id, block.id, question.id), question.tags ?? []);
      }
    }
  }
  return tags;
}

function summarizeQuizzes(events: EventRecord[]): QuizProgress[] {
  const summaries = new Map<string, QuizProgress & { missed: Map<string, number> }>();
  for (const event of events) {
    if (event.type !== "quiz_checked") continue;
    const textbookId = text(event.textbookId);
    const chapterId = text(event.chapterId);
    const quizId = text(event.quizId);
    const score = integer(event.score);
    const total = integer(event.total);
    if (!textbookId || !chapterId || !quizId || score === null || total === null) continue;
    const key = `${textbookId}/${chapterId}/${quizId}`;
    const current = summaries.get(key) ?? {
      textbookId,
      chapterId,
      quizId,
      attempts: 0,
      latestScore: score,
      total,
      bestScore: score,
      missedQuestionIds: [],
      missed: new Map<string, number>()
    };
    current.attempts += 1;
    current.latestScore = score;
    current.total = total;
    current.bestScore = Math.max(current.bestScore, score);
    for (const response of responseRecords(event.responses)) {
      if (response.correct === true) continue;
      const questionId = text(response.questionId);
      if (questionId) current.missed.set(questionId, (current.missed.get(questionId) ?? 0) + 1);
    }
    summaries.set(key, current);
  }
  return [...summaries.values()].map(({ missed, ...summary }) => ({
    ...summary,
    missedQuestionIds: [...missed.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([questionId]) => questionId)
  }));
}

function summarizeWeakTags(events: EventRecord[], questionTags: Map<string, string[]>): Array<{ tag: string; misses: number }> {
  const misses = new Map<string, number>();
  for (const event of events) {
    if (event.type !== "quiz_checked") continue;
    const textbookId = text(event.textbookId);
    const chapterId = text(event.chapterId);
    const quizId = text(event.quizId);
    if (!textbookId || !chapterId || !quizId) continue;
    for (const response of responseRecords(event.responses)) {
      if (response.correct === true) continue;
      const questionId = text(response.questionId);
      if (!questionId) continue;
      for (const tag of questionTags.get(questionKey(textbookId, chapterId, quizId, questionId)) ?? []) {
        misses.set(tag, (misses.get(tag) ?? 0) + 1);
      }
    }
  }
  return [...misses.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, misses: count }));
}

function summarizeCoding(events: EventRecord[]): CodingProgress[] {
  const summaries = new Map<string, CodingProgress>();
  for (const event of events) {
    if (event.type !== "coding_action_ran") continue;
    const textbookId = text(event.textbookId);
    const chapterId = text(event.chapterId);
    const blockId = text(event.blockId);
    if (!textbookId || !chapterId || !blockId) continue;
    const key = `${textbookId}/${chapterId}/${blockId}`;
    const current = summaries.get(key) ?? { textbookId, chapterId, blockId, attempts: 0, passed: false };
    current.attempts += 1;
    current.passed = event.exitCode === 0 && event.timedOut !== true;
    summaries.set(key, current);
  }
  return [...summaries.values()];
}

function summarizeGlossary(events: EventRecord[]): Array<{ termId: string; count: number }> {
  const again = new Map<string, number>();
  for (const event of events) {
    if (event.type !== "glossary_card_rated" || event.rating !== "again") continue;
    const termId = text(event.termId);
    if (termId) again.set(termId, (again.get(termId) ?? 0) + 1);
  }
  return [...again.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 12)
    .map(([termId, count]) => ({ termId, count }));
}

function countOpenHighlights(events: EventRecord[]): number {
  const states = new Map<string, string>();
  for (const event of events) {
    const highlightId = text(event.highlightId);
    if (!highlightId) continue;
    if (event.type === "highlight_deleted") states.delete(highlightId);
    if (event.type === "highlight_created" || event.type === "highlight_status_changed") {
      states.set(highlightId, text(event.status) ?? "open");
    }
  }
  return [...states.values()].filter((status) => status !== "resolved").length;
}

function chooseNextMove(
  eventCount: number,
  weakTags: Array<{ tag: string; misses: number }>,
  coding: CodingProgress[],
  glossaryAgain: Array<{ termId: string; count: number }>
): string {
  if (eventCount === 0) return "Start with the next planned lesson or a short diagnostic.";
  if (weakTags.length > 0) return `Review ${weakTags.slice(0, 3).map(({ tag }) => tag).join(", ")} with a new example and a short transfer check.`;
  const failed = coding.filter((item) => !item.passed);
  if (failed.length > 0) return `Repair or scaffold ${failed[0].chapterId}/${failed[0].blockId} before adding new material.`;
  if (glossaryAgain.length > 0) return `Retrieve ${glossaryAgain.slice(0, 3).map(({ termId }) => termId).join(", ")} before the next lesson.`;
  return "Continue to the next planned outcome and include one cumulative retrieval check.";
}

function latestTimestamp(events: EventRecord[]): string | null {
  const timestamps = events.map((event) => text(event.createdAt)).filter((value): value is string => value !== null);
  return timestamps.sort().at(-1) ?? null;
}

function collectBlocks(sections: Array<{ blocks: TutorBlock[]; subsections: Array<{ blocks: TutorBlock[] }> }>): TutorBlock[] {
  return sections.flatMap((section) => [
    ...section.blocks,
    ...section.subsections.flatMap((subsection) => subsection.blocks)
  ]);
}

function isQuizBlock(block: TutorBlock): block is QuizBlock {
  return block.kind === "quiz";
}

function questionKey(textbookId: string, chapterId: string, quizId: string, questionId: string): string {
  return `${textbookId}/${chapterId}/${quizId}/${questionId}`;
}

function responseRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function integer(value: unknown): number | null {
  return Number.isInteger(value) ? value as number : null;
}
