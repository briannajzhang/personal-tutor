#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillDir = dirname(scriptDir);
const cliPath = join(skillDir, "assets", "tutor-kit", "dist", "cli", "index.js");

if (!existsSync(cliPath)) {
  console.error(`Tutor Kit CLI not found at ${cliPath}`);
  console.error("Reinstall the personal-tutor skill or rebuild the bundled Tutor Kit asset.");
  process.exit(1);
}

const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], {
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
