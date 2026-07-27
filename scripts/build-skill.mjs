import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePackage = join(root, "packages", "tutor-kit");
const target = join(root, "skills", "personal-tutor", "assets", "tutor-kit");

const mode = parseArgs(process.argv.slice(2));

if (mode.check) {
  const tempRoot = mkdtempSync(join(tmpdir(), "personal-tutor-skill-"));
  const checkTarget = join(tempRoot, "tutor-kit");
  try {
    writeBundle(checkTarget);
    const differences = diffDirectories(checkTarget, target);
    if (differences.length > 0) {
      console.error("Bundled Tutor Kit asset is stale.");
      for (const difference of differences.slice(0, 40)) {
        console.error(`- ${difference}`);
      }
      if (differences.length > 40) {
        console.error(`- ...and ${differences.length - 40} more`);
      }
      console.error("");
      console.error("Run npm run build:skill and commit the updated skill asset.");
      process.exit(1);
    }
    console.log("Bundled Tutor Kit asset is up to date.");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
} else {
  rmSync(target, { recursive: true, force: true });
  writeBundle(target);
  console.log(`Copied built Tutor Kit package to ${target}`);
}

function parseArgs(args) {
  const result = { check: false };
  for (const arg of args) {
    if (arg === "--check") {
      result.check = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`Usage:
  node scripts/build-skill.mjs [--check]

Copies the built Tutor Kit runtime into skills/personal-tutor/assets/tutor-kit.

Options:
  --check   Build into a temporary directory and fail if the checked-in asset is stale.
  -h        Show this help.`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return result;
}

function writeBundle(destination) {
  const packageJson = join(sourcePackage, "package.json");
  const packageLock = join(sourcePackage, "package-lock.json");
  const assets = join(sourcePackage, "assets");
  const dist = join(sourcePackage, "dist");

  if (!existsSync(packageLock)) {
    throw new Error(`Missing Tutor Kit runtime lockfile: ${packageLock}`);
  }
  if (!existsSync(dist)) {
    throw new Error(`Missing Tutor Kit build output: ${dist}`);
  }

  mkdirSync(destination, { recursive: true });
  cpSync(packageJson, join(destination, "package.json"));
  cpSync(packageLock, join(destination, "package-lock.json"));
  cpSync(assets, join(destination, "assets"), { recursive: true });
  cpSync(dist, join(destination, "dist"), { recursive: true });
  writeFileSync(join(destination, ".gitkeep"), "");
}

function diffDirectories(expected, actual) {
  const expectedFiles = collectFiles(expected);
  const actualFiles = collectFiles(actual);
  const allFiles = [...new Set([...expectedFiles.keys(), ...actualFiles.keys()])].sort();
  const differences = [];

  for (const file of allFiles) {
    const expectedPath = expectedFiles.get(file);
    const actualPath = actualFiles.get(file);
    if (!expectedPath) {
      differences.push(`extra file: ${file}`);
      continue;
    }
    if (!actualPath) {
      differences.push(`missing file: ${file}`);
      continue;
    }
    if (!readFileSync(expectedPath).equals(readFileSync(actualPath))) {
      differences.push(`changed file: ${file}`);
    }
  }

  return differences;
}

function collectFiles(directory) {
  const files = new Map();
  if (!existsSync(directory)) return files;

  const visit = (current) => {
    for (const entry of readdirSync(current).filter((name) => name !== ".DS_Store").sort()) {
      const fullPath = join(current, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        visit(fullPath);
        continue;
      }
      if (stats.isFile()) {
        files.set(relative(directory, fullPath), fullPath);
      }
    }
  };

  visit(directory);
  return files;
}
