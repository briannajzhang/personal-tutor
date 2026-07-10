# Tutor Kit API

Use this reference when setting up a Tutor Kit workspace, invoking the CLI, authoring TypeScript modules, choosing semantic block builders, or starting the local UI.

## Contents

- Command invocation
- Core commands
- Workspace layout
- Textbook and chapter modules
- Semantic block builders
- Coding problem files
- UI server
- Troubleshooting

## Command Invocation

Use the skill wrapper by default:

```bash
node <skill-dir>/scripts/tutor-kit.mjs <command>
```

The wrapper delegates to the bundled Tutor Kit CLI at `assets/tutor-kit/dist/cli/index.js`, which keeps the SDK, CLI, and UI aligned with the installed skill.

Use a workspace command only when the user explicitly wants a separately installed Tutor Kit CLI:

```bash
tutor <command>
```

During local Tutor Kit development in this source repo, this is also valid:

```bash
npm run tutor -- <command>
```

Use `--cwd <path>` when the learner workspace is not the shell cwd.

## Core Commands

```bash
tutor init
tutor init --starter
tutor add textbook <id> [title]
tutor add chapter <textbook-id> <id> [title]
tutor add block <p|heading|list|codeBlock|mathBlock|diagram|chart|image|callout|transformation|glossary|quiz|codingProblem>
tutor list textbooks
tutor inspect textbook <id>
tutor compile
tutor compile --textbook <textbook-id>
tutor doctor
tutor doctor --textbook <textbook-id>
tutor verify coding-problems
tutor verify coding-problems --textbook <textbook-id>
tutor dev
```

Use `tutor init` only when Tutor Kit files are missing. It creates an empty workspace by default. Use `--starter` only for demos, tests, or fixtures.

## Workspace Layout

```txt
package.json
tutor.config.ts
textbooks/
  <textbook-id>/
    textbook.ts
    prompt.md
    curriculum-map.md
    chapter-specs.md
    materials-index.md
    source-notes.md
    review-notes.md
    compile-result.md
    chapters/
      <chapter-id>.chapter.ts
      problems/
tutor/
  registry.ts
  blocks/
tutor-data/
  events.jsonl
  drafts/
  feedback/
```

Authored curriculum lives in `textbooks/<textbook-id>/textbook.ts` and chapter modules. Optional source artifacts such as `materials-index.md` and `source-notes.md` preserve source context for future generation. Runtime learner activity lives under `tutor-data/`.

## Textbook And Chapter Modules

Textbooks are TypeScript modules:

```ts
import { textbook } from "tutor-kit";
import foundations from "./chapters/foundations.chapter.js";

export default textbook({
  id: "sql-foundations",
  title: "SQL Foundations",
  description: "Beginner-friendly SQL querying practice.",
  chapters: [foundations]
});
```

Chapters are usually separate modules:

```ts
import { chapter, p, section } from "tutor-kit";

export default chapter({
  id: "filtering-rows",
  title: "Chapter 1: Filtering Rows",
  description: "Use WHERE clauses to keep only rows that match a condition.",
  role: "instruction",
  sections: [
    section({
      id: "why-filter",
      title: "Filtering Answers One Question",
      role: "instruction",
      blocks: [
        p({
          id: "filtering-problem",
          body: "A table usually contains more rows than the question needs. A `WHERE` clause states the condition a row must satisfy before it appears in the result."
        })
      ]
    })
  ]
});
```

Use stable lowercase kebab-case IDs. Keep textbook IDs unique across the workspace, chapter IDs unique within a textbook, section IDs unique within a chapter, and block IDs unique within their section or subsection.

Generated instructional chapters should normally set `role: "instruction"` and end with a final section whose `role` is `"review"`. Dedicated cumulative practice-test chapters should set `role: "cumulative-checkpoint"` and end with an `"assessment"` section.

## Semantic Block Builders

Import builders from `tutor-kit`:

```ts
import {
  balancedQuiz,
  callout,
  chart,
  chapter,
  codeBlock,
  codingProblem,
  diagram,
  glossary,
  image,
  list,
  mathBlock,
  p,
  projectFiles,
  quiz,
  section,
  subsection,
  textbook,
  transformation
} from "tutor-kit";
```

Use blocks by teaching purpose:

- `p`: explanation, definition, transition, or example readout.
- `heading`: local structure inside a section or subsection.
- `list`: concrete tasks, comparisons, retrieval prompts, or scan-friendly points.
- `codeBlock`: exact code, query, command, schema, or structured example.
- `mathBlock`: displayed equation or notation.
- `diagram`: visual flow, relationship, hierarchy, state transition, or system structure.
- `chart`: small numeric comparison or trend.
- `image`: durable raster artifact such as a screenshot, source figure, generated illustration, photo, scanned figure, UI capture, or concrete visual example.
- `callout`: misconception, warning, boundary case, or key idea.
- `transformation`: inspectable input -> operation -> output worked example.
- `glossary`: optional compact reference for durable terms the learner has already met and will benefit from retrieving later.
- `quiz` or `balancedQuiz`: local checks, chapter review, and practice tests.
- `codingProblem`: runnable or checkable learner practice.

Prefer `balancedQuiz(...)` for generated 4-choice multiple-choice quizzes unless answer order is meaningful. Use `quiz(...)` for matching questions or preserved answer structure.

Quiz questions should set `kind: "multiple-choice"` when they use `choices` and `answer`, or `kind: "matching"` when they use one-to-one `pairs`. Matching pairs contain `id`, `left`, `right`, and optional `explanation`; matching questions can set `leftLabel` and `rightLabel` when the defaults are too generic.

`callout` tones are `note`, `caution`, and `key-idea`.

`transformation` artifact formats are `markdown`, `code`, `math`, and `table`. Use `layout: "auto"` unless `flow` or `compare` is clearly better.

Use `diagram(...)` when a relationship, flow, branching decision, ownership handoff, or structure is clearer visually:

```ts
diagram({
  id: "request-flow",
  title: "Browser To Server Handoff",
  body: "sequenceDiagram\n  Browser->>Server: GET /api/textbooks\n  Server-->>Browser: JSON textbook list\n  Browser->>Browser: Render chapter links"
});
```

Choose Mermaid syntax that matches the teaching purpose, such as `sequenceDiagram` for ordered handoffs or `flowchart` subgraphs for trust or ownership zones.

Use `chart(...)` for simple single-series numeric comparisons or trends. Chart titles and labels should define the metric, unit, and comparison set clearly enough that the learner does not have to guess what the numbers mean. Qualitative tradeoffs usually belong in prose, a list, a table, or `transformation(...)`.

```ts
chart({
  id: "checkout-outcomes-one-hour",
  title: "Checkout Attempt Outcomes, Last Hour",
  type: "bar",
  xLabel: "Outcome",
  yLabel: "Percent of checkout attempts",
  points: [
    { label: "Success", value: 91 },
    { label: "Payment error", value: 4 },
    { label: "Inventory error", value: 3 },
    { label: "Unknown error", value: 2 }
  ]
});
```

`glossary` entries contain `term` and `definition`; `title` defaults to `Glossary`.

Glossary terms and definitions support inline Markdown, including backticked code.

```ts
glossary({
  id: "join-terms",
  title: "Join Terms",
  entries: [
    { term: "LEFT JOIN", definition: "Keeps every left row and fills missing right-side values with NULL." }
  ]
});
```

Use `image(...)` for durable raster artifacts that ground the learner in visual appearance, context, evidence, examples, source figures, screenshots, generated illustrations, or concrete real-world referents. Images may supplement prose, diagrams, transformations, or practice; they should be educational, alt-described, captioned when useful, and tied to the surrounding explanation. The block records the durable asset, not how it was acquired; surrounding blocks should teach how to inspect the image when the important features are not self-explanatory. Project-bound images should live under `textbooks/<textbook-id>/assets/` and be referenced with `src: "assets/..."`.

```ts
image({
  id: "loss-surface",
  src: "assets/loss-surface.png",
  alt: "A bowl-shaped loss surface with arrows stepping downhill.",
  caption: "Gradient descent follows local downhill steps.",
  credit: "Source or credit when known"
});
```

Agents may use generated images, source-derived figures, screenshots, user-provided materials, or online images while authoring. Save the chosen image locally before referencing it. For online images, record source or credit when known; for user-provided PDFs, slides, or notes, preserve, extract, screenshot, or recreate useful visual artifacts when they improve grounding, context, evidence, or learner recognition.

## Coding Problem Files

Use `projectFiles(import.meta.url, "./problems/<problem-id>")` to load real source files next to the chapter:

```ts
import { codingProblem, projectFiles } from "tutor-kit";

const project = projectFiles(import.meta.url, "./problems/normalize-vector");

codingProblem({
  id: "normalize-vector",
  title: "Normalize A Vector",
  prompt: "Implement `normalize(xs)` so it returns numbers that sum to 1. Handle an empty list by returning an empty list.",
  language: "python",
  files: [
    project.file("main.py", { editable: true }),
    project.file("solution.py", { hidden: true }),
    project.file("tests.py")
  ],
  test: "$PYTHON tests.py",
  verification: {
    actionId: "test",
    referenceFiles: { "main.py": "solution.py" }
  },
  review: "Check normalization behavior, edge cases, and whether the learner can explain the sum-to-1 invariant."
});
```

Recommended layout:

```txt
chapters/
  vectors.chapter.ts
  problems/
    normalize-vector/
      main.py
      solution.py
      tests.py
```

Configure runtime commands in `tutor.config.ts` when needed:

```ts
const config = {
  codeRunner: {
    runtimes: {
      python: { command: "python3" }
    }
  }
};
```

Use `$PYTHON`, `$NODE`, `$TSX`, or custom runtime env vars in commands when helpful.

## UI Server

After verified authoring work, start the local UI for the user unless they explicitly ask not to:

```bash
tutor dev
```

Keep the server running and report the localhost URL, normally `http://localhost:4177`. If that port is busy, use `tutor dev --port <port>` with another available port.

The UI reads textbooks, renders semantic blocks, runs coding-problem actions in temporary local project directories, persists quiz state under `tutor-data/quiz-state/`, and appends learner activity to `tutor-data/events.jsonl`.

Do not edit `events.jsonl` to fake progress.

## Troubleshooting

If unrelated existing material blocks full compile, use a targeted compile while repairing the selected textbook:

```bash
tutor compile --textbook <textbook-id>
```

A targeted compile proves the selected textbook is usable in isolation. Only a full `tutor doctor` or full `tutor compile` proves the whole workspace is healthy.

If the bundled CLI reports missing packages after an installed skill copy, repair the bundled Tutor Kit asset:

```bash
cd <skill-dir>/assets/tutor-kit && npm ci --omit=dev --ignore-scripts --no-audit --fund=false
```
