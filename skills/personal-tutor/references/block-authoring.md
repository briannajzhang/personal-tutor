# Block Authoring

Use semantic blocks inside section and subsection `blocks` arrays. They are intentionally HTML-like, but typed and opinionated so the UI stays consistent.

## Contents

- Core block examples
- Callout tones
- Authoring rules
- Block coherence and teaching sequence
- Quiz examples
- Extension pattern

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

quiz({
  id: "slope-check",
  title: "Check: Slope as Rate of Change",
  mode: "check",
  questions: [
    {
      id: "steeper-line",
      prompt: "Two lines both move 1 unit to the right. Line A moves 2 units up, and Line B moves 5 units up. Which line has the greater slope?",
      choices: [
        { id: "a", body: "Line A, because 2 is closer to 1." },
        { id: "b", body: "Line B, because it changes more vertically for the same horizontal change." },
        { id: "c", body: "They have the same slope because both move 1 unit right." },
        { id: "d", body: "Neither line has a slope unless it crosses the origin." }
      ],
      answer: "b",
      explanation: "Slope compares vertical change to horizontal change. If the horizontal change is the same, the line with more vertical change has the greater slope.",
      tags: ["slope", "rate-of-change"],
      difficulty: "easy"
    }
  ]
});

const project = projectFiles(import.meta.url, "./problems/normalize-vector");

codingProblem({
  id: "normalize-vector",
  title: "Normalize A Vector",
  prompt: "Implement `normalize(xs)` so the returned values sum to 1.",
  language: "python",
  files: [
    project.file("main.py", { editable: true }),
    project.file("solution.py", { hidden: true }),
    project.file("tests.py")
  ],
  setup: "uv --version",
  test: "$PYTHON tests.py",
  verification: {
    actionId: "test",
    referenceFiles: { "main.py": "solution.py" }
  }
});
```

## Transformation Block

Use `transformation(...)` when the learner needs to inspect how a specific operation, rule, reasoning move, or revision connects a concrete starting artifact to a concrete result.

Use it only when all four are true:

1. There is a concrete starting artifact, context, or state.
2. There is a specific operation, rule, reasoning move, or action.
3. There is a visible result, output, conclusion, or changed artifact.
4. The learner benefits from inspecting the relationship between them.

The learner should be able to point to the input, follow the move, and account for the result. If not, use ordinary semantic blocks instead.

Supported artifact formats are `markdown`, `code`, `math`, and `table`. A transformation may contain multiple input and output artifacts, but exactly one operation artifact. Custom stage labels let the same block represent state changes, derivations, revisions, and interpretations without implying that every relationship is deterministic.

Every transformation requires a short `focus` that tells the learner which concrete relationship, value, row, textual change, symbol, or reasoning move to inspect.

A transformation replaces scattered example artifacts; it does not replace the surrounding lesson. Nearby content should add a distinct teaching move that is not already inside the widget, such as mechanism setup, problem framing, artifact readout, generalization, implication, contrast, boundary case, check, or practice. Do not add generic setup, bridge, or mastery prose solely to satisfy a repeated lesson shape.

The operation must be coherent with the shown input, and the explanation must account for the concrete visible artifacts. A transformation should not hide a state change or intermediate artifact it claims to teach. If the explanation relies on a baseline, temporary state, intermediate result, rejected input, or comparison output, that artifact should be visible.

The optional `layout` is `auto`, `flow`, or `compare` and defaults to `auto`:

- Use `auto` unless there is a clear reason to override it. It compares all three stages when they fit, lets a dense operation span full width while input and output remain side by side, and switches the whole block to full-width rows when input or output needs more width.
- Use `flow` when the sequence should always receive full width.
- Use `compare` only when keeping compact stages side by side is important. It still stacks on narrow screens.

```ts
transformation({
  id: "left-join-preservation",
  title: "Inspect: How LEFT JOIN Preserves Unmatched Rows",
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
    body: "SELECT customers.customer_id, customers.name, orders.total\\nFROM customers\\nLEFT JOIN orders ON customers.customer_id = orders.customer_id;"
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

```ts
transformation({
  id: "evidence-to-claim",
  title: "Inspect: From Evidence To A Supported Claim",
  focus: "Track how the source detail supports a limited claim without proving more than the evidence shows.",
  inputLabel: "Evidence",
  operationLabel: "Reasoning move",
  outputLabel: "Supported claim",
  input: [{
    format: "markdown",
    body: "A factory report from 1912 says workers were fined for arriving more than 3 minutes late."
  }],
  operation: {
    format: "markdown",
    body: "Connect the rule to what it suggests about workplace control."
  },
  output: [{
    format: "markdown",
    body: "The factory used strict time rules to control worker behavior."
  }],
  explanation: "The evidence directly supports a limited claim about time discipline, but it does not prove every aspect of factory life."
});
```

Do not use `transformation(...)` for:

- definitions, general explanations, summaries, or broad conceptual overviews
- ordinary practice prompts or results such as "the learner understands X"
- large multi-step workflows or whole projects
- examples without a concrete starting artifact or meaningful visible result
- every code, query, math, or example block by default

A transformation is a modeled example, not practice. Its surrounding lesson content should add distinct teaching value rather than formulaic padding. Follow it with a quiz, concrete task, or coding problem when the learner needs to use the mechanism. Repeated transformations in one chapter should represent genuinely distinct inspectable relationships.

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
- Use `transformation` for focused, inspectable input-to-move-to-result relationships. It does not count as learner practice.
- Use `quiz` for multiple-choice concept checks, chapter review, and cumulative practice tests.
- Use `codingProblem` for runnable practice. See `coding-problems.md`.
- For programming lessons, prefer `codingProblem` over prose-only exercise descriptions when the target skill requires writing, running, debugging, or refactoring code.
- Prefer several semantic blocks over one giant Markdown string.
- Keep block IDs stable and unique within their section or subsection.
- Give lists a clear teaching job. Add nearby framing when the purpose is not obvious from the section and preceding block.

`explanation` and `blurb` are legacy aliases. Do not use them in new material.

## Block Coherence

A block should not appear as a standalone fragment. It should connect to the block before it and prepare the block after it.

Before adding a block, know its teaching job:

- introduce a problem
- define a term
- explain a mechanism
- show a concrete example
- name a misconception or boundary
- ask the learner to predict, explain, debug, compare, classify, apply, or create

Before a `codeBlock`, `mathBlock`, table, diagram, formal notation, or example, tell the learner what to inspect.

After a `codeBlock`, `mathBlock`, table, diagram, formal notation, or example, explain what it showed.

Weak:

1. `p`: slope means steepness
2. `mathBlock`: slope formula
3. `callout`: slope can be negative
4. `list`: questions

Better:

1. `p`: slope compares vertical change to horizontal change
2. `p`: tell the learner to inspect how far the line rises for the same horizontal move
3. `mathBlock`: slope formula
4. `p`: walk through what the numerator and denominator mean
5. `callout`: a negative slope means the line goes down as x increases
6. `quiz`: quick prediction check
7. `list`: guided practice with two new lines

## Teaching Sequence

Blocks are semantic teaching moves, not layout decoration. For durable material, prefer a learning loop rather than an explanation-only stack. The sequence does not need to be rigid, but each block should make the next block easier to understand or use:

1. `p`: state the learner-facing problem or confusion.
2. `p`: define the concept and explain the mechanism.
3. `codeBlock`, `mathBlock`, diagram, table, or example: show the mechanism in a small concrete form.
4. `quiz`: check local comprehension when multiple choice fits.
5. `callout`: name the misconception, warning, or key idea.
6. `list` or another concrete task block: give guided practice, retrieval, comparison, or prediction tasks.
7. `codingProblem` or another subject-appropriate independent-practice move when the learner should perform the skill with less support.
8. `quiz`: use review or practice-test modes when the learner should get scored retrieval across a chapter or unit.

For programming lessons, a common pattern is:

1. `p`: name the coding task or bug pattern.
2. `codeBlock`: show a small worked example.
3. `quiz`: ask a short prediction or misconception check.
4. `callout`: isolate the trap.
5. `list`: give short guided tasks or predictions.
6. `codingProblem`: require runnable independent practice.

Avoid isolated blocks that are individually valid but weak together. A technically correct `codeBlock`, `callout`, and `list` can still produce a poor lesson if the learner is not told why each block appears or how they connect.

After an interactive or runnable block, add a transition before switching to retrieval, review, assessment, or an unrelated scenario.

Do not place separate tables or parallel artifacts into one plain-text block when spacing is required to understand their relationship. Prefer separate labeled blocks unless the combined alignment has been verified in the rendered UI.

## Quiz Examples

For generated quizzes, prefer `balancedQuiz(...)` when choice order is not pedagogically meaningful. It accepts the same input shape as `quiz(...)`, returns a normal quiz block, and deterministically reorders choices so correct rendered positions are balanced mechanically. The author should focus on clear prompts, plausible distractors, and useful explanations rather than manually arranging answer letters.

Do not use `balancedQuiz(...)` when choice order teaches meaning, such as chronological choices, numeric scales, step ordering, "all of the above", or "both A and B". Use `quiz(...)` when the exact author-specified order matters.

Concept check:

```ts
balancedQuiz({
  id: "slope-check",
  title: "Check: Slope as Rate of Change",
  mode: "check",
  questions: [
    {
      id: "same-run-different-rise",
      prompt: "Two lines both move 1 unit to the right. Line A moves 2 units up, and Line B moves 5 units up. Which line has the greater slope?",
      choices: [
        { id: "a", body: "Line A, because 2 is closer to 1." },
        { id: "b", body: "Line B, because it changes more vertically for the same horizontal change." },
        { id: "c", body: "They have the same slope because both move 1 unit right." },
        { id: "d", body: "Neither line has a slope unless it crosses the origin." }
      ],
      answer: "b",
      explanation: "Slope compares vertical change to horizontal change. If the horizontal change is the same, the line with more vertical change has the greater slope.",
      tags: ["slope", "rate-of-change"],
      difficulty: "easy"
    }
  ]
});
```

Chapter review:

```ts
balancedQuiz({
  id: "evidence-review",
  title: "Chapter Review: Evidence and Claims",
  mode: "review",
  questions: [
    {
      id: "strongest-evidence",
      prompt: "A paragraph claims that a city changed its transit policy because ridership had fallen. Which evidence would most directly support that claim?",
      choices: [
        { id: "a", body: "A map of the city's train lines." },
        { id: "b", body: "Ridership data showing a decline before the policy change." },
        { id: "c", body: "A quote saying public transit is important." },
        { id: "d", body: "A list of nearby cities with transit systems." }
      ],
      answer: "b",
      explanation: "The claim is about a cause for the policy change. Ridership data from before the change is the evidence that most directly tests that cause.",
      tags: ["evidence", "claims", "causation"],
      difficulty: "medium"
    }
  ]
});
```

Practice-test chapter:

```ts
chapter({
  id: "foundations-practice-test-1",
  title: "Practice Test 1: Foundations",
  description: "Mixed review across the first unit.",
  role: "cumulative-checkpoint",
  sections: [
    section({
      id: "instructions",
      title: "Before you start",
      blocks: [
        p({
          id: "intro",
          body: "This is a mixed review. Answer from memory first, then check your score and explanations."
        })
      ]
    }),
    section({
      id: "mixed-review",
      title: "Mixed Review Quiz",
      role: "assessment",
      blocks: [
        list({
          id: "mixed-synthesis",
          items: [
            "Diagnose one scenario that combines two earlier ideas and explain the correction."
          ]
        }),
        balancedQuiz({
          id: "foundations-practice-test",
          title: "Practice Test: Foundations",
          mode: "practice-test",
          questions: [
            // 10-25 mixed questions here
          ]
        })
      ]
    })
  ]
});
```

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
