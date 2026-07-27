import { loadTextbooks } from "../compile/discover.js";
export async function reportDevTextbookIssues(cwd, report = console.error) {
    const loaded = await loadTextbooks(cwd);
    if (loaded.issues.length === 0)
        return;
    report(formatDevTextbookIssues(loaded.issues));
    if (loaded.textbooks.length === 0) {
        throw new Error("Tutor UI did not start because no textbooks could be loaded. Fix the issues above and run tutor dev again.");
    }
}
export function formatDevTextbookIssues(issues) {
    const label = issues.length === 1 ? "issue" : "issues";
    const lines = [`Tutor Kit found ${issues.length} textbook load ${label} before starting the Tutor UI:`];
    for (const issue of issues) {
        const location = issue.file ? ` (${issue.file})` : "";
        lines.push(`- ${issue.textbookId ?? "workspace"}${location}`);
        const detail = issue.message.split("\n").find((line) => line.trim().length > 0)?.trim()
            ?? "This textbook could not be loaded.";
        lines.push(`  ${detail}`);
    }
    return lines.join("\n");
}
