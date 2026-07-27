#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillDir = dirname(scriptDir);
const kitDir = join(skillDir, "assets", "tutor-kit");
const cliPath = join(kitDir, "dist", "cli", "index.js");
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

ensureTutorKitDependencies();

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

function ensureTutorKitDependencies() {
  const missing = missingTutorKitDependencies();
  if (missing.length === 0) return;

  console.error("Preparing Tutor Kit for first use...");
  const npm = npmInvocation();
  const installCommand = existsSync(join(kitDir, "package-lock.json")) ? "ci" : "install";
  const npmArgs = [
    ...npm.args,
    installCommand,
    "--omit=dev",
    "--ignore-scripts",
    "--no-audit",
    "--fund=false"
  ];
  const install = spawnSync(npm.command, npmArgs, {
    cwd: kitDir,
    stdio: "inherit"
  });

  if (install.error || install.status !== 0) {
    if (install.error) console.error(install.error.message);
    console.error("Tutor Kit package installation failed.");
    console.error(`Run this command to try again: ${repairCommand(installCommand)}`);
    process.exit(typeof install.status === "number" && install.status !== 0 ? install.status : 1);
  }

  const stillMissing = missingTutorKitDependencies();
  if (stillMissing.length > 0) {
    console.error(`Tutor Kit is still missing these packages: ${stillMissing.join(", ")}`);
    console.error(`Run this command to repair it: ${repairCommand(installCommand)}`);
    process.exit(1);
  }
}

function missingTutorKitDependencies() {
  const packageJsonPath = join(kitDir, "package.json");
  if (!existsSync(packageJsonPath)) {
    console.error(`Tutor Kit package file not found at ${packageJsonPath}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  return Object.keys(packageJson.dependencies ?? {}).filter((dependency) => {
    return !dependencyPackageExists(dependency);
  });
}

function dependencyPackageExists(dependency) {
  let current = kitDir;
  while (true) {
    const packageJsonPath = join(current, "node_modules", ...dependency.split("/"), "package.json");
    if (existsSync(packageJsonPath)) return true;

    const parent = dirname(current);
    if (parent === current) return false;
    current = parent;
  }
}

function npmInvocation() {
  if (process.env.PERSONAL_TUTOR_NPM_BIN) {
    return { command: resolve(process.env.PERSONAL_TUTOR_NPM_BIN), args: [] };
  }
  if (process.env.npm_execpath) {
    return { command: process.execPath, args: [process.env.npm_execpath] };
  }
  return {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    args: []
  };
}

function repairCommand(installCommand) {
  return `cd ${shellQuote(kitDir)} && npm ${installCommand} --omit=dev --ignore-scripts --no-audit --fund=false`;
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:=@+-]+$/.test(value)) return value;
  return `'${value.replaceAll("'", "'\\''")}'`;
}
