import { readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
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
export function codingProblem(input) {
    return {
        kind: "codingProblem",
        id: requireText(input.id, "codingProblem.id"),
        props: {
            title: requireText(input.title, "codingProblem.title"),
            prompt: requireText(input.prompt, "codingProblem.prompt"),
            language: input.language ?? "python",
            files: input.files.map(normalizeProblemFile),
            setup: input.setup === undefined ? undefined : normalizeCodingAction("setup", input.setup, "Setup", "setup"),
            actions: normalizeCodingActions(input),
            verification: input.verification === undefined ? undefined : {
                actionId: requireText(input.verification.actionId, "codingProblem.verification.actionId"),
                referenceFiles: { ...input.verification.referenceFiles }
            },
            review: input.review ?? input.reviewPrompt
        }
    };
}
export function quiz(input) {
    return {
        kind: "quiz",
        id: requireText(input.id, "quiz.id"),
        props: {
            title: requireText(input.title, "quiz.title"),
            mode: input.mode ?? "check",
            questions: input.questions.map(normalizeQuizQuestion)
        }
    };
}
export function projectFiles(baseUrl, dir) {
    const root = resolve(dirname(fileURLToPath(baseUrl)), dir);
    return {
        file(path, options = {}) {
            const resolved = resolve(root, path);
            if (resolved !== root && !resolved.startsWith(root + sep)) {
                throw new Error(`Problem file escapes project directory: ${path}`);
            }
            return normalizeProblemFile({
                path,
                content: readFileSync(resolved, "utf8"),
                source: relative(dirname(fileURLToPath(baseUrl)), resolved).replaceAll("\\", "/"),
                sourcePath: resolved,
                ...options
            });
        },
        inline(path, content, options = {}) {
            return normalizeProblemFile({ path, content, ...options });
        }
    };
}
function normalizeQuizQuestion(input) {
    return {
        id: requireText(input.id, "quiz.questions[].id"),
        prompt: requireText(input.prompt, "quiz.questions[].prompt"),
        choices: input.choices.map(normalizeQuizChoice),
        answer: requireText(input.answer, "quiz.questions[].answer"),
        explanation: requireText(input.explanation, "quiz.questions[].explanation"),
        tags: input.tags ?? [],
        difficulty: input.difficulty
    };
}
function normalizeQuizChoice(input) {
    return {
        id: requireText(input.id, "quiz.questions[].choices[].id"),
        body: requireText(input.body, "quiz.questions[].choices[].body")
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
function normalizeProblemFile(input) {
    return {
        path: requireText(input.path, "codingProblem.files[].path"),
        content: String(input.content ?? ""),
        editable: input.editable ?? false,
        hidden: input.hidden ?? false,
        language: input.language,
        source: input.source,
        sourcePath: input.sourcePath
    };
}
function normalizeCodingActions(input) {
    const actions = new Map();
    if (input.run !== undefined)
        addAction(actions, "run", input.run, "Run", "run");
    if (input.test !== undefined)
        addAction(actions, "test", input.test, "Test", "test");
    for (const [id, command] of Object.entries(input.commands ?? {})) {
        addAction(actions, id, command, titleCase(id), id);
    }
    for (const action of input.actions ?? []) {
        addAction(actions, action.id, action, action.label ?? titleCase(action.id), action.kind ?? action.id);
    }
    return [...actions.values()];
}
function addAction(actions, id, value, label, kind) {
    actions.set(id, normalizeCodingAction(id, value, label, kind));
}
function normalizeCodingAction(id, value, label, kind) {
    const input = typeof value === "string" ? { command: value } : value;
    return {
        id: requireText(id, "codingProblem.actions[].id"),
        label: requireText(input.label ?? label, "codingProblem.actions[].label"),
        command: requireText(input.command, "codingProblem.actions[].command"),
        kind: input.kind ?? kind,
        hidden: input.hidden ?? false
    };
}
function titleCase(value) {
    return value
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
//# sourceMappingURL=builders.js.map