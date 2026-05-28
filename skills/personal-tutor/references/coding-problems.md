# Coding Problems

Use `codingProblem(...)` when the learner should write and run code inside the Tutor UI.

## Authoring Pattern

Write real source files next to the chapter, then reference them from the block:

```ts
import { codingProblem, projectFiles } from "tutor-kit";

const project = projectFiles(import.meta.url, "./problems/normalize-vector");

codingProblem({
  id: "normalize-vector",
  title: "Normalize A Vector",
  prompt: "Implement `normalize(xs)` so the returned values sum to 1.",
  language: "python",
  files: [
    project.file("main.py", { editable: true }),
    project.file("tests.py")
  ],
  setup: "uv --version",
  run: "$PYTHON main.py",
  test: "$PYTHON tests.py",
  review: "Check correctness, edge cases, and clarity."
});
```

Recommended layout:

```txt
chapters/
  foundations.chapter.ts
  problems/
    normalize-vector/
      main.py
      tests.py
```

## Rules

- Prefer real `.py` files over large inline strings.
- Keep `codingProblem(...)` as the manifest: prompt, files, commands, review focus.
- Mark learner-editable files with `{ editable: true }`.
- Keep tests visible by default. Hidden files/actions are hidden from the UI, not secret from local source.
- Use `language` as a runtime/editor hint, not as a restriction. Commands are the source of truth.
- Use `setup` for dependency checks or environment preparation. It runs before each action in the same temporary project directory.
- Use `$PYTHON`, `$NODE`, `$TSX`, or custom runtime env vars in commands when helpful.
- For Python packages, prefer hermetic commands such as `uv run --with mlx python tests.py` over assuming global installs.
- Configure runtime commands in `tutor.config.ts`:

```ts
const config = {
  codeRunner: {
    runtimes: {
      python: { command: "python3" }
    }
  }
};
```

Run `tutor compile` after adding or moving problem files.

## Review Feedback

The UI saves learner edits to:

```txt
tutor-data/drafts/<textbook>/<chapter>/<problem>.json
```

The review task should be path-based, not a pasted transcript. Tell the reviewing agent:

- the review goal
- the absolute learner draft path
- the absolute source/test file paths
- the absolute feedback output path

```txt
tutor-data/feedback/<textbook>/<chapter>/<problem>.md
```

Tutor UI always shows a feedback area in the problem block. When the feedback file exists, its Markdown is rendered there.
