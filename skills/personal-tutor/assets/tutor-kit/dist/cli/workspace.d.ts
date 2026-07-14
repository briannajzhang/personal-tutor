export interface WriteResult {
    created: string[];
    skipped: string[];
}
export interface InitWorkspaceOptions {
    packageSpec?: string;
    starter?: boolean;
}
export declare const blockKinds: readonly ["p", "heading", "list", "codeBlock", "mathBlock", "diagram", "chart", "image", "component", "callout", "transformation", "glossary", "quiz", "codingProblem"];
export declare function initWorkspace(cwd: string, options?: InitWorkspaceOptions): WriteResult;
export declare function addTextbook(cwd: string, id: string, title: string): WriteResult;
export declare function addChapter(cwd: string, textbookId: string, id: string, title: string): WriteResult;
export declare function addBlock(cwd: string, kind: string): WriteResult;
export declare function addWidget(cwd: string, kind: string): WriteResult;
export declare function printWriteResult(action: string, result: WriteResult): string;
