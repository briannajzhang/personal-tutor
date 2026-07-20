export function codingCss(): string {
  return `
.coding-problem {
  margin: 10px 0 22px;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  background: color-mix(in srgb, var(--panel) 42%, transparent);
}
.coding-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 55%, transparent);
}
.coding-title {
  margin: 0;
  color: var(--ink);
  font-size: 18px;
  font-weight: 560;
  letter-spacing: 0;
}
.coding-language {
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}
.coding-prompt {
  padding: 16px 18px 0;
}
.coding-workspace {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  min-height: 610px;
  border-top: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
}
.coding-problem.files-collapsed .coding-workspace {
  grid-template-columns: minmax(0, 1fr);
}
.coding-problem.files-collapsed .coding-files {
  display: none;
}
.coding-files {
  border-right: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
  padding: 12px 0;
  background: color-mix(in srgb, var(--paper) 56%, transparent);
}
.coding-file {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
  line-height: 1.35;
  overflow: hidden;
  padding: 7px 14px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.coding-file.active {
  color: var(--ink);
  background: var(--panel-soft);
}
.coding-editor-wrap {
  min-width: 0;
}
.coding-editor-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
  color: var(--muted);
  font-size: 12px;
  padding: 0 12px;
}
.coding-editor-status {
  align-items: center;
  display: inline-flex;
  gap: 10px;
}
.coding-files-toggle {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.coding-editor {
  height: 574px;
}
.coding-fallback {
  width: 100%;
  height: 574px;
  border: 0;
  background: var(--paper);
  color: var(--ink-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 12px;
  resize: vertical;
}
.coding-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
}
.coding-action,
.coding-review {
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  background: var(--paper);
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 13px;
  padding: 7px 11px;
}
.coding-action.primary {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}
.coding-output {
  min-height: 80px;
  margin: 0;
  padding: 14px 18px 18px;
  border-top: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
  background: #020202;
  color: #f1eee6;
  font-size: 12px;
  line-height: 1.5;
  overflow: auto;
  white-space: pre-wrap;
}
.coding-feedback {
  margin: 0;
  padding: 14px 18px 18px;
  border-top: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
  background: #020202;
  color: #b5b3ad;
}
.coding-feedback-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}
.coding-feedback-title {
  color: #f0eee6;
  font-size: 13px;
  font-weight: 620;
}
.coding-feedback-path,
.coding-feedback-empty {
  color: #7d7c77;
  font-size: 12px;
  line-height: 1.5;
}
.coding-feedback-refresh {
  border: 0;
  background: transparent;
  color: #b5b3ad;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  padding: 0;
}
.coding-feedback-body.markdown p,
.coding-feedback-body.markdown ul,
.coding-feedback-body.markdown ol {
  color: #b5b3ad;
  font-size: 13px;
  line-height: 1.6;
}
.coding-feedback-body.markdown code {
  background: #403e3a;
  border-color: #5e5d59;
  color: #f1eee6;
}
.coding-feedback-body .math {
  color: #f0eee6;
}
.markdown p {
  color: var(--ink-soft);
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 12px;
}
.markdown code,
.glossary-term code,
.glossary-definition code {
  background: var(--panel-soft);
  border: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  padding: 2px 5px;
  border-radius: 5px;
  font-size: .92em;
}
.markdown strong,
.transformation-focus strong {
  color: var(--ink);
  font-weight: 650;
}
.markdown em,
.transformation-focus em {
  font-style: italic;
}
.text-highlight {
  background: color-mix(in srgb, #f4d35e 62%, transparent);
  border-radius: 3px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  padding: 1px 2px;
  transition: background-color 160ms ease, box-shadow 160ms ease;
}
.text-highlight.focused {
  background: color-mix(in srgb, #f4d35e 88%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, #d6a932 56%, transparent);
}
.math {
  color: var(--accent-2);
  font-family: "Times New Roman", serif;
  font-style: italic;
}
body.route-loading {
  cursor: progress;
}
.empty-state {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.45fr);
  gap: 34px;
  align-items: center;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 30px 0;
}
.empty-kicker,
.not-found-kicker {
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.empty-title {
  margin: 8px 0 0;
  color: var(--ink);
  font-size: 23px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.22;
}
.empty-copy,
.not-found-copy {
  max-width: 640px;
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.65;
}
.empty-prompt {
  display: grid;
  gap: 9px;
  border-left: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  padding-left: 20px;
}
.empty-prompt-label {
  color: var(--muted-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.empty-prompt code {
  color: var(--ink-soft);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 1.55;
}
.not-found {
  min-height: calc(100vh - 188px);
}
.not-found-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 52px;
  align-items: center;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 42px 0;
}
.not-found-panel h1 {
  margin-top: 8px;
}
.not-found-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}
.not-found-action {
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--paper);
  cursor: pointer;
  font-size: 13px;
  padding: 9px 13px;
}
.not-found-action:hover {
  background: var(--accent-2);
  border-color: var(--accent-2);
}
.not-found-code {
  color: color-mix(in srgb, var(--accent) 48%, var(--line));
  font-size: 92px;
  font-weight: 620;
  letter-spacing: 0;
  line-height: 1;
}
.loading-shell {
  min-height: 240px;
}
.loading-stack {
  display: grid;
  gap: 12px;
}
.loading-bar {
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--panel) 0%, color-mix(in srgb, var(--paper) 82%, transparent) 45%, var(--panel) 100%);
  background-size: 200% 100%;
  animation: loading-bar 1.15s linear infinite;
}
.loading-bar.wide {
  width: min(100%, 560px);
}
.loading-bar.mid {
  width: min(100%, 420px);
}
.loading-bar.short {
  width: min(100%, 260px);
}
@keyframes loading-bar {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
@media (max-width: 860px) {
  main {
    width: min(100vw - 40px, 1180px);
    padding: 36px 0 60px;
  }
  .crumbs {
    margin-bottom: 36px;
  }
  .page-head {
    display: block;
    margin-bottom: 28px;
  }
  .meta {
    margin-top: 12px;
    white-space: normal;
  }
  h1 {
    font-size: 28px;
  }
  .row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 20px 0;
  }
  .row-title {
    font-size: 21px;
  }
  .empty-state,
  .not-found-panel {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .empty-prompt {
    border-left: 0;
    border-top: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
    padding-left: 0;
    padding-top: 16px;
  }
  .not-found-code {
    font-size: 58px;
    justify-self: start;
  }
  .chapter-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "crumbs"
      "head"
      "sidebar"
      "content";
  }
  .chapter-index {
    position: static;
    margin-bottom: 36px;
    border-bottom: 1px solid var(--line);
    padding-top: 0;
  }
  .chapter-tools-summary {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    color: var(--ink);
    cursor: pointer;
    font-size: 13px;
    font-weight: 620;
    list-style: none;
    padding: 13px 0;
  }
  .chapter-tools-summary::-webkit-details-marker {
    display: none;
  }
  .chapter-tools-summary::after {
    content: "+";
    color: var(--accent-2);
    font-size: 18px;
    font-weight: 400;
    line-height: 1;
    margin-left: auto;
  }
  [data-chapter-tools][open] > .chapter-tools-summary::after {
    content: "−";
  }
  .chapter-tools-summary:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
    outline-offset: 4px;
  }
  .chapter-tools-summary-meta {
    color: var(--muted-2);
    font-size: 12px;
    font-weight: 500;
  }
  .chapter-tools-body {
    border-top: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
    padding: 18px 0 4px;
  }
  .chapter-navigation {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .chapter-navigation-button.next {
    grid-column: 1;
    text-align: left;
  }
  .transformation-stages,
  .transformation.layout-auto.auto-hybrid .transformation-stages,
  .transformation.layout-compare.auto-hybrid .transformation-stages {
    grid-template-columns: 1fr;
  }
  .transformation.layout-auto.auto-hybrid .transformation-stage-operation,
  .transformation.layout-auto.auto-hybrid .transformation-stage-output,
  .transformation.layout-compare.auto-hybrid .transformation-stage-operation,
  .transformation.layout-compare.auto-hybrid .transformation-stage-output {
    grid-column: auto;
    grid-row: auto;
  }
  .transformation-stage {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
  }
  .transformation-stage:last-child {
    border-bottom: 0;
  }
  .glossary-entry {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .textbook-tabs {
    margin-top: -6px;
  }
  .glossary-aggregate-entry {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .glossary-toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .glossary-page-actions {
    justify-content: flex-start;
  }
  .glossary-search {
    flex-basis: auto;
    max-width: none;
    margin-left: 0;
  }
  .glossary-study-controls {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
  .glossary-study-scoreboard {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .glossary-study-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .glossary-study-options.desktop {
    display: none;
  }
  .glossary-study-options.mobile {
    position: static;
    display: grid;
  }
  .glossary-study-options.mobile .glossary-study-options-groups {
    border-top: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
    margin-top: 14px;
    padding-top: 16px;
  }
  .glossary-card {
    min-height: 360px;
    padding: 30px 18px 22px;
  }
  .glossary-study-finish {
    min-height: 360px;
    padding: 30px 18px 22px;
  }
  .glossary-rate-button {
    flex: 1 1 auto;
  }
  .glossary-card-nav {
    gap: 12px;
  }
  .glossary-card-nav .glossary-action {
    min-width: 0;
  }
  .glossary-card .glossary-star {
    right: 16px;
    top: 16px;
  }
  .glossary-card-term {
    font-size: 30px;
  }
  .quiz-matching-head,
  .quiz-match-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .quiz-match-row {
    grid-template-columns: minmax(0, 1fr) 22px;
    column-gap: 10px;
  }
  .quiz-match-left,
  .quiz-match-select {
    grid-column: 1 / 2;
  }
  .quiz-match-result {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
  .coding-workspace {
    grid-template-columns: 1fr;
  }
  .coding-files {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--line) 45%, transparent);
  }
}
@media (max-width: 560px) {
  .glossary-card-controls {
    gap: 10px;
  }
  .glossary-card-nav,
  .glossary-track-toggle {
    grid-area: auto;
  }
  .glossary-card-nav {
    justify-self: center;
  }
  .glossary-track-toggle {
    justify-self: start;
    min-height: auto;
  }
}
`;
}
