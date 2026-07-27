import { createRequire } from "node:module";
import { dirname, join, resolve, sep } from "node:path";
const require = createRequire(import.meta.url);
const packageRoot = dirname(require.resolve("monaco-editor/package.json"));
const vsRoot = join(packageRoot, "min", "vs");
export function monacoAssetPath(assetPath) {
    if (assetPath.includes("\0") || assetPath.split("/").some((part) => part === "..")) {
        throw new Error(`Invalid Monaco asset path: ${assetPath}`);
    }
    const resolved = resolve(vsRoot, assetPath);
    if (resolved !== vsRoot && !resolved.startsWith(vsRoot + sep)) {
        throw new Error(`Invalid Monaco asset path: ${assetPath}`);
    }
    return resolved;
}
