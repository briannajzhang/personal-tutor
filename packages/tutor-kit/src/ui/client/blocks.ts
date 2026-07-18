export function blocksClientJs(): string {
  return `
function renderGlossary(block, context) {
  const title = block.props.title || "Glossary";
  const entries = Array.isArray(block.props.entries) ? block.props.entries : [];
  const textbookId = context?.textbookId;
  const titleMarkup = textbookId
    ? \`<a class="glossary-title-link" href="/textbooks/\${encodeURIComponent(textbookId)}/glossary" data-glossary-overview="\${escapeAttr(textbookId)}">\${escapeHtml(title)}</a>\`
    : escapeHtml(title);
  return \`
    <article class="block glossary" id="\${escapeAttr(blockAnchorId(block.id))}"\${highlightUnsupportedAttrs()}>
      <h4 class="glossary-title">\${titleMarkup}</h4>
      <dl class="glossary-list">
        \${entries.map((entry) => {
          const term = String(entry?.term ?? "");
          const glossaryEntry = context?.chapter && context?.glossaryStudyState
            ? { id: glossaryEntryId(context.chapter.id, block.id, term), term }
            : null;
          return \`
          <div class="glossary-entry">
            <dt class="glossary-term">\${renderInlineMarkdown(term)}</dt>
            <dd class="glossary-definition">\${renderInlineMarkdown(entry?.definition ?? "")}</dd>
            \${glossaryEntry ? renderGlossaryStarButton(glossaryEntry, context.glossaryStudyState) : ""}
          </div>
        \`;
        }).join("")}
      </dl>
    </article>
  \`;
}

function renderTransformation(block) {
  return \`
    <article class="block transformation layout-\${escapeAttr(block.props.layout)}" data-transformation="\${escapeAttr(block.id)}" data-transformation-layout="\${escapeAttr(block.props.layout)}"\${highlightUnsupportedAttrs()}>
      <h4 class="transformation-title">\${escapeHtml(block.props.title)}</h4>
      <div class="transformation-focus">\${renderInlineMarkdown(block.props.focus)}</div>
      <div class="transformation-stages">
        \${renderTransformationStage("input", block.props.inputLabel, block.props.input)}
        \${renderTransformationStage("operation", block.props.operationLabel, [block.props.operation])}
        \${renderTransformationStage("output", block.props.outputLabel, block.props.output)}
      </div>
      <div class="transformation-explanation">
        <div class="transformation-explanation-label">Explanation</div>
        <div class="markdown">\${renderMarkdown(block.props.explanation)}</div>
      </div>
    </article>
  \`;
}

let transformationLayoutFrame = null;

function scheduleTransformationLayouts() {
  if (transformationLayoutFrame !== null) cancelAnimationFrame(transformationLayoutFrame);
  transformationLayoutFrame = requestAnimationFrame(() => {
    transformationLayoutFrame = null;
    updateTransformationLayouts();
  });
}

function updateTransformationLayouts() {
  const transformations = document.querySelectorAll('[data-transformation-layout="auto"], [data-transformation-layout="compare"]');
  document.documentElement.classList.add("measuring-transformation-layout");
  try {
    transformations.forEach((element) => {
      element.classList.remove("auto-flow", "auto-hybrid");
      element.removeAttribute("data-transformation-measured");
      element.removeAttribute("data-transformation-resolved-layout");
    });
    transformations.forEach((element) => {
      const inputOverflow = transformationStageOverflows(element, "input");
      const operationOverflow = transformationStageOverflows(element, "operation");
      const outputOverflow = transformationStageOverflows(element, "output");
      let resolvedLayout = "columns";
      if (inputOverflow || outputOverflow) {
        element.classList.add("auto-flow");
        resolvedLayout = "flow";
      } else if (operationOverflow) {
        element.classList.add("auto-hybrid");
        resolvedLayout = "hybrid";
      }
      element.dataset.transformationMeasured = "true";
      element.dataset.transformationResolvedLayout = resolvedLayout;
    });
  } finally {
    document.documentElement.classList.remove("measuring-transformation-layout");
  }
}

function transformationStageOverflows(element, stage) {
  const artifacts = element.querySelectorAll(
    \`[data-transformation-stage="\${stage}"] .code-block, [data-transformation-stage="\${stage}"] .math-block, [data-transformation-stage="\${stage}"] .markdown, [data-transformation-stage="\${stage}"] .transformation-table-scroll\`
  );
  return [...artifacts].some((artifact) => artifact.scrollWidth > artifact.clientWidth + 1);
}

function renderTransformationStage(stage, label, artifacts) {
  return \`
    <section class="transformation-stage transformation-stage-\${escapeAttr(stage)}" data-transformation-stage="\${escapeAttr(stage)}">
      <div class="transformation-stage-label">\${escapeHtml(label)}</div>
      <div class="transformation-artifacts">\${artifacts.map(renderTransformationArtifact).join("")}</div>
    </section>
  \`;
}

function renderTransformationArtifact(artifact) {
  const label = artifact.label
    ? \`<div class="transformation-artifact-label">\${escapeHtml(artifact.label)}</div>\`
    : "";
  let content = "";
  if (artifact.format === "markdown") {
    content = \`<div class="markdown">\${renderMarkdown(artifact.body)}</div>\`;
  } else if (artifact.format === "code") {
    const language = artifact.language ? \` data-language="\${escapeAttr(artifact.language)}"\` : "";
    content = \`<pre class="code-block"\${language}><code>\${escapeHtml(artifact.body)}</code></pre>\`;
  } else if (artifact.format === "math") {
    content = \`<div class="math-block">\${renderMath(artifact.body, true)}</div>\`;
  } else if (artifact.format === "table") {
    content = \`
      <div class="transformation-table-scroll">
        <table class="transformation-table">
          <thead><tr>\${artifact.columns.map((column) => \`<th>\${escapeHtml(column)}</th>\`).join("")}</tr></thead>
          <tbody>\${artifact.rows.map((row) => \`<tr>\${row.map((cell) => \`<td>\${escapeHtml(cell)}</td>\`).join("")}</tr>\`).join("")}</tbody>
        </table>
      </div>
    \`;
  }
  return \`<div class="transformation-artifact">\${label}\${content}</div>\`;
}
`;
}
