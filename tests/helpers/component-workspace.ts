import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { linkTutorKit, repoRoot } from "./tutor-kit.ts";

export function createComponentWorkspace(): string {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-component-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  symlinkSync(join(repoRoot, "node_modules", "katex"), join(dir, "node_modules", "katex"), "dir");
  symlinkSync(join(repoRoot, "node_modules", "vite"), join(dir, "node_modules", "vite"), "dir");

  const packagePath = join(dir, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  packageJson.dependencies.katex = "^0.16.47";
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const componentsDir = join(dir, "textbooks", "getting-started", "components");
  mkdirSync(componentsDir, { recursive: true });
  writeFileSync(join(componentsDir, "value.ts"), "export const step = 2;\n");
  writeFileSync(join(componentsDir, "message.json"), '{"label":"Current value"}\n');
  writeFileSync(join(componentsDir, "spark.svg"), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>\n');
  writeFileSync(join(componentsDir, "empty.wasm"), Buffer.from("AGFzbQEAAAA=", "base64"));
  writeFileSync(join(componentsDir, "worker.ts"), `self.onmessage = (event) => self.postMessage(Number(event.data) * 2);\n`);
  writeFileSync(join(componentsDir, "explorer.css"), `
.component-card { display: grid; gap: 12px; padding: 18px; }
.component-card output { color: var(--tutor-color-accent); font-size: 1.5rem; font-weight: 650; }
.component-card img { width: 18px; height: 18px; }
.component-card .palette-chip {
  background: var(--tutor-color-green-soft);
  border: 1px solid var(--tutor-color-category-3-strong);
  color: var(--tutor-color-info);
  padding: 4px 6px;
}
`);
  writeFileSync(join(componentsDir, "explorer.tsx"), `import { renderToString } from "katex";
import { defineComponent, type JsonValue } from "tutor-kit/client";
import message from "./message.json";
import sparkUrl from "./spark.svg";
import initWasm from "./empty.wasm?init";
import { step } from "./value.js";
import pluginMessage from "virtual:tutor-test";
import "./explorer.css";

interface ExplorerProps extends JsonValue { initialValue: number; }
declare global { namespace JSX { interface IntrinsicElements { div: Record<string, unknown>; } } }

function h(tag: string, props: Record<string, unknown> | null, ...children: unknown[]): HTMLElement {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (key === "className") element.className = String(value);
  }
  element.append(...children.map((child) => child instanceof Node ? child : document.createTextNode(String(child))));
  return element;
}

export default defineComponent<ExplorerProps>(async ({ root, props, signal, services, location }) => {
  await initWasm();
  const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  const card = <div className="component-card" />;
  const label = document.createElement("label");
  label.textContent = message.label;
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "20";
  input.value = String(props.initialValue);
  const output = document.createElement("output");
  const math = document.createElement("span");
  math.innerHTML = renderToString("x^2");
  const image = document.createElement("img");
  image.src = sparkUrl;
  image.alt = "";
  const asset = document.createElement("span");
  asset.dataset.assetUrl = services.assets.url("assets/example.txt");
  asset.dataset.pluginMessage = pluginMessage;
  asset.dataset.blockId = location.blockId;
  const paletteChip = document.createElement("span");
  paletteChip.className = "palette-chip";
  paletteChip.textContent = "Theme palette";
  paletteChip.dataset.greenToken = services.theme.tokens["--tutor-color-green"];
  paletteChip.dataset.greenSoftToken = services.theme.tokens["--tutor-color-green-soft"];
  paletteChip.dataset.category3StrongToken = services.theme.tokens["--tutor-color-category-3-strong"];
  const update = () => { output.value = String(Number(input.value) + step); };
  input.addEventListener("input", update, { signal });
  signal.addEventListener("abort", () => {
    document.documentElement.dataset.componentAbortCount = String(Number(document.documentElement.dataset.componentAbortCount ?? 0) + 1);
  });
  update();
  card.append(label, input, output, math, image, asset, paletteChip);
  root.append(card);
  requestAnimationFrame(() => card.dataset.animated = "true");
  worker.postMessage(props.initialValue);
  return () => {
    worker.terminate();
    document.documentElement.dataset.componentCleanupCount = String(Number(document.documentElement.dataset.componentCleanupCount ?? 0) + 1);
  };
});
`);

  writeFileSync(join(componentsDir, "virtual.d.ts"), `declare module "virtual:tutor-test" { const value: string; export default value; }\n`);
  mkdirSync(join(dir, "tutor"), { recursive: true });
  writeFileSync(join(dir, "tutor", "frontend.config.ts"), `import { defineFrontendConfig } from "tutor-kit";

export default defineFrontendConfig({
  oxc: { jsx: { runtime: "classic", pragma: "h" } },
  plugins: [{
    name: "test-virtual-module",
    resolveId(id) { return id === "virtual:tutor-test" ? "\\0virtual:tutor-test" : null; },
    load(id) { return id === "\\0virtual:tutor-test" ? 'export default "plugin loaded"' : null; }
  }]
});
`);

  const assetDir = join(dir, "textbooks", "getting-started", "assets");
  mkdirSync(assetDir, { recursive: true });
  writeFileSync(join(assetDir, "example.txt"), "component asset\n");

  writeFileSync(join(dir, "textbooks", "getting-started", "chapters", "welcome.chapter.ts"), `import { chapter, component, componentModule, p, section, type JsonValue } from "tutor-kit";

interface ExplorerProps extends JsonValue { initialValue: number; }
const explorer = componentModule<ExplorerProps>(import.meta.url, "../components/explorer.tsx");

export default chapter({
  id: "welcome",
  title: "Component Lab",
  sections: [section({
    id: "lab",
    title: "Interactive lab",
    blocks: [
      p({ id: "intro", body: "Change the value and inspect the result." }),
      component({ id: "threshold-explorer", title: "Threshold explorer", module: explorer, props: { initialValue: 5 } })
    ]
  })]
});
`);
  return dir;
}
