# Practice And Assessment

Use this reference when authoring quizzes, exercises, review questions, practice-test chapters, coding problems, or other learner tasks. Treat the practice patterns as ways to enrich a lesson, not as required quotas. Choose the mix and amount that fit the learner and request.

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

Aim for practice that reveals whether the learner can use the idea.

Useful practice often gives one or more of:

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

In a chapter that is explicitly practice heavy, devote substantial space to learner work. Move from support toward independence when that progression helps.

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

Choose the question format by the learner move. Multiple choice is useful when the learner should make one decision, prediction, diagnosis, misconception check, or best-answer judgment among several credible alternatives. When the subject supports only one credible response and additional choices would become filler, prefer sharpening the prompt or using a format that better fits the move. Use matching when the useful work is organizing a related set well enough to discriminate among its members: terms to meanings, representations to interpretations, tools to use cases, symptoms to causes, examples to categories, or steps to roles.

Matching is most valuable when neighboring ideas are easy to confuse and later tasks depend on choosing among them. A compact table, ladder, glossary, taxonomy, label set, or comparison is a useful signal to consider matching, especially when several multiple-choice questions would otherwise check the same relationship one item at a time. In that case, one matching question can compress retrieval and discrimination before the quiz returns to scenario-based application.

Do not add matching for variety alone. Use it when it improves the learner move: checking a map, separating similar-but-different ideas, or preparing for later decisions that depend on choosing among those ideas quickly.

After drafting a quiz, scan for clusters of questions that test the same relationship pattern across a related set. If several one-decision questions are mainly checking that map item by item, consider whether one matching question would check the relationship more directly and leave room for scenario-based application.

Choice position should not become a clue. Tutor Kit balances ordinary four-choice multiple-choice questions by default. Preserve an authored order when that order itself supports the learner's interpretation; see `tutor-kit-api.md` for the opt-out syntax.

Quiz modes:

- `"check"`: local comprehension, 1-3 questions.
- `"review"`: chapter mastery, 4-10 questions.
- `"practice-test"`: mixed cumulative assessment, at least 10 questions.

Prompts should ask the learner to predict, classify, map, debug, compare, or apply.

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
- `kind`: `"multiple-choice"` with choices and one answer ID, or `"matching"` with compact one-to-one pairs
- explanation that teaches the mechanism
- tags
- difficulty when useful: `easy`, `medium`, or `hard`

Strong multiple-choice options represent competing interpretations, predictions, diagnoses, or actions that could follow from different learner models. Several may look credible at first, while the taught idea still leaves one defensible answer. The options tend to answer the same question at a comparable level of specificity, so the learner must use the idea—not differences in length, detail, tone, or plausibility—to reject them. Useful alternatives often arise from partial understanding, missed conditions, nearby confusions, or overextensions of a true idea.

Keep the full reasoning in feedback rather than making one choice carry the explanation. Use choice-level `explanation` selectively to repair a recognizable misconception, and keep the question-level `explanation` focused on why the correct answer works.

For matching questions, keep both sides short and one-to-one. Use them after the lesson has taught or framed the items; do not make matching the first exposure to the concepts.

Avoid matching when the answer requires long reasoning, nuanced judgment, partial credit, or more than one reasonable pairing. Split many-to-many relationships into simpler checks.

For matching explanations, explain the shared sorting rule or decision test, not a reference entry for every term.

## Review Sets

For a substantial instructional chapter, consider a clear review or transfer moment near the end. It can be a section, quiz, concrete task, reflection, project step, or another fitting form.

Review should usually include:

- a short retrieval frame
- a concrete written or task-based mastery check
- a `quiz(...)` block with `mode: "review"` when a quiz fits the mastery check

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
4. Run `doctor --textbook <id> --record`; Tutor Kit writes the evidence to `compile-result.md`.

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
