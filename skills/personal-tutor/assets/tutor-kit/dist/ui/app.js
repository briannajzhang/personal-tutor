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
function css() {
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
  margin: 2px 0 14px;
  color: var(--accent-2);
  font-size: 23px;
  line-height: 1.4;
}
.math-block .katex-display {
  margin: 0;
  text-align: left;
}
.math .katex {
  font-size: 1.02em;
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
function clientJs() {
    return `
let textbooks = [];
const textbookCache = new Map();
const glossaryStudyStates = new Map();
let activeChapter = null;
const codingStates = new Map();
const quizStates = new Map();
let monacoReady = null;
let routeToken = 0;

async function load() {
  textbooks = await fetchJson("/api/textbooks");
  window.addEventListener("popstate", () => { void renderRoute(); });
  window.addEventListener("resize", scheduleTransformationLayouts);
  await renderRoute();
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text();
    const error = new Error(parseResponseError(body) || response.statusText || "Request failed");
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return response.json();
}

async function loadTextbook(textbookId) {
  if (textbookCache.has(textbookId)) return textbookCache.get(textbookId);
  const textbook = await fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}\`);
  textbookCache.set(textbookId, textbook);
  return textbook;
}

function renderHome() {
  const totalChapters = textbooks.reduce((sum, textbook) => sum + textbook.chapterCount, 0);
  const meta = textbooks.length === 0 ? "No textbooks yet" : \`\${textbooks.length} textbooks / \${totalChapters} chapters\`;
  document.querySelector("#main").innerHTML = \`
    <section>
      <div class="page-head">
        <h1>\${escapeHtml(document.title)}</h1>
        <div class="meta">\${escapeHtml(meta)}</div>
      </div>
      \${textbooks.length === 0 ? renderEmptyTextbooks() : renderTextbookRows()}
    </section>
  \`;
  document.querySelectorAll("[data-textbook]").forEach((button) => {
    button.addEventListener("click", () => navigateTextbook(button.dataset.textbook));
  });
}

function renderTextbookRows() {
  return \`
      <div class="rows">
        \${textbooks.map((textbook) => \`
          <button class="row" data-textbook="\${escapeAttr(textbook.id)}">
            <span>
              <span class="row-title">\${escapeHtml(textbook.title)}</span>
              \${textbook.description ? \`<span class="row-description">\${escapeHtml(textbook.description)}</span>\` : ""}
            </span>
            <span class="row-count">\${textbook.chapterCount} chapters</span>
          </button>
        \`).join("")}
      </div>
  \`;
}

function renderEmptyTextbooks() {
  return \`
    <div class="empty-state">
      <div>
        <div class="empty-kicker">Library is empty</div>
        <h2 class="empty-title">Generate your first textbook</h2>
        <p class="empty-copy">This workspace has no registered Tutor Kit textbooks yet. Published chapters will appear here once a textbook module is added.</p>
      </div>
      <div class="empty-prompt" aria-label="Expected textbook source">
        <span class="empty-prompt-label">Expected source</span>
        <code>textbooks/&lt;textbook-id&gt;/textbook.ts</code>
      </div>
    </div>
  \`;
}

async function renderTextbook(textbookId) {
  const token = textbookCache.has(textbookId) ? ++routeToken : beginRouteLoad("Loading textbook...");
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const glossaryEntries = collectTextbookGlossaryEntries(textbook);
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: textbook.title }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(textbook.title)}</h1>
      </div>
      \${renderTextbookTabs("chapters", textbook.chapters.length, glossaryEntries.length)}
      <div class="rows textbook-chapter-rows">
        \${textbook.chapters.map((chapter) => {
          const sectionCount = chapter.sections.length;
          const subsectionCount = chapter.sections.reduce((sum, section) => sum + section.subsections.length, 0);
          return \`
            <button class="row" data-chapter="\${escapeAttr(chapter.id)}">
              <span>
                <span class="row-title">\${escapeHtml(chapter.title)}</span>
                \${chapter.description ? \`<span class="row-description">\${escapeHtml(chapter.description)}</span>\` : ""}
              </span>
              <span class="row-count">\${sectionCount} sections / \${subsectionCount} subsections</span>
            </button>
          \`;
        }).join("")}
      </div>
    </section>
  \`;
  document.querySelectorAll("[data-chapter]").forEach((button) => {
    button.addEventListener("click", () => navigateChapter(textbook.id, button.dataset.chapter));
  });
  bindTextbookTabs(textbook.id);
  bindCrumbs();
  finishRouteLoad(token);
}

async function renderTextbookGlossary(textbookId) {
  const token = textbookCache.has(textbookId) ? ++routeToken : beginRouteLoad("Loading glossary...");
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const entries = collectTextbookGlossaryEntries(textbook);
  if (entries.length === 0) {
    history.replaceState(history.state, "", "/textbooks/" + encodeURIComponent(textbookId));
    await renderTextbook(textbookId);
    return;
  }
  const studyState = await loadGlossaryStudyState(textbook.id);
  if (token !== routeToken) return;
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: textbook.title, action: "textbook", textbookId },
        { label: "Glossary" }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(textbook.title)}</h1>
      </div>
      \${renderTextbookTabs("glossary", textbook.chapters.length, entries.length)}
      \${renderTextbookGlossaryView(textbook.id, entries, studyState)}
    </section>
  \`;
  bindCrumbs();
  bindTextbookTabs(textbook.id);
  bindTextbookGlossaryControls(textbook.id, entries);
  finishRouteLoad(token);
}

async function renderTextbookGlossaryStudy(textbookId) {
  const token = textbookCache.has(textbookId) ? ++routeToken : beginRouteLoad("Loading study session...");
  const textbook = await loadTextbook(textbookId);
  if (token !== routeToken) return;
  const entries = collectTextbookGlossaryEntries(textbook);
  if (entries.length === 0) {
    history.replaceState(history.state, "", "/textbooks/" + encodeURIComponent(textbookId));
    await renderTextbook(textbookId);
    return;
  }
  const studyState = await loadGlossaryStudyState(textbook.id);
  if (token !== routeToken) return;
  const requestedSet = new URLSearchParams(window.location.search).get("set") === "starred" ? "starred" : "all";
  const studySet = requestedSet === "starred" && studyState.starredTermIds.length === 0 ? "all" : requestedSet;
  startGlossaryStudySession(textbook.id, entries, studySet, undefined, { preserveCurrentIndex: true, render: false });
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: textbook.title, action: "textbook", textbookId },
        { label: "Glossary", action: "glossary", textbookId },
        { label: "Flashcards" }
      ])}
      <div class="page-head">
        <h1>Flashcards</h1>
        <div class="meta" data-glossary-study-top-progress>\${renderGlossaryStudyProgressLabel(entries, studyState)}</div>
      </div>
      \${renderGlossaryStudyPage(textbook.id, entries, studyState)}
    </section>
  \`;
  bindCrumbs();
  bindGlossaryStudyPageControls(textbook.id, entries);
  finishRouteLoad(token);
}

function renderTextbookTabs(activeTab, chapterCount, glossaryCount) {
  return \`
    <nav class="textbook-tabs" aria-label="Textbook views">
      <button class="textbook-tab \${activeTab === "chapters" ? "active" : ""}" type="button" data-textbook-tab="chapters">
        Chapters · \${chapterCount}
      </button>
      \${glossaryCount > 0 ? \`
      <button class="textbook-tab \${activeTab === "glossary" ? "active" : ""}" type="button" data-textbook-tab="glossary">
        Glossary · \${glossaryCount}
      </button>
      \` : ""}
    </nav>
  \`;
}

function bindTextbookTabs(textbookId) {
  document.querySelectorAll("[data-textbook-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.textbookTab === "glossary") {
        navigateTextbookGlossary(textbookId);
        return;
      }
      navigateTextbook(textbookId);
    });
  });
}

function renderTextbookGlossaryView(textbookId, entries, studyState) {
  if (entries.length === 0) {
    return renderTextbookGlossaryEmpty();
  }
  return \`
    <div data-glossary-view>
      \${renderGlossaryBrowseView(entries, studyState)}
    </div>
  \`;
}

function renderGlossaryStudyLauncher(studyState, glossaryCount = 0) {
  const starredCount = studyState.starredTermIds.length;
  return \`
    <div class="glossary-study-launcher">
      <button class="glossary-study-button" type="button" data-glossary-study-menu-toggle aria-expanded="false">Flashcards ▾</button>
      <div class="glossary-study-menu" data-glossary-study-menu hidden>
        <button type="button" data-glossary-study-launch="all">
          <span>Study all terms</span>
          <span class="glossary-study-menu-count">\${glossaryCount}</span>
        </button>
        <button type="button" data-glossary-study-launch="starred" \${starredCount === 0 ? "disabled" : ""}>
          <span>Study starred terms</span>
          <span class="glossary-study-menu-count">\${starredCount}</span>
        </button>
      </div>
    </div>
  \`;
}

function renderTextbookGlossaryEmpty() {
  return \`
    <div class="glossary-empty">
      <div>
        <div class="empty-kicker">No glossary terms</div>
        <h2 class="empty-title">This textbook does not have glossary terms yet</h2>
        <p class="empty-copy">Glossary terms are collected from chapter glossary blocks when they exist.</p>
      </div>
    </div>
  \`;
}

function renderGlossaryBrowseView(entries, studyState) {
  return \`
    <div class="glossary-toolbar">
      <div class="glossary-page-actions" data-glossary-page-actions>
        \${renderGlossaryStudyLauncher(studyState, entries.length)}
      </div>
      <input class="glossary-search" type="search" placeholder="Search glossary" aria-label="Search glossary terms" data-glossary-search />
    </div>
    <div class="glossary-results" data-glossary-results>
      \${renderTextbookGlossaryResults(entries, studyState)}
    </div>
  \`;
}

function renderTextbookGlossaryResults(entries, studyState) {
  if (entries.length === 0) {
    return \`
      <div class="empty-state">
        <div>
          <div class="empty-kicker">No matches</div>
          <h2 class="empty-title">No glossary terms match this search</h2>
          <p class="empty-copy">Search checks glossary terms only.</p>
        </div>
      </div>
    \`;
  }

  const groups = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last && last.chapterId === entry.chapterId) {
      last.entries.push(entry);
    } else {
      groups.push({ chapterId: entry.chapterId, chapterTitle: entry.chapterTitle, sourceHref: entry.sourceHref, entries: [entry] });
    }
  }

  return groups.map((group) => \`
    <section class="glossary-chapter-group">
      <div class="glossary-group-head">
        <h2 class="glossary-group-title">
          <a class="glossary-group-title-link" href="\${escapeAttr(group.sourceHref)}" data-glossary-source aria-label="Open source glossary for \${escapeAttr(group.chapterTitle)}">\${escapeHtml(group.chapterTitle)}</a>
        </h2>
      </div>
      <dl class="glossary-aggregate-list">
        \${group.entries.map((entry) => \`
          <div class="glossary-aggregate-entry" data-glossary-entry="\${escapeAttr(entry.id)}">
            <dt class="glossary-term">\${renderInlineMarkdown(entry.term)}</dt>
            <dd class="glossary-definition">
              \${renderInlineMarkdown(entry.definition)}
            </dd>
            \${renderGlossaryStarButton(entry, studyState)}
          </div>
        \`).join("")}
      </dl>
    </section>
  \`).join("");
}

function renderGlossaryStarButton(entry, studyState) {
  const starred = isGlossaryTermStarred(studyState, entry.id);
  return \`
    <button class="glossary-star \${starred ? "is-starred" : ""}" type="button" data-glossary-star="\${escapeAttr(entry.id)}" data-glossary-term="\${escapeAttr(entry.term)}" aria-pressed="\${starred ? "true" : "false"}" aria-label="\${starred ? "Unstar" : "Star"} \${escapeAttr(entry.term)}" title="\${starred ? "Unstar term" : "Star term"}">
      \${starred ? "★" : "☆"}
    </button>
  \`;
}

function renderGlossaryStudyPage(textbookId, entries, studyState) {
  return \`
    <div class="glossary-study-page" data-glossary-study-page>
      <div class="glossary-study-layout">
        <aside class="glossary-study-options desktop" data-glossary-study-options aria-label="Flashcard options">
          \${renderGlossaryStudyOptions(entries, studyState)}
        </aside>
        <details class="glossary-study-options mobile" data-glossary-study-options>
          <summary class="glossary-study-options-title">Options</summary>
          \${renderGlossaryStudyOptions(entries, studyState, { includeTitle: false })}
        </details>
        <div class="glossary-study-main" data-glossary-study-view>
          \${renderGlossaryStudySession(textbookId, entries, studyState)}
        </div>
      </div>
    </div>
  \`;
}

function renderGlossaryStudyOptions(entries, studyState, options = {}) {
  const session = ensureGlossaryStudySession(entries, studyState);
  normalizeGlossarySessionOptions(session);
  const starredCount = entries.filter((entry) => isGlossaryTermStarred(studyState, entry.id)).length;
  return \`
    <div class="glossary-study-options-groups">
      <div class="glossary-study-option-group">
        <div class="glossary-study-option-label">Study set</div>
        <div class="glossary-segmented-control" role="group" aria-label="Study set">
          <button class="glossary-segment \${session.studySet === "all" ? "is-selected" : ""}" type="button" data-glossary-deck-option="all" aria-pressed="\${session.studySet === "all" ? "true" : "false"}">All</button>
          <button class="glossary-segment \${session.studySet === "starred" ? "is-selected" : ""}" type="button" data-glossary-deck-option="starred" aria-pressed="\${session.studySet === "starred" ? "true" : "false"}" \${starredCount === 0 ? "disabled" : ""}>Starred</button>
        </div>
      </div>
      <div class="glossary-study-option-group">
        <div class="glossary-study-option-label">Prompt side</div>
        <div class="glossary-segmented-control \${session.showBoth ? "is-disabled" : ""}" role="group" aria-label="Prompt side" \${session.showBoth ? 'aria-disabled="true"' : ""}>
          <button class="glossary-segment \${session.promptMode === "term-first" ? "is-selected" : ""}" type="button" data-glossary-prompt-option="term-first" aria-pressed="\${session.promptMode === "term-first" ? "true" : "false"}" \${session.showBoth ? "disabled" : ""}>Term</button>
          <button class="glossary-segment \${session.promptMode === "definition-first" ? "is-selected" : ""}" type="button" data-glossary-prompt-option="definition-first" aria-pressed="\${session.promptMode === "definition-first" ? "true" : "false"}" \${session.showBoth ? "disabled" : ""}>Definition</button>
        </div>
      </div>
      <div class="glossary-study-option-group">
        <label class="glossary-toggle-row">
          <span class="glossary-toggle-label">Show both sides</span>
          <input class="glossary-toggle-input" type="checkbox" data-glossary-show-both \${session.showBoth ? "checked" : ""}>
        </label>
      </div>
      <div class="glossary-study-option-group">
        <label class="glossary-toggle-row">
          <span class="glossary-toggle-label">Track progress</span>
          <input class="glossary-toggle-input" type="checkbox" data-glossary-track-toggle \${session.trackingEnabled ? "checked" : ""}>
        </label>
      </div>
      <div class="glossary-study-option-group session-action">
        <button class="glossary-study-option restart" type="button" data-glossary-restart>Restart session</button>
      </div>
    </div>
  \`;
}

function renderGlossaryStudyProgressLabel(entries, studyState) {
  const progress = glossaryStudyProgressMetrics(entries, studyState);
  if (progress.total === 0) return "0 terms";
  return \`\${progress.current} of \${progress.total} terms\`;
}

function glossaryStudyProgressMetrics(entries, studyState) {
  const session = ensureGlossaryStudySession(entries, studyState);
  const progressCardIds = glossaryStudyProgressCardIds(entries, studyState);
  const total = progressCardIds.length;
  const currentCardId = session.index < session.cardIds.length ? session.cardIds[session.index] : null;
  const currentIndex = currentCardId ? progressCardIds.indexOf(currentCardId) : -1;
  const current = total === 0
    ? 0
    : session.completed
      ? total
      : currentIndex >= 0
        ? currentIndex + 1
        : Math.min(session.index + 1, total);
  return { current, total };
}

function glossaryStudyProgressCardIds(entries, studyState) {
  const session = ensureGlossaryStudySession(entries, studyState);
  if (session.studySet !== "starred" || session.label !== "starred terms") return session.cardIds;
  const currentCardId = session.index < session.cardIds.length ? session.cardIds[session.index] : null;
  const entryIds = new Set(entries.map((entry) => entry.id));
  const starredIds = new Set(entries
    .filter((entry) => isGlossaryTermStarred(studyState, entry.id))
    .map((entry) => entry.id));
  return session.cardIds.filter((termId) => entryIds.has(termId) && (starredIds.has(termId) || termId === currentCardId));
}

function renderGlossaryStudySession(textbookId, entries, studyState) {
  const session = ensureGlossaryStudySession(entries, studyState);
  normalizeGlossarySessionRatings(session);
  const cards = session.cardIds.map((termId) => entries.find((entry) => entry.id === termId)).filter(Boolean);
  if (cards.length === 0) {
    return \`
      <div class="glossary-study-stage">
        \${renderGlossaryStudyFinishSpacer()}
        <div class="glossary-study-finish">
          <div class="glossary-study-finish-body">
            <h2 class="empty-title">No terms in this study set</h2>
            <p class="empty-copy">Star terms in Browse mode to build a custom study set.</p>
            <div class="glossary-study-finish-actions">
              <button class="glossary-action" type="button" data-glossary-back>Browse terms</button>
            </div>
          </div>
        </div>
      </div>
    \`;
  }
  if (session.completed) {
    return renderGlossaryStudyFinish(textbookId, entries, studyState);
  }
  if (session.index >= cards.length) {
    session.index = Math.max(cards.length - 1, 0);
  }
  if (typeof session.trackingEnabled !== "boolean") {
    session.trackingEnabled = false;
  }
  normalizeGlossarySessionOptions(session);
  const entry = cards[session.index];
  const counts = glossarySessionRatingCounts(session);
  const currentRating = glossarySessionRatingFor(session, entry.id);
  const progressMetrics = glossaryStudyProgressMetrics(entries, studyState);
  const trackingEnabled = session.trackingEnabled === true;
  const ratedCount = counts.again + counts.known;
  const positionProgress = progressMetrics.total > 0 ? Math.round((Math.max(progressMetrics.current - 1, 0) / progressMetrics.total) * 100) : 0;
  const ratingProgress = progressMetrics.total > 0 ? Math.round((Math.min(ratedCount, progressMetrics.total) / progressMetrics.total) * 100) : 0;
  const progress = trackingEnabled ? Math.max(ratingProgress, positionProgress) : positionProgress;
  const isFirst = session.index === 0;
  const isLast = session.index >= cards.length - 1;
  return \`
    <div class="glossary-study-stage">
      <div class="glossary-study-status \${trackingEnabled ? "is-tracking" : "is-placeholder"}" \${trackingEnabled ? "" : 'aria-hidden="true"'}>
        <div class="glossary-study-controls">
          <div class="glossary-study-scoreboard">
            <div class="glossary-study-score again">
              <span class="glossary-study-score-value">\${trackingEnabled ? counts.again : 0}</span>
              <span>still learning</span>
            </div>
            <div class="glossary-study-score known">
              <span class="glossary-study-score-value">\${trackingEnabled ? counts.known : 0}</span>
              <span>known</span>
            </div>
          </div>
        </div>
        <div class="glossary-study-progress-bar" aria-hidden="true">
          <div class="glossary-study-progress-fill" style="--glossary-progress: \${progress}%"></div>
        </div>
      </div>
      <div class="glossary-card \${session.showBoth ? "is-showing-both" : ""}" data-glossary-card="\${escapeAttr(entry.id)}" data-glossary-card-toggle role="button" tabindex="0" aria-label="\${session.showBoth ? "Showing term and definition" : session.revealed ? "Hide definition" : "Reveal definition"}">
        \${renderGlossaryStarButton(entry, studyState)}
        <div class="glossary-card-body">
          \${renderGlossaryCardContent(entry, session)}
        </div>
      </div>
      <div class="glossary-card-controls">
        <div class="glossary-card-nav \${trackingEnabled ? "is-tracking" : "is-browsing"}" aria-label="\${trackingEnabled ? "Flashcard rating" : "Flashcard navigation"}">
          \${trackingEnabled
            ? \`<button class="glossary-rate-button again \${currentRating === "again" ? "is-selected" : ""}" type="button" data-glossary-rate="again" aria-pressed="\${currentRating === "again" ? "true" : "false"}" aria-label="still learning">
                <span class="glossary-rate-icon" aria-hidden="true">×</span>
              </button>\`
            : \`<button class="glossary-action glossary-nav-arrow previous" type="button" data-glossary-prev aria-label="Previous card" title="Previous card" \${isFirst ? "disabled" : ""}>←</button>\`}
          \${trackingEnabled
            ? \`<button class="glossary-rate-button known \${currentRating === "knew-it" ? "is-selected" : ""}" type="button" data-glossary-rate="knew-it" aria-pressed="\${currentRating === "knew-it" ? "true" : "false"}" aria-label="know">
                <span class="glossary-rate-icon" aria-hidden="true">✓</span>
              </button>\`
            : \`<button class="glossary-action glossary-nav-arrow next" type="button" data-glossary-next aria-label="\${isLast ? "Complete flashcards" : "Next card"}" title="\${isLast ? "Complete flashcards" : "Next card"}">→</button>\`}
        </div>
      </div>
    </div>
  \`;
}

function renderGlossaryCardContent(entry, session) {
  const term = \`<div class="glossary-card-term">\${renderInlineMarkdown(entry.term)}</div>\`;
  const definition = \`<div class="glossary-card-definition">\${renderInlineMarkdown(entry.definition)}</div>\`;
  if (session.showBoth) {
    return \`
      <div class="glossary-card-content glossary-card-both">
        \${term}
        \${definition}
      </div>
    \`;
  }
  const showingDefinition = session.promptMode === "term-first" ? session.revealed : !session.revealed;
  return \`
    <div class="glossary-card-content \${session.revealed ? "glossary-card-revealed" : "glossary-card-prompt"}">
      \${showingDefinition ? definition : term}
    </div>
  \`;
}

function renderGlossaryStudyFinish(textbookId, entries, studyState) {
  const session = studyState.session;
  normalizeGlossarySessionOptions(session);
  normalizeGlossarySessionRatings(session);
  const stillLearningIds = glossarySessionStillLearningIds(studyState);
  const counts = glossarySessionRatingCounts(session);
  if (session.trackingEnabled !== true) {
    return \`
      <div class="glossary-study-stage">
        \${renderGlossaryStudyFinishSpacer()}
        <div class="glossary-study-finish">
          <div class="glossary-study-finish-body">
            <h2 class="empty-title">\${session.cardIds.length} terms reviewed</h2>
            <div class="glossary-study-finish-actions">
              <button class="glossary-action" type="button" data-glossary-restart>Restart</button>
              <button class="glossary-action" type="button" data-glossary-back>Browse terms</button>
            </div>
          </div>
        </div>
      </div>
    \`;
  }
  return \`
    <div class="glossary-study-stage">
      \${renderGlossaryStudyFinishSpacer()}
      <div class="glossary-study-finish">
        <div class="glossary-study-finish-body">
          <h2 class="empty-title">\${session.cardIds.length} terms reviewed</h2>
          <div class="glossary-study-finish-stats">
            <span>\${counts.known} known</span>
            <span class="glossary-study-score-separator" aria-hidden="true">·</span>
            <span>\${counts.again} still learning</span>
          </div>
          <div class="glossary-study-finish-actions">
            \${stillLearningIds.length > 0 ? '<button class="glossary-action" type="button" data-glossary-review-again>Continue learning</button>' : ""}
            <button class="glossary-action" type="button" data-glossary-restart>Restart</button>
            <button class="glossary-action" type="button" data-glossary-back>Browse terms</button>
          </div>
        </div>
      </div>
    </div>
  \`;
}

function renderGlossaryStudyFinishSpacer() {
  return \`
    <div class="glossary-study-status is-finished" aria-hidden="true">
      <div class="glossary-study-controls">
        <div class="glossary-study-scoreboard">
          <div class="glossary-study-score again"><span class="glossary-study-score-value">0</span><span>still learning</span></div>
          <div class="glossary-study-score known"><span class="glossary-study-score-value">0</span><span>known</span></div>
        </div>
      </div>
      <div class="glossary-study-progress-bar">
        <div class="glossary-study-progress-fill" style="--glossary-progress: 0%"></div>
      </div>
    </div>
  \`;
}

function bindTextbookGlossaryControls(textbookId, entries) {
  bindGlossaryStudyLauncher(textbookId);
  bindGlossaryDynamicControls(textbookId, entries);
}

function bindGlossaryDynamicControls(textbookId, entries) {
  bindTextbookGlossarySearch(textbookId, entries);
  bindGlossaryStarControls(textbookId, entries);
  bindGlossarySourceLinks();
}

function bindTextbookGlossarySearch(textbookId, entries) {
  const input = document.querySelector("[data-glossary-search]");
  const results = document.querySelector("[data-glossary-results]");
  if (!input || !results) return;
  input.addEventListener("input", () => {
    const studyState = getGlossaryStudyState(textbookId);
    const query = normalizeGlossarySearch(input.value);
    const filtered = query
      ? entries.filter((entry) => entry.searchText.includes(query))
      : entries;
    results.innerHTML = renderTextbookGlossaryResults(filtered, studyState);
    bindGlossarySourceLinks();
    bindGlossaryStarControls(textbookId, entries);
  });
}

function bindGlossaryStudyLauncher(textbookId) {
  const toggle = document.querySelector("[data-glossary-study-menu-toggle]");
  const menu = document.querySelector("[data-glossary-study-menu]");
  if (toggle && menu) {
    const handleOutsideClick = () => closeMenu();
    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      document.removeEventListener("click", handleOutsideClick);
    };
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
        return;
      }
      toggle.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      document.addEventListener("click", handleOutsideClick);
    });
    menu.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }
  document.querySelectorAll("[data-glossary-study-launch]").forEach((button) => {
    button.addEventListener("click", () => {
      const studySet = button.dataset.glossaryStudyLaunch === "starred" ? "starred" : "all";
      navigateTextbookGlossaryStudy(textbookId, studySet);
    });
  });
}

function bindGlossaryStudyPageControls(textbookId, entries) {
  const card = document.querySelector("[data-glossary-card-toggle]");
  if (card) {
    card.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("[data-glossary-star]")) return;
      toggleCurrentGlossaryCardReveal(textbookId, entries);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleCurrentGlossaryCardReveal(textbookId, entries);
    });
  }
  document.querySelectorAll("[data-glossary-rate]").forEach((button) => {
    button.addEventListener("click", () => {
      const rating = button.dataset.glossaryRate === "again" ? "again" : "knew-it";
      markCurrentGlossaryCardRating(textbookId, entries, rating);
    });
  });
  document.querySelectorAll("[data-glossary-deck-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const studySet = button.dataset.glossaryDeckOption === "starred" ? "starred" : "all";
      const state = getGlossaryStudyState(textbookId);
      if (studySet === state.session?.studySet) return;
      startGlossaryStudySession(textbookId, entries, studySet, undefined, glossarySessionOptions(state.session));
    });
  });
  document.querySelectorAll("[data-glossary-prompt-option]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = getGlossaryStudyState(textbookId);
      if (!state.session) return;
      state.session.promptMode = button.dataset.glossaryPromptOption === "definition-first" ? "definition-first" : "term-first";
      renderGlossaryStudyPageContent(textbookId, entries);
    });
  });
  document.querySelectorAll("[data-glossary-show-both]").forEach((control) => {
    control.addEventListener("change", () => {
      const state = getGlossaryStudyState(textbookId);
      if (!state.session) return;
      state.session.showBoth = control instanceof HTMLInputElement
        ? control.checked
        : control.dataset.glossaryShowBoth === "true";
      state.session.revealed = false;
      renderGlossaryStudyPageContent(textbookId, entries);
    });
  });
  document.querySelectorAll("[data-glossary-track-toggle]").forEach((control) => {
    control.addEventListener("change", () => {
      const state = getGlossaryStudyState(textbookId);
      if (!state.session) return;
      state.session.trackingEnabled = control instanceof HTMLInputElement
        ? control.checked
        : control.dataset.glossaryTrackToggle === "track";
      renderGlossaryStudyPageContent(textbookId, entries);
    });
  });
  const previous = document.querySelector("[data-glossary-prev]");
  if (previous) {
    previous.addEventListener("click", () => {
      moveGlossaryStudyCard(textbookId, entries, -1);
    });
  }
  const next = document.querySelector("[data-glossary-next]");
  if (next) {
    next.addEventListener("click", () => {
      moveGlossaryStudyCard(textbookId, entries, 1);
    });
  }
  document.querySelectorAll("[data-glossary-restart]").forEach((restart) => {
    restart.addEventListener("click", () => {
      const state = getGlossaryStudyState(textbookId);
      const completedReview = state.session?.label === "again terms";
      const reviewFinishedClean = completedReview
        && state.session?.trackingEnabled === true
        && glossarySessionStillLearningIds(state).length === 0;
      const forcedTermIds = completedReview && !reviewFinishedClean ? state.session.cardIds : undefined;
      const studySet = reviewFinishedClean ? "all" : state.studySet === "starred" ? "starred" : "all";
      startGlossaryStudySession(textbookId, entries, studySet, forcedTermIds, glossarySessionOptions(state.session));
    });
  });
  const reviewAgain = document.querySelector("[data-glossary-review-again]");
  if (reviewAgain) {
    reviewAgain.addEventListener("click", () => {
      const state = getGlossaryStudyState(textbookId);
      const reviewIds = glossarySessionStillLearningIds(state);
      startGlossaryStudySession(textbookId, entries, "all", reviewIds, { ...glossarySessionOptions(state.session), trackingEnabled: true });
    });
  }
  document.querySelectorAll("[data-glossary-back]").forEach((button) => {
    if (button.dataset.glossaryBackBound === "true") return;
    button.dataset.glossaryBackBound = "true";
    button.addEventListener("click", () => navigateTextbookGlossary(textbookId));
  });
  bindGlossaryStarControls(textbookId, entries);
}

function toggleCurrentGlossaryCardReveal(textbookId, entries) {
  const state = getGlossaryStudyState(textbookId);
  if (!state.session) return;
  normalizeGlossarySessionOptions(state.session);
  if (state.session.showBoth) return;
  state.session.revealed = !state.session.revealed;
  renderGlossaryStudyPageContent(textbookId, entries);
}

function bindGlossaryStarControls(textbookId, entries) {
  document.querySelectorAll("[data-glossary-star]").forEach((button) => {
    button.addEventListener("click", () => {
      const termId = button.dataset.glossaryStar;
      if (!termId) return;
      toggleGlossaryStar(textbookId, termId, entries);
    });
  });
}

function renderGlossaryInteractiveView(textbookId, entries) {
  const container = document.querySelector("[data-glossary-view]");
  if (!container) return;
  const state = getGlossaryStudyState(textbookId);
  container.innerHTML = renderGlossaryBrowseView(entries, state);
  bindGlossaryDynamicControls(textbookId, entries);
  updateGlossaryStudyLauncher(textbookId, entries);
}

function renderGlossaryStudyPageContent(textbookId, entries) {
  const state = getGlossaryStudyState(textbookId);
  reconcileGlossaryStarredSession(entries, state);
  const container = document.querySelector("[data-glossary-study-view]");
  if (container) {
    container.innerHTML = renderGlossaryStudySession(textbookId, entries, state);
  }
  const progress = document.querySelector("[data-glossary-study-top-progress]");
  if (progress) {
    progress.textContent = renderGlossaryStudyProgressLabel(entries, state);
  }
  document.querySelectorAll("[data-glossary-study-options]").forEach((container) => {
    const includeTitle = !container.classList.contains("mobile");
    if (container instanceof HTMLDetailsElement) {
      const wasOpen = container.open;
      container.innerHTML = \`<summary class="glossary-study-options-title">Options</summary>\${renderGlossaryStudyOptions(entries, state, { includeTitle: false })}\`;
      container.open = wasOpen;
    } else {
      container.innerHTML = renderGlossaryStudyOptions(entries, state, { includeTitle });
    }
  });
  bindGlossaryStudyPageControls(textbookId, entries);
}

function updateGlossaryStudyLauncher(textbookId, entries = []) {
  const container = document.querySelector("[data-glossary-page-actions]");
  if (!container) return;
  container.innerHTML = renderGlossaryStudyLauncher(getGlossaryStudyState(textbookId), entries.length);
  bindGlossaryStudyLauncher(textbookId);
}

async function loadGlossaryStudyState(textbookId) {
  if (glossaryStudyStates.has(textbookId)) return glossaryStudyStates.get(textbookId);
  const state = emptyGlossaryStudyState(textbookId);
  glossaryStudyStates.set(textbookId, state);
  try {
    const persisted = await fetchJson(\`/api/glossary-study/state?textbookId=\${encodeURIComponent(textbookId)}\`);
    state.starredTermIds = Array.isArray(persisted.starredTermIds) ? persisted.starredTermIds : [];
    state.ratings = persisted.ratings ?? {};
    state.studySet = persisted.lastStudySet === "starred" ? "starred" : "all";
    state.lastStudySet = state.studySet;
    state.currentCardIndex = Number.isInteger(persisted.currentCardIndex) ? persisted.currentCardIndex : 0;
  } catch {
    // Study persistence is a convenience; the glossary remains usable without it.
  }
  return state;
}

function getGlossaryStudyState(textbookId) {
  if (!glossaryStudyStates.has(textbookId)) {
    glossaryStudyStates.set(textbookId, emptyGlossaryStudyState(textbookId));
  }
  return glossaryStudyStates.get(textbookId);
}

function emptyGlossaryStudyState(textbookId) {
  return {
    textbookId,
    studySet: "all",
    lastStudySet: "all",
    starredTermIds: [],
    ratings: {},
    currentCardIndex: 0,
    session: null
  };
}

function ensureGlossaryStudySession(entries, state) {
  if (!state.session) {
    state.session = newGlossaryStudySession(entries, state, state.studySet === "starred" ? "starred" : "all");
  }
  normalizeGlossarySessionOptions(state.session);
  return state.session;
}

function normalizeGlossarySessionOptions(session) {
  if (!session) return;
  if (session.promptMode !== "definition-first") {
    session.promptMode = "term-first";
  }
  session.showBoth = session.showBoth === true;
  session.trackingEnabled = session.trackingEnabled === true;
}

function glossarySessionOptions(session) {
  normalizeGlossarySessionOptions(session);
  return {
    trackingEnabled: session?.trackingEnabled === true,
    promptMode: session?.promptMode === "definition-first" ? "definition-first" : "term-first",
    showBoth: session?.showBoth === true
  };
}

function reconcileGlossaryStarredSession(entries, state) {
  const session = state.session;
  if (!session || session.studySet !== "starred" || session.label !== "starred terms") return;
  const currentCardId = session.index < session.cardIds.length ? session.cardIds[session.index] : null;
  const entryIds = new Set(entries.map((entry) => entry.id));
  const starredIds = entries
    .filter((entry) => isGlossaryTermStarred(state, entry.id))
    .map((entry) => entry.id);
  const starredIdsSet = new Set(starredIds);
  const priorCards = session.cardIds.slice(0, session.index)
    .filter((termId) => starredIdsSet.has(termId));
  const activeCards = new Set(priorCards);
  const nextCardIds = [...priorCards];
  let nextIndex = nextCardIds.length;
  if (currentCardId && entryIds.has(currentCardId)) {
    nextIndex = nextCardIds.length;
    nextCardIds.push(currentCardId);
    activeCards.add(currentCardId);
  }
  const existingFuture = session.cardIds.slice(session.index + 1)
    .filter((termId) => starredIdsSet.has(termId) && !activeCards.has(termId));
  existingFuture.forEach((termId) => activeCards.add(termId));
  const newFuture = starredIds
    .filter((termId) => !activeCards.has(termId));
  session.cardIds = [...nextCardIds, ...existingFuture, ...shuffleGlossaryCards(newFuture)];
  session.index = session.cardIds.length === 0 ? 0 : Math.min(nextIndex, session.cardIds.length - 1);
  state.currentCardIndex = session.index;
  if (session.index > session.cardIds.length) {
    session.index = session.cardIds.length;
    state.currentCardIndex = session.index;
  }
}

function startGlossaryStudySession(textbookId, entries, studySet, forcedTermIds, options = {}) {
  const state = getGlossaryStudyState(textbookId);
  const currentOptions = glossarySessionOptions(state.session);
  const nextOptions = {
    ...currentOptions,
    ...options
  };
  const initialIndex = options.preserveCurrentIndex === true ? state.currentCardIndex : 0;
  state.studySet = studySet === "starred" ? "starred" : "all";
  state.lastStudySet = state.studySet;
  state.session = newGlossaryStudySession(entries, state, state.studySet, forcedTermIds, { ...nextOptions, initialIndex });
  state.currentCardIndex = state.session.index;
  void saveGlossaryStudyState(textbookId);
  if (options.render !== false) {
    renderGlossaryStudyPageContent(textbookId, entries);
  }
}

function newGlossaryStudySession(entries, state, studySet, forcedTermIds, options = {}) {
  const forced = Array.isArray(forcedTermIds) ? new Set(forcedTermIds) : null;
  const starred = new Set(state.starredTermIds);
  const cards = entries.filter((entry) => forced
    ? forced.has(entry.id)
    : studySet === "starred" ? starred.has(entry.id) : true);
  const initialIndex = Number.isInteger(options.initialIndex) && options.initialIndex > 0 ? options.initialIndex : 0;
  return {
    studySet,
    label: forced ? "again terms" : studySet === "starred" ? "starred terms" : "all terms",
    cardIds: shuffleGlossaryCards(cards.map((entry) => entry.id)),
    index: Math.max(0, Math.min(initialIndex, Math.max(cards.length - 1, 0))),
    revealed: false,
    completed: false,
    trackingEnabled: options.trackingEnabled === true,
    promptMode: options.promptMode === "definition-first" ? "definition-first" : "term-first",
    showBoth: options.showBoth === true,
    ratings: {}
  };
}

function shuffleGlossaryCards(cardIds) {
  const shuffled = [...cardIds];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

function moveGlossaryStudyCard(textbookId, entries, direction) {
  const state = getGlossaryStudyState(textbookId);
  const session = state.session;
  if (!session || session.index >= session.cardIds.length) return;
  if (direction > 0 && session.index >= session.cardIds.length - 1) {
    session.completed = true;
    session.revealed = false;
    state.currentCardIndex = session.index;
    void saveGlossaryStudyState(textbookId);
    renderGlossaryStudyPageContent(textbookId, entries);
    return;
  }
  const nextIndex = Math.max(0, Math.min(session.cardIds.length - 1, session.index + direction));
  if (nextIndex === session.index) return;
  session.index = nextIndex;
  session.revealed = false;
  session.completed = false;
  state.currentCardIndex = session.index;
  void saveGlossaryStudyState(textbookId);
  renderGlossaryStudyPageContent(textbookId, entries);
}

function markCurrentGlossaryCardRating(textbookId, entries, rating) {
  const state = getGlossaryStudyState(textbookId);
  const session = state.session;
  if (!session || session.index >= session.cardIds.length) return;
  const termId = session.cardIds[session.index];
  const ratings = normalizeGlossarySessionRatings(session);
  ratings[termId] = rating;
  updateLocalGlossaryRating(state, termId, rating);
  if (session.trackingEnabled === true) {
    if (session.index >= session.cardIds.length - 1) {
      session.completed = true;
    } else {
      session.index += 1;
      session.completed = false;
    }
    session.revealed = false;
    state.currentCardIndex = session.index;
  }
  void persistGlossaryRatingAndState(textbookId, termId, rating);
  renderGlossaryStudyPageContent(textbookId, entries);
}

async function persistGlossaryRatingAndState(textbookId, termId, rating) {
  await submitGlossaryStudyRating(textbookId, termId, rating);
  await saveGlossaryStudyState(textbookId);
}

function normalizeGlossarySessionRatings(session) {
  if (!session) return {};
  if (Array.isArray(session.ratings)) {
    session.ratings = session.ratings.reduce((ratings, item) => {
      if (item?.termId && (item.rating === "again" || item.rating === "knew-it")) {
        ratings[item.termId] = item.rating;
      }
      return ratings;
    }, {});
  }
  if (!isRecordObject(session.ratings)) {
    session.ratings = {};
  }
  return session.ratings;
}

function glossarySessionRatingFor(session, termId) {
  const ratings = normalizeGlossarySessionRatings(session);
  return ratings[termId] === "again" || ratings[termId] === "knew-it" ? ratings[termId] : null;
}

function glossarySessionRatingCounts(session) {
  const ratings = normalizeGlossarySessionRatings(session);
  const counts = { again: 0, known: 0, unrated: 0 };
  for (const termId of session.cardIds) {
    const rating = ratings[termId];
    if (rating === "again") {
      counts.again += 1;
    } else if (rating === "knew-it") {
      counts.known += 1;
    } else {
      counts.unrated += 1;
    }
  }
  return counts;
}

function updateLocalGlossaryRating(state, termId, rating) {
  const previous = state.ratings[termId] ?? { reviewCount: 0, againCount: 0, knewItCount: 0 };
  state.ratings[termId] = {
    rating,
    reviewedAt: new Date().toISOString(),
    reviewCount: previous.reviewCount + 1,
    againCount: previous.againCount + (rating === "again" ? 1 : 0),
    knewItCount: previous.knewItCount + (rating === "knew-it" ? 1 : 0)
  };
}

function glossarySessionStillLearningIds(state) {
  if (!state.session) return [];
  const ratings = normalizeGlossarySessionRatings(state.session);
  return state.session.cardIds.filter((termId) => ratings[termId] === "again");
}

function toggleGlossaryStar(textbookId, termId, entries) {
  const state = getGlossaryStudyState(textbookId);
  const starred = new Set(state.starredTermIds);
  if (starred.has(termId)) {
    starred.delete(termId);
  } else {
    starred.add(termId);
  }
  state.starredTermIds = [...starred];
  void saveGlossaryStudyState(textbookId);
  if (document.querySelector("[data-glossary-study-page]") && Array.isArray(entries)) {
    renderGlossaryStudyPageContent(textbookId, entries);
  } else if (Array.isArray(entries)) {
    renderGlossaryInteractiveView(textbookId, entries);
  } else {
    updateGlossaryStarButtons(textbookId);
  }
}

function updateGlossaryStarButtons(textbookId) {
  const state = getGlossaryStudyState(textbookId);
  document.querySelectorAll("[data-glossary-star]").forEach((button) => {
    const termId = button.dataset.glossaryStar;
    if (!termId) return;
    const starred = isGlossaryTermStarred(state, termId);
    button.classList.toggle("is-starred", starred);
    button.setAttribute("aria-pressed", starred ? "true" : "false");
    button.setAttribute("aria-label", (starred ? "Unstar" : "Star") + " " + (button.dataset.glossaryTerm ?? "term"));
    button.setAttribute("title", starred ? "Unstar term" : "Star term");
    button.textContent = starred ? "★" : "☆";
  });
}

async function saveGlossaryStudyState(textbookId) {
  const state = getGlossaryStudyState(textbookId);
  try {
    await fetchJson("/api/glossary-study/state", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId,
        starredTermIds: state.starredTermIds,
        lastStudySet: state.studySet,
        currentCardIndex: state.currentCardIndex
      })
    });
  } catch {
    // Study persistence is a convenience; local UI state remains usable.
  }
}

async function submitGlossaryStudyRating(textbookId, termId, rating) {
  try {
    await fetchJson("/api/glossary-study/rating", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ textbookId, termId, rating })
    });
  } catch {
    // The local session can continue even if the rating save fails.
  }
}

function isGlossaryTermStarred(studyState, termId) {
  return studyState.starredTermIds.includes(termId);
}

function bindGlossarySourceLinks() {
  document.querySelectorAll("[data-glossary-source]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      history.pushState({}, "", href);
      void renderRoute();
    });
  });
}

async function renderChapter(textbookId, chapterId) {
  const token = beginRouteLoad("Loading chapter...");
  const chapter = await fetchJson(\`/api/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  if (token !== routeToken) return;
  const glossaryStudyState = await loadGlossaryStudyState(textbookId);
  if (token !== routeToken) return;
  activeChapter = chapter;
  const renderContext = { textbookId, chapter, glossaryStudyState };
  document.querySelector("#main").innerHTML = \`
    <section>
      \${renderCrumbs([
        { label: document.title, action: "home" },
        { label: chapter.textbookTitle, action: "textbook", textbookId },
        { label: chapter.title }
      ])}
      <div class="page-head">
        <h1>\${escapeHtml(chapter.title)}</h1>
        <div class="meta">\${chapter.sectionCount} sections / \${chapter.subsectionCount} subsections</div>
      </div>
      <div class="chapter-layout">
        <aside class="chapter-index" aria-label="Chapter sections">
          <div class="index-label">Contents</div>
          <div class="index-list">
            \${chapter.sections.map((section) => \`
              <a class="index-link" href="#\${escapeAttr(anchorId(section.id))}">\${escapeHtml(section.title)}</a>
              \${section.subsections.map((subsection) => \`
                <a class="index-link subsection" href="#\${escapeAttr(anchorId(subsection.id))}">\${escapeHtml(subsection.title)}</a>
              \`).join("")}
            \`).join("")}
          </div>
        </aside>
        <div class="chapter-content">
          \${chapter.sections.map((section) => renderSection(section, renderContext)).join("")}
          \${renderChapterNavigation(chapter)}
        </div>
      </div>
    </section>
  \`;
  bindCrumbs();
  bindChapterIndex();
  bindChapterNavigation(textbookId);
  bindGlossaryOverviewLinks();
  bindGlossaryStarControls(textbookId);
  bindQuizzes(chapter);
  bindCodingProblems(chapter);
  scheduleTransformationLayouts();
  if (document.fonts?.ready) void document.fonts.ready.then(scheduleTransformationLayouts);
  finishRouteLoad(token);
  scrollToHashTarget(window.location.hash, "auto");
}

function renderChapterNavigation(chapter) {
  if (!chapter.previousChapter && !chapter.nextChapter) return "";
  return \`
    <nav class="chapter-navigation" aria-label="Chapter navigation">
      \${chapter.previousChapter ? \`
        <button class="chapter-navigation-button previous" data-chapter-navigation="\${escapeAttr(chapter.previousChapter.id)}">
          <span class="chapter-navigation-label">Previous chapter</span>
          <span class="chapter-navigation-title">\${escapeHtml(chapter.previousChapter.title)}</span>
        </button>
      \` : ""}
      \${chapter.nextChapter ? \`
        <button class="chapter-navigation-button next" data-chapter-navigation="\${escapeAttr(chapter.nextChapter.id)}">
          <span class="chapter-navigation-label">Next chapter</span>
          <span class="chapter-navigation-title">\${escapeHtml(chapter.nextChapter.title)}</span>
        </button>
      \` : ""}
    </nav>
  \`;
}

function bindChapterNavigation(textbookId) {
  document.querySelectorAll("[data-chapter-navigation]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateChapter(textbookId, button.dataset.chapterNavigation, true);
    });
  });
}

function bindChapterIndex() {
  document.querySelectorAll(".index-link[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const hash = link.getAttribute("href") ?? "";
      if (!hash || hash === "#") return;
      const id = parseHashId(hash);
      if (!id || !document.getElementById(id)) return;

      event.preventDefault();
      const nextUrl = window.location.pathname + window.location.search + hash;
      if (window.location.hash === hash) {
        history.replaceState(history.state, "", nextUrl);
      } else {
        history.pushState({}, "", nextUrl);
      }
      scrollToHashTarget(hash, "smooth");
    });
  });
}

function scrollToHashTarget(hash = window.location.hash, behavior = "auto") {
  const id = parseHashId(hash);
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ block: "start", behavior });
  return true;
}

function parseHashId(hash) {
  const value = String(hash ?? "");
  if (!value.startsWith("#") || value.length <= 1) return "";
  try {
    return decodeURIComponent(value.slice(1));
  } catch {
    return value.slice(1);
  }
}

function renderSection(section, context) {
  return \`
    <section class="chapter-section" id="\${escapeAttr(anchorId(section.id))}">
      <h2 class="section-title">\${escapeHtml(section.title)}</h2>
      \${section.description ? \`<div class="markdown"><p>\${escapeHtml(section.description)}</p></div>\` : ""}
      <div class="blocks">\${section.blocks.map((block) => renderBlock(block, context)).join("")}</div>
      \${section.subsections.map((subsection) => \`
        <section class="subsection-block" id="\${escapeAttr(anchorId(subsection.id))}">
          <h3 class="subsection-title">\${escapeHtml(subsection.title)}</h3>
          \${subsection.description ? \`<div class="markdown"><p>\${escapeHtml(subsection.description)}</p></div>\` : ""}
          <div class="blocks">\${subsection.blocks.map((block) => renderBlock(block, context)).join("")}</div>
        </section>
      \`).join("")}
    </section>
  \`;
}

async function renderRoute() {
  const route = parseRoute(window.location.pathname);
  try {
    if (route.kind === "chapter") {
      await renderChapter(route.textbookId, route.chapterId);
      return;
    }
    if (route.kind === "textbookGlossaryStudy") {
      await renderTextbookGlossaryStudy(route.textbookId);
      return;
    }
    if (route.kind === "textbookGlossary") {
      await renderTextbookGlossary(route.textbookId);
      return;
    }
    if (route.kind === "textbook") {
      await renderTextbook(route.textbookId);
      return;
    }
    if (route.kind === "notFound") {
      routeToken += 1;
      finishRouteLoad(routeToken);
      renderNotFoundPage({
        title: "Page not found",
        message: \`No route matches \${route.path}. Return to your textbook library to keep studying.\`
      });
      return;
    }
    routeToken += 1;
    finishRouteLoad(routeToken);
    renderHome();
  } catch (error) {
    finishRouteLoad();
    if (isNotFoundError(error)) {
      renderNotFoundPage(notFoundDetails(route));
      return;
    }
    renderRouteError(error);
  }
}

function parseRoute(pathname) {
  let parts;
  try {
    parts = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return { kind: "notFound", path: pathname };
  }
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "textbooks")) {
    return { kind: "home" };
  }
  if (parts.length === 4 && parts[0] === "textbooks" && parts[1] && parts[2] === "chapters" && parts[3]) {
    return { kind: "chapter", textbookId: parts[1], chapterId: parts[3] };
  }
  if (parts.length === 4 && parts[0] === "textbooks" && parts[1] && parts[2] === "glossary" && parts[3] === "study") {
    return { kind: "textbookGlossaryStudy", textbookId: parts[1] };
  }
  if (parts.length === 3 && parts[0] === "textbooks" && parts[1] && parts[2] === "glossary") {
    return { kind: "textbookGlossary", textbookId: parts[1] };
  }
  if (parts.length === 2 && parts[0] === "textbooks" && parts[1]) {
    return { kind: "textbook", textbookId: parts[1] };
  }
  return { kind: "notFound", path: pathname };
}

function navigateHome() {
  history.pushState({}, "", "/");
  void renderRoute();
}

function navigateTextbook(textbookId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}\`);
  void renderRoute();
}

function navigateTextbookGlossary(textbookId) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/glossary\`);
  void renderRoute();
}

function navigateTextbookGlossaryStudy(textbookId, studySet = "all") {
  const safeStudySet = studySet === "starred" ? "starred" : "all";
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/glossary/study?set=\${safeStudySet}\`);
  void renderRoute();
}

function bindGlossaryOverviewLinks() {
  document.querySelectorAll("[data-glossary-overview]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const textbookId = link.dataset.glossaryOverview;
      if (!textbookId) return;
      event.preventDefault();
      navigateTextbookGlossary(textbookId);
    });
  });
}

function navigateChapter(textbookId, chapterId, scrollToTop = false) {
  history.pushState({}, "", \`/textbooks/\${encodeURIComponent(textbookId)}/chapters/\${encodeURIComponent(chapterId)}\`);
  if (scrollToTop) window.scrollTo({ top: 0, behavior: "auto" });
  void renderRoute();
}

function renderBlock(block, context) {
  if (block.kind === "p" || block.kind === "explanation" || block.kind === "blurb") {
    const title = block.props.title ? \`<h4 class="local-heading">\${escapeHtml(block.props.title)}</h4>\` : "";
    return \`<article class="block">\${title}<div class="markdown">\${renderMarkdown(block.props.body)}</div></article>\`;
  }
  if (block.kind === "heading") {
    return \`<h\${block.props.level} class="local-heading level-\${block.props.level}">\${escapeHtml(block.props.text)}</h\${block.props.level}>\`;
  }
  if (block.kind === "list") {
    const tag = block.props.style === "number" ? "ol" : "ul";
    return \`<div class="block markdown"><\${tag}>\${block.props.items.map((item) => \`<li>\${renderInlineMarkdown(item)}</li>\`).join("")}</\${tag}></div>\`;
  }
  if (block.kind === "codeBlock") {
    const language = block.props.language ? \` data-language="\${escapeAttr(block.props.language)}"\` : "";
    return \`<pre class="code-block"\${language}><code>\${escapeHtml(block.props.code)}</code></pre>\`;
  }
  if (block.kind === "mathBlock") {
    return \`<div class="math-block">\${renderMath(block.props.body, true)}</div>\`;
  }
  if (block.kind === "callout") {
    const title = block.props.title ? block.props.title : block.props.tone.replace("-", " ");
    return \`<aside class="callout \${escapeAttr(block.props.tone)}"><div class="callout-title">\${escapeHtml(title)}</div><div class="markdown">\${renderMarkdown(block.props.body)}</div></aside>\`;
  }
  if (block.kind === "glossary") {
    return renderGlossary(block, context);
  }
  if (block.kind === "transformation") {
    return renderTransformation(block);
  }
  if (block.kind === "codingProblem") {
    return renderCodingProblem(block);
  }
  if (block.kind === "quiz") {
    return renderQuiz(block);
  }
  return \`<article class="block"><div class="markdown"><p>Unsupported block: \${escapeHtml(block.kind)}</p></div></article>\`;
}

function renderGlossary(block, context) {
  const title = block.props.title || "Glossary";
  const entries = Array.isArray(block.props.entries) ? block.props.entries : [];
  const textbookId = context?.textbookId;
  const titleMarkup = textbookId
    ? \`<a class="glossary-title-link" href="/textbooks/\${encodeURIComponent(textbookId)}/glossary" data-glossary-overview="\${escapeAttr(textbookId)}">\${escapeHtml(title)}</a>\`
    : escapeHtml(title);
  return \`
    <article class="block glossary" id="\${escapeAttr(blockAnchorId(block.id))}">
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
    <article class="block transformation layout-\${escapeAttr(block.props.layout)}" data-transformation="\${escapeAttr(block.id)}" data-transformation-layout="\${escapeAttr(block.props.layout)}">
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
  document.querySelectorAll('[data-transformation-layout="auto"]').forEach((element) => {
    element.classList.remove("auto-flow", "auto-hybrid");
    const inputOverflow = transformationStageOverflows(element, "input");
    const operationOverflow = transformationStageOverflows(element, "operation");
    const outputOverflow = transformationStageOverflows(element, "output");
    if (inputOverflow || outputOverflow) {
      element.classList.add("auto-flow");
    } else if (operationOverflow) {
      element.classList.add("auto-hybrid");
    }
  });
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

function renderQuiz(block) {
  return \`
    <article class="block quiz" data-quiz="\${escapeAttr(block.id)}">
      <div class="quiz-head">
        <h4 class="quiz-title">\${escapeHtml(block.props.title)}</h4>
        <div class="quiz-meta">\${escapeHtml(formatQuizMode(block.props.mode))} / \${block.props.questions.length} questions</div>
      </div>
      <form class="quiz-form">
        \${block.props.questions.map((question, index) => renderQuizQuestion(block, question, index)).join("")}
        <div class="quiz-footer">
          <div class="quiz-actions">
            <button class="quiz-check" type="button" data-quiz-check>Check answers</button>
            <button class="quiz-reset" type="button" data-quiz-reset>Try again</button>
          </div>
          <div class="quiz-score" data-quiz-score hidden></div>
        </div>
      </form>
    </article>
  \`;
}

function renderQuizQuestion(block, question, index) {
  if (isMatchingQuestion(question)) return renderMatchingQuestion(block, question, index);
  const title = renderQuizQuestionTitle(block, question, index);
  return \`
    <fieldset class="quiz-question" data-quiz-question="\${escapeAttr(question.id)}" data-quiz-kind="choice" data-quiz-answer="\${escapeAttr(question.answer)}">
      <div class="quiz-question-title">\${title}</div>
      <div class="quiz-choices">
        \${question.choices.map((choice) => \`
          <label class="quiz-choice" data-quiz-choice="\${escapeAttr(choice.id)}">
            <input type="radio" name="\${escapeAttr(block.id)}-\${escapeAttr(question.id)}" value="\${escapeAttr(choice.id)}" />
            <span>\${renderInlineMarkdown(choice.body)}</span>
          </label>
        \`).join("")}
      </div>
      <div class="quiz-explanation markdown" data-quiz-explanation hidden>\${renderMarkdown(question.explanation)}</div>
    </fieldset>
  \`;
}

function renderMatchingQuestion(block, question, index) {
  const options = matchingOptions(block, question);
  const title = renderQuizQuestionTitle(block, question, index);
  return \`
    <fieldset class="quiz-question" data-quiz-question="\${escapeAttr(question.id)}" data-quiz-kind="matching">
      <div class="quiz-question-title">\${title}</div>
      <div class="quiz-matching">
        <div class="quiz-matching-head">
          <span>\${escapeHtml(question.leftLabel ?? "Prompt")}</span>
          <span>\${escapeHtml(question.rightLabel ?? "Match")}</span>
          <span aria-hidden="true"></span>
        </div>
        \${question.pairs.map((pair) => \`
          <div class="quiz-match-row" data-quiz-match-pair="\${escapeAttr(pair.id)}" data-quiz-match-answer="\${escapeAttr(pair.id)}">
            <div class="quiz-match-left">\${renderInlineMarkdown(pair.left)}</div>
            <select class="quiz-match-select" data-quiz-match-select aria-label="Choose match for \${escapeAttr(pair.left)}">
              <option value="">Choose...</option>
              \${options.map((option) => \`<option value="\${escapeAttr(option.id)}">\${escapeHtml(option.right)}</option>\`).join("")}
            </select>
            <span class="quiz-match-result" data-quiz-match-result></span>
          </div>
        \`).join("")}
      </div>
      <div class="quiz-explanation markdown" data-quiz-explanation hidden>\${renderMarkdown(question.explanation)}</div>
    </fieldset>
  \`;
}

function renderQuizQuestionTitle(block, question, index) {
  const prompt = renderInlineMarkdown(question.prompt);
  if (block.props.questions.length === 1) return prompt;
  return \`\${index + 1}. \${prompt}\`;
}

function matchingOptions(block, question) {
  return question.pairs
    .map((option) => ({ id: option.id, right: option.right }))
    .sort((left, right) => stableHash(\`\${block.id}:\${question.id}:\${left.id}\`) - stableHash(\`\${block.id}:\${question.id}:\${right.id}\`));
}

function isMatchingQuestion(question) {
  return question?.kind === "matching";
}

function formatQuizMode(mode) {
  return String(mode ?? "check").replace("-", " ");
}

function bindQuizzes(chapter) {
  quizStates.clear();
  collectChapterBlocks(chapter)
    .filter((block) => block.kind === "quiz")
    .forEach((block) => {
      const element = document.querySelector(\`[data-quiz="\${cssEscape(block.id)}"]\`);
      if (element) void hydrateQuiz(element, block, chapter);
    });
}

async function hydrateQuiz(element, block, chapter) {
  const state = { element, block, chapter, selectedAnswers: {}, submitted: false };
  quizStates.set(block.id, state);
  try {
    const persisted = await fetchJson(\`/api/quiz/state?\${quizQuery(chapter, block)}\`);
    state.selectedAnswers = persisted.selectedAnswers ?? {};
    state.submitted = persisted.submitted === true;
    restoreQuizState(state, persisted);
  } catch {
    // Quiz persistence is a convenience; the quiz remains usable without it.
  }
  element.querySelectorAll("input[type=radio]").forEach((input) => {
    input.addEventListener("change", () => {
      const questionId = input.closest("[data-quiz-question]")?.dataset.quizQuestion;
      if (!questionId) return;
      state.selectedAnswers[questionId] = input.value;
      void saveQuizSelections(state);
    });
  });
  bindMatchingBoards(element, state);
  const checkButton = element.querySelector("[data-quiz-check]");
  const resetButton = element.querySelector("[data-quiz-reset]");
  if (checkButton) {
    checkButton.addEventListener("click", () => checkQuizAnswers(state));
  }
  if (resetButton) {
    resetButton.addEventListener("click", () => resetQuiz(state));
  }
}

function bindMatchingBoards(element, state) {
  element.querySelectorAll('[data-quiz-kind="matching"]').forEach((questionElement) => {
    questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
      select.addEventListener("change", () => {
        if (state.submitted) return;
        const questionId = questionElement.dataset.quizQuestion;
        if (!questionId) return;
        normalizeMatchingSelections(questionElement);
        const selected = matchingSelection(questionElement);
        updateMatchingSelectOptions(questionElement);
        if (Object.keys(selected).length > 0) {
          state.selectedAnswers[questionId] = selected;
        } else {
          delete state.selectedAnswers[questionId];
        }
        void saveQuizSelections(state);
      });
    });
  });
}

async function checkQuizAnswers(state) {
  const { element, block, chapter } = state;
  let correct = 0;
  const responses = [];
  for (const question of block.props.questions) {
    const questionElement = element.querySelector(\`[data-quiz-question="\${cssEscape(question.id)}"]\`);
    if (!questionElement) continue;
    const isCorrect = isMatchingQuestion(question)
      ? checkMatchingQuestion(questionElement, question, state, responses)
      : checkChoiceQuestion(questionElement, question, state, responses);
    if (isCorrect) correct += 1;
  }

  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = \`\${correct} / \${block.props.questions.length} correct\`;
    score.hidden = false;
  }
  state.submitted = true;
  await fetchJson("/api/quiz/attempt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: chapter.textbookId,
      chapterId: chapter.id,
      quizId: block.id,
      selectedAnswers: state.selectedAnswers,
      responses,
      score: correct,
      total: block.props.questions.length
    })
  });
}

function checkChoiceQuestion(questionElement, question, state, responses) {
  const selected = questionElement.querySelector("input:checked")?.value;
  const isCorrect = selected === question.answer;
  if (selected) {
    state.selectedAnswers[question.id] = selected;
    responses.push({ questionId: question.id, selectedAnswer: selected, correct: isCorrect });
  }
  applyChoiceFeedback(questionElement, question, selected);
  return isCorrect;
}

function applyChoiceFeedback(questionElement, question, selected) {
  questionElement.querySelectorAll("[data-quiz-choice]").forEach((choiceElement) => {
    const choiceId = choiceElement.dataset.quizChoice;
    choiceElement.classList.toggle("correct", choiceId === question.answer);
    choiceElement.classList.toggle("incorrect", Boolean(selected) && choiceId === selected && selected !== question.answer);
  });
  questionElement.querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });
  const explanation = questionElement.querySelector("[data-quiz-explanation]");
  if (explanation) explanation.hidden = false;
}

function checkMatchingQuestion(questionElement, question, state, responses) {
  normalizeMatchingSelections(questionElement);
  updateMatchingSelectOptions(questionElement);
  const selected = matchingSelection(questionElement);
  const hasSelection = Object.keys(selected).length > 0;
  const isCorrect = matchingQuestionCorrect(question, selected);
  if (hasSelection) {
    state.selectedAnswers[question.id] = selected;
    responses.push({ questionId: question.id, selectedAnswer: selected, correct: isCorrect });
  } else {
    delete state.selectedAnswers[question.id];
  }
  applyMatchingFeedback(questionElement, question, selected);
  return isCorrect;
}

function matchingSelection(questionElement) {
  const selected = {};
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const value = row.querySelector("[data-quiz-match-select]")?.value;
    if (pairId && value) selected[pairId] = value;
  });
  return selected;
}

function normalizeMatchingSelections(questionElement) {
  const used = new Set();
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    const value = select.value;
    if (!value) return;
    if (used.has(value)) {
      select.value = "";
      return;
    }
    used.add(value);
  });
}

function updateMatchingSelectOptions(questionElement) {
  const selectedBySelect = new Map();
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    if (select.value) selectedBySelect.set(select, select.value);
  });
  const selectedValues = new Set(selectedBySelect.values());
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    const currentValue = selectedBySelect.get(select) ?? "";
    select.querySelectorAll("option").forEach((option) => {
      option.disabled = Boolean(option.value) && option.value !== currentValue && selectedValues.has(option.value);
    });
  });
}

function renderMatchingAssignments(questionElement, selectedAnswer) {
  const selected = isRecordObject(selectedAnswer) ? selectedAnswer : {};
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const select = row.querySelector("[data-quiz-match-select]");
    if (!pairId || !select) return;
    select.value = selected[pairId] ?? "";
    if (select.value !== (selected[pairId] ?? "")) {
      select.value = "";
    }
  });
  normalizeMatchingSelections(questionElement);
  updateMatchingSelectOptions(questionElement);
  return matchingSelection(questionElement);
}

function matchingQuestionCorrect(question, selected) {
  if (!isRecordObject(selected)) return false;
  return question.pairs.every((pair) => selected[pair.id] === pair.id);
}

function applyMatchingFeedback(questionElement, question, selectedAnswer) {
  const selected = renderMatchingAssignments(questionElement, selectedAnswer);
  questionElement.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    const pairId = row.dataset.quizMatchPair;
    const answer = row.dataset.quizMatchAnswer;
    const selectedRight = pairId ? selected[pairId] : undefined;
    const isCorrect = Boolean(selectedRight) && selectedRight === answer;
    row.classList.toggle("correct", isCorrect);
    row.classList.toggle("incorrect", !isCorrect);
    row.classList.remove("selected");
    const result = row.querySelector("[data-quiz-match-result]");
    if (result) {
      result.textContent = isCorrect ? "✓" : "!";
      result.setAttribute("aria-label", isCorrect ? "Correct" : "Incorrect");
    }
  });
  delete questionElement.dataset.quizActivePair;
  questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
    select.disabled = true;
  });
  const explanation = questionElement.querySelector("[data-quiz-explanation]");
  if (explanation) explanation.hidden = false;
}

function resetQuiz(state) {
  const { element } = state;
  state.selectedAnswers = {};
  state.submitted = false;
  element.querySelectorAll("input").forEach((input) => {
    input.checked = false;
    input.disabled = false;
  });
  element.querySelectorAll("[data-quiz-kind='matching']").forEach((questionElement) => {
    delete questionElement.dataset.quizActivePair;
    questionElement.querySelectorAll("[data-quiz-match-select]").forEach((select) => {
      select.disabled = false;
    });
    renderMatchingAssignments(questionElement, {});
  });
  element.querySelectorAll("[data-quiz-choice]").forEach((choiceElement) => {
    choiceElement.classList.remove("correct", "incorrect");
  });
  element.querySelectorAll("[data-quiz-match-pair]").forEach((row) => {
    row.classList.remove("correct", "incorrect", "selected");
  });
  element.querySelectorAll("[data-quiz-match-result]").forEach((result) => {
    result.textContent = "";
    result.removeAttribute("aria-label");
  });
  element.querySelectorAll("[data-quiz-explanation]").forEach((explanation) => {
    explanation.hidden = true;
  });
  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = "";
    score.hidden = true;
  }
  void saveQuizSelections(state);
}

function restoreQuizState(state, persisted) {
  for (const [questionId, answer] of Object.entries(state.selectedAnswers)) {
    if (typeof answer === "string") {
      const input = state.element.querySelector(\`[data-quiz-question="\${cssEscape(questionId)}"] input[value="\${cssEscape(answer)}"]\`);
      if (input) input.checked = true;
    } else if (isRecordObject(answer)) {
      const questionElement = state.element.querySelector(\`[data-quiz-question="\${cssEscape(questionId)}"][data-quiz-kind="matching"]\`);
      if (questionElement) {
        const normalized = renderMatchingAssignments(questionElement, answer);
        if (Object.keys(normalized).length > 0) {
          state.selectedAnswers[questionId] = normalized;
        } else {
          delete state.selectedAnswers[questionId];
        }
      }
    }
  }
  if (persisted.submitted) {
    void checkQuizAnswersLocally(state, persisted.score, persisted.total);
  }
}

function checkQuizAnswersLocally(state, persistedScore, persistedTotal) {
  const { element, block } = state;
  for (const question of block.props.questions) {
    const questionElement = element.querySelector(\`[data-quiz-question="\${cssEscape(question.id)}"]\`);
    if (!questionElement) continue;
    if (isMatchingQuestion(question)) {
      applyMatchingFeedback(questionElement, question, state.selectedAnswers[question.id]);
    } else {
      applyChoiceFeedback(questionElement, question, state.selectedAnswers[question.id]);
    }
  }
  const score = element.querySelector("[data-quiz-score]");
  if (score) {
    score.textContent = \`\${persistedScore ?? 0} / \${persistedTotal ?? block.props.questions.length} correct\`;
    score.hidden = false;
  }
}

async function saveQuizSelections(state) {
  await fetchJson("/api/quiz/state", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      textbookId: state.chapter.textbookId,
      chapterId: state.chapter.id,
      quizId: state.block.id,
      selectedAnswers: state.selectedAnswers
    })
  });
}

function quizQuery(chapter, block) {
  return new URLSearchParams({
    textbookId: chapter.textbookId,
    chapterId: chapter.id,
    quizId: block.id
  }).toString();
}

function renderCodingProblem(block) {
  const visibleFiles = block.props.files.filter((file) => !file.hidden);
  const visibleActions = block.props.actions.filter((action) => !action.hidden);
  return \`
    <article class="block coding-problem" data-coding-problem="\${escapeAttr(block.id)}">
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
  const source = normalizeLatex(value);
  if (window.katex && typeof window.katex.renderToString === "function") {
    return window.katex.renderToString(source, {
      displayMode,
      throwOnError: false,
      strict: "ignore"
    });
  }
  return escapeHtml(source);
}

function normalizeLatex(value) {
  const slash = String.fromCharCode(92);
  return String(value ?? "")
    .replaceAll(slash + slash, slash)
    .replaceAll(slash + "left", "")
    .replaceAll(slash + "right", "");
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
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
//# sourceMappingURL=app.js.map