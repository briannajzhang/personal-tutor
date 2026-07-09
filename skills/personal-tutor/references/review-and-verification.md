# Review And Verification

Use this reference before finalizing Tutor Kit lesson material.

## Contents

- Review loop
- Acceptance gate
- Source claims
- Authoring validation notes
- Pedagogical audit
- Compile evidence
- Coding verification evidence
- Revision triggers
- Static skill validation

## Review Loop

Use this loop for every generated or revised publication:

1. Review the drafted material against the acceptance gate.
2. Revise blocking issues before adding more chapters.
3. Run `tutor doctor` when possible.
4. If `doctor` is too broad because unrelated material is broken, run targeted `tutor compile --textbook <textbook-id>` and coding verification for the changed textbook.
5. Record review, compile, and verification evidence.

Do not claim the workspace is healthy unless the relevant command actually passed.

## Acceptance Gate

Reject and revise if any item fails.

### Scope Honesty

If the request is broad, the generated artifact must either cover the expected beginner core scope in the plan or explicitly label itself as a scoped module.

If scoped, record:

- what scope it covers
- what major topics it defers
- why narrowing is appropriate

### Coverage Claim Honesty

Do not claim a chapter teaches a mechanism unless it:

- defines or frames the mechanism plainly
- demonstrates it in a concrete example or transformation
- checks it, uses it in guided practice, or scaffolds it before independent use

If something is only named, previewed, or used in an answer explanation, label it as introduced or previewed.

### Source Claims

Do not claim source alignment unless the relevant source notes support it.

Reject when:

- missing or unreadable sources are used as a source basis
- source-grounded claims have no corresponding source note

### Practice And Review

Reject when:

- a non-trivial chapter has no worked example
- a non-trivial chapter has no local check
- a non-trivial chapter has no independent task
- a non-trivial chapter has no final review or mastery check
- practice is only vague suggestions
- review questions are decorative or duplicated without a reason
- quizzes replace concrete practice when the learner needs to produce, debug, design, or revise
- concrete practice replaces quizzes when fast conceptual diagnosis is also needed

### Prerequisite Safety

Every independent task, coding problem, project, mastery check, and practice-test question must use only concepts, syntax, mechanisms, and edge cases that were:

- taught earlier in the chapter
- taught in a prerequisite chapter
- deliberately scaffolded inside the task

Check prompts, starter files, tests, reference solutions, review focus, and answer explanations.

### Runnable Practice

For practical technical topics, include runnable or checkable practice when it improves feedback.

Missing direct runtime support is not a valid reason to use prose-only practice. Use a harness when appropriate.

If runnable practice is omitted, record the learner-facing reason.

### Transformation Coherence

For each central worked example, check whether it has concrete input, a specific operation, a visible result, and learner benefit from inspecting the relationship.

If yes, use `transformation(...)` unless ordinary semantic blocks are clearer.

Every transformation must show a coherent input -> operation -> output relationship. If the explanation relies on a baseline, temporary state, intermediate result, rejected input, or comparison output, that artifact should be visible.

### Visual Coherence

Treat diagrams and charts as visual examples, not practice by themselves.

Revise when:

- a diagram's arrows or nodes do not have a clear meaning
- a diagram's title or readout claims a boundary, ownership model, lifecycle, or state change that the visual does not show
- arrows mix meanings or omit labels when the payload, action, or responsibility is not obvious
- generic node labels could apply to almost any system
- the visual repeats prose as a decorative flowchart instead of revealing a relationship
- a chart uses arbitrary scores without defining the scale
- a chart's axis labels do not explain what the values measure
- a chart's y-axis unit or denominator is unclear
- one chart mixes unlike metrics, units, or denominators
- generic chart labels such as `Signal`, `Value`, or `Score` create ambiguity
- a qualitative tradeoff would be clearer as prose, a list, a table, or `transformation(...)`
- a visual lacks nearby framing for what to inspect or a readout of what it shows

## Authoring Validation Notes

Ordinary generation should create concise `review-notes.md`:

```md
# Review Notes

## Acceptance Gate
Pass/Fail:

## Blocking Issues Found
- ...

## Revisions Applied
- ...

## Remaining Known Issues
- ...

## Targeted Notes
- ...
```

Do not write full per-chapter score tables during ordinary generation unless the user asks for a strict audit.

If no revisions were applied, explain why the first draft passed every blocking gate.

## Pedagogical Audit

Use a pedagogical audit only when requested. It is slower and quality-focused.

Score chapters on:

- teaching flow
- definition clarity
- mechanism clarity
- example quality
- practice quality
- check and review quality
- local coherence
- learner action
- review evidence

Revise any category below 4 before finalizing. Scores of 4 or 5 must cite concrete chapter content, examples, blocks, or questions.

## Compile Evidence

Record compile or doctor results in `compile-result.md`:

```md
# Compile Result

## Command
`tutor doctor --textbook <textbook-id>`

## Result
Passed/Failed:

## Scope
full workspace / textbook <id>

## Errors Fixed
- ...

## Remaining Known Issues
- ...
```

Prefer:

```bash
tutor doctor
```

Or:

```bash
tutor doctor --textbook <textbook-id>
```

Use `tutor compile` plus coding verification when that is clearer for the task.

## Coding Verification Evidence

For textbooks with coding problems, record:

- command run
- starter result
- reference solution result
- setup/runtime failures, if any
- assertion failures fixed, if any

Example:

```md
## Coding Problem Verification

Command: `tutor verify coding-problems --textbook sql-foundations`
Result: Passed

- `filter-rows`: starter failed as expected; reference solution passed.
```

## Revision Triggers

Revise before finalizing when material is:

- structurally flat
- mostly summary prose
- vague about mechanisms
- missing definitions before use
- missing inspectable examples
- thin on practice
- missing local checks
- missing chapter review
- missing or outdated chapter specs
- using quiz modes incorrectly
- using prose-only programming exercises where runnable practice would help
- containing under-specified coding problems
- repetitive in chapter shape or voice
- using diagrams or charts as decoration, vague summaries, or fake precision
- requiring untaught moves in independent tasks
- claiming compile or verification evidence that was not actually run
- claiming source alignment without source notes

## Static Skill Validation

For skill development, verify:

- frontmatter has only `name` and `description`
- description is specific and third person
- `SKILL.md` points directly to every reference
- references are one level deep
- long references include `## Contents`
- wrapper scripts run without loading large source files into context
- tests cover skill packaging, reference routing, and CLI invocation
