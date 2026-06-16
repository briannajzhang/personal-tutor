# Personal Tutor Quickstart

Use this file for durable Tutor Kit authoring. The default is incremental publishing: seed a course or continue an existing one.

## Decide The Mode

- Use seed mode when no suitable textbook exists.
- Use continuation mode when a suitable textbook already exists.
- Use live tutoring mode for conversational help that does not need files.
- Use full textbook mode only when the user explicitly asks for a complete finished textbook.

## Twenty Rules

1. Treat the current directory as the learner workspace.
2. Run `tutor init` only when Tutor Kit files are missing.
3. Use `tutor add textbook <id> [title]` for a new subject.
4. Keep one requested subject in one textbook unless the user asks otherwise.
5. Pick a concise workspace title in `tutor.config.ts`.
6. Persist `prompt.md`, `curriculum-map.md`, `chapter-specs.md`, `review-notes.md`, and `compile-result.md` for generated textbooks.
7. Plan the full course arc in `curriculum-map.md`.
8. Mark chapters as `Published now` or `Planned next`.
9. Publish only 1-2 chapters by default.
10. Do not create placeholder future `.chapter.ts` files.
11. A published chapter must be imported in `textbook.ts` and listed in `chapters`.
12. A non-trivial published chapter should have at least 2 sections and usually a subsection.
13. Teach mechanisms, not just terminology.
14. Define key terms before relying on them.
15. Include worked examples with visible results.
16. Add quizzes and exercises where they reveal understanding.
17. Use `codingProblem(...)` when the learner should implement, debug, refactor, or run code.
18. Verify generated coding problems with starter-fails/reference-passes evidence.
19. Run `tutor doctor` or `tutor compile` after content changes.
20. Record compile and verification results in `compile-result.md`.

## Published Chapter Contract

A published chapter is learner-ready. It should include:

- a clear learner outcome
- explanation of the central mechanism
- at least one worked example
- local checks near major ideas
- meaningful practice or exercise
- an end-of-chapter review or mastery check

It may contain many quizzes or exercises if they are purposeful. Practice volume is good; low-quality filler is not.

## Planning Backlog

Future chapters belong in planning artifacts until ready:

```txt
textbooks/<textbook-id>/curriculum-map.md
textbooks/<textbook-id>/chapter-specs.md
```

Do not add a future chapter to `textbook.ts` until its `.chapter.ts` file is complete enough for the learner to study.

## Verification Loop

Use the single-command check when possible:

```bash
tutor doctor
```

Or run the underlying checks directly:

```bash
tutor compile
tutor verify coding-problems --textbook <textbook-id>
```

If unrelated existing material blocks full compile, run `tutor compile --textbook <textbook-id>` for the changed textbook and report the remaining workspace issue.
