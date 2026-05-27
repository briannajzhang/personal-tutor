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
    validateWidgetList(value.widgets, "widgets", file, issues);
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
    validateWidgetList(value.widgets, "widgets", file, issues);
    return issues;
}
function validateWidgetList(widgets, path, file, issues) {
    if (!Array.isArray(widgets)) {
        issues.push(issue("Widgets must be an array.", path, file));
        return;
    }
    const widgetIds = new Set();
    for (const [index, widget] of widgets.entries()) {
        validateWidget(widget, `${path}[${index}]`, file, issues);
        if (isRecord(widget) && hasText(widget.id)) {
            if (widgetIds.has(widget.id)) {
                issues.push(issue(`Duplicate widget id: ${widget.id}`, `${path}[${index}].id`, file));
            }
            widgetIds.add(widget.id);
        }
    }
}
export function validateWidget(widget, path, file, issues) {
    if (!isRecord(widget)) {
        issues.push(issue("Widget must be an object.", path, file));
        return;
    }
    if (!hasText(widget.id))
        issues.push(issue("Widget id is required.", `${path}.id`, file));
    if (!hasText(widget.title))
        issues.push(issue("Widget title is required.", `${path}.title`, file));
    if (!hasText(widget.kind))
        issues.push(issue("Widget kind is required.", `${path}.kind`, file));
    if (!isRecord(widget.props))
        issues.push(issue("Widget props must be an object.", `${path}.props`, file));
    if (widget.kind === "blurb") {
        if (!isRecord(widget.props) || !hasText(widget.props.body)) {
            issues.push(issue("Blurb body is required.", `${path}.props.body`, file));
        }
        else {
            validateMarkupText(widget.props.body, `${path}.props.body`, file, issues);
        }
    }
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
    return { widgets: subsection.widgets.length };
}
export function summarizeSection(section) {
    let widgets = section.widgets.length;
    for (const subsection of section.subsections) {
        widgets += summarizeSubsection(subsection).widgets;
    }
    return { subsections: section.subsections.length, widgets };
}
export function summarizeChapter(chapter) {
    let subsections = 0;
    let widgets = 0;
    for (const section of chapter.sections) {
        const summary = summarizeSection(section);
        subsections += summary.subsections;
        widgets += summary.widgets;
    }
    return { sections: chapter.sections.length, subsections, widgets };
}
export function summarizeTextbook(textbook) {
    let sections = 0;
    let subsections = 0;
    let widgets = 0;
    for (const chapter of textbook.chapters) {
        const summary = summarizeChapter(chapter);
        sections += summary.sections;
        subsections += summary.subsections;
        widgets += summary.widgets;
    }
    return { chapters: textbook.chapters.length, sections, subsections, widgets };
}
//# sourceMappingURL=validation.js.map