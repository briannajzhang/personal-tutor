export function shellClientJs(): string {
  return `
function renderCrumbs(items) {
  return \`
    <nav class="crumbs" aria-label="Breadcrumb">
      \${items.map((item, index) => {
        const separator = index === 0 ? "" : '<span class="crumb-separator">/</span>';
        if (item.action) {
          const attrs = item.action === "textbook" || item.action === "glossary"
            ? \`data-nav="\${escapeAttr(item.action)}" data-textbook="\${escapeAttr(item.textbookId ?? "")}"\`
            : 'data-nav="home"';
          return \`\${separator}<button class="crumb-link" \${attrs}>\${escapeHtml(item.label)}</button>\`;
        }
        return \`\${separator}<span class="crumb-current">\${escapeHtml(item.label)}</span>\`;
      }).join("")}
    </nav>
  \`;
}

function bindCrumbs() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.nav === "home") {
        navigateHome();
        return;
      }
      if (button.dataset.nav === "textbook" && button.dataset.textbook) {
        navigateTextbook(button.dataset.textbook);
        return;
      }
      if (button.dataset.nav === "glossary" && button.dataset.textbook) {
        navigateTextbookGlossary(button.dataset.textbook);
      }
    });
  });
}

function renderNotFoundPage(details = {}) {
  const title = details.title ?? "Page not found";
  const message = details.message ?? "That page does not exist in this Tutor Kit workspace.";
  const actionLabel = textbooks.length === 0 ? "Go home" : "Back to textbooks";
  document.querySelector("#main").innerHTML = \`
    <section class="not-found">
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: "Not found" }
      ])}
      <div class="not-found-panel">
        <div>
          <div class="not-found-kicker">404 not found</div>
          <h1>\${escapeHtml(title)}</h1>
          <p class="not-found-copy">\${escapeHtml(message)}</p>
          <div class="not-found-actions">
            <button class="not-found-action" data-nav="home">\${escapeHtml(actionLabel)}</button>
          </div>
        </div>
        <div class="not-found-code" aria-hidden="true">404</div>
      </div>
    </section>
  \`;
  bindCrumbs();
}

function notFoundDetails(route) {
  if (route.kind === "chapter") {
    return {
      title: "Chapter not found",
      message: \`No chapter matches \${route.textbookId}/\${route.chapterId}. It may have been renamed, removed, or not generated yet.\`
    };
  }
  if (route.kind === "textbook") {
    return {
      title: "Textbook not found",
      message: \`No textbook matches \${route.textbookId}. It may have been renamed, removed, or not generated yet.\`
    };
  }
  return {
    title: "Page not found",
    message: \`No route matches \${route.path ?? window.location.pathname}. Return to your textbook library to keep studying.\`
  };
}

function isNotFoundError(error) {
  return error?.status === 404;
}

function parseResponseError(body) {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.error === "string") return parsed.error;
    if (Array.isArray(parsed.issues)) return parsed.issues.map((issue) => issue.message ?? String(issue)).join("\\n");
  } catch {
    // Use the plain response body below.
  }
  return String(body ?? "").trim();
}

function beginRouteLoad(message) {
  const token = ++routeToken;
  document.body.classList.add("route-loading");
  document.querySelector("#main").innerHTML = \`
    <section class="loading-shell" aria-busy="true">
      <div class="page-head">
        <h1>\${escapeHtml(message)}</h1>
        <div class="meta">Fetching content</div>
      </div>
      <div class="loading-stack" aria-hidden="true">
        <div class="loading-bar wide"></div>
        <div class="loading-bar mid"></div>
        <div class="loading-bar wide"></div>
        <div class="loading-bar short"></div>
      </div>
    </section>
  \`;
  return token;
}

function finishRouteLoad(token) {
  if (token && token !== routeToken) return;
  document.body.classList.remove("route-loading");
}

function renderRouteError(error) {
  document.querySelector("#main").innerHTML = \`
    <section>
      <div class="page-head">
        <h1>Unable to load</h1>
      </div>
      <pre>\${escapeHtml(error?.stack || error?.message || String(error))}</pre>
    </section>
  \`;
}

function renderMarkdown(value) {
  return String(value ?? "")
    .split(/\\n{2,}/)
    .map((paragraph) => "<p>" + renderInlineMarkdown(paragraph).replace(/\\n/g, "<br>") + "</p>")
    .join("");
}

function renderInlineMarkdown(value) {
  const source = String(value ?? "");
  let html = "";
  let cursor = 0;
  const pattern = /(\`[^\`]*\`|\\$[^$\\n]+\\$)/g;
  for (const match of source.matchAll(pattern)) {
    html += renderInlineEmphasis(source.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("\`")) {
      html += \`<code>\${escapeHtml(token.slice(1, -1))}</code>\`;
    } else {
      html += \`<span class="math">\${renderMath(token.slice(1, -1), false)}</span>\`;
    }
    cursor = match.index + token.length;
  }
  html += renderInlineEmphasis(source.slice(cursor));
  return html;
}

function renderInlineEmphasis(value) {
  const source = String(value ?? "");
  let html = "";
  let cursor = 0;
  const pattern = /(\\*\\*[^*\\n]+\\*\\*|\\*[^*\\n]+\\*)/g;
  for (const match of source.matchAll(pattern)) {
    html += escapeHtml(source.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      html += \`<strong>\${escapeHtml(token.slice(2, -2))}</strong>\`;
    } else {
      html += \`<em>\${escapeHtml(token.slice(1, -1))}</em>\`;
    }
    cursor = match.index + token.length;
  }
  html += escapeHtml(source.slice(cursor));
  return html;
}

function renderMath(value, displayMode) {
  const source = String(value ?? "");
  if (window.katex && typeof window.katex.renderToString === "function") {
    return window.katex.renderToString(source, {
      displayMode,
      throwOnError: false,
      strict: "ignore"
    });
  }
  return escapeHtml(source);
}

function anchorId(value) {
  return String(value ?? "").replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function blockAnchorId(value) {
  return \`block-\${anchorId(value)}\`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(String(value));
  return String(value).replace(/["\\\\]/g, "\\\\$&");
}

function isRecordObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableHash(value) {
  const source = String(value ?? "");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

load().catch((error) => {
  document.querySelector("#main").innerHTML = \`<section><div class="page-head"><h1>Unable to load</h1></div><pre>\${escapeHtml(error.stack || error.message)}</pre></section>\`;
});
`;
}
