export function baseCss(): string {
  return `
:root {
  color-scheme: light;
  --ink: #020202;
  --ink-soft: #403e3a;
  --muted: #5e5d59;
  --muted-2: #7d7c77;
  --line: #b5b3ad;
  --paper: #faf9f5;
  --panel: #f1eee6;
  --panel-soft: #f0eee6;
  --accent: #8a5b41;
  --accent-2: #654533;
  --tutor-color-red: #a33b2f;
  --tutor-color-red-soft: #f0e2dd;
  --tutor-color-red-border: #ab7168;
  --tutor-color-red-strong: #863127;
  --tutor-color-orange: #b2642f;
  --tutor-color-orange-soft: #f1e7dd;
  --tutor-color-orange-border: #b38868;
  --tutor-color-orange-strong: #925227;
  --tutor-color-yellow: #c99a2e;
  --tutor-color-yellow-soft: #f4eedd;
  --tutor-color-yellow-border: #c0a567;
  --tutor-color-yellow-strong: #a57f26;
  --tutor-color-green: #2f7d46;
  --tutor-color-green-soft: #e2eae0;
  --tutor-color-green-border: #6b9574;
  --tutor-color-green-strong: #27673a;
  --tutor-color-blue: #3f6f8f;
  --tutor-color-blue-soft: #e4e8e9;
  --tutor-color-blue-border: #748e9d;
  --tutor-color-blue-strong: #345b76;
  --tutor-color-indigo: #565b92;
  --tutor-color-indigo-soft: #e6e6e9;
  --tutor-color-indigo-border: #81839e;
  --tutor-color-indigo-strong: #474b78;
  --tutor-color-violet: #774f8b;
  --tutor-color-violet-soft: #eae5e8;
  --tutor-color-violet-border: #937c9a;
  --tutor-color-violet-strong: #624172;
  --tutor-color-success: #2f7d46;
  --tutor-color-success-soft: #e2eae0;
  --tutor-color-success-border: #6b9574;
  --tutor-color-success-strong: #27673a;
  --tutor-color-danger: #a33b2f;
  --tutor-color-danger-soft: #f0e2dd;
  --tutor-color-danger-border: #ab7168;
  --tutor-color-danger-strong: #863127;
  --tutor-color-warning: #c99a2e;
  --tutor-color-warning-soft: #f4eedd;
  --tutor-color-warning-border: #c0a567;
  --tutor-color-warning-strong: #a57f26;
  --tutor-color-info: #3f6f8f;
  --tutor-color-info-soft: #e4e8e9;
  --tutor-color-info-border: #748e9d;
  --tutor-color-info-strong: #345b76;
  --tutor-color-category-1: #b2642f;
  --tutor-color-category-1-soft: #f1e7dd;
  --tutor-color-category-1-border: #b38868;
  --tutor-color-category-1-strong: #925227;
  --tutor-color-category-2: #565b92;
  --tutor-color-category-2-soft: #e6e6e9;
  --tutor-color-category-2-border: #81839e;
  --tutor-color-category-2-strong: #474b78;
  --tutor-color-category-3: #774f8b;
  --tutor-color-category-3-soft: #eae5e8;
  --tutor-color-category-3-border: #937c9a;
  --tutor-color-category-3-strong: #624172;
}
* { box-sizing: border-box; }
.sr-only {
  width: 1px;
  height: 1px;
  position: absolute;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
button {
  font: inherit;
}
main {
  width: min(1180px, calc(100vw - 160px));
  margin: 0 auto;
  padding: 84px 0 104px;
}
.crumbs {
  min-height: 22px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-bottom: 42px;
  color: var(--muted);
  font-size: 13px;
}
.crumb-link {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  padding: 0;
}
.crumb-link:hover,
.index-link:hover,
.row:hover {
  color: var(--accent-2);
}
.crumb-current {
  color: var(--ink-soft);
}
.crumb-separator {
  color: var(--muted-2);
}
.page-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
}
h1 {
  margin: 0;
  color: var(--ink);
  font-size: 30px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.16;
}
.meta {
  color: var(--muted);
  font-size: 13px;
  white-space: nowrap;
}
.highlight-mode-row {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 7px;
  width: fit-content;
}
.highlight-mode-tooltip {
  display: inline-grid;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--muted-2);
  cursor: help;
  font-size: 10px;
  font-weight: 650;
  font-style: normal;
  line-height: 1;
  min-height: 15px;
  min-width: 15px;
  padding: 0;
  position: relative;
}
.highlight-mode-tooltip:hover,
.highlight-mode-tooltip:focus-visible {
  border-color: color-mix(in srgb, var(--accent) 56%, transparent);
  color: var(--accent-2);
}
.highlight-mode-tooltip:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 2px;
}
.highlight-mode-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 7px);
  left: 50%;
  z-index: 20;
  width: max-content;
  max-width: 220px;
  border: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
  background: var(--paper);
  color: var(--ink-soft);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  opacity: 0;
  padding: 6px 8px;
  pointer-events: none;
  text-align: center;
  transform: translate(-50%, 2px);
  transition: opacity 120ms ease, transform 120ms ease;
}
.highlight-mode-tooltip:hover::after,
.highlight-mode-tooltip:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}
.rows {
  border-top: 1px solid var(--line);
}
.textbook-chapter-rows {
  border-top: 0;
}
.textbook-tabs {
  display: flex;
  gap: 22px;
  border-bottom: 1px solid var(--line);
  margin: -12px 0 0;
}
.textbook-tab {
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  font-weight: 620;
  padding: 0 0 10px;
}
.textbook-tab.active {
  border-bottom-color: var(--ink);
  color: var(--ink);
}
.textbook-tab:hover {
  color: var(--accent-2);
}
.row {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  padding: 24px 0;
  text-align: left;
}
.row-title {
  display: block;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1.2;
}
.row-description {
  display: block;
  max-width: 660px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
  margin-top: 8px;
}
.chapter-row-status {
  display: block;
  color: var(--muted-2);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  margin-top: 6px;
  opacity: .72;
  text-align: right;
}
.row-count {
  color: var(--muted-2);
  font-size: 13px;
  white-space: nowrap;
}
.row-meta-stack {
  display: grid;
  justify-items: end;
}
.library-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 44px;
  align-items: center;
  border-bottom: 1px solid var(--line);
  padding: 24px 0;
}
.library-row-count {
  text-align: right;
}
.library-row-title-line {
  display: block;
}
.library-row-main {
  display: block;
  width: 100%;
}
.library-row-title-button {
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  padding: 0;
  text-align: left;
}
.library-row-title-button:hover .row-title,
.library-row-title-button:focus-visible .row-title {
  color: var(--accent-2);
}
.library-row-title-button:focus-visible,
.textbook-row-action:focus-visible,
.chapter-completion-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 55%, transparent);
  outline-offset: 3px;
}
.course-progress {
  width: min(100%, 520px);
  display: grid;
  gap: 6px;
}
.course-progress-rail {
  display: block;
  width: 100%;
  height: 4px;
  border: 0;
  overflow: hidden;
  background: color-mix(in srgb, var(--line) 34%, transparent);
}
.course-progress-rail > span {
  display: block;
  height: 100%;
  background: var(--accent-2);
}
.course-progress-label {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 5px;
  color: var(--muted-2);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 10px;
}
.course-progress-separator {
  color: var(--muted-2);
}
.course-progress-list {
  margin-top: 8px;
  max-width: 520px;
}
.textbook-row-action,
.chapter-completion-button {
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  font-weight: 560;
  padding: 8px 0;
}
.textbook-row-action {
  margin: -4px 0;
  white-space: nowrap;
}
.course-progress-label .textbook-row-action {
  min-height: auto;
  color: inherit;
  font-weight: inherit;
  margin: 0;
  padding: 0;
  font-size: inherit;
  line-height: inherit;
}
.chapter-completion-button {
  padding-left: 10px;
}
.textbook-row-action:hover {
  background: transparent;
  color: var(--accent-2);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.progress-check {
  color: var(--accent);
}
.next-up-label {
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  opacity: 1;
}
.repair-label,
.course-progress-kicker {
  display: block;
  color: var(--accent-2);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .1em;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.library-row-error {
  grid-template-columns: 1fr;
  border-left: 3px solid var(--accent);
  background: color-mix(in srgb, var(--panel) 54%, transparent);
  padding-left: 20px;
  padding-right: 20px;
}
.repair-path {
  display: block;
  color: var(--muted-2);
  font-size: 11px;
  margin-top: 10px;
  overflow-wrap: anywhere;
}
.chapter-progress-block {
  display: grid;
  gap: 8px;
  justify-items: start;
  margin: 20px 0 -9px;
}
.chapter-progress-count {
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 550;
  line-height: 1.45;
}
.chapter-progress-separator {
  color: var(--muted-2);
}
.chapter-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 82px;
  align-items: start;
}
.chapter-index {
  position: sticky;
  top: 48px;
  border-top: 1px solid var(--line);
  padding-top: 18px;
}
.chapter-tools-summary {
  display: none;
}
.index-label {
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.index-list {
  display: grid;
  gap: 2px;
}
.chapter-highlights {
  border-top: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
  margin-top: 24px;
  padding-top: 18px;
}
.chapter-highlights[hidden] {
  display: none;
}
.chapter-highlight-list {
  display: grid;
  gap: 8px;
}
.chapter-highlight-empty {
  color: var(--muted-2);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 2px;
}
.highlight-mode-toggle {
  margin: 0 0 12px;
}
.highlight-mode-switch {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 7px;
  min-height: 22px;
  color: var(--muted);
  font-size: 13px;
  width: fit-content;
}
.highlight-mode-row .highlight-mode-switch {
  gap: 7px;
  justify-content: flex-start;
  min-height: 22px;
}
.highlight-mode-switch-label {
  color: var(--muted);
  font-weight: 530;
}
.highlight-mode-row .highlight-mode-switch-label {
  color: var(--muted);
  font-weight: 530;
}
.highlight-mode-switch .glossary-toggle-input {
  height: 14px;
  width: 14px;
}
.highlight-mode-switch .glossary-toggle-input::before {
  height: 6px;
  width: 6px;
}
.chapter-content.highlight-mode-active [data-highlight-unsupported] {
  cursor: not-allowed;
}
.chapter-content.highlight-mode-active [data-highlight-anchor] {
  cursor: text;
}
.chapter-highlight-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: start;
  border: 0;
  border-left: 3px solid color-mix(in srgb, #c99a2e 86%, var(--line));
  background: color-mix(in srgb, #f4d35e 26%, var(--paper));
  color: var(--ink-soft);
  cursor: pointer;
  font: inherit;
  padding: 10px 12px;
  text-align: left;
}
.chapter-highlight-item.changed,
.chapter-highlight-item.unresolved {
  border-left-color: var(--muted-2);
  background: color-mix(in srgb, var(--panel) 46%, transparent);
}
.chapter-highlight-quote {
  display: -webkit-box;
  color: var(--muted);
  font-size: 12.5px;
  line-height: 1.35;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
.chapter-highlight-status {
  color: var(--muted-2);
  font-size: 11px;
  font-weight: 620;
  line-height: 1.35;
  margin-top: 4px;
}
.chapter-highlight-remove {
  border: 0;
  background: transparent;
  color: var(--muted-2);
  cursor: pointer;
  font: inherit;
  font-size: 15px;
  line-height: 1;
  min-height: 20px;
  min-width: 20px;
  opacity: .72;
  padding: 0;
  text-align: center;
}
.chapter-highlight-remove:hover,
.chapter-highlight-remove:focus-visible {
  color: var(--accent-2);
  opacity: 1;
}
.index-link {
  display: block;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  padding: 7px 0;
  text-align: left;
  text-decoration: none;
  font-size: 13px;
  line-height: 1.35;
}
.index-link.subsection {
  padding-left: 18px;
  color: var(--muted-2);
}
.chapter-content {
  min-width: 0;
}
.chapter-footer {
  margin-top: 26px;
}
.chapter-completion {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  padding: 0;
}
.chapter-completion-state {
  color: var(--ink-soft);
  font-size: 16px;
  font-weight: 560;
  line-height: 1.45;
}
.chapter-completion-state.is-complete {
  color: var(--ink);
}
.chapter-completion-button {
  min-height: auto;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--paper);
  padding: 7px 11px;
}
.chapter-completion-button:hover {
  border-color: var(--accent-2);
  background: var(--accent-2);
  color: var(--paper);
}
.chapter-completion-button:disabled {
  cursor: progress;
  opacity: .6;
}
.chapter-navigation {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  border-top: 1px solid var(--line);
  margin-top: 26px;
  padding-top: 28px;
}
.chapter-navigation-button {
  display: grid;
  gap: 7px;
  border: 0;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  padding: 0;
  text-align: left;
}
.chapter-navigation-button.next {
  grid-column: 2;
  text-align: right;
}
.chapter-navigation-button:hover .chapter-navigation-title {
  color: var(--accent-2);
}
.chapter-navigation-label {
  color: var(--muted-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.chapter-navigation-title {
  font-size: 17px;
  font-weight: 560;
  line-height: 1.35;
}
.chapter-section {
  border-top: 1px solid var(--line);
  padding: 32px 0 6px;
}
.chapter-section:first-child {
  padding-top: 0;
  border-top: 0;
}
.section-title {
  margin: 0 0 18px;
  color: var(--ink);
  font-size: 24px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.2;
}
.subsection-block {
  margin-top: 34px;
  padding-top: 0;
}
.subsection-title {
  margin: 0 0 14px;
  color: var(--ink-soft);
  font-size: 18px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.3;
}
.blocks {
  display: grid;
  gap: 18px;
}
.block {
  min-width: 0;
}
.local-heading {
  margin: 10px 0 0;
  color: var(--accent-2);
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0;
}
.local-heading.level-5 {
  color: var(--ink-soft);
  font-size: 13px;
}
.markdown ul,
.markdown ol {
  color: var(--ink-soft);
  font-size: 16px;
  line-height: 1.7;
  margin: 0 0 12px;
  padding-left: 22px;
}
.code-block {
  position: relative;
  overflow: auto;
  margin: 0 0 12px;
  padding: 14px 16px;
  background: var(--panel-soft);
  border: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  border-radius: 6px;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.55;
}
.code-block.syntax-highlighted {
  color: var(--ink-soft);
}
.code-block.syntax-highlighted code {
  display: block;
  min-width: max-content;
}
.code-block.syntax-highlighted::before {
  content: attr(data-syntax-language);
  position: sticky;
  left: 100%;
  float: right;
  margin: -1px 0 4px 12px;
  padding: 0;
  color: var(--muted-2);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0;
  line-height: 1.3;
  text-transform: uppercase;
}
.math-block {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 2px 0 14px;
  padding-bottom: 2px;
  color: var(--accent-2);
  font-size: 23px;
  line-height: 1.4;
}
.math-block .katex-display {
  margin: 0;
  text-align: left;
}
.math {
  max-width: 100%;
  overflow-wrap: anywhere;
}
.math .katex {
  font-size: 1.02em;
}
.diagram,
.chart,
.image-block {
  margin: 6px 0 16px;
}
.diagram-title,
.chart-title {
  margin: 0 0 10px;
  color: var(--ink);
  font-size: 16px;
  font-weight: 560;
  letter-spacing: 0;
}
.diagram-frame {
  position: relative;
}
.diagram-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}
.diagram-body,
.chart-body {
  overflow: auto;
  padding: 16px;
  background: color-mix(in srgb, var(--panel) 32%, transparent);
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  border-radius: 6px;
}
.diagram-body {
  display: grid;
  justify-items: center;
}
.diagram-body svg,
.chart-svg {
  display: block;
  max-width: 100%;
}
.diagram-body svg {
  height: auto;
}
.diagram-icon-button {
  display: inline-grid;
  width: 32px;
  height: 32px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
}
.diagram-icon-button:hover,
.diagram-icon-button:focus-visible {
  color: var(--accent-2);
}
.diagram-icon-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 48%, transparent);
  outline-offset: 2px;
}
.diagram-icon-button svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.has-diagram-overlay {
  overflow: hidden;
}
.diagram-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  padding: 28px;
  background: rgba(2, 2, 2, .62);
}
.diagram-overlay-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--paper);
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  border-radius: 8px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, .28);
}
.diagram-overlay-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
}
.diagram-overlay-title {
  min-width: 0;
  overflow: hidden;
  color: var(--ink);
  font-size: 14px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.diagram-overlay-close {
  flex: 0 0 auto;
}
.diagram-overlay-body {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  display: grid;
  place-items: center;
  padding: 24px;
}
.diagram-overlay-body svg {
  display: block;
  width: auto;
  max-width: none;
  height: auto;
  max-height: none;
}
.diagram-source,
.diagram-error {
  margin-top: 10px;
}
.diagram-error {
  color: var(--accent-2);
  font-size: 13px;
}
.chart-svg {
  width: 100%;
  height: auto;
}
.chart-axis,
.chart-grid {
  stroke: color-mix(in srgb, var(--line) 78%, transparent);
  stroke-width: 1;
}
.chart-grid {
  stroke-dasharray: 4 5;
}
.chart-bar {
  fill: color-mix(in srgb, var(--accent) 76%, var(--paper));
}
.chart-line,
.chart-point {
  stroke: var(--accent-2);
}
.chart-line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.chart-point {
  fill: var(--paper);
  stroke-width: 2;
}
.chart-label,
.chart-value,
.chart-axis-label {
  fill: var(--ink-soft);
  font-size: 12px;
}
.chart-axis-label {
  fill: var(--muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.image-block {
  display: grid;
  gap: 9px;
}
.image-block-media {
  display: block;
  max-width: 100%;
  height: auto;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--panel) 32%, transparent);
}
.image-block-caption {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}
.image-block-credit {
  color: var(--muted-2);
}
.callout {
  margin: 4px 0 14px;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--panel) 68%, transparent);
  border-left: 3px solid var(--accent);
}
.callout.caution {
  border-left-color: var(--accent-2);
}
.callout.key-idea {
  border-left-color: var(--ink-soft);
}
.callout-title {
  color: var(--accent-2);
  font-size: 12px;
  font-weight: 650;
  letter-spacing: .04em;
  text-transform: uppercase;
  margin: 0 0 7px;
}
`;
}
