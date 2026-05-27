import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePackage = join(root, "packages", "tutor-kit");
const target = join(root, "skills", "personal-tutor", "assets", "tutor-kit");

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(join(sourcePackage, "package.json"), join(target, "package.json"));
cpSync(join(sourcePackage, "dist"), join(target, "dist"), { recursive: true });
writeFileSync(join(target, ".gitkeep"), "");

console.log(`Copied built Tutor Kit package to ${target}`);
