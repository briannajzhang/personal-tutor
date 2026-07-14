import { clientJs } from "./client.js";
import { css } from "./styles.js";
export function html(title) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>${css()}</style>
    <link rel="stylesheet" href="/__tutor-assets/katex/katex.min.css" />
  </head>
  <body>
    <div id="app">
      <main id="main"></main>
    </div>
    <script src="/__tutor-assets/katex/katex.min.js"></script>
    <script src="/__tutor-assets/monaco/vs/loader.js"></script>
    <script>${clientJs()}</script>
  </body>
</html>`;
}
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
//# sourceMappingURL=app.js.map