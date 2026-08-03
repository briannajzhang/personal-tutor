# Authoring quickstart

Use this reference for the common Tutor Kit authoring path. Read the complete API reference only for uncommon blocks, runtime configuration, or troubleshooting.

## Contents

- Commands
- Source layout
- Textbook and chapter
- Full expressive surface

## Commands

The skill wrapper uses one central learner library at `~/.personal-tutor`. If `PERSONAL_TUTOR_HOME` is set, it uses that location. Every textbook created through the wrapper appears in the same list and study app. Pass `--cwd <path>` only for a separate workspace.

```bash
node <skill-dir>/scripts/tutor-kit.mjs brief
node <skill-dir>/scripts/tutor-kit.mjs progress --textbook <id>
node <skill-dir>/scripts/tutor-kit.mjs begin <id> <title>
node <skill-dir>/scripts/tutor-kit.mjs --cwd ~/.personal-tutor/tutor-work/<id> add chapter <id> <chapter-id> <title>
node <skill-dir>/scripts/tutor-kit.mjs publish <id>
node <skill-dir>/scripts/tutor-kit.mjs dev
```

`brief` reports textbooks, chapters, useful authoring files, and a small learner activity summary. `begin` initializes a missing central library and creates or resumes an isolated work area. Edit only that work area. `publish` verifies the work, installs it, and loads it from the published location before reporting success. A failed publish restores the previous textbook and keeps the work area for repair. `dev` reports textbook load issues before it starts. It stops when no textbook can load and allows a mixed library to start with warnings.

## Source layout

```txt
~/.personal-tutor/
  textbooks/<textbook-id>/
    textbook.ts
    course.md
    compile-result.md
    chapters/<chapter-id>.chapter.ts
    chapters/problems/<problem-id>/
    assets/
  tutor-work/<textbook-id>/
    textbooks/<textbook-id>/
  tutor-archive/<textbook-id>/<timestamp>/
  tutor-data/
    reading-progress/<textbook-id>.json
```

Tutor Kit writes `compile-result.md` during publish. Runtime learner data belongs under `tutor-data/` and is not replaced or archived with textbook source.

## Textbook and chapter

```ts
import { textbook } from "tutor-kit";
import foundations from "./chapters/foundations.chapter.js";

export default textbook({
  id: "subject",
  title: "Subject",
  chapters: [foundations]
});
```

```ts
import { chapter, codeBlock, list, p, quiz, section } from "tutor-kit";

export default chapter({
  id: "foundations",
  title: "Foundations",
  role: "instruction",
  sections: [
    section({
      id: "core-idea",
      title: "Core idea",
      role: "instruction",
      blocks: [
        p({ id: "goal", body: "After this lesson, you can ..." }),
        p({ id: "mechanism", body: "Define and explain the central mechanism here." }),
        p({ id: "inspect", body: "Inspect what changes between the input and output." }),
        codeBlock({ id: "example", language: "text", code: "input\noperation\noutput" }),
        p({ id: "readout", body: "Explain why the output follows." })
      ]
    }),
    section({
      id: "practice",
      title: "Practice",
      role: "practice",
      blocks: [
        list({ id: "tasks", items: ["Apply the idea to this concrete new case: ..."] })
      ]
    }),
    section({
      id: "review",
      title: "Review",
      role: "review",
      blocks: [
        quiz({
          id: "review-quiz",
          title: "Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "transfer",
              prompt: "Ask for a decision in a new case.",
              choices: [
                { id: "a", body: "Best answer for the stated conditions" },
                { id: "b", body: "Plausible but incorrect answer" },
                { id: "c", body: "Another plausible but incorrect answer" },
                { id: "d", body: "Another plausible but incorrect answer" }
              ],
              answer: "a",
              explanation: "Explain the mechanism behind the answer.",
              tags: ["central-concept"]
            }
          ]
        })
      ]
    })
  ]
});
```

Stable lowercase kebab case IDs preserve learner state. Keep chapter IDs unique within a textbook, section IDs unique within a chapter, and block IDs unique within their section.

The example shows common syntax, not a required chapter shape. Use it as a seed rather than a ceiling. Add richer examples, guided exploration, alternate representations, projects, visuals, simulations, or other blocks when they improve the lesson. Remove any example block that does not fit. No block is required.

## Full expressive surface

Tutor Kit also provides `heading`, `mathBlock`, `diagram`, `chart`, `image`, `component`, `callout`, `transformation`, `glossary`, `quiz`, `codingProblem`, `subsection`, and `projectFiles`.

Custom blocks are authored as `component(...)`. Use one when a purpose-built interaction or animation materially improves the teaching move. See `lesson-authoring.md` for pedagogical fit and `tutor-kit-api.md` for syntax, technical constraints, and shared component theme tokens. Put browser source in the textbook workspace, reference it with `componentModule(import.meta.url, path)`, export a definition made with `defineComponent(...)` from `tutor-kit/client`, and run `tutor compile` after adding the component or any frontend package. The compact workflow does not restrict the authoring API or lesson shape.
