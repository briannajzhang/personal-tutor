# Coding Problems

A coding problem should teach or assess a specific skill. Do not use `codingProblem(...)` only because the subject involves code.

## Contents

- Reference solution verification
- Authoring pattern
- Runtime harnesses
- Problem design and prompt completeness
- Rules
- Review feedback
- Practice quality

## Reference Solution Verification

Every generated coding problem that is intended to be automatically verified must include a hidden reference solution, such as `solution.py`, `reference.ts`, or another clearly named solution file.

If a coding problem is intentionally open-ended or manually reviewed, state that explicitly in the problem review focus, and do not present it as automatically verified.

Use `verification.referenceFiles` to map each learner-editable file to its reference-solution file, and use `verification.actionId` to select the action that should be run for verification.

Before finalizing the problem:

1. Run the tests against the intentionally incomplete starter and confirm it fails for the intended assertion reason.
2. Run the same tests against the reference solution and confirm it passes.
3. Distinguish setup/runtime failures from assertion failures.
4. Record the starter result and reference-solution result in `compile-result.md` under `## Coding Problem Verification`.

Run:

```bash
tutor verify coding-problems --textbook <textbook-id>
```

A good coding problem gives the learner:

- a concrete task
- starter code or files when useful
- visible tests or expected behavior
- at least one realistic edge case or failure mode
- a review focus that matches the chapter goal

The problem should connect to the surrounding lesson. The prose before the problem should prepare the learner for the task, and the review or mastery check after the problem should help the learner interpret what they practiced.

Coding problems do not replace concept checks or review quizzes. Use `codingProblem(...)` when the learner needs runnable practice, and use `quiz(...)` when the learner needs fast conceptual diagnosis, prediction, misconception checks, or local scoring.

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
    project.file("solution.py", { hidden: true }),
    project.file("tests.py")
  ],
  setup: "uv --version",
  run: "$PYTHON main.py",
  test: "$PYTHON tests.py",
  verification: {
    actionId: "test",
    referenceFiles: { "main.py": "solution.py" }
  },
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
      solution.py
      tests.py
```

## Runtime Harnesses

Do not avoid `codingProblem(...)` only because the target skill does not have a dedicated runtime configured.

When the learner would benefit from runnable practice, use an available runtime or test harness to exercise the target artifact.

A harness is appropriate when:

- the learner edits one artifact, such as a query, config file, function, command, regex, parser rule, schema, or data transformation
- tests can load that artifact and check observable behavior
- the harness can stay secondary to the target skill
- the prompt can make clear what the learner should edit and what behavior must pass

The learner should not have to learn the harness language to solve the problem. If the harness becomes the main task, the problem is poorly designed.

Examples of acceptable harness patterns:

- SQL query checked by a small database fixture
- regex checked against matching and non-matching strings
- JSON/YAML/config checked by a parser and expected fields
- command-line behavior checked by a script
- data transformation checked against small input and expected output
- API handler checked by request/response tests

Do not downgrade runnable practice into prose-only prompts merely because the target language, file type, or tool is not itself configured as a runtime. If execution would meaningfully improve feedback, create a small harness and satisfy the normal verification requirements.

## Problem Design

Design coding problems around learner actions, not topic labels.

## Preserve The Central Learner Move

Classify each task during planning:

- `construct`: the learner writes the central logic
- `debug`: the learner diagnoses and repairs a realistic failure
- `complete`: the learner fills a deliberately limited missing piece
- `extend`: the learner adds behavior to a working artifact

The prompt and starter should match the classification. Expose the environment, available interface, input shape, execution context, and expected result needed to begin. Do not provide the central reasoning the task claims to assess. If most of the target mechanism is already present, describe the task honestly as debugging or completion rather than independent construction.

Make the classification clear in learner-facing wording:

- debug prompts identify what is wrong and what correct behavior should replace it
- complete prompts identify the deliberately missing part
- construct prompts provide context and expected behavior without starting the central solution
- extend prompts identify existing behavior and the new capability to add

For each planned coding problem, identify:

- task classification
- central learner move
- context supplied to reduce setup uncertainty
- logic deliberately omitted from the starter

Starter files should reflect the learner profile. A placeholder such as `SELECT 1` or an empty function is insufficient when the learner must inspect tests to reconstruct the environment or discover how to begin. A nearly complete solution is also insufficient when the task claims to assess independent construction.

Surrounding prose should explain why the learner is doing the problem and which mechanism it exercises. Do not merely restate the coding prompt.

A coding problem should not be inserted solely to satisfy compile. It must reinforce a central or cumulative learner move identified in the chapter spec. Follow-up tasks should interpret, extend, debug, or retrieve from the coding problem rather than appearing as an unrelated list.

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

During review, reject or revise a coding problem when the learner must read the tests to discover core requirements.

Tests may cover edge cases, but they should not be the only place where the main behavior, required inputs, output shape, ordering rule, constraint, or important failure mode appears.

## Rules

- Prefer real source files over large inline strings.
- Keep `codingProblem(...)` as the manifest: prompt, files, commands, review focus.
- Mark learner-editable files with `{ editable: true }`.
- Keep tests visible by default. Hidden files/actions are hidden from the UI, not secret from local source.
- Use `language` as a runtime/editor hint, not as a restriction. Commands are the source of truth.
- Use `setup` for dependency checks or environment preparation. It runs before each action in the same temporary project directory.
- Use `$PYTHON`, `$NODE`, `$TSX`, or custom runtime env vars in commands when helpful.
- For package-dependent exercises, prefer hermetic commands such as `uv run --with mlx python tests.py` over assuming global installs.
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

Run `tutor compile` after adding or moving problem files. Run `tutor verify coding-problems --textbook <textbook-id>` after changing starter code, tests, setup, commands, or reference solutions.

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
