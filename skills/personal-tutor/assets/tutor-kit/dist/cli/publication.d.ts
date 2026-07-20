export interface BeginTextbookResult {
    workDir: string;
    resumed: boolean;
}
export interface PublishTextbookResult {
    publishedDir: string;
    archivedDir: string | null;
    compileOutput: string;
    verificationOutput: string;
}
export declare function beginTextbook(cwd: string, textbookId: string, title: string): Promise<BeginTextbookResult>;
export declare function publishTextbook(cwd: string, textbookId: string): Promise<PublishTextbookResult>;
