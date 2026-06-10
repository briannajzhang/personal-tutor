#!/usr/bin/env node
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
    dryRun: false
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

  console.log(`Installed ${skillName} skill`);
  console.log(`- destination: ${destination}`);
  console.log("");
  console.log("Try it in Codex with:");
  console.log("Use $personal-tutor to create a practice-heavy study plan.");
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
  --dry-run            Print what would happen without copying files
  -h, --help           Show this help
  -v, --version        Show the package version

Examples:
  npx personal-tutor@latest
  npx personal-tutor@latest --force
  npx personal-tutor@latest --skills-dir ~/.codex/skills
`);
}
