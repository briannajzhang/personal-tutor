# Coding Problems

A coding problem should teach or assess a specific skill. Do not use `codingProblem(...)` only because the subject involves code.

A good coding problem gives the learner:

- a concrete task
- starter code or files when useful
- visible tests or expected behavior
- at least one realistic edge case or failure mode
- a review focus that matches the chapter goal

The problem should connect to the surrounding lesson. The prose before the problem should prepare the learner for the task, and the review or mastery check after the problem should help the learner interpret what they practiced.

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

## Problem Design

Design coding problems around learner actions, not topic labels.

Weak:

> Practice using arrays.

Better:

> Implement `dedupeUsers(users)` so it returns one user per `id`, preserving the first occurrence. Add behavior for empty input and repeated IDs.

Weak:

> Build a caching example.

Better:

> Implement `getProduct(productId)` so it checks an in-memory cache before calling `fetchProductFromApi(productId)`. The tests should show that two calls for the same product only call the API once.

A coding problem should usually specify:

- the function, class, command, or behavior to implement
- the important inputs
- the expected output or observable behavior
- at least one edge case
- what the learner should learn from passing the tests

For debugging or refactoring problems, specify:

- what is currently wrong
- what behavior should be preserved
- what behavior should change
- how tests reveal the problem

## Prompt Completeness

The learner should not need to read the tests to discover core requirements.

Tests may reveal edge cases, but the problem prompt, docstring, or starter comments should state the main behavior needed to solve the task.

A coding problem is under-specified if:
- tests require behavior not mentioned in the prompt
- starter comments omit an important filter, ordering rule, or return shape
- the learner must infer the main task from assertion names
- the review focus mentions requirements that the prompt never stated

Weak:

> Return active products costing at least $50.

If tests also require `created_at >= '2026-02-01'`, that requirement must be in the prompt.

Better:

> Return active products with `price_cents >= 5000` and `created_at >= '2026-02-01'`, ordered by `created_at DESC`.

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

The review goal should be specific to the chapter's target skill.

Weak:

> Review the learner's solution.

Better:

> Check whether the learner used the cache before calling the API, handled missing products, and can explain why the second call should not refetch the same product.

```txt
tutor-data/feedback/<textbook>/<chapter>/<problem>.md
```

Tutor UI always shows a feedback area in the problem block. When the feedback file exists, its Markdown is rendered there.

## Practice Quality

Do not replace runnable practice with vague instructions when the learner should implement, debug, refactor, or test code.

Insufficient:

- "Try writing a function that uses joins."
- "Practice debugging this kind of issue."
- "Build a small app using caching."
- "Experiment with the code."

Better:

- provide starter files
- provide a specific function or behavior to implement
- provide tests or expected outputs
- include at least one edge case
- make the task connect to the chapter's central mechanism or misconception

The problem should not be a disconnected mini-project. It should reinforce the chapter's learner outcome.
