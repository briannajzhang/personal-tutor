# Practice And Assessment

Use this reference when authoring quizzes, exercises, review questions, practice-test chapters, coding problems, or other learner tasks.

## Contents

- Practice principles
- Practice taxonomy
- Quiz authoring
- Review sets
- Practice-test chapters
- Coding problems
- Runnable harnesses
- Coding problem verification
- Feedback files

## Practice Principles

Practice should reveal whether the learner can use the idea.

Good practice gives at least one of:

- concrete input
- concrete scenario
- specific artifact to produce
- bug to diagnose
- output to predict
- comparison to make
- constraint to satisfy
- solution behavior to test

The following are not enough by themselves:

- "Practice writing about X."
- "Try building a small project."
- "Review the key ideas."
- "Explain this concept in your own words" as the only practice mode.
- A list of broad suggestions with no input, expected output, scenario, or target behavior.

At least 40% of learner-facing content in a practice-heavy chapter should be practice-oriented. Practice should move from supported to more independent work.

## Practice Taxonomy

Choose a mix that fits the subject:

- recall
- prediction
- classification
- explanation
- comparison
- debugging or error diagnosis
- application to new cases
- creation or design
- synthesis or cumulative review

Examples by subject:

- language learning: translation, usage, error correction
- math: solve, justify, spot the misconception
- history: compare causes, explain significance, interpret evidence
- programming: implement, debug, refactor, explain behavior
- science: predict outcome, explain mechanism, interpret data

## Quiz Authoring

Choose the question format by the learner move. Use multiple choice when one prompt asks for one decision, prediction, diagnosis, or best answer. Use matching when the check is about distinguishing several related items along the same one-to-one relationship.

Use `balancedQuiz(...)` for generated multiple-choice quizzes when answer order does not matter. Use `quiz(...)` when the quiz includes matching or when answer order or question structure should be preserved.

Quiz modes:

- `"check"`: local comprehension, 1-3 questions.
- `"review"`: chapter mastery, 4-10 questions.
- `"practice-test"`: mixed cumulative assessment, at least 10 questions.

Prompts should ask the learner to predict, classify, debug, compare, or apply.

Weak:

```txt
What is slope?
```

Better:

```txt
A line moves 3 units up every time it moves 1 unit right. What does that tell you about its slope?
```

Each question should include:

- stable question ID
- concrete prompt
- `kind`: `"multiple-choice"` with choices and an answer ID, or `"matching"` with one-to-one pairs
- explanation that teaches the mechanism
- tags
- difficulty when useful: `easy`, `medium`, or `hard`

Distractors should represent realistic learner mistakes. If no plausible learner reasoning leads to a choice, replace it.

For matching questions, keep both sides short and one-to-one. Avoid many-to-many relationships unless the question is split into simpler checks.

For matching explanations, explain the shared sorting rule or decision test.

## Review Sets

Every non-trivial instructional chapter should end with a dedicated final review section.

Review should usually include:

- a short retrieval frame
- a concrete written or task-based mastery check
- a `balancedQuiz(...)` or `quiz(...)` block with `mode: "review"` when multiple choice fits

Review questions should assess the chapter outcome with new scenarios where possible. Direct repetition is appropriate only for deliberate retrieval of a fundamental concept.

Do not make the final review section also serve as the main independent-practice section.

## Practice-Test Chapters

Use a dedicated cumulative checkpoint chapter when mixed review across earlier material is warranted.

Requirements:

- `chapter({ role: "cumulative-checkpoint" })`
- final section with `role: "assessment"`
- one `mode: "practice-test"` quiz with at least 10 questions
- questions from at least 3 distinct tags when possible
- at least 2 difficulty levels when possible
- at least one non-quiz cumulative task
- no new central mechanism

Practice-test questions should require selection or transfer. Do not tell the learner which earlier chapter or technique applies.

## Coding Problems

Use `codingProblem(...)` when the learner should implement, debug, refactor, query, transform, or test code or code-like artifacts.

A coding problem should teach or assess a specific learner move. Do not add it only because the subject involves code.

Classify each task during planning:

- `construct`: learner writes the central logic
- `debug`: learner diagnoses and repairs a realistic failure
- `complete`: learner fills a deliberately limited missing piece
- `extend`: learner adds behavior to a working artifact

A good prompt specifies:

- function, class, command, query, artifact, or behavior to implement
- important inputs
- expected output or observable behavior
- constraints and edge cases
- what the learner should learn from passing the tests

The learner should not need to read tests to discover core requirements. Tests may reveal edge cases, but the main behavior belongs in the prompt, docstring, or starter comments.

Starter code should preserve the central learner move. Do not give a nearly complete solution when the task claims to assess construction. Do not use an empty starter when the learner needs setup context to begin.

## Runnable Harnesses

Do not downgrade runnable practice into prose-only prompts just because the target artifact lacks a dedicated runtime.

Use an available harness when execution improves feedback:

- SQL checked by a small database fixture
- regex checked against matching and non-matching strings
- JSON/YAML/config checked by a parser and expected fields
- command behavior checked by a script
- data transformation checked against small input and output
- API behavior checked by request/response tests

The harness should stay secondary to the target skill. If the learner must learn the harness language to solve the problem, redesign the task.

## Coding Problem Verification

Automatically verified coding problems must include a hidden reference solution and verification metadata.

Pattern:

```ts
codingProblem({
  id: "add-one",
  title: "Add One",
  prompt: "Implement `add_one(x)` so it returns the input plus 1. For example, `add_one(2)` should return `3`.",
  language: "python",
  files: [
    project.file("main.py", { editable: true }),
    project.file("solution.py", { hidden: true }),
    project.file("tests.py")
  ],
  test: "$PYTHON tests.py",
  verification: {
    actionId: "test",
    referenceFiles: { "main.py": "solution.py" }
  },
  review: "Check return behavior and whether the learner can explain why callers need the returned value."
});
```

Before finalizing:

1. Confirm the starter fails for the intended assertion reason.
2. Confirm the reference solution passes.
3. Distinguish setup/runtime failures from assertion failures.
4. Record evidence in `compile-result.md`.

Run:

```bash
tutor verify coding-problems --textbook <textbook-id>
```

## Feedback Files

The UI saves learner edits to:

```txt
tutor-data/drafts/<textbook>/<chapter>/<problem>.json
```

Feedback belongs at:

```txt
tutor-data/feedback/<textbook>/<chapter>/<problem>.md
```

When preparing a review task for another agent, include:

- review goal
- absolute learner draft path
- absolute source/test file paths
- absolute feedback output path

The feedback goal should match the chapter's target skill, not only say "review the solution."
