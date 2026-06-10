#!/usr/bin/env node
import { resolve } from "node:path";
import { compileWorkspace } from "../compile/compile.js";
import { verifyCodingProblems } from "../compile/verify-coding.js";
import { loadTextbooks } from "../compile/discover.js";
import { startDevServer } from "../server/server.js";
import { addBlock, addChapter, addTextbook, initWorkspace, printWriteResult } from "./workspace.js";
async function main() {
    const args = parseArgs(process.argv.slice(2));
    const [command, subcommand, ...rest] = args.command;
    if (!command || command === "help" || command === "--help" || command === "-h") {
        console.log(help());
        return;
    }
    if (command === "init") {
        console.log(printWriteResult("Initialized Tutor Kit workspace", initWorkspace(args.cwd, {
            packageSpec: args.packageSpec
        })));
        return;
    }
    if (command === "add" && subcommand === "textbook") {
        const id = rest[0];
        if (!id)
            throw new Error("Usage: tutor add textbook <id> [title]");
        const title = rest.slice(1).join(" ") || titleFromId(id);
        console.log(printWriteResult(`Added textbook ${id}`, addTextbook(args.cwd, id, title)));
        return;
    }
    if (command === "add" && subcommand === "chapter") {
        const textbookId = rest[0];
        const id = rest[1];
        if (!textbookId || !id)
            throw new Error("Usage: tutor add chapter <textbook-id> <id> [title]");
        const title = rest.slice(2).join(" ") || titleFromId(id);
        console.log(printWriteResult(`Added chapter ${textbookId}/${id}`, addChapter(args.cwd, textbookId, id, title)));
        return;
    }
    if (command === "list" && subcommand === "textbooks") {
        const loaded = await loadTextbooks(args.cwd);
        if (loaded.issues.length > 0) {
            console.log(JSON.stringify({ issues: loaded.issues }, null, 2));
            process.exitCode = 1;
            return;
        }
        for (const { textbook } of loaded.textbooks) {
            console.log(`${textbook.id}\t${textbook.title}\t${textbook.chapters.length} chapters`);
        }
        return;
    }
    if (command === "inspect" && subcommand === "textbook") {
        const id = rest[0];
        if (!id)
            throw new Error("Usage: tutor inspect textbook <id>");
        const loaded = await loadTextbooks(args.cwd);
        const found = loaded.textbooks.find(({ textbook }) => textbook.id === id);
        if (!found)
            throw new Error(`Textbook not found: ${id}`);
        console.log(JSON.stringify(found.textbook, null, 2));
        return;
    }
    if (command === "add" && (subcommand === "block" || subcommand === "widget")) {
        const kind = rest[0];
        if (!kind)
            throw new Error("Usage: tutor add block <p|heading|list|codeBlock|mathBlock|callout|quiz|codingProblem>");
        console.log(printWriteResult(`Added block ${kind}`, addBlock(args.cwd, kind)));
        return;
    }
    if (command === "compile") {
        const result = await compileWorkspace(args.cwd, { textbookId: args.textbookId });
        console.log(result.output);
        process.exitCode = result.ok ? 0 : 1;
        return;
    }
    if (command === "verify" && subcommand === "coding-problems") {
        const result = await verifyCodingProblems(args.cwd, { textbookId: args.textbookId });
        console.log(result.output);
        process.exitCode = result.ok ? 0 : 1;
        return;
    }
    if (command === "dev") {
        const server = await startDevServer({ cwd: args.cwd, port: args.port });
        console.log(`Tutor UI running at ${server.url}`);
        console.log("Press Ctrl+C to stop.");
        return;
    }
    throw new Error(`Unknown command: ${args.command.join(" ")}`);
}
function parseArgs(argv) {
    let cwd = process.cwd();
    let port = 4177;
    let packageSpec = process.env.TUTOR_KIT_PACKAGE_SPEC;
    let textbookId;
    const command = [];
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === "--cwd") {
            const value = argv[++i];
            if (!value)
                throw new Error("--cwd requires a path");
            cwd = resolve(value);
            continue;
        }
        if (arg === "--port") {
            const value = argv[++i];
            if (!value)
                throw new Error("--port requires a number");
            port = Number(value);
            if (!Number.isInteger(port) || port <= 0)
                throw new Error("--port must be a positive integer");
            continue;
        }
        if (arg === "--package-spec") {
            const value = argv[++i];
            if (!value)
                throw new Error("--package-spec requires a package specifier");
            packageSpec = value;
            continue;
        }
        if (arg === "--textbook") {
            const value = argv[++i];
            if (!value)
                throw new Error("--textbook requires an id");
            textbookId = value;
            continue;
        }
        command.push(arg);
    }
    return { cwd: resolve(cwd), port, packageSpec, textbookId, command };
}
function titleFromId(id) {
    return id
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(" ");
}
function help() {
    return `Tutor Kit

Usage:
  tutor [--cwd path] init
  tutor [--cwd path] --package-spec file:/path/to/tutor-kit init
  tutor [--cwd path] add textbook <id> [title]
  tutor [--cwd path] add chapter <textbook-id> <id> [title]
  tutor [--cwd path] add block <p|heading|list|codeBlock|mathBlock|callout|quiz|codingProblem>
  tutor [--cwd path] list textbooks
  tutor [--cwd path] inspect textbook <id>
  tutor [--cwd path] compile [--textbook textbook-id]
  tutor [--cwd path] verify coding-problems [--textbook textbook-id]
  tutor [--cwd path] dev [--port 4177]
`;
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
//# sourceMappingURL=index.js.map