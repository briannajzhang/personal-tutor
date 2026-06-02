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

## Required Prose Moves

When authoring durable written material, keep these requirements visible:

- Start each substantial teaching unit from a real learner confusion, practical question, or failure mode instead of opening with abstract terminology.
- Define the central term in plain language before adding nuance, edge cases, or formalism.
- Explain the mechanism that makes the idea work, not just the label or a polished summary.
- Include at least one realistic mistake, misconception, or boundary case for each substantial section or subsection.
- End each substantial teaching unit with a concrete self-check, recall target, or application task when the material is meant to stand alone.

These are not optional style flourishes. They are the minimum moves that keep the prose teaching instead of merely sounding polished.

## Avoid Template Prose

A textbook can satisfy the block schema and still feel flat if every chapter uses the same rhetorical rhythm. Do not mechanically repeat the same sequence of problem, definition, example, and self-check with only the nouns swapped.

Vary the teaching shape when the idea calls for it:

- Some lessons should begin with a tempting wrong model and then correct it.
- Some lessons should begin with a tiny example and introduce the term afterward.
- Some lessons should compare two nearby ideas before defining either one formally.
- Some lessons should center a practical failure mode and then explain the mechanism that prevents it.

Consistency is useful, but sameness is not. Reuse a pattern when it clarifies the material, not because it is the easiest template to continue.

## Bad vs Better

Weak:

Joins combine data from multiple tables. A primary key uniquely identifies a row. A foreign key refers to a primary key in another table. Joins are important in relational databases.

Better:

A join helps you answer questions that need data from more than one table. Suppose one table lists students and another lists enrollments. If you want to know which classes Maya is taking, SQL has to connect Maya's row to the matching enrollment rows. It usually makes that connection with IDs. The primary key is the ID that uniquely identifies a row, such as `students.student_id`. The foreign key stores that ID in another table, such as `enrollments.student_id`. If you match the wrong columns, the query may still run, but the answer will be wrong.

Use the better pattern as the default:

1. Name the learner's problem.
2. Define the term plainly.
3. Explain the mechanism.
4. Show the realistic mistake.
5. Leave the learner with an actionable check.

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
- Does the prose explain the mechanism, not just the terminology?
- Is there at least one concrete example or mechanism?
- Does every callout protect the learner from a mistake?
- Is there a realistic mistake or misconception the learner is now less likely to make?
- Does this section sound distinct from the last one, or does it feel like the same template reused?
- Could the learner test themselves after reading?
- After reading, could the learner notice, predict, explain, or do something they could not do before?
