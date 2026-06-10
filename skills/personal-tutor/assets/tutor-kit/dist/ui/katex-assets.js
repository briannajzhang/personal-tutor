import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
const require = createRequire(import.meta.url);
const cssPath = require.resolve("katex/dist/katex.min.css");
const jsPath = require.resolve("katex/dist/katex.min.js");
const fontDir = join(dirname(cssPath), "fonts");
export function katexCss() {
    return readFileSync(cssPath, "utf8")
        .replaceAll("url(fonts/", "url(/__tutor-assets/katex/fonts/");
}
export function katexJs() {
    return readFileSync(jsPath, "utf8")
        .replaceAll("</script", "<\\/script");
}
export function katexCssPath() {
    return cssPath;
}
export function katexJsPath() {
    return jsPath;
}
export function katexFontPath(fileName) {
    if (!/^[A-Za-z0-9_.-]+$/.test(fileName)) {
        throw new Error(`Invalid KaTeX font path: ${fileName}`);
    }
    return join(fontDir, fileName);
}
//# sourceMappingURL=katex-assets.js.map