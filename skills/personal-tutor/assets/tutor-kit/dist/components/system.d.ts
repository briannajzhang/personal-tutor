import type { Server } from "node:http";
import { type ViteDevServer } from "vite";
import type { Chapter, LoadedTextbook, Textbook } from "../core/types.js";
export interface ComponentRecord {
    id: string;
    sourcePath: string;
    blockIds: string[];
}
export declare class ComponentRegistry {
    #private;
    constructor(records?: ComponentRecord[]);
    replace(records: ComponentRecord[]): void;
    get(id: string): ComponentRecord | undefined;
    values(): ComponentRecord[];
    moduleUrl(id: string): string;
}
export declare function collectComponentRecords(cwd: string, textbooks: LoadedTextbook[]): ComponentRecord[];
export declare function serializeTextbookComponents(cwd: string, registry: ComponentRegistry, textbook: Textbook): object;
export declare function serializeChapterComponents(cwd: string, registry: ComponentRegistry, chapter: Chapter): object;
export declare function validateComponentBuild(cwd: string, registry: ComponentRegistry): Promise<void>;
export declare function createComponentViteServer(cwd: string, registry: ComponentRegistry, parentServer: Server): Promise<ViteDevServer>;
