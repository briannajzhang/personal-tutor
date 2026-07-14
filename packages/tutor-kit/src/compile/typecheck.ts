import { relative } from "node:path";
import ts from "typescript";

export interface TypecheckResult {
  ok: boolean;
  messages: string[];
}

export function typecheckWorkspace(cwd: string, rootFiles?: string[]): TypecheckResult {
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

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    cwd,
    { noEmit: true },
    configPath
  );

  if (parsed.errors.length > 0) {
    return {
      ok: false,
      messages: parsed.errors.map((diagnostic) => formatDiagnostic(diagnostic, cwd))
    };
  }

  const ambientFiles = rootFiles
    ? parsed.fileNames.filter((file) => file.endsWith(".d.ts"))
    : [];
  const program = ts.createProgram(rootFiles ? [...new Set([...rootFiles, ...ambientFiles])] : parsed.fileNames, parsed.options);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  return {
    ok: diagnostics.length === 0,
    messages: diagnostics.map((diagnostic) => formatDiagnostic(diagnostic, cwd))
  };
}

function formatDiagnostic(diagnostic: ts.Diagnostic, cwd: string): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (!diagnostic.file || diagnostic.start === undefined) {
    return message;
  }

  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  const file = relative(cwd, diagnostic.file.fileName);
  return `${file}:${position.line + 1}:${position.character + 1} - ${message}`;
}
