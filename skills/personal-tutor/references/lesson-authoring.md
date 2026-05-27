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
