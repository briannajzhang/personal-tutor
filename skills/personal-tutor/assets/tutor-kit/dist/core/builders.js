function requireText(value, label) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`${label} is required`);
    }
    return value;
}
export function subsection(input) {
    return {
        id: requireText(input.id, "subsection.id"),
        title: requireText(input.title, "subsection.title"),
        description: input.description,
        tags: input.tags ?? [],
        widgets: input.widgets ?? []
    };
}
export function section(input) {
    return {
        id: requireText(input.id, "section.id"),
        title: requireText(input.title, "section.title"),
        description: input.description,
        tags: input.tags ?? [],
        widgets: input.widgets ?? [],
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
export function blurb(input) {
    return {
        kind: "blurb",
        id: requireText(input.id, "blurb.id"),
        title: requireText(input.title, "blurb.title"),
        props: {
            body: requireText(input.body, "blurb.body")
        }
    };
}
//# sourceMappingURL=builders.js.map