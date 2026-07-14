export function learningBlocksCss() {
    return `
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
`;
}
//# sourceMappingURL=learning-blocks.js.map