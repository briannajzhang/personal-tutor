import { relative } from "node:path";
import ts from "typescript";
export function typecheckWorkspace(cwd) {
    const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, "tsconfig.json");
    if (!configPath) {
        return {
            ok: false,
            messages: ["Missing tsconfig.json. Run `tutor init` first."]
        };
    }
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    if (configFile.error) {
        return {
            ok: false,
            messages: [formatDiagnostic(configFile.error, cwd)]
        };
    }
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, cwd, { noEmit: true }, configPath);
    if (parsed.errors.length > 0) {
        return {
            ok: false,
            messages: parsed.errors.map((diagnostic) => formatDiagnostic(diagnostic, cwd))
        };
    }
    const program = ts.createProgram(parsed.fileNames, parsed.options);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    return {
        ok: diagnostics.length === 0,
        messages: diagnostics.map((diagnostic) => formatDiagnostic(diagnostic, cwd))
    };
}
function formatDiagnostic(diagnostic, cwd) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    if (!diagnostic.file || diagnostic.start === undefined) {
        return message;
    }
    const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const file = relative(cwd, diagnostic.file.fileName);
    return `${file}:${position.line + 1}:${position.character + 1} - ${message}`;
}
//# sourceMappingURL=typecheck.js.map