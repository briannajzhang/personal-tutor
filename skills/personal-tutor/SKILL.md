---
name: personal-tutor
description: Use when the user wants to learn, study, practice, master, or build skill in a subject; asks for tutoring, lessons, a course, curriculum, study plan, exercises, quizzes, projects, coding practice, progress review, a learning workspace, Tutor Kit, or continuation of existing study material. For broad learning requests like "I want to learn TypeScript", "teach me web servers", or "help me learn SQL", default to creating or continuing an agent-authored Tutor Kit seed course, not a conversational roadmap, unless the user explicitly asks for chat-only help.
---

# Personal Tutor

Use this skill to tutor a learner and maintain a visible Tutor Kit workspace. Tutor Kit is operated by agents; optimize for reliable curriculum generation and verification, not manual CLI use.

## Mode Selection

- If the user expresses broad learning intent and does not explicitly ask for chat-only help, use seed mode or continuation mode.
- **Seed mode**: use when there is no suitable existing textbook. Create the workspace, plan the course arc, and publish the first 1-2 learner-ready chapters.
- **Continuation mode**: use when a suitable textbook exists. Inspect the current state, then publish the next ready chapter or improve the active chapter.
- **Live tutoring mode**: use only for specific questions, quick explanations, diagnosis, feedback, or short practice that does not need durable files.
- **Full textbook mode**: use only when the user explicitly asks for a complete/full textbook or a large batch of finished chapters.

## Core Rules

- Treat the current working directory as the learner workspace.
- For durable authoring, read `references/quickstart.md` before writing files.
- Author Tutor Kit TypeScript modules, not hand-edited JSON.
- A chapter is published only when it has a real `.chapter.ts` file, is imported by `textbook.ts`, appears in the `chapters` array, and passes verification.
- Do not create placeholder future chapter files. Keep future chapters in `curriculum-map.md` or `chapter-specs.md` until they are ready to publish.
- Published chapters may be practice-heavy: add quizzes, retrieval checks, exercises, projects, and coding problems when they serve the chapter goal.
- Keep runtime learning history in `tutor-data/events.jsonl`; inspect it when useful, but do not fake progress by editing it.
- After changing content or blocks, run `tutor doctor`; `tutor compile` plus `tutor verify coding-problems --textbook <textbook-id>` is also acceptable.
- If `tutor` is not on PATH, invoke `node <skill-dir>/assets/tutor-kit/dist/cli/index.js <command>`.
- Start `tutor dev` when the user wants the local UI.

## Seed Mode

1. Initialize the workspace with `tutor init` if Tutor Kit files are missing.
2. Check for existing textbooks before adding a new one.
3. Infer a learner profile when the user is vague; use `references/learner-profiles.md` only when needed.
4. Add one textbook for the requested subject.
5. Save `prompt.md`, `curriculum-map.md`, `chapter-specs.md`, `review-notes.md`, and `compile-result.md` in the textbook directory.
6. Write a curriculum map for the whole course arc, marking `Published now` and `Planned next`.
7. Write specs only for the chapters being published now, usually 1-2 chapters.
8. Author and publish those chapters with complete teaching, examples, and practice.
9. Compile, verify coding problems when present, record results, and leave concise continuation notes.

## Continuation Mode

1. Inspect `tutor.config.ts`, the relevant textbook, existing chapters, planning artifacts, and recent learner events.
2. Choose the smallest useful next publication: improve the active chapter or publish the next 1-2 chapters.
3. Update the curriculum map and chapter specs before authoring.
4. Publish only learner-ready chapters.
5. Compile, verify coding problems when present, record results, and summarize what changed plus the next suggested publication.

## References

- Default durable workflow: `references/quickstart.md`
- Tutor Kit commands: `references/tutor-kit-workflow.md`
- Chapter contract and semantic blocks: `references/lesson-authoring.md`
- Coding practice: `references/coding-problems.md`
- Learner defaults: `references/learner-profiles.md`
- Optional deep references: `references/chapter-specs.md`, `references/generation-workflow.md`, `references/review-rubric.md`, `references/writing-style.md`, `references/block-authoring.md`, `references/tutoring-behavior.md`, `references/ui-server.md`
