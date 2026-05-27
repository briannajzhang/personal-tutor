const calloutTones = new Set(["note", "caution", "key-idea"]);
const listStyles = new Set(["bullet", "number"]);
const headingLevels = new Set([4, 5]);
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
    if (block.kind === "callout") {
        if (!calloutTones.has(block.props.tone)) {
            issues.push(issue("Callout tone must be note, caution, or key-idea.", `${path}.props.tone`, file));
        }
        if (block.props.title !== undefined && typeof block.props.title !== "string") {
            issues.push(issue("Callout title must be a string.", `${path}.props.title`, file));
        }
        validateTextProp(block.props.body, `${path}.props.body`, file, issues);
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
export function summarizeSubsection(subsection) {
    return { blocks: subsection.blocks.length };
}
export function summarizeSection(section) {
    let blocks = section.blocks.length;
    for (const subsection of section.subsections) {
        blocks += summarizeSubsection(subsection).blocks;
    }
    return { subsections: section.subsections.length, blocks };
}
export function summarizeChapter(chapter) {
    let subsections = 0;
    let blocks = 0;
    for (const section of chapter.sections) {
        const summary = summarizeSection(section);
        subsections += summary.subsections;
        blocks += summary.blocks;
    }
    return { sections: chapter.sections.length, subsections, blocks };
}
export function summarizeTextbook(textbook) {
    let sections = 0;
    let subsections = 0;
    let blocks = 0;
    for (const chapter of textbook.chapters) {
        const summary = summarizeChapter(chapter);
        sections += summary.sections;
        subsections += summary.subsections;
        blocks += summary.blocks;
    }
    return { chapters: textbook.chapters.length, sections, subsections, blocks };
}
//# sourceMappingURL=validation.js.map