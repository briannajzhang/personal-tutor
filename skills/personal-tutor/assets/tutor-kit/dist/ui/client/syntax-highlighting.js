export const plainSyntaxLanguages = ["text", "txt", "plain", "plaintext"];
export const syntaxLanguageAliases = {
    bash: "shellscript",
    js: "javascript",
    jsx: "jsx",
    md: "markdown",
    sh: "shellscript",
    ts: "typescript",
    tsx: "tsx",
    zsh: "shellscript"
};
const plainLanguageSet = new Set(plainSyntaxLanguages);
export function normalizeSyntaxLanguage(value) {
    const language = String(value ?? "").trim().toLowerCase();
    if (!language || plainLanguageSet.has(language))
        return null;
    return syntaxLanguageAliases[language] ?? language;
}
export function syntaxHighlightingClientJs() {
    return `
const plainSyntaxLanguages = new Set(${JSON.stringify(plainSyntaxLanguages)});
const syntaxLanguageAliases = ${JSON.stringify(syntaxLanguageAliases)};
let syntaxHighlighterRuntimePromise = null;
let syntaxHighlighterRuntimeFailed = false;

function normalizeSyntaxLanguage(value) {
  const language = String(value ?? "").trim().toLowerCase();
  if (!language || plainSyntaxLanguages.has(language)) return null;
  return syntaxLanguageAliases[language] ?? language;
}

async function loadSyntaxHighlighterRuntime() {
  if (syntaxHighlighterRuntimeFailed) return null;
  if (!syntaxHighlighterRuntimePromise) {
    syntaxHighlighterRuntimePromise = import("/__tutor-assets/shiki/runtime.js").catch(() => {
      syntaxHighlighterRuntimeFailed = true;
      return null;
    });
  }
  return syntaxHighlighterRuntimePromise;
}

async function highlightCodeBlocks(root = document) {
  const targets = [...root.querySelectorAll(".code-block[data-language]")]
    .filter((block) => !block.dataset.syntaxHighlighted)
    .map((block) => ({
      block,
      code: block.querySelector("code"),
      language: normalizeSyntaxLanguage(block.dataset.language)
    }))
    .filter((target) => target.code && target.language);

  if (targets.length === 0) return;

  const runtime = await loadSyntaxHighlighterRuntime();
  if (!runtime || typeof runtime.highlightCode !== "function") return;

  for (const target of targets) {
    if (typeof runtime.hasLanguage === "function" && !runtime.hasLanguage(target.language)) continue;
    try {
      const html = await runtime.highlightCode(target.code.textContent ?? "", target.language);
      const highlightedCode = codeElementFromHighlightedHtml(html);
      if (!highlightedCode) continue;
      target.code.innerHTML = highlightedCode.innerHTML;
      target.block.dataset.syntaxHighlighted = "true";
      target.block.dataset.syntaxLanguage = target.language;
      target.block.classList.add("syntax-highlighted");
    } catch {
      // Leave the escaped plaintext code in place.
    }
  }
}

function codeElementFromHighlightedHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html ?? "");
  return template.content.querySelector("pre code");
}
`;
}
