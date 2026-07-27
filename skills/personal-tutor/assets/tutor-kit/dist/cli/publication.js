import { cpSync, existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { compileWorkspace } from "../compile/compile.js";
import { invalidateWorkspaceCaches, loadTextbooks, resolveWorkspace } from "../compile/discover.js";
import { verifyCodingProblems } from "../compile/verify-coding.js";
import { recordDoctorEvidence } from "./evidence.js";
import { addTextbook, initWorkspace } from "./workspace.js";
export async function beginTextbook(cwd, textbookId, title) {
    validateTextbookId(textbookId);
    initWorkspace(cwd);
    invalidateWorkspaceCaches(cwd);
    const workspace = await resolveWorkspace(cwd);
    const workDir = join(workspace.cwd, "tutor-work", textbookId);
    if (existsSync(workDir))
        return { workDir, resumed: true };
    initWorkspace(workDir, { learnerMemory: false });
    const sharedTutorDir = join(workspace.cwd, "tutor");
    if (existsSync(sharedTutorDir)) {
        cpSync(sharedTutorDir, join(workDir, "tutor"), { recursive: true, force: true });
    }
    writeFileSync(join(workDir, "tutor.config.ts"), stagingConfig(workspace));
    const publishedDir = join(workspace.textbooksDir, textbookId);
    const stagedDir = join(workDir, "textbooks", textbookId);
    if (existsSync(publishedDir)) {
        cpSync(publishedDir, stagedDir, { recursive: true });
    }
    else {
        addTextbook(workDir, textbookId, title);
    }
    invalidateWorkspaceCaches(workDir);
    return { workDir, resumed: false };
}
export async function publishTextbook(cwd, textbookId) {
    validateTextbookId(textbookId);
    const workspace = await resolveWorkspace(cwd);
    const workDir = join(workspace.cwd, "tutor-work", textbookId);
    const sourceDir = join(workDir, "textbooks", textbookId);
    if (!existsSync(sourceDir)) {
        throw new Error(`No work area found for textbook ${textbookId}. Run tutor begin ${textbookId} first.`);
    }
    invalidateWorkspaceCaches(workDir);
    const compile = await compileWorkspace(workDir, { textbookId });
    if (!compile.ok)
        throw new Error(compile.output);
    const verification = await verifyCodingProblems(workDir, { textbookId });
    if (!verification.ok)
        throw new Error(verification.output);
    await recordDoctorEvidence(workDir, textbookId, compile, verification);
    mkdirSync(workspace.textbooksDir, { recursive: true });
    const temporaryRoot = mkdtempSync(join(workspace.textbooksDir, `.publish-${textbookId}-`));
    const preparedDir = join(temporaryRoot, textbookId);
    const publishedDir = join(workspace.textbooksDir, textbookId);
    let archivedDir = null;
    let installedPublishedSource = false;
    try {
        cpSync(sourceDir, preparedDir, { recursive: true });
        if (existsSync(publishedDir)) {
            archivedDir = join(workspace.cwd, "tutor-archive", textbookId, archiveTimestamp());
            mkdirSync(dirname(archivedDir), { recursive: true });
            renameSync(publishedDir, archivedDir);
        }
        renameSync(preparedDir, publishedDir);
        installedPublishedSource = true;
        invalidateWorkspaceCaches(workspace.cwd);
        const loaded = await loadTextbooks(workspace.cwd, { textbookId });
        const found = loaded.textbooks.some(({ textbook }) => textbook.id === textbookId);
        if (loaded.issues.length > 0 || !found) {
            const details = loaded.issues.length > 0
                ? loaded.issues.map((issue) => issue.message).join("\n")
                : `Textbook not found: ${textbookId}`;
            throw new Error(`Published textbook ${textbookId} could not be loaded from ${publishedDir}:\n${details}`);
        }
    }
    catch (error) {
        if (installedPublishedSource) {
            rmSync(publishedDir, { recursive: true, force: true });
        }
        if (archivedDir && !existsSync(publishedDir)) {
            renameSync(archivedDir, publishedDir);
        }
        invalidateWorkspaceCaches(workspace.cwd);
        throw error;
    }
    finally {
        rmSync(temporaryRoot, { recursive: true, force: true });
    }
    rmSync(workDir, { recursive: true, force: true });
    invalidateWorkspaceCaches(workDir);
    invalidateWorkspaceCaches(workspace.cwd);
    return {
        publishedDir,
        archivedDir,
        compileOutput: compile.output,
        verificationOutput: verification.output
    };
}
function stagingConfig(workspace) {
    const config = {
        title: workspace.title,
        textbooksDir: "textbooks",
        dataDir: "tutor-data",
        codeRunner: workspace.codeRunner
    };
    return `export default ${JSON.stringify(config, null, 2)};\n`;
}
function validateTextbookId(textbookId) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(textbookId)) {
        throw new Error(`Invalid textbook id: ${textbookId}. Use lowercase letters, numbers, and hyphens.`);
    }
}
function archiveTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-");
}
//# sourceMappingURL=publication.js.map