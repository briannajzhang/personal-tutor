#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillDir = dirname(scriptDir);
const cliPath = join(skillDir, "assets", "tutor-kit", "dist", "cli", "index.js");
const supportedNodeRange = "^20.19.0 || >=22.12.0";

if (!isSupportedNode(process.versions.node)) {
  console.error(`Tutor Kit requires Node ${supportedNodeRange}.`);
  console.error(`Current Node: ${process.version}`);
  console.error("Install a supported Node version, then rerun the command.");
  process.exit(1);
}

if (!existsSync(cliPath)) {
  console.error(`Tutor Kit CLI not found at ${cliPath}`);
  console.error("Reinstall the personal-tutor skill or rebuild the bundled Tutor Kit asset.");
  process.exit(1);
}

const args = process.argv.slice(2);
const cliArgs = hasCwdOption(args) ? args : ["--cwd", defaultLibraryDir(), ...args];
const result = spawnSync(process.execPath, [cliPath, ...cliArgs], {
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

if (result.signal) {
  console.error(`Tutor Kit CLI terminated by signal ${result.signal}`);
  process.exit(1);
}

function hasCwdOption(args) {
  return args.includes("--cwd");
}

function defaultLibraryDir() {
  const configured = process.env.PERSONAL_TUTOR_HOME?.trim();
  if (!configured || configured === "~") return configured ? homedir() : join(homedir(), ".personal-tutor");
  if (configured.startsWith("~/")) return join(homedir(), configured.slice(2));
  return resolve(configured);
}

function isSupportedNode(version) {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map((part) => Number.parseInt(part, 10));
  if (major === 20) {
    return minor > 19 || (minor === 19 && patch >= 0);
  }
  return major > 22 || (major === 22 && minor >= 12);
}
