import { mkdirSync, symlinkSync } from "node:fs";
import { join, resolve } from "node:path";

export const repoRoot = resolve(import.meta.dirname, "../..");
export const exampleWorkspace = join(repoRoot, "examples", "learner-workspace");

export function linkTutorKit(workspace: string): void {
  const nodeModules = join(workspace, "node_modules");
  mkdirSync(nodeModules, { recursive: true });
  symlinkSync(join(repoRoot, "packages", "tutor-kit"), join(nodeModules, "tutor-kit"), "dir");
}
