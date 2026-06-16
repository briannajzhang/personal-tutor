---
name: personal-tutor
description: Creates and continues durable Tutor Kit learning material: lessons, course modules, textbook chapters, examples, exercises, quizzes, review sets, practice tests, coding problems, and verified learner practice. Use when the user asks to learn, study, practice, master, build skill, generate curriculum, create lessons, write practice questions, make quizzes, add coding practice, review progress through authored material, maintain a learning workspace, use Tutor Kit, or continue existing Tutor Kit study content.
---

# Personal Tutor

Use this skill to author durable Tutor Kit lessons and practice. Center every task on files the learner can keep studying: chapters, examples, quizzes, exercises, review material, coding problems, and verification notes.

This skill is not for one-off conversational tutoring. If a request is about learning, turn it into maintained Tutor Kit material unless the user explicitly asks not to create or edit files.

## Default Workflow

1. Treat the current working directory as the learner workspace.
2. Inspect existing Tutor Kit files before adding content:
   - `tutor.config.ts`
   - `textbooks/*/textbook.ts`
   - `textbooks/*/chapters/*.chapter.ts`
   - authoring artifacts such as `prompt.md`, `curriculum-map.md`, `chapter-specs.md`, `review-notes.md`, and `compile-result.md`
3. If Tutor Kit files are missing, initialize the workspace with `tutor init` or `node <skill-dir>/scripts/tutor-kit.mjs init`.
4. Decide the smallest durable publication:
   - **Seed course/module**: create a new textbook and publish the first 1-2 learner-ready chapters.
   - **Continuation**: improve the active chapter or publish the next 1-2 planned chapters.
   - **Focused material**: add or revise a lesson section, practice set, quiz, review set, practice-test chapter, or coding problem inside an existing textbook.
5. Plan before authoring. Keep future chapters in `curriculum-map.md` or `chapter-specs.md` until they are ready.
6. Author Tutor Kit TypeScript modules, not hand-edited JSON.
7. Use semantic blocks as teaching moves: `p`, `heading`, `list`, `codeBlock`, `mathBlock`, `callout`, `transformation`, `quiz`, `balancedQuiz`, and `codingProblem`.
8. Verify before finalizing with `tutor doctor`, or with `tutor compile` plus `tutor verify coding-problems --textbook <textbook-id>` when coding problems exist.
9. Record review, compile, and coding-problem verification evidence in the textbook directory.

## Core Rules

- A published chapter must have a real `.chapter.ts` file, be imported by `textbook.ts`, appear in the ordered `chapters` array, and pass verification.
- Do not create placeholder future chapter files.
- Do not answer broad learning requests with only a roadmap. Create or continue a Tutor Kit course/module with learner-ready material now.
- Do not make exposition-only chapters. Every non-trivial lesson needs examples, checks, practice, and review.
- Use quizzes for fast diagnosis, retrieval, local checks, chapter review, and cumulative practice tests.
- Use runnable `codingProblem(...)` blocks when the learner should implement, debug, refactor, query, transform, or test code or code-like artifacts.
- Keep runtime learner history in `tutor-data/events.jsonl`; inspect it only when it helps choose review or continuation work. Do not edit it to fake progress.
- Start `tutor dev` only when the user wants to open the local UI.

## Tutor Kit Command Wrapper

Prefer `tutor <command>` when it works in the learner workspace.

If `tutor` is not on PATH, run the bundled command through this skill:

```bash
node <skill-dir>/scripts/tutor-kit.mjs <command>
```

Examples:

```bash
node <skill-dir>/scripts/tutor-kit.mjs init
node <skill-dir>/scripts/tutor-kit.mjs doctor --textbook sql-foundations
node <skill-dir>/scripts/tutor-kit.mjs verify coding-problems --textbook sql-foundations
node <skill-dir>/scripts/tutor-kit.mjs dev
```

## Reference Routing

Read only the reference files needed for the current job:

- `references/tutor-kit-api.md`: commands, workspace layout, builders, block API, and UI server behavior.
- `references/lesson-generation.md`: seed course, continuation, focused material, learner defaults, curriculum maps, and chapter specs.
- `references/lesson-authoring.md`: learning contract, prose style, semantic blocks, examples, transformations, and chapter structure.
- `references/practice-and-assessment.md`: quizzes, exercises, review questions, practice-test chapters, coding problems, and verification metadata.
- `references/review-and-verification.md`: acceptance gate, authoring review, compile evidence, doctor, coding verification, and revision loop.

Default read path for new or continued material:

1. `references/tutor-kit-api.md`
2. `references/lesson-generation.md`
3. `references/lesson-authoring.md`
4. `references/practice-and-assessment.md`
5. `references/review-and-verification.md`
