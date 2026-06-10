export interface CompileResult {
    ok: boolean;
    output: string;
    textbookCount: number;
    chapterCount: number;
    sectionCount: number;
    subsectionCount: number;
    blockCount: number;
    widgetCount: number;
}
export declare function compileWorkspace(cwd: string, options?: {
    textbookId?: string;
}): Promise<CompileResult>;
