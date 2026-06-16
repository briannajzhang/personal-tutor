import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import { join, resolve } from "node:path";

export const repoRoot = resolve(import.meta.dirname, "../..");

export function linkTutorKit(workspace: string): void {
  const nodeModules = join(workspace, "node_modules");
  const link = join(nodeModules, "tutor-kit");
  if (existsSync(link)) return;
  mkdirSync(nodeModules, { recursive: true });
  symlinkSync(join(repoRoot, "packages", "tutor-kit"), link, "dir");
}
