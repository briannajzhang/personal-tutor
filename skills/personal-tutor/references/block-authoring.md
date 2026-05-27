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
- Prefer several semantic blocks over one giant Markdown string.
- Keep block IDs stable and unique within their section or subsection.

`explanation` and `blurb` are legacy aliases. Do not use them in new material.

## Teaching Sequence

Blocks are semantic teaching moves, not layout decoration. For durable material, prefer this sequence unless the topic suggests a better one:

1. `p`: state the learner-facing problem or confusion.
2. `p`: define the concept and explain the mechanism.
3. `codeBlock` or `mathBlock`: show the mechanism in a small concrete form.
4. `callout`: name the misconception, warning, or key idea.
5. `list`: give recall checks, comparison points, or operating rules.

Avoid thin prose blocks that only label a term. A good `p` should move the learner from "I have seen this" toward "I can recognize when this matters."

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
