import { existsSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { collectChapterBlocks, collectSectionBlocks } from "./traversal.js";
export { summarizeChapter, summarizeSection, summarizeSubsection, summarizeTextbook } from "./traversal.js";
const calloutTones = new Set(["note", "caution", "key-idea"]);
const listStyles = new Set(["bullet", "number"]);
const headingLevels = new Set([4, 5]);
const diagramSyntaxes = new Set(["mermaid"]);
const chartTypes = new Set(["bar", "line"]);
const quizModes = new Set(["check", "review", "practice-test"]);
const quizDifficulties = new Set(["easy", "medium", "hard"]);
const chapterRoles = new Set(["instruction", "cumulative-checkpoint"]);
const sectionRoles = new Set(["instruction", "practice", "review", "assessment"]);
const transformationFormats = new Set(["markdown", "code", "math", "table"]);
const transformationLayouts = new Set(["auto", "flow", "compare"]);
const taskVerbPattern = /^(write|predict|explain|compare|classify|debug|diagnose|fix|implement|solve|justify|design|create|trace|identify|rewrite|describe|test|name|build|apply|refactor|interpret|spot)\b/i;
const reviewHintPattern = /\b(check|self-check|review|recall|retrieval|mastery|quiz|practice|try|exercise|explain|predict|compare|debug|apply|test)\b/i;
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function issue(message, path, file) {
    return { file, path, message };
}
export function validateTextbook(value, file) {
    const issues = [];
    if (!isRecord(value)) {
        return [issue("Textbook export must be an object.", "default", file)];
    }
    if (!hasText(value.id))
        issues.push(issue("Textbook id is required.", "id", file));
    if (!hasText(value.title))
        issues.push(issue("Textbook title is required.", "title", file));
    if (!Array.isArray(value.chapters)) {
        issues.push(issue("Textbook chapters must be an array.", "chapters", file));
        return issues;
    }
    const chapterIds = new Set();
    for (const [index, chapter] of value.chapters.entries()) {
        issues.push(...validateChapter(chapter, file).map((chapterIssue) => ({
            ...chapterIssue,
            path: `chapters[${index}]${chapterIssue.path ? `.${chapterIssue.path}` : ""}`
        })));
        if (isRecord(chapter) && hasText(chapter.id)) {
            if (chapterIds.has(chapter.id)) {
                issues.push(issue(`Duplicate chapter id in textbook: ${chapter.id}`, `chapters[${index}].id`, file));
            }
            chapterIds.add(chapter.id);
        }
    }
    issues.push(...validateTextbookHeuristics(value, file));
    return issues;
}
function validateTextbookHeuristics(textbook, file) {
    const issues = [];
    if (!Array.isArray(textbook.chapters))
        return issues;
    const quizBlocks = collectTextbookBlocks(textbook).filter(isQuizBlock);
    const answerPositions = collectFourChoiceAnswerPositions(quizBlocks);
    const chapters = textbook.chapters.filter(isRecord);
    const describedChapterCount = chapters.filter((chapter) => hasText(chapter.description)).length;
    if (describedChapterCount > 0 && describedChapterCount < chapters.length) {
        issues.push(issue("Chapter descriptions should be used consistently across a textbook: provide descriptions for all chapters or none.", "chapters", file));
    }
    if (answerPositions.total >= 24 &&
        [0, 1, 2, 3].some((position) => (answerPositions.counts.get(position) ?? 0) / answerPositions.total < 0.1)) {
        issues.push(issue("Textbook quiz correct answers should use all four choice positions, with each position containing at least 10% of four-choice answers.", "chapters", file));
    }
    return issues;
}
export function validateChapter(value, file) {
    const issues = [];
    if (!isRecord(value)) {
        return [issue("Chapter must be an object.", "", file)];
    }
    if (!hasText(value.id))
        issues.push(issue("Chapter id is required.", "id", file));
    if (!hasText(value.title))
        issues.push(issue("Chapter title is required.", "title", file));
    if (value.role !== undefined && !chapterRoles.has(value.role)) {
        issues.push(issue("Chapter role must be instruction or cumulative-checkpoint.", "role", file));
    }
    if (!Array.isArray(value.sections)) {
        issues.push(issue("Chapter sections must be an array.", "sections", file));
        return issues;
    }
    const sectionIds = new Set();
    for (const [index, section] of value.sections.entries()) {
        issues.push(...validateSection(section, file).map((sectionIssue) => ({
            ...sectionIssue,
            path: `sections[${index}]${sectionIssue.path ? `.${sectionIssue.path}` : ""}`
        })));
        if (isRecord(section) && hasText(section.id)) {
            if (sectionIds.has(section.id)) {
                issues.push(issue(`Duplicate section id in chapter: ${section.id}`, `sections[${index}].id`, file));
            }
            sectionIds.add(section.id);
        }
    }
    issues.push(...validateChapterLearningHeuristics(value, file));
    return issues;
}
function validateChapterLearningHeuristics(chapter, file) {
    const issues = [];
    const blocks = collectChapterBlocks(chapter);
    const quizBlocks = blocks.filter(isQuizBlock);
    const reviewQuizzes = quizBlocks.filter((block) => block.props.mode === "review");
    const practiceTestQuizzes = quizBlocks.filter((block) => block.props.mode === "practice-test");
    const isPracticeTestChapter = practiceTestQuizzes.length > 0;
    const chapterRole = chapter.role;
    const finalSection = chapter.sections.at(-1);
    if (reviewQuizzes.length > 0 && practiceTestQuizzes.length > 0) {
        issues.push(issue("A chapter must not contain both review and practice-test quizzes. Put cumulative practice tests in dedicated chapters.", "sections", file));
    }
    if (chapterRole === "instruction") {
        if (practiceTestQuizzes.length > 0) {
            issues.push(issue("Instruction chapters must not contain practice-test quizzes. Put cumulative assessment in a cumulative-checkpoint chapter.", "sections", file));
        }
        if (blocks.length >= 8 && finalSection?.role !== "review") {
            issues.push(issue("Non-trivial instruction chapters must end with a section whose role is review.", "sections", file));
        }
        if (blocks.length >= 8 &&
            finalSection?.role === "review" &&
            !collectSectionBlocks(finalSection).some((block) => isQuizBlock(block) && block.props.mode === "review")) {
            issues.push(issue("The final review section of a non-trivial instruction chapter must contain a review quiz.", "sections", file));
        }
    }
    if (chapterRole === "cumulative-checkpoint") {
        if (practiceTestQuizzes.length === 0) {
            issues.push(issue("Cumulative-checkpoint chapters must contain a practice-test quiz.", "sections", file));
        }
        if (quizBlocks.some((block) => block.props.mode === "check" || block.props.mode === "review")) {
            issues.push(issue("Cumulative-checkpoint chapters must not contain check or review quizzes.", "sections", file));
        }
        if (finalSection?.role !== "assessment") {
            issues.push(issue("Cumulative-checkpoint chapters must end with a section whose role is assessment.", "sections", file));
        }
        const hasConcreteNonQuizTask = blocks.some((block) => block.kind === "codingProblem" || looksLikeTaskList(block));
        if (!hasConcreteNonQuizTask) {
            issues.push(issue("Cumulative-checkpoint chapters must include at least one concrete non-quiz task.", "sections", file));
        }
    }
    if (blocks.length < 4)
        return issues;
    if (blocks.length >= 8 && quizBlocks.length === 0) {
        issues.push(issue("Non-trivial chapter should include at least one quiz block.", "sections", file));
    }
    if (blocks.length >= 8 && reviewQuizzes.length === 0 && !isPracticeTestChapter) {
        issues.push(issue("Non-trivial chapter should end with a review quiz.", "sections", file));
    }
    if (blocks.length >= 8 && reviewQuizzes.length > 0) {
        const finalSectionHasReview = finalSection !== undefined &&
            collectSectionBlocks(finalSection).some((block) => isQuizBlock(block) && block.props.mode === "review");
        if (!finalSectionHasReview) {
            issues.push(issue("Non-trivial chapter review quiz must appear in the chapter's final section.", "sections", file));
        }
    }
    if (chapter.sections.length >= 3 && !isPracticeTestChapter && !quizBlocks.some((block) => block.props.mode === "check")) {
        issues.push(issue("Chapter with several sections should include at least one check quiz before the final review.", "sections", file));
    }
    if (chapter.sections.length < 2) {
        issues.push(issue("Non-trivial chapter has fewer than 2 sections. Split concept introduction, examples, practice, and review into clearer teaching moves.", "sections", file));
    }
    const subsectionCount = chapter.sections.reduce((count, section) => count + section.subsections.length, 0);
    if (blocks.length >= 8 && subsectionCount === 0) {
        issues.push(issue("Substantial chapter has no subsections. Add a focused worked example, misconception, boundary case, or practice cluster when useful.", "sections", file));
    }
    const hasPracticeMove = blocks.some((block) => (block.kind === "codingProblem" ||
        block.kind === "quiz" ||
        looksLikeTaskList(block) ||
        (!isVisualExampleBlock(block) && blockText(block).some((text) => reviewHintPattern.test(text)))));
    if (!hasPracticeMove) {
        issues.push(issue("Chapter appears exposition-heavy. Add guided or independent practice with concrete learner tasks.", "sections", file));
    }
    const hasReviewMove = blocks.some((block) => (block.kind === "quiz" ||
        looksLikeTaskList(block) ||
        (!isVisualExampleBlock(block) && blockText(block).some((text) => reviewHintPattern.test(text)))));
    if (!hasReviewMove) {
        issues.push(issue("Chapter is missing a retrieval, review, or mastery-check move.", "sections", file));
    }
    const hasCodeExample = blocks.some((block) => (block.kind === "codeBlock" &&
        isRecord(block.props) &&
        typeof block.props.language === "string" &&
        block.props.language.trim().length > 0));
    const hasCodingProblem = blocks.some((block) => block.kind === "codingProblem");
    if (hasCodeExample && !hasCodingProblem) {
        issues.push(issue("Programming-oriented chapter has code examples but no codingProblem for runnable independent practice.", "sections", file));
    }
    return issues;
}
export function validateSection(value, file) {
    const issues = [];
    if (!isRecord(value)) {
        return [issue("Section must be an object.", "", file)];
    }
    if (!hasText(value.id))
        issues.push(issue("Section id is required.", "id", file));
    if (!hasText(value.title))
        issues.push(issue("Section title is required.", "title", file));
    if (value.role !== undefined && !sectionRoles.has(value.role)) {
        issues.push(issue("Section role must be instruction, practice, review, or assessment.", "role", file));
    }
    validateBlockList(value.blocks, "blocks", file, issues);
    if (!Array.isArray(value.subsections)) {
        issues.push(issue("Section subsections must be an array.", "subsections", file));
        return issues;
    }
    const subsectionIds = new Set();
    for (const [index, subsection] of value.subsections.entries()) {
        issues.push(...validateSubsection(subsection, file).map((subsectionIssue) => ({
            ...subsectionIssue,
            path: `subsections[${index}]${subsectionIssue.path ? `.${subsectionIssue.path}` : ""}`
        })));
        if (isRecord(subsection) && hasText(subsection.id)) {
            if (subsectionIds.has(subsection.id)) {
                issues.push(issue(`Duplicate subsection id in section: ${subsection.id}`, `subsections[${index}].id`, file));
            }
            subsectionIds.add(subsection.id);
        }
    }
    if (sectionRoles.has(value.role)) {
        const blocks = collectSectionBlocks(value);
        const quizBlocks = blocks.filter(isQuizBlock);
        if (value.role === "review" && quizBlocks.some((block) => block.props.mode === "practice-test")) {
            issues.push(issue("Review sections must not contain practice-test quizzes.", "blocks", file));
        }
        if (value.role === "assessment" && quizBlocks.some((block) => block.props.mode === "review")) {
            issues.push(issue("Assessment sections must not contain review quizzes.", "blocks", file));
        }
    }
    return issues;
}
export function validateSubsection(value, file) {
    const issues = [];
    if (!isRecord(value)) {
        return [issue("Subsection must be an object.", "", file)];
    }
    if (!hasText(value.id))
        issues.push(issue("Subsection id is required.", "id", file));
    if (!hasText(value.title))
        issues.push(issue("Subsection title is required.", "title", file));
    validateBlockList(value.blocks, "blocks", file, issues);
    return issues;
}
function validateBlockList(blocks, path, file, issues) {
    if (!Array.isArray(blocks)) {
        issues.push(issue("Blocks must be an array.", path, file));
        return;
    }
    const blockIds = new Set();
    for (const [index, block] of blocks.entries()) {
        validateBlock(block, `${path}[${index}]`, file, issues);
        if (isRecord(block) && hasText(block.id)) {
            if (blockIds.has(block.id)) {
                issues.push(issue(`Duplicate block id: ${block.id}`, `${path}[${index}].id`, file));
            }
            blockIds.add(block.id);
        }
    }
}
export function validateBlock(block, path, file, issues) {
    if (!isRecord(block)) {
        issues.push(issue("Block must be an object.", path, file));
        return;
    }
    if (!hasText(block.id))
        issues.push(issue("Block id is required.", `${path}.id`, file));
    if (!hasText(block.kind))
        issues.push(issue("Block kind is required.", `${path}.kind`, file));
    if (!isRecord(block.props)) {
        issues.push(issue("Block props must be an object.", `${path}.props`, file));
        return;
    }
    if (block.kind === "p" || block.kind === "explanation" || block.kind === "blurb") {
        validateTextProp(block.props.body, `${path}.props.body`, file, issues);
        return;
    }
    if (block.kind === "heading") {
        validateTextProp(block.props.text, `${path}.props.text`, file, issues);
        if (!headingLevels.has(block.props.level)) {
            issues.push(issue("Heading level must be 4 or 5.", `${path}.props.level`, file));
        }
        return;
    }
    if (block.kind === "list") {
        if (!listStyles.has(block.props.style)) {
            issues.push(issue("List style must be bullet or number.", `${path}.props.style`, file));
        }
        if (!Array.isArray(block.props.items) || block.props.items.length === 0) {
            issues.push(issue("List items must be a non-empty array.", `${path}.props.items`, file));
        }
        else {
            block.props.items.forEach((item, index) => validateTextProp(item, `${path}.props.items[${index}]`, file, issues));
        }
        return;
    }
    if (block.kind === "codeBlock") {
        if (!hasText(block.props.code))
            issues.push(issue("Code block code is required.", `${path}.props.code`, file));
        if (block.props.language !== undefined && typeof block.props.language !== "string") {
            issues.push(issue("Code block language must be a string.", `${path}.props.language`, file));
        }
        return;
    }
    if (block.kind === "mathBlock") {
        if (!hasText(block.props.body))
            issues.push(issue("Math block body is required.", `${path}.props.body`, file));
        return;
    }
    if (block.kind === "diagram") {
        validateDiagram(block.props, `${path}.props`, file, issues);
        return;
    }
    if (block.kind === "chart") {
        validateChart(block.props, `${path}.props`, file, issues);
        return;
    }
    if (block.kind === "image") {
        validateImage(block.props, `${path}.props`, file, issues);
        return;
    }
    if (block.kind === "callout") {
        if (!calloutTones.has(block.props.tone)) {
            issues.push(issue("Callout tone must be note, caution, or key-idea.", `${path}.props.tone`, file));
        }
        if (block.props.title !== undefined && typeof block.props.title !== "string") {
            issues.push(issue("Callout title must be a string.", `${path}.props.title`, file));
        }
        validateTextProp(block.props.body, `${path}.props.body`, file, issues);
        return;
    }
    if (block.kind === "glossary") {
        validateGlossary(block.props, `${path}.props`, file, issues);
        return;
    }
    if (block.kind === "transformation") {
        validateTransformation(block.props, `${path}.props`, file, issues);
        return;
    }
    if (block.kind === "codingProblem") {
        validateCodingProblem(block.props, `${path}.props`, file, issues);
        return;
    }
    if (block.kind === "quiz") {
        validateQuiz(block.props, `${path}.props`, file, issues);
    }
}
function validateDiagram(props, path, file, issues) {
    if (props.title !== undefined)
        validateTextProp(props.title, `${path}.title`, file, issues);
    if (!diagramSyntaxes.has(props.syntax)) {
        issues.push(issue("Diagram syntax must be mermaid.", `${path}.syntax`, file));
    }
    validateTextProp(props.body, `${path}.body`, file, issues);
}
function validateChart(props, path, file, issues) {
    validateTextProp(props.title, `${path}.title`, file, issues);
    if (!chartTypes.has(props.type)) {
        issues.push(issue("Chart type must be bar or line.", `${path}.type`, file));
    }
    if (props.xLabel !== undefined)
        validateTextProp(props.xLabel, `${path}.xLabel`, file, issues);
    if (props.yLabel !== undefined)
        validateTextProp(props.yLabel, `${path}.yLabel`, file, issues);
    if (!Array.isArray(props.points) || props.points.length === 0) {
        issues.push(issue("Chart points must be a non-empty array.", `${path}.points`, file));
        return;
    }
    if (props.type === "line" && props.points.length < 2) {
        issues.push(issue("Line charts must contain at least two points.", `${path}.points`, file));
    }
    props.points.forEach((point, index) => {
        const pointPath = `${path}.points[${index}]`;
        if (!isRecord(point)) {
            issues.push(issue("Chart point must be an object.", pointPath, file));
            return;
        }
        validateTextProp(point.label, `${pointPath}.label`, file, issues);
        if (typeof point.value !== "number" || !Number.isFinite(point.value)) {
            issues.push(issue("Chart point value must be a finite number.", `${pointPath}.value`, file));
        }
    });
}
function validateImage(props, path, file, issues) {
    validateTextProp(props.src, `${path}.src`, file, issues);
    validateTextProp(props.alt, `${path}.alt`, file, issues);
    if (props.caption !== undefined)
        validateTextProp(props.caption, `${path}.caption`, file, issues);
    if (props.credit !== undefined)
        validateTextProp(props.credit, `${path}.credit`, file, issues);
    if (typeof props.src === "string" && !isSafeImageSrc(props.src)) {
        issues.push(issue('Image src must reference a textbook asset path such as "assets/example.png".', `${path}.src`, file));
    }
    else if (typeof props.src === "string" && file && !imageAssetExists(props.src, file)) {
        issues.push(issue(`Image asset does not exist inside the textbook directory: ${props.src}`, `${path}.src`, file));
    }
}
function isSafeImageSrc(src) {
    if (!src.startsWith("assets/"))
        return false;
    if (src.includes("\\") || src.includes("\0"))
        return false;
    return !src.split("/").some((part) => part === "" || part === "." || part === "..");
}
function imageAssetExists(src, textbookFile) {
    const textbookDir = dirname(textbookFile);
    const target = resolve(textbookDir, src);
    if (!existsSync(target))
        return false;
    try {
        const realTextbookDir = realpathSync(textbookDir);
        const realTarget = realpathSync(target);
        const pathFromTextbook = relative(realTextbookDir, realTarget);
        return statSync(realTarget).isFile()
            && pathFromTextbook !== ""
            && !pathFromTextbook.startsWith("..")
            && !isAbsolute(pathFromTextbook);
    }
    catch {
        return false;
    }
}
function validateGlossary(props, path, file, issues) {
    if (props.title !== undefined)
        validateTextProp(props.title, `${path}.title`, file, issues);
    if (!Array.isArray(props.entries) || props.entries.length === 0) {
        issues.push(issue("Glossary entries must be a non-empty array.", `${path}.entries`, file));
        return;
    }
    props.entries.forEach((entry, index) => {
        const entryPath = `${path}.entries[${index}]`;
        if (!isRecord(entry)) {
            issues.push(issue("Glossary entry must be an object.", entryPath, file));
            return;
        }
        validateTextProp(entry.term, `${entryPath}.term`, file, issues);
        validateTextProp(entry.definition, `${entryPath}.definition`, file, issues);
    });
}
function validateTransformation(props, path, file, issues) {
    validateTextProp(props.title, `${path}.title`, file, issues);
    validateTextProp(props.focus, `${path}.focus`, file, issues);
    if (!transformationLayouts.has(props.layout)) {
        issues.push(issue("Transformation layout must be auto, flow, or compare.", `${path}.layout`, file));
    }
    validateTextProp(props.inputLabel, `${path}.inputLabel`, file, issues);
    validateTextProp(props.operationLabel, `${path}.operationLabel`, file, issues);
    validateTextProp(props.outputLabel, `${path}.outputLabel`, file, issues);
    validateTextProp(props.explanation, `${path}.explanation`, file, issues);
    validateTransformationArtifactList(props.input, `${path}.input`, file, issues);
    validateTransformationArtifact(props.operation, `${path}.operation`, file, issues);
    validateTransformationArtifactList(props.output, `${path}.output`, file, issues);
}
function validateTransformationArtifactList(value, path, file, issues) {
    if (!Array.isArray(value) || value.length === 0) {
        issues.push(issue("Transformation artifacts must be a non-empty array.", path, file));
        return;
    }
    value.forEach((artifact, index) => validateTransformationArtifact(artifact, `${path}[${index}]`, file, issues));
}
function validateTransformationArtifact(value, path, file, issues) {
    if (!isRecord(value)) {
        issues.push(issue("Transformation artifact must be an object.", path, file));
        return;
    }
    if (!transformationFormats.has(value.format)) {
        issues.push(issue("Transformation artifact format must be markdown, code, math, or table.", `${path}.format`, file));
        return;
    }
    if (value.label !== undefined)
        validateTextProp(value.label, `${path}.label`, file, issues);
    if (value.format === "markdown" || value.format === "code" || value.format === "math") {
        validateTextProp(value.body, `${path}.body`, file, issues);
        if (value.format === "code" && value.language !== undefined && typeof value.language !== "string") {
            issues.push(issue("Transformation code artifact language must be a string.", `${path}.language`, file));
        }
        return;
    }
    if (!Array.isArray(value.columns) || value.columns.length === 0) {
        issues.push(issue("Transformation table columns must be a non-empty array.", `${path}.columns`, file));
    }
    else {
        value.columns.forEach((column, index) => {
            if (typeof column !== "string") {
                issues.push(issue("Transformation table columns must be strings.", `${path}.columns[${index}]`, file));
            }
        });
    }
    if (!Array.isArray(value.rows)) {
        issues.push(issue("Transformation table rows must be an array.", `${path}.rows`, file));
        return;
    }
    value.rows.forEach((row, rowIndex) => {
        const rowPath = `${path}.rows[${rowIndex}]`;
        if (!Array.isArray(row)) {
            issues.push(issue("Transformation table row must be an array.", rowPath, file));
            return;
        }
        if (Array.isArray(value.columns) && row.length !== value.columns.length) {
            issues.push(issue("Transformation table row width must match its column count.", rowPath, file));
        }
        row.forEach((cell, cellIndex) => {
            if (typeof cell !== "string") {
                issues.push(issue("Transformation table cells must be strings.", `${rowPath}[${cellIndex}]`, file));
            }
        });
    });
}
function validateCodingProblem(props, path, file, issues) {
    validateTextProp(props.title, `${path}.title`, file, issues);
    validateTextProp(props.prompt, `${path}.prompt`, file, issues);
    if (typeof props.prompt === "string") {
        const prompt = props.prompt.trim();
        const hasConcreteSignal = /function|return|implement|write|fill in|query|string|input|output|expected|ordered|where|filter|debug|fix|test/i.test(prompt);
        if (prompt.length < 80 || !hasConcreteSignal) {
            issues.push(issue("Coding problem prompt may be too vague. State the concrete behavior, expected output or query shape, and any important constraints before relying on tests.", `${path}.prompt`, file));
        }
    }
    if (props.language !== undefined && typeof props.language !== "string") {
        issues.push(issue("Coding problem language must be a string.", `${path}.language`, file));
    }
    if (!Array.isArray(props.files) || props.files.length === 0) {
        issues.push(issue("Coding problem files must be a non-empty array.", `${path}.files`, file));
    }
    else {
        const filePaths = new Set();
        let editableCount = 0;
        props.files.forEach((problemFile, index) => {
            const filePath = `${path}.files[${index}]`;
            if (!isRecord(problemFile)) {
                issues.push(issue("Coding problem file must be an object.", filePath, file));
                return;
            }
            if (!hasText(problemFile.path)) {
                issues.push(issue("Coding problem file path is required.", `${filePath}.path`, file));
            }
            else {
                validateProblemPath(problemFile.path, `${filePath}.path`, file, issues);
                if (filePaths.has(problemFile.path)) {
                    issues.push(issue(`Duplicate coding problem file path: ${problemFile.path}`, `${filePath}.path`, file));
                }
                filePaths.add(problemFile.path);
            }
            if (typeof problemFile.content !== "string") {
                issues.push(issue("Coding problem file content must be a string.", `${filePath}.content`, file));
            }
            if (problemFile.editable !== undefined && typeof problemFile.editable !== "boolean") {
                issues.push(issue("Coding problem file editable must be a boolean.", `${filePath}.editable`, file));
            }
            if (problemFile.hidden !== undefined && typeof problemFile.hidden !== "boolean") {
                issues.push(issue("Coding problem file hidden must be a boolean.", `${filePath}.hidden`, file));
            }
            if (problemFile.language !== undefined && typeof problemFile.language !== "string") {
                issues.push(issue("Coding problem file language must be a string.", `${filePath}.language`, file));
            }
            if (problemFile.editable === true)
                editableCount += 1;
        });
        if (editableCount === 0) {
            issues.push(issue("Coding problem must contain at least one editable file.", `${path}.files`, file));
        }
        if (props.verification === undefined) {
            issues.push(issue("Coding problem should define verification metadata so its starter failure and reference solution can be verified.", `${path}.verification`, file));
        }
    }
    if (!Array.isArray(props.actions) || props.actions.length === 0) {
        issues.push(issue("Coding problem actions must be a non-empty array.", `${path}.actions`, file));
        return;
    }
    if (props.setup !== undefined) {
        validateCodingAction(props.setup, `${path}.setup`, file, issues);
    }
    const actionIds = new Set();
    props.actions.forEach((action, index) => {
        const actionPath = `${path}.actions[${index}]`;
        if (validateCodingAction(action, actionPath, file, issues)) {
            if (actionIds.has(action.id)) {
                issues.push(issue(`Duplicate coding problem action id: ${action.id}`, `${actionPath}.id`, file));
            }
            actionIds.add(action.id);
        }
    });
    validateCodingVerification(props.verification, props.files, actionIds, `${path}.verification`, file, issues);
}
function validateCodingVerification(verification, files, actionIds, path, file, issues) {
    if (verification === undefined)
        return;
    if (!isRecord(verification)) {
        issues.push(issue("Coding problem verification must be an object.", path, file));
        return;
    }
    if (!hasText(verification.actionId)) {
        issues.push(issue("Coding problem verification actionId is required.", `${path}.actionId`, file));
    }
    else if (!actionIds.has(verification.actionId)) {
        issues.push(issue("Coding problem verification actionId must match an action.", `${path}.actionId`, file));
    }
    if (!isRecord(verification.referenceFiles) || Object.keys(verification.referenceFiles).length === 0) {
        issues.push(issue("Coding problem verification referenceFiles must be a non-empty object.", `${path}.referenceFiles`, file));
        return;
    }
    const problemFiles = Array.isArray(files)
        ? files.filter(isRecord)
        : [];
    for (const [targetPath, referencePath] of Object.entries(verification.referenceFiles)) {
        const target = problemFiles.find((problemFile) => problemFile.path === targetPath);
        const reference = problemFiles.find((problemFile) => problemFile.path === referencePath);
        if (!target || target.editable !== true) {
            issues.push(issue(`Verification target must match an editable file: ${targetPath}`, `${path}.referenceFiles`, file));
        }
        if (!reference) {
            issues.push(issue(`Verification reference file does not exist: ${String(referencePath)}`, `${path}.referenceFiles`, file));
        }
        else if (reference.hidden !== true) {
            issues.push(issue(`Verification reference file must be hidden: ${String(referencePath)}`, `${path}.referenceFiles`, file));
        }
    }
}
function validateQuiz(props, path, file, issues) {
    validateTextProp(props.title, `${path}.title`, file, issues);
    if (!quizModes.has(props.mode)) {
        issues.push(issue("Quiz mode must be check, review, or practice-test.", `${path}.mode`, file));
    }
    if (!Array.isArray(props.questions) || props.questions.length === 0) {
        issues.push(issue("Quiz questions must be a non-empty array.", `${path}.questions`, file));
        return;
    }
    if (props.mode === "check" && (props.questions.length < 1 || props.questions.length > 3)) {
        issues.push(issue("Check quiz should contain 1-3 questions.", `${path}.questions`, file));
    }
    if (props.mode === "review" && (props.questions.length < 4 || props.questions.length > 10)) {
        issues.push(issue("Review quiz should contain 4-10 questions.", `${path}.questions`, file));
    }
    if (props.mode === "practice-test" && props.questions.length < 10) {
        issues.push(issue("Practice-test quiz should contain at least 10 questions.", `${path}.questions`, file));
    }
    const questionIds = new Set();
    const tags = new Set();
    const difficulties = new Set();
    const answerPositions = new Map();
    const fourChoiceAnswerPositions = new Map();
    let choiceQuestionCount = 0;
    let fourChoiceQuestionCount = 0;
    props.questions.forEach((question, index) => {
        const questionPath = `${path}.questions[${index}]`;
        if (!isRecord(question)) {
            issues.push(issue("Quiz question must be an object.", questionPath, file));
            return;
        }
        if (!hasText(question.id)) {
            issues.push(issue("Quiz question id is required.", `${questionPath}.id`, file));
        }
        else {
            if (questionIds.has(question.id)) {
                issues.push(issue(`Duplicate quiz question id: ${question.id}`, `${questionPath}.id`, file));
            }
            questionIds.add(question.id);
        }
        validateTextProp(question.prompt, `${questionPath}.prompt`, file, issues);
        validateTextProp(question.explanation, `${questionPath}.explanation`, file, issues);
        if (question.difficulty !== undefined && !quizDifficulties.has(question.difficulty)) {
            issues.push(issue("Quiz question difficulty must be easy, medium, or hard.", `${questionPath}.difficulty`, file));
        }
        if (question.tags !== undefined) {
            if (!Array.isArray(question.tags)) {
                issues.push(issue("Quiz question tags must be an array of strings.", `${questionPath}.tags`, file));
            }
            else {
                question.tags.forEach((tag, tagIndex) => {
                    if (typeof tag !== "string") {
                        issues.push(issue("Quiz question tag must be a string.", `${questionPath}.tags[${tagIndex}]`, file));
                    }
                    else if (tag.trim().length > 0) {
                        tags.add(tag);
                    }
                });
            }
        }
        else {
            issues.push(issue("Quiz question should include tags.", `${questionPath}.tags`, file));
        }
        const questionKind = question.kind;
        if (questionKind !== "multiple-choice" && questionKind !== "matching") {
            issues.push(issue("Quiz question kind must be multiple-choice or matching.", `${questionPath}.kind`, file));
            return;
        }
        if (questionKind === "matching") {
            validateMatchingQuizQuestion(question, questionPath, file, issues);
            if (typeof question.difficulty === "string" && quizDifficulties.has(question.difficulty)) {
                difficulties.add(question.difficulty);
            }
            return;
        }
        if (!Array.isArray(question.choices) || question.choices.length < 2) {
            issues.push(issue("Quiz question choices must contain at least 2 choices.", `${questionPath}.choices`, file));
            return;
        }
        choiceQuestionCount += 1;
        const choiceIds = new Set();
        question.choices.forEach((choice, choiceIndex) => {
            const choicePath = `${questionPath}.choices[${choiceIndex}]`;
            if (!isRecord(choice)) {
                issues.push(issue("Quiz choice must be an object.", choicePath, file));
                return;
            }
            if (!hasText(choice.id)) {
                issues.push(issue("Quiz choice id is required.", `${choicePath}.id`, file));
            }
            else {
                if (choiceIds.has(choice.id)) {
                    issues.push(issue(`Duplicate quiz choice id: ${choice.id}`, `${choicePath}.id`, file));
                }
                choiceIds.add(choice.id);
            }
            validateTextProp(choice.body, `${choicePath}.body`, file, issues);
        });
        if (!hasText(question.answer)) {
            issues.push(issue("Quiz question answer is required.", `${questionPath}.answer`, file));
        }
        else if (!choiceIds.has(question.answer)) {
            issues.push(issue("Quiz question answer must match a choice id.", `${questionPath}.answer`, file));
        }
        else {
            const answerPosition = question.choices.findIndex((choice) => isRecord(choice) && choice.id === question.answer);
            answerPositions.set(answerPosition, (answerPositions.get(answerPosition) ?? 0) + 1);
            if (question.choices.length === 4) {
                fourChoiceQuestionCount += 1;
                fourChoiceAnswerPositions.set(answerPosition, (fourChoiceAnswerPositions.get(answerPosition) ?? 0) + 1);
            }
        }
        if (typeof question.difficulty === "string" && quizDifficulties.has(question.difficulty)) {
            difficulties.add(question.difficulty);
        }
    });
    if (props.mode === "practice-test" && tags.size < 3) {
        issues.push(issue("Practice-test quiz should include questions from at least 3 distinct tags.", `${path}.questions`, file));
    }
    if (props.mode === "practice-test" && difficulties.size < 2) {
        issues.push(issue("Practice-test quiz should include at least 2 difficulty levels.", `${path}.questions`, file));
    }
    if (choiceQuestionCount >= 4) {
        const highestPositionCount = Math.max(0, ...answerPositions.values());
        if (highestPositionCount / choiceQuestionCount > 0.7) {
            issues.push(issue("Quiz correct answers are overly concentrated in one choice position. Shuffle choices to reduce answer-position bias.", `${path}.questions`, file));
        }
    }
    if (fourChoiceQuestionCount >= 8 && fourChoiceAnswerPositions.size < 3) {
        issues.push(issue("Quiz correct answers should use at least 3 different choice positions across 8 or more four-choice questions.", `${path}.questions`, file));
    }
}
function validateMatchingQuizQuestion(question, path, file, issues) {
    if (question.leftLabel !== undefined)
        validateTextProp(question.leftLabel, `${path}.leftLabel`, file, issues);
    if (question.rightLabel !== undefined)
        validateTextProp(question.rightLabel, `${path}.rightLabel`, file, issues);
    if (!Array.isArray(question.pairs) || question.pairs.length < 2) {
        issues.push(issue("Matching quiz question pairs must contain at least 2 pairs.", `${path}.pairs`, file));
        return;
    }
    const pairIds = new Set();
    question.pairs.forEach((pair, pairIndex) => {
        const pairPath = `${path}.pairs[${pairIndex}]`;
        if (!isRecord(pair)) {
            issues.push(issue("Matching quiz pair must be an object.", pairPath, file));
            return;
        }
        if (!hasText(pair.id)) {
            issues.push(issue("Matching quiz pair id is required.", `${pairPath}.id`, file));
        }
        else {
            if (pairIds.has(pair.id)) {
                issues.push(issue(`Duplicate matching quiz pair id: ${pair.id}`, `${pairPath}.id`, file));
            }
            pairIds.add(pair.id);
        }
        validateTextProp(pair.left, `${pairPath}.left`, file, issues);
        validateTextProp(pair.right, `${pairPath}.right`, file, issues);
        if (pair.explanation !== undefined)
            validateTextProp(pair.explanation, `${pairPath}.explanation`, file, issues);
    });
}
function validateCodingAction(action, path, file, issues) {
    if (!isRecord(action)) {
        issues.push(issue("Coding problem action must be an object.", path, file));
        return false;
    }
    if (!hasText(action.id)) {
        issues.push(issue("Coding problem action id is required.", `${path}.id`, file));
    }
    if (!hasText(action.label))
        issues.push(issue("Coding problem action label is required.", `${path}.label`, file));
    if (!hasText(action.command))
        issues.push(issue("Coding problem action command is required.", `${path}.command`, file));
    if (action.kind !== undefined && typeof action.kind !== "string") {
        issues.push(issue("Coding problem action kind must be a string.", `${path}.kind`, file));
    }
    if (action.hidden !== undefined && typeof action.hidden !== "boolean") {
        issues.push(issue("Coding problem action hidden must be a boolean.", `${path}.hidden`, file));
    }
    return hasText(action.id);
}
function validateProblemPath(value, path, file, issues) {
    const parts = value.split("/");
    if (value.startsWith("/") ||
        value.includes("\\") ||
        parts.some((part) => part === "" || part === "." || part === "..")) {
        issues.push(issue("Coding problem file paths must be relative forward-slash paths without . or ..", path, file));
    }
}
function validateTextProp(value, path, file, issues) {
    if (!hasText(value)) {
        issues.push(issue("Text is required.", path, file));
        return;
    }
    validateMarkupText(value, path, file, issues);
}
function validateMarkupText(value, path, file, issues) {
    const dollarCount = [...value.matchAll(/(?<!\\)\$/g)].length;
    if (dollarCount % 2 !== 0) {
        issues.push(issue("Markdown/LaTeX has an unmatched $ delimiter.", path, file));
    }
    const fenceCount = [...value.matchAll(/```/g)].length;
    if (fenceCount % 2 !== 0) {
        issues.push(issue("Markdown has an unmatched code fence.", path, file));
    }
}
function collectTextbookBlocks(textbook) {
    const blocks = [];
    if (!Array.isArray(textbook.chapters))
        return blocks;
    for (const chapter of textbook.chapters) {
        if (!isRecord(chapter) || !Array.isArray(chapter.sections))
            continue;
        for (const section of chapter.sections) {
            if (!isRecord(section))
                continue;
            if (Array.isArray(section.blocks))
                blocks.push(...section.blocks);
            if (!Array.isArray(section.subsections))
                continue;
            for (const subsection of section.subsections) {
                if (isRecord(subsection) && Array.isArray(subsection.blocks)) {
                    blocks.push(...subsection.blocks);
                }
            }
        }
    }
    return blocks;
}
function collectFourChoiceAnswerPositions(quizBlocks) {
    const counts = new Map();
    let total = 0;
    for (const block of quizBlocks) {
        if (!Array.isArray(block.props.questions))
            continue;
        for (const question of block.props.questions) {
            if (!isRecord(question) || !Array.isArray(question.choices) || question.choices.length !== 4 || !hasText(question.answer)) {
                continue;
            }
            const answerPosition = question.choices.findIndex((choice) => isRecord(choice) && choice.id === question.answer);
            if (answerPosition < 0)
                continue;
            total += 1;
            counts.set(answerPosition, (counts.get(answerPosition) ?? 0) + 1);
        }
    }
    return { total, counts };
}
function isQuizBlock(block) {
    return block.kind === "quiz" && isRecord(block.props);
}
function blockText(block) {
    const texts = [block.id];
    if (!isRecord(block.props))
        return texts;
    if (typeof block.props.title === "string")
        texts.push(block.props.title);
    if (typeof block.props.text === "string")
        texts.push(block.props.text);
    if (typeof block.props.body === "string")
        texts.push(block.props.body);
    if (typeof block.props.prompt === "string")
        texts.push(block.props.prompt);
    if (Array.isArray(block.props.entries)) {
        for (const entry of block.props.entries) {
            if (!isRecord(entry))
                continue;
            if (typeof entry.term === "string")
                texts.push(entry.term);
            if (typeof entry.definition === "string")
                texts.push(entry.definition);
        }
    }
    if (Array.isArray(block.props.items)) {
        for (const item of block.props.items) {
            if (typeof item === "string")
                texts.push(item);
        }
    }
    if (Array.isArray(block.props.questions)) {
        for (const question of block.props.questions) {
            if (!isRecord(question))
                continue;
            if (typeof question.prompt === "string")
                texts.push(question.prompt);
            if (typeof question.explanation === "string")
                texts.push(question.explanation);
        }
    }
    return texts;
}
function looksLikeTaskList(block) {
    if (block.kind !== "list" || !isRecord(block.props) || !Array.isArray(block.props.items)) {
        return false;
    }
    return block.props.items.some((item) => (typeof item === "string" &&
        (item.includes("?") || taskVerbPattern.test(item.trim()))));
}
function isVisualExampleBlock(block) {
    return block.kind === "transformation" || block.kind === "diagram" || block.kind === "chart";
}
//# sourceMappingURL=validation.js.map