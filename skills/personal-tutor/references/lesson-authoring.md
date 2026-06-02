# Textbook Authoring

Textbooks are TypeScript modules named `textbooks/<textbook-id>/textbook.ts`.
Chapters are usually separate modules in `textbooks/<textbook-id>/chapters/*.chapter.ts`.

## Textbook Example

```ts
import { textbook } from "tutor-kit";
import foundations from "./chapters/foundations.chapter.js";

export default textbook({
  id: "mlx",
  title: "MLX",
  description: "Learning Apple's MLX framework.",
  chapters: [foundations]
});
```

## Chapter Example

```ts
import { callout, chapter, codeBlock, heading, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "foundations",
  title: "Chapter 1: MLX Foundations",
  sections: [
    section({
      id: "arrays",
      title: "1.1 Arrays",
      blocks: [
        p({
          id: "array-problem",
          body: "The first useful question in MLX is not \"what is an array?\" but \"when does my numerical work actually happen?\" MLX code often looks NumPy-like, but the framework is designed around deferred computation, so a line that creates an expression may not immediately run the underlying operation."
        }),
        p({
          id: "array-mechanism",
          body: "An MLX array is the value that moves through this system. You build arrays, combine them with vectorized operations, and then cross an evaluation boundary when you need a concrete result. That boundary matters for debugging, benchmarking, and understanding memory use."
        }),
        heading({
          id: "array-boundaries-heading",
          text: "Evaluation boundaries"
        }),
        list({
          id: "array-boundaries",
          items: [
            "Use `mx.eval(...)` when you need computed values.",
            "Force evaluation before timing or logging.",
            "Treat printing, NumPy conversion, and scalar `.item()` as concrete-value boundaries."
          ]
        })
      ],
      subsections: [
        subsection({
          id: "lazy-evaluation",
          title: "1.1.1 Lazy Evaluation",
          blocks: [
            p({
              id: "lazy-definition",
              body: "Lazy evaluation means MLX can record work before performing it. This lets the system schedule and combine operations efficiently, but it also means your mental model must distinguish between constructing a computation and forcing its result."
            }),
            codeBlock({
              id: "lazy-example",
              language: "python",
              code: "c = a + b\\nmx.eval(c)"
            }),
            callout({
              id: "timing-warning",
              tone: "caution",
              title: "Benchmarking trap",
              body: "If you time only expression construction, you may not time the actual computation."
            }),
            list({
              id: "lazy-checks",
              items: [
                "Can you identify which line constructs the computation?",
                "Can you identify which line asks MLX to produce the value?",
                "Can you explain why a benchmark may look too fast if it omits evaluation?"
              ]
            })
          ]
        })
      ]
    })
  ]
});
```

## Rules

- Use stable lowercase kebab-case IDs.
- Keep textbook IDs unique across the workspace.
- Keep chapter IDs unique within a textbook.
- Keep section IDs unique within a chapter.
- Keep subsection IDs unique within a section.
- Keep block IDs unique within their section or subsection.
- Before adding content, inspect existing textbooks and chapters.
- Prefer semantic blocks over giant Markdown strings.
- Run `tutor compile` after every content edit.

## Chapter Structure

Use sections and subsections to reflect the teaching plan, not just the schema.

- Treat a chapter as non-trivial unless it is intentionally tiny.
- For non-trivial chapters, use at least 2 sections.
- Most non-trivial chapters should also include at least 1 subsection, while intentionally small chapters may use none.
- Do not collapse concept introduction, worked example, practice, and recap into one flat section unless the lesson is intentionally very small.
- If every chapter in a textbook ends up with the same exact shape, stop and ask whether the structure matches the content or just your template.

### When To Start A New Section

Create a new section when the learner is changing tasks in a meaningful way, for example:

- moving from concept introduction to worked example
- moving from one major subtopic to another
- moving from explanation to practice
- moving from one kind of practice to cumulative review

Sections should feel like major teaching moves, not just visual wrappers.

### When To Add A Subsection

Add a subsection when a section needs one narrower unit inside it, for example:

- a misconception or boundary case that deserves focused treatment
- a worked example that should not be buried in a larger section
- a practice cluster around one specific skill
- a comparison between two closely related ideas

Subsections are useful when the learner benefits from one more level of structure, not when they merely rename the same content.

## Recommended Shapes

### Small Chapter

Use this only when the topic is intentionally narrow.

- 2 sections
- 0-1 subsections

Example:

- Section 1: core idea and small example
- Section 2: focused practice and recap

### Standard Chapter

This should be the default shape for most beginner lessons.

- 2-3 sections
- 1-3 subsections total

Example:

- Section 1: learner problem and concept introduction
- Section 2: worked example
  Add a subsection for the misconception, edge case, or a second example
- Section 3: practice and self-check

### Larger Chapter

Use this when the learner must connect several related ideas.

- 3-4 sections
- multiple subsections where they clarify distinct skills or traps

Example:

- Section 1: central concept
- Section 2: mechanism and example
- Section 3: second related concept or comparison
- Section 4: cumulative practice and recap

## Anti-Patterns

Avoid these common weak structures:

- one giant section with headings doing all the real structural work
- zero subsections across an entire textbook
- every chapter repeating the exact same flat template without regard to the topic
- practice appearing only as one list at the very end of a long explanation section
- worked examples embedded as one small block inside a section that is really doing three jobs at once

If the structure looks clean but does not help the learner navigate the lesson, rewrite it.
