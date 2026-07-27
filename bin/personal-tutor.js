#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const skillName = "personal-tutor";
const supportedNodeRange = "^20.19.0 || >=22.12.0";
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

  if (command === "install") {
    assertSupportedNode();
    installSkill(parseInstallArgs(args));
    return;
  }

  if (command === "dev") {
    assertSupportedNode();
    runTutorKitDev(parseDevArgs(args));
    return;
  }

  fail(`Unknown command: ${command}`);
}

function parseInstallArgs(args) {
  const options = {
    agent: "codex",
    skillsDir: undefined,
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

    if (arg === "--agent") {
      const value = args[++index];
      if (!value) fail("--agent requires codex, claude-code, or all");
      if (!["codex", "claude-code", "all"].includes(value)) {
        fail("--agent must be codex, claude-code, or all");
      }
      options.agent = value;
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

function parseDevArgs(args) {
  const options = {
    agent: "codex",
    skillDir: undefined,
    help: false,
    tutorArgs: []
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--agent") {
      const value = args[++index];
      if (!value) fail("--agent requires codex or claude-code");
      if (!["codex", "claude-code"].includes(value)) {
        fail("--agent must be codex or claude-code for dev");
      }
      options.agent = value;
      continue;
    }

    if (arg === "--skill-dir") {
      const value = args[++index];
      if (!value) fail("--skill-dir requires a path");
      options.skillDir = resolveUserPath(value);
      continue;
    }

    if (arg === "--cwd") {
      const value = args[++index];
      if (!value) fail("--cwd requires a path");
      options.tutorArgs.push("--cwd", resolveUserPath(value));
      continue;
    }

    if (arg === "--port") {
      const value = args[++index];
      if (!value) fail("--port requires a number");
      options.tutorArgs.push("--port", value);
      continue;
    }

    fail(`Unknown option for dev: ${arg}`);
  }

  return options;
}

function installSkill(options) {
  if (!existsSync(sourceSkillDir)) {
    fail(`Packaged skill source not found: ${sourceSkillDir}`);
  }

  if (options.agent === "all" && (options.skillsDir || options.skillDir)) {
    fail("--skills-dir and --skill-dir cannot be used with --agent all");
  }
  const agents = options.agent === "all" ? ["codex", "claude-code"] : [options.agent];
  const targets = agents.map((agent) => ({
    agent,
    destination: options.skillDir ?? join(options.skillsDir ?? defaultSkillsDir(agent), skillName)
  }));

  if (options.dryRun) {
    console.log(`Would install ${skillName} skill`);
    console.log(`- source: ${sourceSkillDir}`);
    for (const target of targets) {
      console.log(`- ${agentLabel(target.agent)} destination: ${target.destination}`);
    }
    console.log(`- overwrite: ${options.force ? "yes" : "no"}`);
    console.log(`- install Tutor Kit dependencies: ${options.installDeps ? "yes" : "no"}`);
    return;
  }

  const existing = targets.filter(({ destination }) => existsSync(destination));
  if (existing.length > 0 && !options.force) {
    fail([
      ...existing.map(({ agent, destination }) => `${skillName} already exists for ${agentLabel(agent)} at ${destination}`),
      "Use --force to replace it, or choose another destination."
    ].join("\n"));
  }

  for (const { agent, destination } of targets) {
    if (existsSync(destination)) {
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
      console.log(`Skipped Tutor Kit dependency installation for ${agentLabel(agent)}.`);
      console.log("Run this later if the bundled tutor command reports missing packages:");
      console.log(tutorKitInstallCommand(destination));
    }

    console.log(`Installed ${skillName} skill for ${agentLabel(agent)}`);
    console.log(`- destination: ${destination}`);
    if (options.installDeps) console.log("- bundled Tutor Kit CLI: verified");
  }

  console.log("");
  if (agents.includes("codex")) {
    console.log("In Codex, use $personal-tutor to start a lesson.");
  }
  if (agents.includes("claude-code")) {
    console.log("In Claude Code, run /personal-tutor to start a lesson.");
  }
}

function runTutorKitDev(options) {
  const skillDir = options.skillDir ?? join(defaultSkillsDir(options.agent), skillName);
  const wrapper = join(skillDir, "scripts", "tutor-kit.mjs");
  if (!existsSync(wrapper)) {
    fail([
      `Personal Tutor skill not found for ${agentLabel(options.agent)} at ${skillDir}`,
      "Install it first, or pass --skill-dir <path>."
    ].join("\n"));
  }

  const tutorArgs = options.help ? ["--help"] : ["dev", ...options.tutorArgs];
  const result = spawnSync(process.execPath, [wrapper, ...tutorArgs], { encoding: "utf8" });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) fail(result.error.message);
  if (typeof result.status === "number") process.exit(result.status);
  if (result.signal) fail(`Tutor Kit CLI terminated by signal ${result.signal}`);
}

function installTutorKitDependencies(skillDir) {
  const kitDir = tutorKitDir(skillDir);
  if (!existsSync(join(kitDir, "package.json"))) {
    fail(`Packaged Tutor Kit package not found: ${kitDir}`);
  }

  console.log("Installing Tutor Kit runtime dependencies...");
  const npm = npmInvocation();
  const installCommand = existsSync(join(kitDir, "package-lock.json")) ? "ci" : "install";
  const args = [
    ...npm.args,
    installCommand,
    "--omit=dev",
    "--ignore-scripts",
    "--no-audit",
    "--fund=false"
  ];
  const result = spawnSync(npm.command, args, { cwd: kitDir, encoding: "utf8" });

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
  const kitDir = tutorKitDir(skillDir);
  const installCommand = existsSync(join(kitDir, "package-lock.json")) ? "ci" : "install";
  return `cd ${shellQuote(kitDir)} && npm ${installCommand} --omit=dev --ignore-scripts --no-audit --fund=false`;
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

function defaultSkillsDir(agent) {
  if (agent === "claude-code") {
    const claudeHome = process.env.CLAUDE_CONFIG_DIR
      ? resolveUserPath(process.env.CLAUDE_CONFIG_DIR)
      : join(homedir(), ".claude");
    return join(claudeHome, "skills");
  }
  const codexHome = process.env.CODEX_HOME ? resolveUserPath(process.env.CODEX_HOME) : join(homedir(), ".codex");
  return join(codexHome, "skills");
}

function agentLabel(agent) {
  return agent === "claude-code" ? "Claude Code" : "Codex";
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

function assertSupportedNode() {
  if (isSupportedNode(process.versions.node)) return;
  fail([
    `personal-tutor requires Node ${supportedNodeRange}.`,
    `Current Node: ${process.version}`,
    "Install a supported Node version, then rerun the command."
  ].join("\n"));
}

function isSupportedNode(version) {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map((part) => Number.parseInt(part, 10));
  if (major === 20) {
    return minor > 19 || (minor === 19 && patch >= 0);
  }
  return major > 22 || (major === 22 && minor >= 12);
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
  console.log(`Personal Tutor

Usage:
  personal-tutor [install] [options]
  personal-tutor dev [options]

Requirements:
  Node.js ${supportedNodeRange}

Install options:
  --agent <name>       Install for codex, claude-code, or all. Default: codex
  --skills-dir <path>  Parent skills directory for one agent
  --skill-dir <path>   Exact destination directory for the personal-tutor skill
  --force              Replace an existing personal-tutor skill
  --skip-deps          Copy the skill without installing bundled Tutor Kit dependencies
  --dry-run            Print what would happen without copying files

Dev options:
  --agent <name>       Open the course library for codex or claude-code. Default: codex
  --skill-dir <path>   Exact personal-tutor skill directory to use
  --cwd <path>         Tutor Kit workspace or library path
  --port <number>      Local Tutor Kit server port

Global options:
  -h, --help           Show this help
  -v, --version        Show the package version

Examples:
  npx personal-tutor@latest
  npx personal-tutor@latest --force
  npx personal-tutor@latest --skip-deps
  npx personal-tutor@latest --agent claude-code
  npx personal-tutor@latest --agent all
  npx personal-tutor@latest --skills-dir ~/.codex/skills
  npx personal-tutor@latest dev
  npx personal-tutor@latest dev --agent claude-code
`);
}
