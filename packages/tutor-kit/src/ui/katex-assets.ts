import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const cssPath = require.resolve("katex/dist/katex.min.css");
const jsPath = require.resolve("katex/dist/katex.min.js");
const fontDir = join(dirname(cssPath), "fonts");

export function katexCssPath(): string {
  return cssPath;
}

export function katexJsPath(): string {
  return jsPath;
}

export function katexFontPath(fileName: string): string {
  if (!/^[A-Za-z0-9_.-]+$/.test(fileName)) {
    throw new Error(`Invalid KaTeX font path: ${fileName}`);
  }
  return join(fontDir, fileName);
}
