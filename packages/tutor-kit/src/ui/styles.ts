export function css(): string {
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
  border-top: 1px solid var(--line);
  padding-top: 18px;
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
.glossary {
  margin: 8px 0 18px;
  padding: 16px 18px 6px;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  background: color-mix(in srgb, var(--panel) 30%, transparent);
}
.glossary-title {
  margin: 0 0 12px;
  color: var(--ink);
  font-size: 17px;
  font-weight: 560;
  letter-spacing: 0;
}
.glossary-title-link {
  color: inherit;
  text-decoration: none;
}
.glossary-title-link:hover,
.glossary-title-link:focus-visible {
  color: var(--accent-2);
}
.glossary-title-link:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent-2) 28%, transparent);
  outline-offset: 3px;
}
.glossary-list {
  display: grid;
  gap: 0;
  margin: 0;
}
.glossary-entry {
  display: grid;
  grid-template-columns: minmax(118px, 190px) minmax(0, 1fr) auto;
  column-gap: 14px;
  align-items: start;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.glossary-entry:last-child {
  border-bottom: 0;
}
.glossary-term {
  margin: 0;
  color: var(--accent-2);
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
}
.glossary-definition {
  margin: 0;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.55;
}
.glossary-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  border-bottom: 0;
  margin-bottom: 8px;
  padding: 14px 0 10px;
}
.glossary-page-actions {
  position: relative;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  justify-content: flex-start;
}
.glossary-study-launcher {
  position: relative;
}
.glossary-study-button {
  border: 1px solid color-mix(in srgb, var(--line) 78%, transparent);
  background: var(--paper);
  color: var(--accent-2);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  line-height: 1;
  min-height: 40px;
  padding: 10px 13px;
}
.glossary-study-button:hover {
  border-color: var(--accent-2);
  background: color-mix(in srgb, var(--panel) 48%, transparent);
  color: var(--accent-2);
}
.glossary-study-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
  outline-offset: 4px;
}
.glossary-study-menu {
  position: absolute;
  left: 0;
  z-index: 5;
  display: grid;
  min-width: 220px;
  margin-top: 8px;
  border: 1px solid color-mix(in srgb, var(--line) 62%, transparent);
  background: var(--paper);
  box-shadow: 0 18px 34px color-mix(in srgb, var(--ink) 11%, transparent);
}
.glossary-study-menu[hidden] {
  display: none;
}
.glossary-study-menu button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 48%, transparent);
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 560;
  min-height: 44px;
  padding: 11px 13px;
  text-align: left;
}
.glossary-study-menu button:disabled {
  cursor: not-allowed;
  opacity: .48;
}
.glossary-study-menu button:last-child {
  border-bottom: 0;
}
.glossary-study-menu button:hover,
.glossary-study-menu button:focus-visible {
  background: color-mix(in srgb, var(--panel) 56%, transparent);
  color: var(--accent-2);
}
.glossary-study-menu button:disabled:hover {
  background: transparent;
  color: var(--ink-soft);
}
.glossary-study-menu-count {
  color: var(--muted-2);
  font-variant-numeric: tabular-nums;
}
.glossary-action {
  border: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
  background: var(--paper);
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 620;
  line-height: 1;
}
.glossary-action.primary {
  border-color: var(--ink);
  color: var(--ink);
}
.glossary-action:hover,
.glossary-action.primary:hover {
  border-color: var(--accent-2);
  background: color-mix(in srgb, var(--panel) 48%, transparent);
  color: var(--accent-2);
}
.glossary-action:disabled {
  cursor: not-allowed;
  opacity: .45;
}
.glossary-action:disabled:hover {
  border-color: color-mix(in srgb, var(--line) 72%, transparent);
  background: var(--paper);
  color: var(--muted);
}
.glossary-search {
  flex: 0 1 400px;
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  border: 1px solid color-mix(in srgb, var(--line) 72%, transparent);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  min-height: 40px;
  padding: 9px 12px;
}
.glossary-search:focus {
  outline: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
  outline-offset: 2px;
}
.glossary-results {
  display: grid;
  gap: 34px;
}
.glossary-empty {
  border-bottom: 1px solid var(--line);
  padding: 28px 0 30px;
}
.glossary-empty .empty-copy {
  max-width: 520px;
}
.glossary-chapter-group {
  border-bottom: 1px solid color-mix(in srgb, var(--line) 48%, transparent);
  padding-bottom: 18px;
}
.glossary-group-head {
  margin-bottom: 14px;
}
.glossary-group-title {
  margin: 0;
}
.glossary-group-title-link {
  color: var(--ink);
  text-decoration: none;
  font-size: 20px;
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.25;
}
.glossary-group-title-link:hover {
  color: var(--accent-2);
}
.glossary-aggregate-list {
  display: grid;
  gap: 0;
  margin: 0;
}
.glossary-aggregate-entry {
  display: grid;
  grid-template-columns: minmax(150px, 220px) minmax(0, 1fr) auto;
  column-gap: 18px;
  align-items: start;
  padding: 16px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.glossary-aggregate-entry:last-child {
  border-bottom: 0;
}
.glossary-star {
  border: 0;
  background: transparent;
  color: var(--muted-2);
  cursor: pointer;
  font: inherit;
  font-size: 18px;
  line-height: 1;
  min-width: 24px;
  min-height: 24px;
  padding: 2px;
}
.glossary-star.is-starred {
  color: var(--accent-2);
}
.glossary-star:hover {
  color: var(--accent-2);
}
.glossary-star.is-starred:hover {
  color: var(--accent);
}
.glossary-star:focus-visible,
.glossary-action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
  outline-offset: 3px;
}
.glossary-study-page {
  display: grid;
  gap: 16px;
  padding: 0 0 34px;
}
.glossary-study-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 62px;
  align-items: start;
}
.glossary-study-options {
  position: sticky;
  top: 48px;
  display: grid;
  gap: 18px;
  border-top: 1px solid var(--line);
  padding-top: 18px;
}
.glossary-study-options.mobile {
  display: none;
}
.glossary-study-options summary {
  cursor: pointer;
  list-style: none;
}
.glossary-study-options summary::-webkit-details-marker {
  display: none;
}
.glossary-study-options-title {
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.glossary-study-options-groups {
  display: grid;
  gap: 18px;
}
.glossary-study-option-group {
  display: grid;
  gap: 9px;
}
.glossary-study-option-label {
  color: var(--muted-2);
  font-size: 12px;
  font-weight: 560;
  letter-spacing: .01em;
}
.glossary-study-option-set {
  display: grid;
  gap: 2px;
}
.glossary-study-option {
  border: 0;
  border-left: 2px solid transparent;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  line-height: 1.35;
  padding: 7px 0 7px 16px;
  text-align: left;
}
.glossary-study-option:hover,
.glossary-study-option:focus-visible {
  color: var(--accent-2);
}
.glossary-study-option.is-selected {
  border-left-color: color-mix(in srgb, var(--accent-2) 78%, var(--line));
  background: color-mix(in srgb, var(--panel) 34%, transparent);
  color: var(--ink);
  font-weight: 650;
}
.glossary-study-option:disabled {
  color: var(--muted-2);
  cursor: not-allowed;
  opacity: .45;
}
.glossary-study-option:disabled:hover {
  color: var(--muted-2);
}
.glossary-study-option.restart {
  margin-top: 8px;
  padding-left: 0;
  font-weight: 520;
}
.glossary-study-option-group.session-action {
  border-top: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  padding-top: 14px;
}
.glossary-segmented-control {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
  background: color-mix(in srgb, var(--paper) 92%, var(--panel));
}
.glossary-segmented-control.is-disabled {
  opacity: .48;
}
.glossary-segment {
  min-height: 34px;
  border: 0;
  border-right: 1px solid color-mix(in srgb, var(--line) 38%, transparent);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 560;
  padding: 7px 8px;
  text-align: center;
}
.glossary-segment:last-child {
  border-right: 0;
}
.glossary-segment:hover,
.glossary-segment:focus-visible {
  background: color-mix(in srgb, var(--panel) 22%, transparent);
  color: var(--accent-2);
}
.glossary-segment.is-selected {
  background: color-mix(in srgb, var(--panel) 54%, var(--paper));
  box-shadow: none;
  color: var(--ink);
  font-weight: 620;
}
.glossary-segment:disabled {
  background: transparent;
  box-shadow: none;
  color: var(--muted-2);
  cursor: not-allowed;
  opacity: .55;
}
.glossary-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 34px;
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  line-height: 1.35;
}
.glossary-toggle-label {
  color: var(--ink-soft);
  font-weight: 540;
}
.glossary-toggle-input {
  appearance: none;
  display: grid;
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--muted) 44%, var(--line));
  background: color-mix(in srgb, var(--paper) 94%, var(--panel));
  cursor: pointer;
  margin: 0;
}
.glossary-toggle-input::before {
  width: 7px;
  height: 7px;
  background: color-mix(in srgb, var(--accent-2) 84%, var(--ink));
  content: "";
  opacity: 0;
  transform: scale(.45);
  transition: opacity 120ms ease, transform 120ms ease;
}
.glossary-toggle-input:checked {
  border-color: color-mix(in srgb, var(--accent-2) 52%, var(--line));
  background: color-mix(in srgb, var(--panel) 42%, var(--paper));
}
.glossary-toggle-input:checked::before {
  opacity: .72;
  transform: scale(1);
}
.glossary-toggle-input:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent-2) 28%, transparent);
  outline-offset: 3px;
}
.glossary-study-main {
  min-width: 0;
}
.glossary-study-stage {
  display: grid;
  gap: 14px;
  width: min(700px, 100%);
  margin: 0 auto;
}
.glossary-study-status {
  display: grid;
  gap: 12px;
  min-height: 34px;
}
.glossary-study-status.is-placeholder .glossary-study-controls {
  visibility: hidden;
}
.glossary-study-status.is-finished {
  visibility: hidden;
}
.glossary-study-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  width: 100%;
}
.glossary-study-scoreboard {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 16px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 620;
}
.glossary-study-score {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.glossary-study-score.known {
  justify-self: end;
}
.glossary-study-score.again {
  color: var(--muted);
}
.glossary-study-score.known {
  color: var(--muted);
}
.glossary-study-score-value {
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}
.glossary-study-score-separator {
  color: var(--muted-2);
}
.glossary-study-progress-bar {
  height: 3px;
  background: color-mix(in srgb, var(--line) 46%, transparent);
}
.glossary-study-progress-fill {
  height: 100%;
  background: color-mix(in srgb, var(--ink) 54%, var(--line));
  width: var(--glossary-progress, 0%);
}
.glossary-card {
  position: relative;
  display: grid;
  align-items: stretch;
  justify-items: center;
  border: 1px solid color-mix(in srgb, var(--line) 54%, transparent);
  background: color-mix(in srgb, var(--panel) 22%, var(--paper));
  box-shadow: 0 10px 22px color-mix(in srgb, var(--ink) 4%, transparent);
  cursor: pointer;
  min-height: 340px;
  padding: 34px 40px;
  transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}
.glossary-card:hover {
  border-color: color-mix(in srgb, var(--accent-2) 28%, var(--line));
  background: color-mix(in srgb, var(--panel) 34%, var(--paper));
  box-shadow: 0 12px 26px color-mix(in srgb, var(--ink) 6%, transparent);
}
.glossary-card-body {
  display: grid;
  align-items: center;
  width: min(560px, 100%);
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.glossary-card-body:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent-2) 36%, transparent);
  outline-offset: 8px;
}
.glossary-card-content {
  display: grid;
  align-content: center;
  gap: 12px;
}
.glossary-card-content.glossary-card-prompt {
  justify-items: center;
  text-align: center;
}
.glossary-card-content.glossary-card-revealed {
  justify-items: center;
  text-align: center;
}
.glossary-card-content.glossary-card-both {
  justify-items: center;
  text-align: center;
  gap: 18px;
}
.glossary-card .glossary-star {
  position: absolute;
  right: 20px;
  top: 20px;
}
.glossary-card-term {
  margin: 0;
  color: var(--ink);
  font-size: 42px;
  font-weight: 560;
  line-height: 1.18;
}
.glossary-card-definition {
  margin: 0;
  color: var(--ink-soft);
  font-size: 20px;
  line-height: 1.55;
  max-width: 44ch;
  text-align: center;
}
.glossary-study-finish-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 6px;
}
.glossary-card-controls {
  display: grid;
  align-items: start;
  width: min(700px, 100%);
  margin: 0 auto;
  min-height: 42px;
}
.glossary-card-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  grid-area: 1 / 1;
  justify-self: center;
}
.glossary-card-nav.is-waiting {
  visibility: hidden;
}
.glossary-card-nav .glossary-action {
  text-align: center;
}
.glossary-card-nav .glossary-nav-arrow,
.glossary-card-nav .glossary-rate-button {
  display: inline-grid;
  width: 42px;
  min-width: 42px;
  height: 42px;
  min-height: 42px;
  place-items: center;
  padding: 0;
  font-size: 20px;
}
.glossary-track-toggle {
  grid-area: 1 / 1;
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  color: var(--muted);
  cursor: pointer;
  font-size: 13px;
  font-weight: 620;
  line-height: 1;
  user-select: none;
}
.glossary-track-toggle input {
  width: 15px;
  height: 15px;
  accent-color: var(--accent-2);
  margin: 0;
}
.glossary-action {
  padding: 9px 12px;
}
.glossary-rate-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, currentColor 54%, var(--line));
  background: color-mix(in srgb, var(--paper) 84%, transparent);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  padding: 9px 12px;
}
.glossary-card-nav .glossary-rate-button {
  flex: 0 0 42px;
  font-size: 20px;
}
.glossary-rate-button:hover {
  background: color-mix(in srgb, currentColor 8%, var(--paper));
  border-color: currentColor;
}
.glossary-rate-button:focus-visible {
  outline: 2px solid color-mix(in srgb, currentColor 34%, transparent);
  outline-offset: 4px;
}
.glossary-rate-button.again {
  color: color-mix(in srgb, #a33b2f 88%, var(--ink));
}
.glossary-rate-button.known {
  color: color-mix(in srgb, #2f7d46 88%, var(--ink));
}
.glossary-rate-button.is-selected {
  background: color-mix(in srgb, currentColor 10%, var(--paper));
  box-shadow: inset 0 0 0 1px currentColor;
}
.glossary-rate-button:disabled {
  background: color-mix(in srgb, var(--paper) 76%, transparent);
  color: var(--muted-2);
  cursor: not-allowed;
  opacity: .5;
}
.glossary-rate-button:disabled:hover {
  background: color-mix(in srgb, var(--paper) 76%, transparent);
  border-color: color-mix(in srgb, currentColor 54%, var(--line));
}
.glossary-rate-icon {
  font-size: 18px;
  line-height: 1;
}
.glossary-study-finish {
  width: min(700px, 100%);
  margin: 0 auto;
  border: 1px solid color-mix(in srgb, var(--line) 54%, transparent);
  background: color-mix(in srgb, var(--panel) 22%, var(--paper));
  box-shadow: 0 10px 22px color-mix(in srgb, var(--ink) 4%, transparent);
  min-height: 340px;
  padding: 34px 40px;
  display: grid;
  place-items: center;
  text-align: center;
}
.glossary-study-finish-body {
  display: grid;
  justify-items: center;
  min-width: 0;
}
.glossary-study-finish .empty-kicker {
  margin-bottom: 8px;
}
.glossary-study-finish .empty-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}
.glossary-study-finish-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 9px;
  margin-top: 12px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 620;
}
.glossary-study-finish-actions {
  justify-content: center;
  margin-top: 18px;
}
.glossary-study-finish-actions .glossary-action:not(.primary) {
  border-color: color-mix(in srgb, var(--line) 58%, transparent);
  color: var(--muted);
}
.glossary-study-finish-actions .glossary-action:not(.primary):hover {
  border-color: color-mix(in srgb, var(--accent-2) 42%, var(--line));
  color: var(--accent-2);
}
.transformation {
  margin: 10px 0 22px;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  background: color-mix(in srgb, var(--panel) 34%, transparent);
}
.transformation-title {
  margin: 0;
  padding: 18px 18px 6px;
  color: var(--ink);
  font-size: 18px;
  font-weight: 560;
}
.transformation-focus {
  padding: 0 18px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 50%, transparent);
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}
.transformation-stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.transformation.layout-flow .transformation-stages,
.transformation.layout-auto.auto-flow .transformation-stages {
  grid-template-columns: 1fr;
}
.transformation.layout-auto.auto-hybrid .transformation-stages {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.transformation.layout-auto.auto-hybrid .transformation-stage-operation {
  grid-column: 1 / -1;
  grid-row: 2;
}
.transformation.layout-auto.auto-hybrid .transformation-stage-output {
  grid-column: 2;
  grid-row: 1;
}
.transformation-stage {
  min-width: 0;
  padding: 16px 18px 18px;
  border-right: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.transformation-stage:last-child {
  border-right: 0;
}
.transformation.layout-flow .transformation-stage,
.transformation.layout-auto.auto-flow .transformation-stage {
  border-right: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.transformation.layout-flow .transformation-stage:last-child,
.transformation.layout-auto.auto-flow .transformation-stage:last-child {
  border-bottom: 0;
}
.transformation.layout-auto.auto-hybrid .transformation-stage-input,
.transformation.layout-auto.auto-hybrid .transformation-stage-output {
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.transformation.layout-auto.auto-hybrid .transformation-stage-output,
.transformation.layout-auto.auto-hybrid .transformation-stage-operation {
  border-right: 0;
}
.transformation-stage-label,
.transformation-artifact-label,
.transformation-explanation-label {
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .07em;
  text-transform: uppercase;
}
.transformation-stage-label {
  margin-bottom: 12px;
}
.transformation-artifacts {
  display: grid;
  gap: 12px;
}
.transformation-artifact {
  min-width: 0;
}
.transformation-artifact-label {
  margin-bottom: 6px;
  color: var(--muted);
  letter-spacing: .04em;
  text-transform: none;
}
.transformation-artifact .code-block,
.transformation-artifact .math-block,
.transformation-artifact .markdown p {
  margin-bottom: 0;
}
.transformation-table-scroll {
  overflow-x: auto;
}
.transformation-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--ink-soft);
  font-size: 13px;
}
.transformation-table th,
.transformation-table td {
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  text-align: left;
  white-space: nowrap;
}
.transformation-table th {
  background: var(--panel-soft);
  color: var(--ink);
  font-weight: 600;
}
.transformation-explanation {
  padding: 16px 18px 18px;
  border-top: 1px solid color-mix(in srgb, var(--line) 50%, transparent);
}
.transformation-explanation-label {
  margin-bottom: 8px;
}
.quiz {
  margin: 10px 0 22px;
  border: 1px solid color-mix(in srgb, var(--line) 64%, transparent);
  background: color-mix(in srgb, var(--panel) 34%, transparent);
}
.quiz-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 50%, transparent);
}
.quiz-title {
  margin: 0;
  color: var(--ink);
  font-size: 18px;
  font-weight: 560;
  letter-spacing: 0;
}
.quiz-meta {
  color: var(--muted);
  font-size: 12px;
  white-space: nowrap;
}
.quiz-form {
  margin: 0;
  padding: 0;
}
.quiz-question {
  margin: 0;
  padding: 16px 18px;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 42%, transparent);
}
.quiz-question[data-quiz-kind="matching"] {
  padding-top: 18px;
  padding-bottom: 18px;
}
.quiz-question-title {
  margin: 0 0 12px;
  color: var(--ink-soft);
  font-size: 15px;
  font-weight: 560;
  line-height: 1.5;
}
.quiz-choices {
  display: grid;
  gap: 8px;
}
.quiz-choice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--line) 58%, transparent);
  background: var(--paper);
  color: var(--ink-soft);
  cursor: pointer;
}
.quiz-choice input {
  margin-top: 3px;
}
.quiz-choice.correct {
  border-color: color-mix(in srgb, #2f7d46 68%, var(--line));
  background: color-mix(in srgb, #2f7d46 12%, var(--paper));
}
.quiz-choice.incorrect {
  border-color: color-mix(in srgb, #a33b2f 62%, var(--line));
  background: color-mix(in srgb, #a33b2f 10%, var(--paper));
}
.quiz-matching {
  display: grid;
  gap: 0;
}
.quiz-matching-head,
.quiz-match-row {
  display: grid;
  grid-template-columns: minmax(0, .8fr) minmax(220px, 1fr) 22px;
  column-gap: 12px;
  row-gap: 4px;
  align-items: start;
}
.quiz-matching-head {
  padding-bottom: 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 36%, transparent);
  color: var(--muted);
  font-size: 12px;
  font-weight: 620;
}
.quiz-match-row {
  padding: 6px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 30%, transparent);
}
.quiz-match-row:last-child {
  padding-bottom: 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--line) 30%, transparent);
}
.quiz-match-row.selected {
  background: transparent;
}
.quiz-match-left {
  min-width: 0;
  padding: 7px 0 0;
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.45;
}
.quiz-match-select {
  width: 100%;
  min-width: 0;
  min-height: 34px;
  padding: 6px 36px 6px 10px;
  appearance: none;
  border: 1px solid color-mix(in srgb, var(--line) 52%, transparent);
  background-color: color-mix(in srgb, var(--panel) 78%, var(--paper));
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5l4 4 4-4' fill='none' stroke='%235d5850' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px 14px;
  color: var(--ink-soft);
  font: inherit;
  font-size: 13px;
  line-height: 1.35;
}
.quiz-match-select:focus {
  outline: 2px solid color-mix(in srgb, var(--accent) 42%, transparent);
  outline-offset: 2px;
}
.quiz-match-select:disabled {
  cursor: default;
  opacity: 1;
}
.quiz-match-row.correct .quiz-match-select {
  border-color: color-mix(in srgb, #2f7d46 52%, var(--line));
}
.quiz-match-row.incorrect .quiz-match-select {
  border-color: color-mix(in srgb, #a33b2f 52%, var(--line));
}
.quiz-match-result {
  min-width: 18px;
  min-height: 34px;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  visibility: hidden;
}
.quiz-match-row.correct .quiz-match-result,
.quiz-match-row.incorrect .quiz-match-result {
  visibility: visible;
}
.quiz-match-row.correct .quiz-match-result {
  color: #2f7d46;
}
.quiz-match-row.incorrect .quiz-match-result {
  color: #a33b2f;
}
.quiz-question[data-quiz-kind="matching"] > .quiz-explanation {
  margin-top: 10px;
  padding: 14px;
  font-size: 13px;
  line-height: 1.45;
}
.quiz-question[data-quiz-kind="matching"] > .quiz-explanation p {
  margin: 0;
  font-size: inherit;
  line-height: inherit;
}
.quiz-explanation {
  margin-top: 12px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--paper) 78%, transparent);
  border-left: 3px solid var(--accent);
}
.quiz-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 18px;
}
.quiz-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.quiz-check,
.quiz-reset {
  border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
  background: var(--paper);
  color: var(--ink-soft);
  cursor: pointer;
  font-size: 13px;
  padding: 7px 11px;
}
.quiz-check {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}
.quiz-score {
  color: var(--muted);
  font-size: 13px;
}
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
    gap: 36px;
  }
  .chapter-index {
    position: static;
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
  .transformation.layout-auto.auto-hybrid .transformation-stages {
    grid-template-columns: 1fr;
  }
  .transformation.layout-auto.auto-hybrid .transformation-stage-operation,
  .transformation.layout-auto.auto-hybrid .transformation-stage-output {
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
}`;
}

