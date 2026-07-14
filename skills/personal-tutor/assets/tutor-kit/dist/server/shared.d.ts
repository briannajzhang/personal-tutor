export declare function appendEvent(dataDir: string, event: Record<string, unknown>): void;
export declare function readJsonFile<T>(path: string): T | undefined;
export declare function writeJsonFile(path: string, value: unknown): void;
export declare function relativeDataPath(cwd: string, absolutePath: string): string;
export declare function safeSegment(value: string): string;
export declare function requireString(value: unknown, label: string): string;
export declare function requireNonNegativeInteger(value: unknown, label: string): number;
export declare function isStringRecord(value: unknown): value is Record<string, string>;
