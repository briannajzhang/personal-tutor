import { createHash } from "node:crypto";
import { existsSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { build, createServer as createViteServer, loadConfigFromFile, mergeConfig, normalizePath } from "vite";
import { collectChapterBlocks } from "../core/traversal.js";
const publicPrefix = "/__tutor-components/";
const virtualPrefix = "\0tutor-component:";
const reservedFrontendConfigKeys = ["root", "base", "appType", "server", "build"];
export class ComponentRegistry {
    #records = new Map();
    constructor(records = []) {
        this.replace(records);
    }
    replace(records) {
        this.#records.clear();
        for (const record of records)
            this.#records.set(record.id, record);
    }
    get(id) {
        return this.#records.get(id);
    }
    values() {
        return [...this.#records.values()];
    }
    moduleUrl(id) {
        return `${publicPrefix}${id}.js`;
    }
}
export function collectComponentRecords(cwd, textbooks) {
    const records = new Map();
    for (const loaded of textbooks) {
        for (const chapter of loaded.textbook.chapters) {
            for (const block of collectChapterBlocks(chapter)) {
                if (!isComponentBlock(block))
                    continue;
                const sourcePath = block.props.module.sourcePath;
                const safePath = requireWorkspaceComponentPath(cwd, sourcePath, block.id);
                const id = componentId(cwd, safePath);
                const existing = records.get(id);
                if (existing) {
                    existing.blockIds.push(block.id);
                }
                else {
                    records.set(id, {
                        id,
                        sourcePath: safePath,
                        blockIds: [block.id]
                    });
                }
            }
        }
    }
    return [...records.values()];
}
export function serializeTextbookComponents(cwd, registry, textbook) {
    return {
        ...textbook,
        chapters: textbook.chapters.map((chapter) => serializeChapterComponents(cwd, registry, chapter))
    };
}
export function serializeChapterComponents(cwd, registry, chapter) {
    return {
        ...chapter,
        sections: chapter.sections.map((section) => ({
            ...section,
            blocks: section.blocks.map((block) => serializeBlock(cwd, registry, block)),
            subsections: section.subsections.map((subsection) => ({
                ...subsection,
                blocks: subsection.blocks.map((block) => serializeBlock(cwd, registry, block))
            }))
        }))
    };
}
export async function validateComponentBuild(cwd, registry) {
    if (registry.values().length === 0)
        return;
    await build(await componentViteConfig(cwd, registry, "build", undefined, {
        build: {
            write: false,
            minify: false,
            sourcemap: true,
            rolldownOptions: {
                input: Object.fromEntries(registry.values().map((record) => [record.id, registry.moduleUrl(record.id)]))
            }
        }
    }));
}
export async function createComponentViteServer(cwd, registry, parentServer) {
    return createViteServer(await componentViteConfig(cwd, registry, "serve", parentServer));
}
function tutorComponentPlugin(registry) {
    return {
        name: "tutor-kit-components",
        enforce: "pre",
        resolveId(id) {
            const componentId = publicComponentId(id);
            return componentId ? `${virtualPrefix}${componentId}` : null;
        },
        load(id) {
            if (!id.startsWith(virtualPrefix))
                return null;
            const componentId = id.slice(virtualPrefix.length);
            const record = registry.get(componentId);
            if (!record)
                throw new Error(`Unknown Tutor Kit component module: ${componentId}`);
            const sourceId = normalizePath(record.sourcePath);
            return `import definition from ${JSON.stringify(sourceId)};
export default definition;
if (import.meta.hot) {
  import.meta.hot.accept((next) => {
    globalThis.__tutorComponentRuntime?.update(${JSON.stringify(registry.moduleUrl(componentId))}, next?.default);
  });
}`;
        }
    };
}
async function componentViteConfig(cwd, registry, command, parentServer, extra = {}) {
    const { plugins = [], ...userConfig } = await loadTutorFrontendConfig(cwd, command);
    const required = {
        configFile: false,
        root: cwd,
        base: "/",
        appType: "custom",
        publicDir: false,
        logLevel: "silent",
        plugins: [tutorComponentPlugin(registry), ...plugins],
        server: {
            middlewareMode: parentServer ? { server: parentServer } : true,
            fs: {
                strict: true,
                allow: [cwd, resolve(import.meta.dirname, "..", "..")]
            }
        }
    };
    return mergeConfig(mergeConfig(userConfig, required), extra);
}
async function loadTutorFrontendConfig(cwd, command) {
    const configPath = resolve(cwd, "tutor", "frontend.config.ts");
    if (!existsSync(configPath))
        return {};
    const loaded = await loadConfigFromFile({ command, mode: command === "serve" ? "development" : "production" }, configPath, cwd);
    const config = loaded?.config ?? {};
    for (const key of reservedFrontendConfigKeys) {
        if (config[key] !== undefined) {
            throw new Error(`tutor/frontend.config.ts cannot set reserved Vite option "${key}".`);
        }
    }
    return config;
}
function publicComponentId(id) {
    if (!id.startsWith(publicPrefix) || !id.endsWith(".js"))
        return null;
    return id.slice(publicPrefix.length, -3);
}
function componentId(cwd, sourcePath) {
    const path = normalizePath(relative(realpathSync(cwd), realpathSync(sourcePath)));
    return createHash("sha256").update(path).digest("hex").slice(0, 20);
}
function requireWorkspaceComponentPath(cwd, sourcePath, blockId) {
    const root = realpathSync(cwd);
    if (!existsSync(sourcePath))
        throw new Error(`Component module for block "${blockId}" does not exist: ${sourcePath}`);
    const target = realpathSync(sourcePath);
    const path = relative(root, target);
    if (!statSync(target).isFile() || path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path)) {
        throw new Error(`Component module for block "${blockId}" must be a file inside the Tutor Kit workspace.`);
    }
    return target;
}
function serializeBlock(cwd, registry, block) {
    if (!isComponentBlock(block))
        return block;
    const record = registry.get(componentId(cwd, requireWorkspaceComponentPath(cwd, block.props.module.sourcePath, block.id)));
    if (!record)
        throw new Error(`Component registry entry is missing for block "${block.id}".`);
    return {
        id: block.id,
        kind: block.kind,
        props: {
            title: block.props.title,
            moduleUrl: registry.moduleUrl(record.id),
            props: block.props.props
        }
    };
}
function isComponentBlock(block) {
    const props = block.props;
    const module = props?.module;
    return block.kind === "component" && module?.kind === "component-module" && typeof module.sourcePath === "string";
}
//# sourceMappingURL=system.js.map