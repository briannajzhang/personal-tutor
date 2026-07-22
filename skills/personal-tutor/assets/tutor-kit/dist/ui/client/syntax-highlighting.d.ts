export declare const plainSyntaxLanguages: readonly ["text", "txt", "plain", "plaintext"];
export declare const syntaxLanguageAliases: Record<string, string>;
export declare function normalizeSyntaxLanguage(value: unknown): string | null;
export declare function syntaxHighlightingClientJs(): string;
