import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";

const require = createRequire(import.meta.url);
const mermaidBundlePath = require.resolve("mermaid/dist/mermaid.esm.min.mjs");
const mermaidDistRoot = dirname(mermaidBundlePath);

export function mermaidJsPath(): string {
  return mermaidBundlePath;
}

export function mermaidAssetPath(assetPath: string): string {
  if (assetPath.includes("\0") || assetPath.split("/").some((part) => part === "..")) {
    throw new Error(`Invalid Mermaid asset path: ${assetPath}`);
  }
  const resolved = resolve(mermaidDistRoot, assetPath);
  if (resolved !== mermaidDistRoot && !resolved.startsWith(mermaidDistRoot + sep)) {
    throw new Error(`Invalid Mermaid asset path: ${assetPath}`);
  }
  return resolved;
}
