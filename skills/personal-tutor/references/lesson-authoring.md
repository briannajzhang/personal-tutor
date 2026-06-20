# Lesson Authoring

Use this reference when writing learner-facing Tutor Kit chapters, sections, examples, and prose blocks.

## Contents

- Learning contract
- Chapter structure
- Teaching prose
- Worked examples
- Semantic blocks
- Transformation blocks
- Quizzes in lessons
- Titles and descriptions
- Anti-patterns

## Learning Contract

Every durable lesson should help the learner do something, not only read about something.

Non-trivial chapters should include:

- a learner-facing goal or problem
- plain definitions before important terms are used
- explanation of the central mechanism
- at least one worked example with inspectable input and result
- local concept checks near major ideas, examples, traps, or boundary cases
- guided practice
- independent practice
- retrieval or self-test prompts
- a final review or mastery check
- at least one realistic misconception, trap, or boundary case

A chapter is incomplete if the learner is never asked to use, test, predict, compare, classify, explain, debug, or create with the idea.

## Chapter Structure

Use sections and subsections as teaching structure, not decoration.

- Treat a chapter as non-trivial unless it is intentionally tiny.
- For non-trivial chapters, use at least 2 sections.
- Substantial chapters should usually include at least 1 subsection.
- Separate concept introduction, worked example, practice, and review when the learner benefits from the structure.
- Instructional chapters should normally end with a dedicated final section whose role is `"review"`.

Use roles:

```ts
chapter({ role: "instruction", ... })
section({ role: "instruction", ... })
section({ role: "practice", ... })
section({ role: "review", ... })

chapter({ role: "cumulative-checkpoint", ... })
section({ role: "assessment", ... })
```

Roles describe teaching purpose. They do not require every chapter to use the same layout.

## Teaching Prose

Teach the idea itself, not just its importance.

For each substantial teaching unit, use these moves unless the topic calls for a different order:

1. Problem: what confusion, task, or failure motivates the idea?
2. Definition: what does the key term mean in plain language?
3. Mechanism: how does it work, or why is it true?
4. Example: what concrete case makes the idea visible?
5. Boundary: what mistake, misconception, or edge case should the learner watch for?
6. Check: what should the learner now predict, explain, compare, debug, or apply?

Do not lean on a technical term before defining it.

Weak:

```txt
Indexes improve performance.
```

Better:

```txt
An index is a separate lookup structure. It can help a database find matching rows without scanning every row, but it adds maintenance work when data changes.
```

Avoid sentences whose only job is to sound insightful. If a sentence says something is important, subtle, powerful, or confusing, revise it so it names the concrete reason.

## Worked Examples

A worked example should make the mechanism visible.

Usually include:

- input, context, or starting state
- operation, reasoning step, or action
- visible result, output, or conclusion
- explanation of why that result follows

For examples involving data, code, math, diagrams, revisions, evidence, or other artifacts, show the artifacts. Do not only describe the result in prose.

Before an example, tell the learner what to inspect. After an example, explain what happened and why it matters.

## Semantic Blocks

Use semantic blocks as teaching moves:

- `p`: introduce, define, explain, or connect ideas.
- `heading`: add local structure inside a larger section.
- `list`: give concrete tasks, comparisons, retrieval prompts, or scan-friendly points.
- `codeBlock`: show exact code, queries, commands, schemas, or structured examples.
- `mathBlock`: show displayed equations or formal notation.
- `callout`: protect the learner from a misconception, warning, boundary, or key idea.
- `transformation`: model an inspectable input-to-result relationship.
- `quiz` and `balancedQuiz`: create local checks, review, and cumulative assessment.
- `codingProblem`: create runnable or checkable practice.

Prefer several semantic blocks over one giant Markdown string.

Before a `codeBlock`, `mathBlock`, table, diagram, formal notation, or example, tell the learner what to inspect. After it, explain what it showed.

`explanation` and `blurb` are legacy aliases. Do not use them in new material.

## Transformation Blocks

Use `transformation(...)` when all 4 conditions are true:

1. There is a concrete starting artifact, context, or state.
2. There is a specific operation, rule, reasoning move, or action.
3. There is a visible result, output, conclusion, or changed artifact.
4. The learner benefits from inspecting the relationship.

Example:

```ts
transformation({
  id: "left-join-preservation",
  title: "Inspect: How LEFT JOIN Preserves Rows",
  focus: "Track what happens to the customer without a matching order.",
  inputLabel: "Starting tables",
  operationLabel: "Query",
  outputLabel: "Result",
  input: [
    {
      label: "customers",
      format: "table",
      columns: ["customer_id", "name"],
      rows: [["1", "Ada"], ["2", "Lin"]]
    },
    {
      label: "orders",
      format: "table",
      columns: ["customer_id", "total"],
      rows: [["1", "40"]]
    }
  ],
  operation: {
    format: "code",
    language: "sql",
    body: "SELECT customers.customer_id, customers.name, orders.total\nFROM customers\nLEFT JOIN orders ON customers.customer_id = orders.customer_id;"
  },
  output: [
    {
      format: "table",
      columns: ["customer_id", "name", "total"],
      rows: [["1", "Ada", "40"], ["2", "Lin", "NULL"]]
    }
  ],
  explanation: "Lin has no matching order, but LEFT JOIN preserves every customer row and fills the missing order value with NULL."
});
```

Do not use transformations for definitions, summaries, broad overviews, or ordinary practice prompts. A transformation is a modeled example, not learner practice.

Surrounding content should add a distinct teaching move: problem framing, readout, generalization, boundary case, check, or practice.

## Quizzes In Lessons

Use quizzes for fast conceptual diagnosis, retrieval, misconception checks, prediction, classification, chapter review, and cumulative mixed review.

Use multiple choice when the learner must make one decision, choose the best explanation, diagnose one scenario, or reason through one misconception.

Use matching when the learner should connect several terms, examples, cases, or patterns to concise one-to-one distinctions.

Use:

- `mode: "check"` for local comprehension near a new idea or example. Use 1-3 questions.
- `mode: "review"` for chapter mastery in the final review section. Use 4-10 questions.
- `mode: "practice-test"` only in dedicated cumulative checkpoint chapters. Use at least 10 questions.

Quiz explanations should teach the mechanism. Do not merely restate the answer.

For matching questions, write the explanation as a correction frame for the whole set: name the distinction that separates the pairs and give the learner a quick test they can apply when retrying. Do not rely on per-pair explanations.

Choices should include plausible distractors based on realistic mistakes. Avoid joke answers, obviously impossible answers, and choices where more than one answer could reasonably be defended.

## Titles And Descriptions

Prefer learner-facing, concept-based titles.

Weak:

```txt
Week 2
Phase B
Practice Section
```

Better:

```txt
Filtering Rows With WHERE
Debugging Off-By-One Loops
Comparing Evidence And Claims
```

Use chapter descriptions consistently within a textbook: either every non-trivial chapter has a concise description or none do.

## Anti-Patterns

Avoid:

- exposition-only chapters
- one giant section with headings doing all structural work
- practice that appears only as a vague list at the end
- examples without visible input and result
- code, notation, or tables without surrounding interpretation
- quizzes used as decoration
- chapter review questions copied from local checks without new context
- identical chapter shapes reused regardless of topic complexity
- independent tasks that require untaught concepts
- programming chapters with code examples but no runnable practice when runnable practice would improve feedback
