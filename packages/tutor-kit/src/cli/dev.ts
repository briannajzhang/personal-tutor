import { loadTextbooks } from "../compile/discover.js";
import type { ValidationIssue } from "../core/types.js";

export async function reportDevTextbookIssues(
  cwd: string,
  report: (message: string) => void = console.error
): Promise<void> {
  const loaded = await loadTextbooks(cwd);
  if (loaded.issues.length === 0) return;

  report(formatDevTextbookIssues(loaded.issues));
  if (loaded.textbooks.length === 0) {
    throw new Error("Tutor UI did not start because no textbooks could be loaded. Fix the issues above and run tutor dev again.");
  }
}

export function formatDevTextbookIssues(issues: ValidationIssue[]): string {
  const label = issues.length === 1 ? "issue" : "issues";
  const lines = [`Tutor Kit found ${issues.length} textbook load ${label} before starting the Tutor UI:`];
  for (const issue of issues) {
    const location = issue.file ? ` (${issue.file})` : "";
    lines.push(`- ${issue.textbookId ?? "workspace"}${location}`);
    for (const line of issue.message.split("\n")) lines.push(`  ${line}`);
  }
  return lines.join("\n");
}
