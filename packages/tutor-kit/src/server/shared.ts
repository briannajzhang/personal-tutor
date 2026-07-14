import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

export function appendEvent(dataDir: string, event: Record<string, unknown>): void {
  mkdirSync(dataDir, { recursive: true });
  appendFileSync(
    join(dataDir, "events.jsonl"),
    `${JSON.stringify({ ...event, createdAt: new Date().toISOString() })}\n`
  );
}

export function readJsonFile<T>(path: string): T | undefined {
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeJsonFile(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function relativeDataPath(cwd: string, absolutePath: string): string {
  return relative(cwd, absolutePath).replaceAll("\\", "/");
}

export function safeSegment(value: string): string {
  const segment = value.replace(/[^a-zA-Z0-9_.-]+/g, "_");
  return segment === "." || segment === ".." ? "_" : segment;
}

export function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
  return value;
}

export function requireNonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value as number;
}

export function isStringRecord(value: unknown): value is Record<string, string> {
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string");
}
