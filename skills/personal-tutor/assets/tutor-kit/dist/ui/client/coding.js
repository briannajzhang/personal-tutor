export function codingClientJs() {
    return `
function renderCodingProblem(block) {
  const visibleFiles = block.props.files.filter((file) => !file.hidden);
  const visibleActions = block.props.actions.filter((action) => !action.hidden);
  return \`
    <article class="block coding-problem" data-coding-problem="\${escapeAttr(block.id)}"\${highlightUnsupportedAttrs()}>
      <div class="coding-head">
        <h4 class="coding-title">\${escapeHtml(block.props.title)}</h4>
        <div class="coding-language">\${escapeHtml(block.props.language)}</div>
      </div>
      <div class="coding-prompt markdown">\${renderMarkdown(block.props.prompt)}</div>
      <div class="coding-workspace">
        <div class="coding-files">
          \${visibleFiles.map((file) => \`<button class="coding-file" data-coding-file="\${escapeAttr(file.path)}">\${escapeHtml(file.path)}\${file.editable ? "" : " · read-only"}</button>\`).join("")}
        </div>
        <div class="coding-editor-wrap">
          <div class="coding-editor-meta">
            <span data-coding-active-file></span>
            <span class="coding-editor-status">
              <button class="coding-files-toggle" type="button" data-coding-toggle-files>Hide files</button>
              <span data-coding-save-state>Saved</span>
            </span>
          </div>
          <div class="coding-editor" data-coding-editor></div>
        </div>
      </div>
      <div class="coding-actions">
        \${visibleActions.map((action, index) => \`<button class="coding-action \${index === 0 ? "primary" : ""}" data-coding-action="\${escapeAttr(action.id)}">\${escapeHtml(action.label)}</button>\`).join("")}
        \${block.props.review ? \`<button class="coding-review" data-coding-review>Copy review task</button>\` : ""}
      </div>
      <pre class="coding-output" data-coding-output>Ready.</pre>
      <section class="coding-feedback" data-coding-feedback aria-readonly="true">
        <div class="coding-feedback-head">
          <div>
            <div class="coding-feedback-title">Agent Feedback</div>
          </div>
          <button class="coding-feedback-refresh" type="button" data-coding-refresh-feedback>Refresh</button>
        </div>
        <div class="coding-feedback-body markdown" data-coding-feedback-body></div>
        <div class="coding-feedback-empty" data-coding-feedback-empty>No feedback yet. Copy the review task, ask an agent to review the saved draft, then refresh.</div>
      </section>
    </article>
  \`;
}

function bindCodingProblems(chapter) {
  codingStates.clear();
  collectChapterBlocks(chapter)
    .filter((block) => block.kind === "codingProblem")
    .forEach((block) => {
      const element = document.querySelector(\`[data-coding-problem="\${cssEscape(block.id)}"]\`);
      if (element) hydrateCodingProblem(element, block, chapter);
    });
}

async function hydrateCodingProblem(element, block, chapter) {
  const files = Object.fromEntries(block.props.files.map((file) => [file.path, file.content]));
  const visibleFiles = block.props.files.filter((file) => !file.hidden);
  const firstFile = visibleFiles.find((file) => file.editable) ?? visibleFiles[0] ?? block.props.files[0];
  const state = {
    element,
    block,
    chapter,
    files,
    activePath: firstFile?.path,
    editor: null,
    saveTimer: null,
    latestResult: null,
    draftPath: null,
    feedbackPath: null,
    draftAbsolutePath: null,
    feedbackAbsolutePath: null,
    loadingFile: false
  };
  codingStates.set(block.id, state);

  try {
    const draft = await fetchJson(\`/api/coding/draft?\${codingQuery(chapter, block)}\`);
    state.draftPath = draft.draftPath;
    state.feedbackPath = draft.feedbackPath;
    state.draftAbsolutePath = draft.draftAbsolutePath;
    state.feedbackAbsolutePath = draft.feedbackAbsolutePath;
    for (const [path, content] of Object.entries(draft.files ?? {})) {
      if (block.props.files.some((file) => file.path === path && file.editable)) {
        state.files[path] = content;
      }
    }
  } catch {
    // Drafts are a convenience; the problem should still run without them.
  }

  element.querySelectorAll("[data-coding-file]").forEach((button) => {
    button.addEventListener("click", () => setCodingFile(state, button.dataset.codingFile));
  });

  element.querySelectorAll("[data-coding-action]").forEach((button) => {
    button.addEventListener("click", () => runCodingAction(state, button.dataset.codingAction));
  });

  const reviewButton = element.querySelector("[data-coding-review]");
  if (reviewButton) {
    reviewButton.addEventListener("click", () => copyReviewPrompt(state));
  }

  const toggleButton = element.querySelector("[data-coding-toggle-files]");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => toggleCodingFiles(state));
  }

  const refreshButton = element.querySelector("[data-coding-refresh-feedback]");
  if (refreshButton) {
    refreshButton.addEventListener("click", () => refreshCodingFeedback(state));
  }

  await refreshCodingFeedback(state);
  await mountCodingEditor(state);
  setCodingFile(state, state.activePath);
}

async function mountCodingEditor(state) {
  const container = state.element.querySelector("[data-coding-editor]");
  try {
    const monaco = await loadMonaco();
    state.editor = monaco.editor.create(container, {
      value: "",
      language: "plaintext",
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 13,
      lineHeight: 20,
      scrollBeyondLastLine: false,
      theme: "vs"
    });
    state.editor.onDidChangeModelContent(() => {
      if (state.loadingFile) return;
      const file = currentProblemFile(state);
      if (!file?.editable) return;
      state.files[state.activePath] = state.editor.getValue();
      markDraftState(state, "Saving");
      clearTimeout(state.saveTimer);
      state.saveTimer = setTimeout(() => saveCodingDraft(state), 700);
    });
  } catch (error) {
    container.innerHTML = \`<textarea class="coding-fallback" spellcheck="false"></textarea>\`;
    const textarea = container.querySelector("textarea");
    state.editor = {
      getValue: () => textarea.value,
      setValue: (value) => { textarea.value = value; },
      updateOptions: (options) => { textarea.readOnly = Boolean(options.readOnly); }
    };
    textarea.addEventListener("input", () => {
      if (state.loadingFile) return;
      const file = currentProblemFile(state);
      if (!file?.editable) return;
      state.files[state.activePath] = textarea.value;
      markDraftState(state, "Saving");
      clearTimeout(state.saveTimer);
      state.saveTimer = setTimeout(() => saveCodingDraft(state), 700);
    });
  }
}

function setCodingFile(state, path) {
  if (!path) return;
  const file = state.block.props.files.find((candidate) => candidate.path === path);
  if (!file || file.hidden) return;
  state.activePath = path;
  state.element.querySelectorAll("[data-coding-file]").forEach((button) => {
    button.classList.toggle("active", button.dataset.codingFile === path);
  });
  state.element.querySelector("[data-coding-active-file]").textContent = path;
  if (state.editor) {
    state.loadingFile = true;
    state.editor.setValue(state.files[path] ?? file.content);
    state.loadingFile = false;
    state.editor.updateOptions({ readOnly: !file.editable });
    if (window.monaco?.editor && state.editor.getModel) {
      window.monaco.editor.setModelLanguage(state.editor.getModel(), monacoLanguage(state.block, file));
    }
  }
}

function toggleCodingFiles(state) {
  const collapsed = !state.element.classList.contains("files-collapsed");
  state.element.classList.toggle("files-collapsed", collapsed);
  const button = state.element.querySelector("[data-coding-toggle-files]");
  if (button) button.textContent = collapsed ? "Show files" : "Hide files";
  if (state.editor?.layout) requestAnimationFrame(() => state.editor.layout());
}

async function runCodingAction(state, actionId) {
  syncActiveEditor(state);
  await saveCodingDraft(state);
  const output = state.element.querySelector("[data-coding-output]");
  output.textContent = "Running...";
  const result = await fetchJson("/api/coding/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      blockId: state.block.id,
      actionId,
      files: editableFileContents(state)
    })
  });
  state.latestResult = result;
  output.textContent = formatRunResult(result);
  await refreshCodingFeedback(state);
}

async function saveCodingDraft(state) {
  syncActiveEditor(state);
  const saved = await fetchJson("/api/coding/draft", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      blockId: state.block.id,
      files: editableFileContents(state)
    })
  });
  state.draftPath = saved.draftPath ?? state.draftPath;
  state.feedbackPath = saved.feedbackPath ?? state.feedbackPath;
  state.draftAbsolutePath = saved.draftAbsolutePath ?? state.draftAbsolutePath;
  state.feedbackAbsolutePath = saved.feedbackAbsolutePath ?? state.feedbackAbsolutePath;
  markDraftState(state, "Saved");
  return saved;
}

async function refreshCodingFeedback(state) {
  try {
    const result = await fetchJson(\`/api/coding/feedback?\${codingQuery(state.chapter, state.block)}\`);
    state.feedbackPath = result.feedbackPath ?? state.feedbackPath;
    const bodyTarget = state.element.querySelector("[data-coding-feedback-body]");
    const emptyTarget = state.element.querySelector("[data-coding-feedback-empty]");
    if (!bodyTarget || !emptyTarget) return;
    if (result.feedback && result.feedback.trim()) {
      bodyTarget.innerHTML = renderMarkdown(result.feedback);
      emptyTarget.hidden = true;
    } else {
      bodyTarget.innerHTML = "";
      emptyTarget.hidden = false;
    }
  } catch {
    // Feedback files are optional.
  }
}

async function copyReviewPrompt(state) {
  syncActiveEditor(state);
  await saveCodingDraft(state);
  const draftPath = state.draftAbsolutePath ?? state.draftPath ?? \`tutor-data/drafts/\${state.chapter.textbookId}/\${state.chapter.id}/\${state.block.id}.json\`;
  const feedbackPath = state.feedbackAbsolutePath ?? state.feedbackPath ?? \`tutor-data/feedback/\${state.chapter.textbookId}/\${state.chapter.id}/\${state.block.id}.md\`;
  const visibleSourcePaths = [...new Set(
    state.block.props.files
      .map((file) => problemSourcePath(state, file))
      .filter(Boolean)
  )];
  const prompt = [
    "Review this Tutor Kit coding problem attempt.",
    "",
    "Goal:",
    state.block.props.review ?? "Check correctness, explain the most important issue, and give one focused next step.",
    "",
    "Read:",
    \`- Learner draft: \${draftPath}\`,
    ...visibleSourcePaths.map((path) => \`- Problem file: \${path}\`),
    "- Optional run history: tutor-data/events.jsonl",
    "",
    "Write:",
    \`- Markdown feedback/hints: \${feedbackPath}\`,
    "",
    "Do not ask the learner to paste code. Read the draft JSON, then create or update the feedback file."
  ].filter(Boolean).join("\\n");
  await navigator.clipboard.writeText(prompt);
  await fetchJson("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "coding_review_prompt_copied",
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      blockId: state.block.id
    })
  });
  state.element.querySelector("[data-coding-output]").textContent = \`Review task copied. Feedback target: \${feedbackPath}\`;
}

function problemSourcePath(state, file) {
  if (file.sourcePath) return file.sourcePath;
  if (!file.source) return file.path;
  if (file.source.startsWith("textbooks/")) return file.source;
  return \`textbooks/\${state.chapter.textbookId}/chapters/\${file.source}\`;
}

function syncActiveEditor(state) {
  const file = currentProblemFile(state);
  if (file?.editable && state.editor) {
    state.files[state.activePath] = state.editor.getValue();
  }
}

function editableFileContents(state) {
  return Object.fromEntries(
    state.block.props.files
      .filter((file) => file.editable)
      .map((file) => [file.path, state.files[file.path] ?? file.content])
  );
}

function currentProblemFile(state) {
  return state.block.props.files.find((file) => file.path === state.activePath);
}

function markDraftState(state, text) {
  const target = state.element.querySelector("[data-coding-save-state]");
  if (target) target.textContent = text;
}

function formatRunResult(result) {
  const setupText = result.setup ? [
    "setup:",
    formatShellResult(result.setup)
  ].join("\\n") : "";
  const actionText = [
    "action:",
    formatShellResult(result)
  ].join("\\n");
  return [setupText, actionText].filter(Boolean).join("\\n\\n");
}

function formatShellResult(result) {
  const status = result.timedOut
    ? "Timed out"
    : result.exitCode === 0
      ? "Passed"
      : result.exitCode === null
        ? "Not run"
      : \`Exited with code \${result.exitCode}\`;
  return [
    \`\${status} in \${result.durationMs}ms\${result.truncated ? " (output truncated)" : ""}\`,
    result.stdout ? \`\\nstdout:\\n\${result.stdout}\` : "",
    result.stderr ? \`\\nstderr:\\n\${result.stderr}\` : ""
  ].join("");
}

function codingQuery(chapter, block) {
  return new URLSearchParams({
    textbookId: chapter.textbookId,
    chapterId: chapter.id,
    blockId: block.id
  }).toString();
}

function collectChapterBlocks(chapter) {
  const blocks = [];
  for (const section of chapter.sections) {
    blocks.push(...section.blocks);
    for (const subsection of section.subsections) {
      blocks.push(...subsection.blocks);
    }
  }
  return blocks;
}

function collectTextbookGlossaryEntries(textbook) {
  const entries = [];
  for (const chapter of textbook.chapters ?? []) {
    for (const section of chapter.sections ?? []) {
      collectGlossaryEntriesFromBlocks(entries, textbook, chapter, section, section.blocks ?? []);
      for (const subsection of section.subsections ?? []) {
        collectGlossaryEntriesFromBlocks(entries, textbook, chapter, section, subsection.blocks ?? [], subsection);
      }
    }
  }
  return entries;
}

function collectGlossaryEntriesFromBlocks(entries, textbook, chapter, section, blocks, subsection) {
  for (const block of blocks) {
    if (block?.kind !== "glossary") continue;
    const glossaryTitle = block.props?.title || "Glossary";
    const sourceHref = \`/textbooks/\${encodeURIComponent(textbook.id)}/chapters/\${encodeURIComponent(chapter.id)}#\${encodeURIComponent(blockAnchorId(block.id))}\`;
    for (const entry of block.props?.entries ?? []) {
      const term = String(entry?.term ?? "");
      const definition = String(entry?.definition ?? "");
      entries.push({
        id: glossaryEntryId(chapter.id, block.id, term),
        term,
        definition,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        sectionId: section.id,
        sectionTitle: section.title,
        subsectionId: subsection?.id,
        subsectionTitle: subsection?.title,
        blockId: block.id,
        glossaryTitle,
        sourceHref,
        searchText: normalizeGlossarySearch(term)
      });
    }
  }
}

function normalizeGlossarySearch(value) {
  return String(value ?? "").trim().toLowerCase();
}

function glossaryEntryId(chapterId, blockId, term) {
  const normalizedTerm = normalizeGlossarySearch(term)
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "term";
  return [chapterId, blockId, normalizedTerm].map((part) => String(part).replace(/[^a-zA-Z0-9_.-]+/g, "_")).join(":");
}

function loadMonaco() {
  if (!monacoReady) {
    monacoReady = new Promise((resolve, reject) => {
      if (!window.require) {
        reject(new Error("Monaco loader is unavailable"));
        return;
      }
      window.require.config({ paths: { vs: "/__tutor-assets/monaco/vs" } });
      window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
    });
  }
  return monacoReady;
}

function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import("/__tutor-assets/mermaid/mermaid.esm.min.mjs")
      .then((module) => {
        const mermaid = module.default ?? module;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          suppressErrorRendering: true
        });
        return mermaid;
      });
  }
  return mermaidReady;
}

function monacoLanguage(block, file) {
  if (file.language) return file.language;
  const extension = file.path.split(".").pop();
  const byExtension = {
    py: "python",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    h: "cpp",
    hpp: "cpp",
    json: "json",
    md: "markdown",
    sql: "sql"
  };
  return byExtension[extension] ?? block.props.language ?? "plaintext";
}
`;
}
//# sourceMappingURL=coding.js.map