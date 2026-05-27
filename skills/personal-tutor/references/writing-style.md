# Writing Style Reference

Use this when authoring Tutor Kit prose blocks.

## Reference

John Ousterhout's *A Philosophy of Software Design*, second-edition extract:
https://web.stanford.edu/~ouster/cgi-bin/aposd2ndEdExtract.pdf

The PDF is scanned, so do not assume ordinary text extraction will work. Do not copy the extract into learner workspaces. Use it as a style model.

Short excerpt for calibration: "Complexity is anything related to the structure of a software system".

## What To Borrow

- Lead with the problem the learner has felt, not with terminology.
- Define the central term plainly before adding nuance.
- Use short sections with purposeful headings.
- Prefer concrete mechanisms over motivational filler.
- Explain why the idea matters in practice.
- Contrast the right model with a tempting wrong model.
- Keep examples small enough that the concept remains visible.
- End with a crisp operational test: what should the learner now be able to notice, predict, or do?

## Tutor Kit Voice

Prose blocks should feel like careful textbook paragraphs guided by a human tutor. They can be longer than UI microcopy, but should stay focused enough to combine with headings, lists, code blocks, math blocks, and callouts.

1. Name the learner-facing problem.
2. Introduce the concept in plain language.
3. Walk through a concrete example or mechanism.
4. Call out a misconception or boundary case.
5. Finish with a recall target or practical check.

Avoid vague encouragement, marketing language, and abstract summaries that do not change what the learner can do next.

## Quality Bar

Durable material should teach, not summarize. Do not write a subsection that merely says "X is Y, and it has properties A, B, and C." A strong subsection gives the learner a way to recognize the idea in code, predict what will happen, and avoid a realistic mistake.

Good material usually includes:

- a felt problem the learner has likely encountered
- a plain definition tied to that problem
- the mechanism that makes the idea work
- a small concrete example, preferably executable when the topic involves code
- a boundary, misconception, or timing trap
- a short self-check the learner can use without the tutor present

If the prose sounds polished but does not change what the learner can notice, predict, or do, rewrite it.

## Recommended Block Shape

Use semantic blocks as teaching moves:

1. `p`: begin with the learner's confusion or practical failure mode.
2. `p`: define the concept and explain the mechanism.
3. `codeBlock` or `mathBlock`: make the mechanism concrete.
4. `callout`: isolate the misconception, warning, or key idea.
5. `list`: end with recall checks, comparison points, or operational rules.

Example shape:

```ts
p({
  id: "lazy-evaluation-problem",
  body: "The confusing moment with MLX often appears during timing. A line such as `c = a + b` looks like the computation has already happened, but MLX may only have built a pending operation."
});

codeBlock({
  id: "force-evaluation",
  language: "python",
  code: "c = a + b\nmx.eval(c)"
});

callout({
  id: "benchmarking-boundary",
  tone: "caution",
  title: "Timing boundary",
  body: "Time the evaluation boundary, not only expression construction, when you want to measure real computation."
});

list({
  id: "lazy-evaluation-checks",
  items: [
    "Can you point to the line where work is requested?",
    "Can you name what would make the value concrete?",
    "Can you predict why a benchmark might look too fast?"
  ]
});
```

## Final Pass

Before finalizing a chapter or subsection, check:

- Does the opening paragraph start from a real learner confusion?
- Are terms attached to code, notation, or action?
- Is there at least one concrete example or mechanism?
- Does every callout protect the learner from a mistake?
- Could the learner test themselves after reading?
