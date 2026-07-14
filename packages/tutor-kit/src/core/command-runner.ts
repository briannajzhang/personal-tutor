import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import type { CodeRunnerConfig, CodingProblemFile } from "./types.js";

export interface ShellResult {
  exitCode: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
  truncated: boolean;
}

const defaultRunner = {
  timeoutMs: 8000,
  maxOutputBytes: 65536
};

const defaultRuntimeCommands: Record<string, { envVar: string; command: string }> = {
  python: { envVar: "PYTHON", command: "python3" },
  javascript: { envVar: "NODE", command: "node" },
  typescript: { envVar: "TSX", command: "tsx" },
  cpp: { envVar: "CXX", command: "c++" }
};

export async function runShell(
  command: string,
  cwd: string,
  language: string,
  config: CodeRunnerConfig
): Promise<ShellResult> {
  const timeoutMs = config.timeoutMs ?? defaultRunner.timeoutMs;
  const maxOutputBytes = config.maxOutputBytes ?? defaultRunner.maxOutputBytes;
  const startedAt = Date.now();
  let stdout = "";
  let stderr = "";
  let truncated = false;
  let timedOut = false;

  return await new Promise((resolvePromise) => {
    const child = spawn(command, {
      cwd,
      env: runnerEnv(language, config),
      shell: true
    });
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      const result = appendLimited(stdout, chunk, maxOutputBytes);
      stdout = result.output;
      truncated = truncated || result.truncated;
    });
    child.stderr.on("data", (chunk) => {
      const result = appendLimited(stderr, chunk, maxOutputBytes);
      stderr = result.output;
      truncated = truncated || result.truncated;
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolvePromise({
        exitCode,
        signal,
        stdout,
        stderr,
        timedOut,
        durationMs: Date.now() - startedAt,
        truncated
      });
    });
  });
}

export function writeProblemFiles(
  root: string,
  files: CodingProblemFile[],
  replacements: Record<string, string> = {}
): void {
  for (const file of files) {
    const target = resolve(root, file.path);
    if (target !== root && !target.startsWith(root + sep)) {
      throw new Error(`Coding problem file escapes temp directory: ${file.path}`);
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, replacements[file.path] ?? file.content);
  }
}

function runnerEnv(language: string, config: CodeRunnerConfig): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const [runtime, preset] of Object.entries(defaultRuntimeCommands)) {
    env[preset.envVar] = config.runtimes?.[runtime]?.command ?? preset.command;
  }
  const runtimeConfig = config.runtimes?.[language];
  if (runtimeConfig?.command) {
    env[language.toUpperCase().replace(/[^A-Z0-9]+/g, "_")] = runtimeConfig.command;
  }
  Object.assign(env, runtimeConfig?.env ?? {});
  return env;
}

function appendLimited(current: string, chunk: Buffer, limit: number): { output: string; truncated: boolean } {
  const combined = Buffer.concat([Buffer.from(current), chunk]);
  if (combined.length <= limit) return { output: combined.toString("utf8"), truncated: false };
  return { output: combined.subarray(0, limit).toString("utf8"), truncated: true };
}
