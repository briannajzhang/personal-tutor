#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillName = "personal-tutor";
const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceSkillDir = join(packageRoot, "skills", skillName);

main(process.argv.slice(2));

function main(rawArgs) {
  if (rawArgs[0] === "help" || rawArgs[0] === "--help" || rawArgs[0] === "-h") {
    printHelp();
    return;
  }

  if (rawArgs[0] === "version" || rawArgs[0] === "--version" || rawArgs[0] === "-v") {
    console.log(`personal-tutor ${packageVersion()}`);
    return;
  }

  const args = [...rawArgs];
  const command = args[0] && !args[0].startsWith("-") ? args.shift() : "install";

  if (command !== "install") {
    fail(`Unknown command: ${command}`);
  }

  installSkill(parseInstallArgs(args));
}

function parseInstallArgs(args) {
  const options = {
    skillsDir: defaultSkillsDir(),
    skillDir: undefined,
    force: false,
    dryRun: false,
    installDeps: true
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--skip-deps") {
      options.installDeps = false;
      continue;
    }

    if (arg === "--skills-dir") {
      const value = args[++index];
      if (!value) fail("--skills-dir requires a path");
      options.skillsDir = resolveUserPath(value);
      continue;
    }

    if (arg === "--skill-dir") {
      const value = args[++index];
      if (!value) fail("--skill-dir requires a path");
      options.skillDir = resolveUserPath(value);
      continue;
    }

    fail(`Unknown option: ${arg}`);
  }

  return options;
}

function installSkill(options) {
  if (!existsSync(sourceSkillDir)) {
    fail(`Packaged skill source not found: ${sourceSkillDir}`);
  }

  const destination = options.skillDir ?? join(options.skillsDir, skillName);

  if (options.dryRun) {
    console.log(`Would install ${skillName} skill`);
    console.log(`- source: ${sourceSkillDir}`);
    console.log(`- destination: ${destination}`);
    console.log(`- overwrite: ${options.force ? "yes" : "no"}`);
    console.log(`- install Tutor Kit dependencies: ${options.installDeps ? "yes" : "no"}`);
    return;
  }

  if (existsSync(destination)) {
    if (!options.force) {
      fail([
        `${skillName} already exists at ${destination}`,
        "Use --force to replace it, or --skill-dir to choose another destination."
      ].join("\n"));
    }
    rmSync(destination, { recursive: true, force: true });
  }

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(sourceSkillDir, destination, {
    recursive: true,
    filter: (source) => basename(source) !== ".DS_Store"
  });

  if (options.installDeps) {
    installTutorKitDependencies(destination);
    verifyTutorKitCli(destination);
  } else {
    console.log("Skipped Tutor Kit dependency installation.");
    console.log(`Run this later if the bundled tutor command reports missing packages:`);
    console.log(tutorKitInstallCommand(destination));
  }

  console.log(`Installed ${skillName} skill`);
  console.log(`- destination: ${destination}`);
  if (options.installDeps) console.log("- bundled Tutor Kit CLI: verified");
  console.log("");
  console.log("Try it in Codex with:");
  console.log("Use $personal-tutor to create a practice-heavy Tutor Kit lesson with quizzes and verified exercises.");
}

function installTutorKitDependencies(skillDir) {
  const kitDir = tutorKitDir(skillDir);
  if (!existsSync(join(kitDir, "package.json"))) {
    fail(`Packaged Tutor Kit package not found: ${kitDir}`);
  }

  console.log("Installing Tutor Kit runtime dependencies...");
  const npm = npmInvocation();
  const args = [
    ...npm.args,
    "install",
    "--prefix",
    kitDir,
    "--omit=dev",
    "--ignore-scripts",
    "--no-audit",
    "--fund=false"
  ];
  const result = spawnSync(npm.command, args, { encoding: "utf8" });

  if (result.status !== 0) {
    fail([
      "Installed the skill files, but Tutor Kit dependency installation failed.",
      "",
      formatCommandFailure(npm.command, args, result),
      "",
      "Repair command:",
      tutorKitInstallCommand(skillDir)
    ].join("\n"));
  }

  console.log("- Tutor Kit dependencies installed");
}

function verifyTutorKitCli(skillDir) {
  const cli = tutorKitCliPath(skillDir);
  const result = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" });
  if (result.status !== 0) {
    fail([
      "Installed the skill files and dependencies, but the bundled Tutor Kit CLI did not start.",
      "",
      formatCommandFailure(process.execPath, [cli, "--help"], result),
      "",
      "Repair command:",
      tutorKitInstallCommand(skillDir)
    ].join("\n"));
  }
}

function tutorKitDir(skillDir) {
  return join(skillDir, "assets", "tutor-kit");
}

function tutorKitCliPath(skillDir) {
  return join(tutorKitDir(skillDir), "dist", "cli", "index.js");
}

function npmInvocation() {
  if (process.env.PERSONAL_TUTOR_NPM_BIN) {
    return { command: resolveUserPath(process.env.PERSONAL_TUTOR_NPM_BIN), args: [] };
  }
  if (process.env.npm_execpath) {
    return { command: process.execPath, args: [process.env.npm_execpath] };
  }
  return { command: process.platform === "win32" ? "npm.cmd" : "npm", args: [] };
}

function tutorKitInstallCommand(skillDir) {
  return `npm install --prefix ${shellQuote(tutorKitDir(skillDir))} --omit=dev --ignore-scripts --no-audit --fund=false`;
}

function formatCommandFailure(command, args, result) {
  const lines = [
    `Command: ${[command, ...args].map(shellQuote).join(" ")}`,
    `Exit status: ${result.status ?? "unknown"}`
  ];
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  if (output) lines.push(output);
  if (result.error) lines.push(String(result.error));
  return lines.join("\n");
}

function defaultSkillsDir() {
  const codexHome = process.env.CODEX_HOME
    ? resolveUserPath(process.env.CODEX_HOME)
    : join(homedir(), ".codex");
  return join(codexHome, "skills");
}

function resolveUserPath(path) {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return resolve(path);
}

function packageVersion() {
  const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  return packageJson.version;
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:=@+-]+$/.test(value)) return value;
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function printHelp() {
  console.log(`Personal Tutor skill installer

Usage:
  personal-tutor [install] [options]

Options:
  --skills-dir <path>  Parent skills directory. Default: \${CODEX_HOME:-~/.codex}/skills
  --skill-dir <path>   Exact destination directory for the personal-tutor skill
  --force              Replace an existing personal-tutor skill
  --skip-deps          Copy the skill without installing bundled Tutor Kit dependencies
  --dry-run            Print what would happen without copying files
  -h, --help           Show this help
  -v, --version        Show the package version

Examples:
  npx personal-tutor@latest
  npx personal-tutor@latest --force
  npx personal-tutor@latest --skip-deps
  npx personal-tutor@latest --skills-dir ~/.codex/skills
`);
}
