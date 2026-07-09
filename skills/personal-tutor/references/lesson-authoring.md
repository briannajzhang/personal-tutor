# Lesson Authoring

Use this reference when writing learner-facing Tutor Kit chapters, sections, examples, and prose blocks.

## Contents

- Learning contract
- Chapter structure
- Teaching prose
- Worked examples
- Semantic blocks
- Choosing visual blocks
- Glossaries
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
- `diagram`: show a flow, relationship, hierarchy, state transition, or system structure.
- `chart`: show a small numeric comparison or trend.
- `callout`: protect the learner from a misconception, warning, boundary, or key idea.
- `transformation`: model an inspectable input-to-result relationship.
- `glossary`: give compact retrieval support for important terms already introduced in prose.
- `quiz` and `balancedQuiz`: create local checks, review, and cumulative assessment.
- `codingProblem`: create runnable or checkable practice.

Prefer several semantic blocks over one giant Markdown string.

Before a `codeBlock`, `mathBlock`, table, diagram, formal notation, or example, tell the learner what to inspect. After it, explain what it showed.

`explanation` and `blurb` are legacy aliases. Do not use them in new material.

## Choosing Visual Blocks

Use visual blocks when the learner benefits from seeing the relationship directly, not because a chapter needs decoration.

Use `diagram(...)` when the learner needs to trace parts, relationships, ownership, sequence, boundaries, branching, loops, or state changes. Good diagrams make arrow meanings and node labels concrete.

For diagrams, match the visual shape to the teaching claim. Boundaries should look like zones, flows should label payloads or actions, sequences should preserve order, and state changes should show transitions. A diagram should answer one inspection question: what connects, moves, changes, branches, or owns the work?

Use `chart(...)` when the learner needs to compare numeric magnitude, direction, trend, threshold, or outlier. Good charts use a defined metric or scale.

For charts, make one numeric inspection question visible: what magnitude, direction, trend, threshold, or outlier should the learner compare? Axis labels should name the category or time dimension and the measured unit or denominator, such as `Outcome` and `Percent of checkout attempts`. Avoid vague labels like `Signal`, `Score`, or `Value` unless the surrounding text defines the metric or scale. Avoid mixing different units or denominators in one chart.

Prefer prose, lists, code, math, `transformation(...)`, or a table when the teaching move is qualitative, definitional, or a concrete input-to-output model.

Avoid visuals with vague node names, unlabeled arrows that mix meanings, decorative flowcharts, or scores that imply precision without a defined scale. Split or replace diagrams that mix unrelated meanings, such as buyer/user roles, data movement, and product output in one unclear picture. Frame what to inspect before the visual and explain the takeaway afterward.

## Glossaries

Use `glossary(...)` only when later retrieval or distinction-making is genuinely useful to the learner. A glossary is optional; it is not a chapter-completion marker, a summary block, or the natural destination for every term defined in prose.

First decide whether the learner will need to recall, distinguish, or reuse a meaningful cluster of terms after the current explanation is over. If not, define the terms inline and rely on examples, checks, practice, or review instead.

For term selection, prefer durable retrieval handles: recurring formal terms, central mechanisms, syntax or API names, and concepts that are easy to confuse with neighboring ideas. Skip ordinary language, one-off labels, local example names, section headings, broad topic categories, and vocabulary the chapter mentions but does not build on.

Treat glossary terms as retrieval handles. Use the exact form the learner saw in the lesson, with inline code formatting for code-like terms.

A term can be important enough to define in prose without being important enough for a glossary. Prefer a smaller set the learner would actually study over a complete-looking list.

Place a glossary where it best supports retrieval after use. Chapter review is a good default for chapter-wide durable terms; a section or subsection ending is better for a local cluster that will not carry across the whole chapter. If a term cluster recurs across many chapters, prefer a small chapter glossary only when it supports the current chapter's practice, and let the textbook glossary aggregate repeated terms. Do not move a glossary earlier just to define terms; teach first, then make the terms retrievable.

Teach concepts first with prose, examples, mechanisms, boundary cases, and checks. A glossary should not be the first or only teaching move for a concept.

Many good chapters should simply define terms inline and use practice or review instead of a glossary.

Do not place visible definitions immediately before definition-recall questions unless the section is intentionally guided.

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

Choose quiz format and builder from the assessment purpose. Keep each quiz close to the concept, example, trap, or review target it checks.

Use:

- `mode: "check"` for local comprehension near a new idea or example. Use 1-3 questions.
- `mode: "review"` for chapter mastery in the final review section. Use 4-10 questions.
- `mode: "practice-test"` only in dedicated cumulative checkpoint chapters. Use at least 10 questions.

Quiz explanations should teach the mechanism. Do not merely restate the answer.

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
- glossaries used as first teaching
- glossaries that preview untaught vocabulary
- visible definitions immediately before unguided definition recall
- quizzes used as decoration
- chapter review questions copied from local checks without new context
- identical chapter shapes reused regardless of topic complexity
- independent tasks that require untaught concepts
- programming chapters with code examples but no runnable practice when runnable practice would improve feedback
