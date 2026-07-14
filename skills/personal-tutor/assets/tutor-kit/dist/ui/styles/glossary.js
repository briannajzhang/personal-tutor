export function glossaryCss() {
    return `
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
`;
}
//# sourceMappingURL=glossary.js.map