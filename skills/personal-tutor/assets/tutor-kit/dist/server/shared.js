import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
export function appendEvent(dataDir, event) {
    mkdirSync(dataDir, { recursive: true });
    appendFileSync(join(dataDir, "events.jsonl"), `${JSON.stringify({ ...event, createdAt: new Date().toISOString() })}\n`);
}
export function readJsonFile(path) {
    if (!existsSync(path))
        return undefined;
    return JSON.parse(readFileSync(path, "utf8"));
}
export function writeJsonFile(path, value) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
export function relativeDataPath(cwd, absolutePath) {
    return relative(cwd, absolutePath).replaceAll("\\", "/");
}
export function safeSegment(value) {
    const segment = value.replace(/[^a-zA-Z0-9_.-]+/g, "_");
    return segment === "." || segment === ".." ? "_" : segment;
}
export function requireString(value, label) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${label} is required`);
    }
    return value;
}
export function requireNonNegativeInteger(value, label) {
    if (!Number.isInteger(value) || value < 0) {
        throw new Error(`${label} must be a non-negative integer`);
    }
    return value;
}
export function isStringRecord(value) {
    return typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.values(value).every((entry) => typeof entry === "string");
}
//# sourceMappingURL=shared.js.map