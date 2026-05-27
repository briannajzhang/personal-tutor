export interface TypecheckResult {
    ok: boolean;
    messages: string[];
}
export declare function typecheckWorkspace(cwd: string): TypecheckResult;
