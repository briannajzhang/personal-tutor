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
}
* { box-sizing: border-box; }
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
.row-count {
  color: var(--muted-2);
  font-size: 13px;
  white-space: nowrap;
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
  max-height: calc(100vh - 96px);
  overflow-y: auto;
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
.chapter-navigation {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  border-top: 1px solid var(--line);
  margin-top: 50px;
  padding-top: 24px;
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
.diagram-body,
.chart-body {
  overflow: auto;
  padding: 16px;
  background: color-mix(in srgb, var(--panel) 32%, transparent);
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  border-radius: 6px;
}
.diagram-body svg,
.chart-svg {
  display: block;
  max-width: 100%;
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
