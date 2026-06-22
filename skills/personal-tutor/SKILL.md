---
name: personal-tutor
description: Create and continue durable Tutor Kit lessons, course modules, examples, exercises, quizzes, review sets, practice tests, and coding problems. Use when the user asks to learn, study, practice, master a topic, build a curriculum, write lessons, make quizzes or exercises, add coding practice, use Tutor Kit, or continue existing study content.
---

# Personal Tutor

Use this skill to author durable Tutor Kit lessons and practice. Center every task on files the learner can keep studying: chapters, examples, glossary references, quizzes, exercises, review material, coding problems, and verification notes.

This skill is not for one-off conversational tutoring. If a request is about learning, turn it into maintained Tutor Kit material unless the user explicitly asks not to create or edit files.

## Default Workflow

1. Treat the current working directory as the learner workspace.
2. Inspect existing Tutor Kit files before adding content:
   - `tutor.config.ts`
   - `textbooks/*/textbook.ts`
   - `textbooks/*/chapters/*.chapter.ts`
   - authoring artifacts such as `prompt.md`, `curriculum-map.md`, `chapter-specs.md`, `materials-index.md`, `source-notes.md`, `review-notes.md`, and `compile-result.md`
3. If Tutor Kit files are missing, initialize the workspace with `node <skill-dir>/scripts/tutor-kit.mjs init`.
4. Run a short tailoring intake before authoring unless the request and existing artifacts already answer it. Ask 3-5 questions that change the material: learner background, concrete goal, desired depth/pace, preferred practice style, time horizon, and whether runnable/checkable exercises are wanted. Do not ask about facts discoverable from the workspace. Record answers in `prompt.md` or `curriculum-map.md`.
5. Decide the smallest durable publication:
   - **Seed course/module**: create a new textbook and publish the first 1-2 learner-ready chapters.
   - **Continuation**: improve the active chapter or publish the next 1-2 planned chapters.
   - **Focused material**: add or revise a lesson section, practice set, quiz, review set, practice-test chapter, or coding problem inside an existing textbook.
6. Plan before authoring. Keep future chapters in `curriculum-map.md` or `chapter-specs.md` until they are ready.
7. Author Tutor Kit TypeScript modules, not hand-edited JSON.
8. Use semantic blocks as teaching moves: `p`, `heading`, `list`, `codeBlock`, `mathBlock`, `callout`, `transformation`, `glossary`, `quiz`, `balancedQuiz`, and `codingProblem`.
9. Verify before finalizing with `tutor doctor`, or with `tutor compile` plus `tutor verify coding-problems --textbook <textbook-id>` when coding problems exist.
10. Record review, compile, and coding-problem verification evidence in the textbook directory.
11. Start the local Tutor Kit app for the user with `tutor dev` unless they explicitly ask not to. Keep it running and report the localhost URL.

## Core Rules

- A published chapter must have a real `.chapter.ts` file, be imported by `textbook.ts`, appear in the ordered `chapters` array, and pass verification.
- Do not create placeholder future chapter files.
- Do not answer broad learning requests with only a roadmap. Create or continue a Tutor Kit course/module with learner-ready material now.
- Do not silently use generic defaults before intake. If the user skips intake or asks the agent to choose, record the chosen defaults.
- Do not make exposition-only chapters. Every non-trivial lesson needs examples, checks, practice, and review.
- Use quizzes for fast diagnosis, retrieval, local checks, chapter review, and cumulative practice tests.
- Use runnable `codingProblem(...)` blocks when the learner should implement, debug, refactor, query, transform, or test code or code-like artifacts.
- Keep runtime learner history in `tutor-data/events.jsonl`; inspect it only when it helps choose review or continuation work. Do not edit it to fake progress.
- Start or keep the Tutor Kit app running after verified authoring work, unless the user explicitly opts out. Report the URL.

## Tutor Kit Command Wrapper

Use the bundled Tutor Kit wrapper by default so generated material matches the skill's shipped runtime:

```bash
node <skill-dir>/scripts/tutor-kit.mjs <command>
```

Use a workspace `tutor <command>` only when the user explicitly wants a separately installed Tutor Kit CLI.

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
- `references/sources.md`: source intake, source notes, and source-grounded generation.
- `references/lesson-authoring.md`: learning contract, prose style, semantic blocks, examples, transformations, and chapter structure.
- `references/practice-and-assessment.md`: quizzes, exercises, review questions, practice-test chapters, coding problems, and verification metadata.
- `references/review-and-verification.md`: acceptance gate, authoring review, compile evidence, doctor, coding verification, and revision loop.

Default read path for new or continued material:

1. `references/tutor-kit-api.md`
2. `references/lesson-generation.md`
3. `references/sources.md` when sources are involved
4. `references/lesson-authoring.md`
5. `references/practice-and-assessment.md`
6. `references/review-and-verification.md`
