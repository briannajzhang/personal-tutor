import { createHash } from "node:crypto";
import { existsSync, realpathSync, statSync } from "node:fs";
import type { Server } from "node:http";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  build,
  createServer as createViteServer,
  loadConfigFromFile,
  mergeConfig,
  normalizePath,
  type InlineConfig,
  type Plugin,
  type UserConfig,
  type ViteDevServer
} from "vite";
import type { Chapter, ComponentBlock, LoadedTextbook, Textbook, TutorBlock } from "../core/types.js";
import { collectChapterBlocks } from "../core/traversal.js";

const publicPrefix = "/__tutor-components/";
const virtualPrefix = "\0tutor-component:";
const syntaxRuntimePath = "/__tutor-assets/shiki/runtime.js";
const syntaxRuntimeVirtualId = "\0tutor-syntax-highlighting-runtime";
const shikiBundleFullId = "shiki/bundle/full";
const shikiBundleFullPath = normalizePath(fileURLToPath(import.meta.resolve(shikiBundleFullId)));
const reservedFrontendConfigKeys = ["root", "base", "appType", "server", "build"] as const;

export interface ComponentRecord {
  id: string;
  sourcePath: string;
  blockIds: string[];
}

export class ComponentRegistry {
  readonly #records = new Map<string, ComponentRecord>();

  constructor(records: ComponentRecord[] = []) {
    this.replace(records);
  }

  replace(records: ComponentRecord[]): void {
    this.#records.clear();
    for (const record of records) this.#records.set(record.id, record);
  }

  get(id: string): ComponentRecord | undefined {
    return this.#records.get(id);
  }

  values(): ComponentRecord[] {
    return [...this.#records.values()];
  }

  moduleUrl(id: string): string {
    return `${publicPrefix}${id}.js`;
  }
}

export function collectComponentRecords(cwd: string, textbooks: LoadedTextbook[]): ComponentRecord[] {
  const records = new Map<string, ComponentRecord>();
  for (const loaded of textbooks) {
    for (const chapter of loaded.textbook.chapters) {
      for (const block of collectChapterBlocks(chapter)) {
        if (!isComponentBlock(block)) continue;
        const sourcePath = block.props.module.sourcePath;
        const safePath = requireWorkspaceComponentPath(cwd, sourcePath, block.id);
        const id = componentId(cwd, safePath);
        const existing = records.get(id);
        if (existing) {
          existing.blockIds.push(block.id);
        } else {
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

export function serializeTextbookComponents(cwd: string, registry: ComponentRegistry, textbook: Textbook): object {
  return {
    ...textbook,
    chapters: textbook.chapters.map((chapter) => serializeChapterComponents(cwd, registry, chapter))
  };
}

export function serializeChapterComponents(cwd: string, registry: ComponentRegistry, chapter: Chapter): object {
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

export async function validateComponentBuild(cwd: string, registry: ComponentRegistry): Promise<void> {
  if (registry.values().length === 0) return;
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

export async function createComponentViteServer(
  cwd: string,
  registry: ComponentRegistry,
  parentServer: Server
): Promise<ViteDevServer> {
  return createViteServer(await componentViteConfig(cwd, registry, "serve", parentServer));
}

function tutorComponentPlugin(registry: ComponentRegistry): Plugin {
  return {
    name: "tutor-kit-components",
    enforce: "pre",
    resolveId(id) {
      const componentId = publicComponentId(id);
      return componentId ? `${virtualPrefix}${componentId}` : null;
    },
    load(id) {
      if (!id.startsWith(virtualPrefix)) return null;
      const componentId = id.slice(virtualPrefix.length);
      const record = registry.get(componentId);
      if (!record) throw new Error(`Unknown Tutor Kit component module: ${componentId}`);
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

function tutorSyntaxHighlightingPlugin(): Plugin {
  return {
    name: "tutor-kit-syntax-highlighting",
    enforce: "pre",
    resolveId(id, importer) {
      if (id === syntaxRuntimePath) return syntaxRuntimeVirtualId;
      if (id === shikiBundleFullId && (
        importer === syntaxRuntimeVirtualId ||
        importer?.startsWith(`${syntaxRuntimeVirtualId}?`)
      )) return shikiBundleFullPath;
      return null;
    },
    load(id) {
      if (id !== syntaxRuntimeVirtualId) return null;
      return `import { bundledLanguages, createHighlighter } from ${JSON.stringify(shikiBundleFullId)};

const theme = "github-light";
const highlighterPromise = createHighlighter({ themes: [theme], langs: [] });
const loadedLanguages = new Set();

export function hasLanguage(language) {
  return Boolean(bundledLanguages[String(language ?? "")]);
}

export async function highlightCode(code, language) {
  const lang = String(language ?? "");
  if (!hasLanguage(lang)) throw new Error("Unsupported syntax language: " + lang);
  const highlighter = await highlighterPromise;
  if (!loadedLanguages.has(lang)) {
    await highlighter.loadLanguage(lang);
    loadedLanguages.add(lang);
  }
  return highlighter.codeToHtml(String(code ?? ""), { lang, theme });
}`;
    }
  };
}

async function componentViteConfig(
  cwd: string,
  registry: ComponentRegistry,
  command: "serve" | "build",
  parentServer?: Server,
  extra: InlineConfig = {}
): Promise<InlineConfig> {
  const { plugins = [], ...userConfig } = await loadTutorFrontendConfig(cwd, command);
  const required: InlineConfig = {
    configFile: false,
    root: cwd,
    base: "/",
    appType: "custom",
    publicDir: false,
    logLevel: "silent",
    plugins: [tutorComponentPlugin(registry), tutorSyntaxHighlightingPlugin(), ...plugins],
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

async function loadTutorFrontendConfig(cwd: string, command: "serve" | "build"): Promise<UserConfig> {
  const configPath = resolve(cwd, "tutor", "frontend.config.ts");
  if (!existsSync(configPath)) return {};
  const loaded = await loadConfigFromFile({ command, mode: command === "serve" ? "development" : "production" }, configPath, cwd);
  const config = loaded?.config ?? {};
  for (const key of reservedFrontendConfigKeys) {
    if (config[key] !== undefined) {
      throw new Error(`tutor/frontend.config.ts cannot set reserved Vite option "${key}".`);
    }
  }
  return config;
}

function publicComponentId(id: string): string | null {
  if (!id.startsWith(publicPrefix) || !id.endsWith(".js")) return null;
  return id.slice(publicPrefix.length, -3);
}

function componentId(cwd: string, sourcePath: string): string {
  const path = normalizePath(relative(realpathSync(cwd), realpathSync(sourcePath)));
  return createHash("sha256").update(path).digest("hex").slice(0, 20);
}

function requireWorkspaceComponentPath(cwd: string, sourcePath: string, blockId: string): string {
  const root = realpathSync(cwd);
  if (!existsSync(sourcePath)) throw new Error(`Component module for block "${blockId}" does not exist: ${sourcePath}`);
  const target = realpathSync(sourcePath);
  const path = relative(root, target);
  if (!statSync(target).isFile() || path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path)) {
    throw new Error(`Component module for block "${blockId}" must be a file inside the Tutor Kit workspace.`);
  }
  return target;
}

function serializeBlock(cwd: string, registry: ComponentRegistry, block: TutorBlock): unknown {
  if (!isComponentBlock(block)) return block;
  const record = registry.get(componentId(cwd, requireWorkspaceComponentPath(cwd, block.props.module.sourcePath, block.id)));
  if (!record) throw new Error(`Component registry entry is missing for block "${block.id}".`);
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

function isComponentBlock(block: TutorBlock): block is ComponentBlock {
  const props = block.props as Record<string, unknown> | undefined;
  const module = props?.module as Record<string, unknown> | undefined;
  return block.kind === "component" && module?.kind === "component-module" && typeof module.sourcePath === "string";
}
