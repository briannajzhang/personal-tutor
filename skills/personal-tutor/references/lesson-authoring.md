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
import { blurb, chapter, section, subsection } from "tutor-kit";

export default chapter({
  id: "foundations",
  title: "Chapter 1: MLX Foundations",
  sections: [
    section({
      id: "arrays",
      title: "1.1 Arrays",
      widgets: [
        blurb({
          id: "array-intro",
          title: "Array Basics",
          body: "MLX arrays are NumPy-like and support inline $LaTeX$."
        })
      ],
      subsections: [
        subsection({
          id: "lazy-evaluation",
          title: "1.1.1 Lazy Evaluation",
          widgets: [
            blurb({
              id: "lazy-intro",
              title: "Evaluation Timing",
              body: "Use `mx.eval(...)` when you need computed values."
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
- Keep widget IDs unique within their section or subsection.
- Before adding content, inspect existing textbooks and chapters.
- Prefer several small blurbs over one large blurb.
- Run `tutor compile` after every content edit.
