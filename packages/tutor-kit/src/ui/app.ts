import { createHash } from "node:crypto";
import { clientJs } from "./client.js";
import { css } from "./styles.js";

export const appCss = css();
export const appJs = clientJs();
export const appAssetVersion = createHash("sha256")
  .update(appCss)
  .update("\0")
  .update(appJs)
  .digest("hex")
  .slice(0, 12);

export function html(title: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="icon" type="image/png" href="/favicon.ico" />
    <link rel="stylesheet" href="/__tutor-assets/app.css?v=${appAssetVersion}" />
    <link rel="stylesheet" href="/__tutor-assets/katex/katex.min.css" />
  </head>
  <body>
    <div id="app">
      <main id="main"></main>
    </div>
    <script defer src="/__tutor-assets/katex/katex.min.js"></script>
    <script defer src="/__tutor-assets/monaco/vs/loader.js"></script>
    <script type="module" src="/@vite/client"></script>
    <script defer src="/__tutor-assets/app.js?v=${appAssetVersion}"></script>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
