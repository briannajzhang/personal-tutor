# Block Authoring

Use semantic blocks inside section and subsection `blocks` arrays. They are intentionally HTML-like, but typed and opinionated so the UI stays consistent.

## Core Blocks

```ts
p({
  id: "derivative-intuition",
  body: "A derivative measures how fast one quantity changes as another quantity changes..."
});

heading({
  id: "common-trap-heading",
  text: "A common trap"
});

list({
  id: "derivative-checks",
  style: "bullet",
  items: [
    "Name the quantity that is changing.",
    "Name the quantity it is changing with respect to."
  ]
});

codeBlock({
  id: "gradient-example",
  language: "python",
  code: "mx.grad(loss_fn)(params)"
});

mathBlock({
  id: "derivative-notation",
  body: "\\\\frac{dy}{dx}"
});

callout({
  id: "key-idea",
  tone: "key-idea",
  title: "Key idea",
  body: "Ask what change is being compared before applying symbolic rules."
});

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
  test: "$PYTHON tests.py"
});
```

## Tones

`callout` supports:

- `note`
- `caution`
- `key-idea`

## Authoring Rules

- Use `p` for substantial teaching prose.
- Use `heading` only for local structure inside a section or subsection.
- Use `list` when the learner should compare, scan, or recall multiple items.
- Use `codeBlock` for exact code, never inline code longer than a phrase.
- Use `mathBlock` for displayed equations; use inline `$LaTeX$` inside prose for small notation.
- Use `callout` sparingly for misconceptions, warnings, or high-value takeaways.
- Use `codingProblem` for runnable practice. See `coding-problems.md`.
- For programming lessons, prefer `codingProblem` over prose-only exercise descriptions when the target skill requires writing, running, debugging, or refactoring code.
- Prefer several semantic blocks over one giant Markdown string.
- Keep block IDs stable and unique within their section or subsection.

`explanation` and `blurb` are legacy aliases. Do not use them in new material.

## Block Coherence

A block should not appear as a standalone fragment. It should connect to the block before it and prepare the block after it.

Before adding a block, know its teaching job:

- introduce a problem
- define a term
- explain a mechanism
- show a concrete example
- name a misconception or boundary
- ask the learner to predict, explain, debug, compare, apply, or create

Before a `codeBlock`, `mathBlock`, table, or example, tell the learner what to inspect.

After a `codeBlock`, `mathBlock`, table, or example, explain what it showed.

Weak:

1. `p`: joins combine tables
2. `codeBlock`: SQL join query
3. `callout`: joins can duplicate rows
4. `list`: questions

Better:

1. `p`: a join creates row pairs using a match condition
2. `p`: tell the learner to inspect the `ON` line
3. `codeBlock`: SQL join query
4. `p`: walk through why one customer with three orders appears three times
5. `callout`: repeated rows can be correct in one-to-many joins
6. `list`: prediction and debugging checks

## Teaching Sequence

Blocks are semantic teaching moves, not layout decoration. For durable material, prefer a learning loop rather than an explanation-only stack. The sequence does not need to be rigid, but each block should make the next block easier to understand or use:

1. `p`: state the learner-facing problem or confusion.
2. `p`: define the concept and explain the mechanism.
3. `codeBlock` or `mathBlock`: show the mechanism in a small concrete form.
4. `callout`: name the misconception, warning, or key idea.
5. `list` or another concrete task block: give guided practice, retrieval, comparison, or prediction tasks.
6. `codingProblem` or another subject-appropriate independent-practice move when the learner should perform the skill with less support.

For programming lessons, a common pattern is:

1. `p`: name the coding task or bug pattern.
2. `codeBlock`: show a small worked example.
3. `callout`: isolate the trap.
4. `list`: give short guided tasks or predictions.
5. `codingProblem`: require runnable independent practice.

Avoid isolated blocks that are individually valid but weak together. A technically correct `codeBlock`, `callout`, and `list` can still produce a poor lesson if the learner is not told why each block appears or how they connect.

## Extension Pattern

New blocks should follow the built-in shape:

```txt
tutor/blocks/<kind>.tsx
packages/tutor-kit/src/blocks/<kind>/
```

Each block needs:

- a typed builder or schema
- a renderer
- a registry entry
- compile-time validation
- event names if the block records learner activity
