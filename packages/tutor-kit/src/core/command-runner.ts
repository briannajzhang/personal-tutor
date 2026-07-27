import { spawn, type ChildProcess } from "node:child_process";
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
  const maxOutputBytes = Math.max(0, config.maxOutputBytes ?? defaultRunner.maxOutputBytes);
  const startedAt = Date.now();
  const stdout = emptyOutput();
  const stderr = emptyOutput();
  let truncated = false;
  let timedOut = false;

  return new Promise((resolvePromise) => {
    const child = spawn(command, {
      cwd,
      env: runnerEnv(language, config),
      shell: true,
      detached: process.platform !== "win32"
    });
    const timer = setTimeout(() => {
      timedOut = true;
      killProcess(child);
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      truncated = appendLimited(stdout, chunk, maxOutputBytes) || truncated;
    });
    child.stderr.on("data", (chunk) => {
      truncated = appendLimited(stderr, chunk, maxOutputBytes) || truncated;
    });
    let settled = false;
    const finish = (exitCode: number | null, signal: NodeJS.Signals | null, error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) truncated = appendLimited(stderr, Buffer.from(error.message), maxOutputBytes) || truncated;
      resolvePromise({
        exitCode,
        signal,
        stdout: outputText(stdout),
        stderr: outputText(stderr),
        timedOut,
        durationMs: Date.now() - startedAt,
        truncated
      });
    };
    child.once("error", (error) => finish(null, null, error));
    child.once("close", (exitCode, signal) => finish(exitCode, signal));
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

interface CapturedOutput {
  chunks: Buffer[];
  length: number;
}

function emptyOutput(): CapturedOutput {
  return { chunks: [], length: 0 };
}

function appendLimited(output: CapturedOutput, chunk: Buffer, limit: number): boolean {
  const remaining = limit - output.length;
  if (remaining > 0) {
    const kept = chunk.length > remaining ? chunk.subarray(0, remaining) : chunk;
    output.chunks.push(kept);
    output.length += kept.length;
  }
  return chunk.length > Math.max(0, remaining);
}

function outputText(output: CapturedOutput): string {
  return Buffer.concat(output.chunks, output.length).toString("utf8");
}

function killProcess(child: ChildProcess): void {
  if (process.platform !== "win32" && child.pid) {
    try {
      process.kill(-child.pid, "SIGKILL");
      return;
    } catch {
      // The process may have exited between the timeout and this signal.
    }
  }
  child.kill("SIGKILL");
}
