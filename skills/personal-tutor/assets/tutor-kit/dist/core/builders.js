function requireText(value, label) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${label} is required`);
    }
    return value;
}
function requireItems(value, label) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${label} must contain at least one item`);
    }
    return value.map((item, index) => requireText(item, `${label}[${index}]`));
}
export function subsection(input) {
    return {
        id: requireText(input.id, "subsection.id"),
        title: requireText(input.title, "subsection.title"),
        description: input.description,
        tags: input.tags ?? [],
        blocks: input.blocks ?? input.widgets ?? []
    };
}
export function section(input) {
    return {
        id: requireText(input.id, "section.id"),
        title: requireText(input.title, "section.title"),
        description: input.description,
        tags: input.tags ?? [],
        blocks: input.blocks ?? input.widgets ?? [],
        subsections: input.subsections ?? []
    };
}
export function chapter(input) {
    return {
        id: requireText(input.id, "chapter.id"),
        title: requireText(input.title, "chapter.title"),
        description: input.description,
        tags: input.tags ?? [],
        sections: input.sections ?? []
    };
}
export function textbook(input) {
    return {
        id: requireText(input.id, "textbook.id"),
        title: requireText(input.title, "textbook.title"),
        description: input.description,
        tags: input.tags ?? [],
        chapters: input.chapters ?? []
    };
}
export function p(input) {
    return {
        kind: "p",
        id: requireText(input.id, "p.id"),
        props: {
            body: requireText(input.body, "p.body")
        }
    };
}
export function heading(input) {
    return {
        kind: "heading",
        id: requireText(input.id, "heading.id"),
        props: {
            text: requireText(input.text, "heading.text"),
            level: input.level ?? 4
        }
    };
}
export function list(input) {
    return {
        kind: "list",
        id: requireText(input.id, "list.id"),
        props: {
            style: input.style ?? "bullet",
            items: requireItems(input.items, "list.items")
        }
    };
}
export function codeBlock(input) {
    return {
        kind: "codeBlock",
        id: requireText(input.id, "codeBlock.id"),
        props: {
            code: requireText(input.code, "codeBlock.code"),
            language: input.language
        }
    };
}
export function mathBlock(input) {
    return {
        kind: "mathBlock",
        id: requireText(input.id, "mathBlock.id"),
        props: {
            body: requireText(input.body, "mathBlock.body")
        }
    };
}
export function callout(input) {
    return {
        kind: "callout",
        id: requireText(input.id, "callout.id"),
        props: {
            tone: input.tone ?? "note",
            title: input.title,
            body: requireText(input.body, "callout.body")
        }
    };
}
export function explanation(input) {
    return {
        kind: "explanation",
        id: requireText(input.id, "explanation.id"),
        props: {
            title: input.title,
            body: requireText(input.body, "explanation.body")
        }
    };
}
export function blurb(input) {
    return explanation(input);
}
//# sourceMappingURL=builders.js.map