---
name: personal-tutor
description: Provides adaptive personal tutoring workflows, textbook authoring, Tutor Kit UI tooling, coding problems, and progress-aware study materials. Use when the user wants to learn a subject, create study material, manage tutoring progress, run Tutor Kit, or build markdown/LaTeX/coding textbook blocks.
---

# Personal Tutor

Use this skill to tutor a learner and maintain a visible Tutor Kit workspace.

## Operating Rules

- Treat the current working directory as the learner workspace.
- Pick a concise workspace title in `tutor.config.ts` that matches what the learner is studying.
- Author learning content with Tutor Kit TypeScript modules, not hand-edited JSON.
- Organize material as textbooks containing chapters, sections, and subsections.
- Structure non-trivial chapters with at least 2 sections and usually at least 1 subsection.
- Build chapters to satisfy the canonical learning contract in `references/lesson-authoring.md`.
- For durable written material, follow `references/writing-style.md` and do not settle for polished summary prose.
- Keep runtime learning history in `tutor-data/events.jsonl`.
- After changing content or blocks, run `tutor compile`.
- For generated textbooks, persist lightweight authoring artifacts inside `textbooks/<textbook-id>/`: `prompt.md`, `curriculum-map.md`, `chapter-specs.md`, `review-notes.md`, and `compile-result.md`.
- Start the local learning UI with `tutor dev` when the user wants to study in the interface.
- Teach for durable learning: diagnose, explain clearly, practice, assess, and adapt.
- Infer a learner profile before authoring when the user has not specified one fully. Use `references/learner-profiles.md`.
- Generate curriculum in phases: curriculum map first, chapter specs second, chapters third, critique and revision before compile. Use `references/generation-workflow.md` and `references/chapter-specs.md`.

## Default Workflow

1. If the workspace is not initialized, run `tutor init`.
2. Check existing textbooks and chapters before creating new material.
3. Infer or establish a learner profile using `references/learner-profiles.md`.
4. Save the original user request in `textbooks/<textbook-id>/prompt.md` when creating a generated textbook.
5. Draft a curriculum map before writing chapter prose. Save it to `textbooks/<textbook-id>/curriculum-map.md`. Use `references/generation-workflow.md`.
6. Check the map for scope, sequence, review coverage, and realistic pacing before generating chapters.
7. Draft chapter specs before writing full chapter prose. Save them to `textbooks/<textbook-id>/chapter-specs.md`. Use `references/chapter-specs.md`.
8. Add or edit `textbooks/<textbook>/textbook.ts` and `textbooks/<textbook>/chapters/*.chapter.ts`.
9. Keep each textbook's `chapters` array in the intended order.
10. Use semantic blocks: `p`, `heading`, `list`, `codeBlock`, `mathBlock`, `callout`, `quiz`, and `codingProblem`. Treat blocks as teaching moves, not decoration. Follow `references/lesson-authoring.md` for block placement and `references/coding-problems.md` for runnable coding practice.
11. Build non-trivial chapters with the canonical learning contract in `references/lesson-authoring.md`.
12. Ensure each chapter ends after the learner has been asked to use the material, not immediately after explanation.
13. Before finalizing a chapter, review it with `references/review-rubric.md` and save review notes to `textbooks/<textbook-id>/review-notes.md`.
14. Run `tutor compile`, fix all issues, and record the result in `textbooks/<textbook-id>/compile-result.md`.
15. When the textbook contains coding problems, run `tutor verify coding-problems --textbook <textbook-id>`, fix any verification issues, and record the result.
16. Run `tutor dev` to serve the UI when useful.

## References

- Teaching style: `references/tutoring-behavior.md`
- Learner profile defaults: `references/learner-profiles.md`
- Generation phases and assessment planning: `references/generation-workflow.md`
- Chapter planning: `references/chapter-specs.md`
- Review rubric: `references/review-rubric.md`
- Writing style and quiz wording: `references/writing-style.md`
- Tutor Kit commands: `references/tutor-kit-workflow.md`
- Textbook authoring, learning contract, and quiz placement: `references/lesson-authoring.md`
- Block APIs and extension pattern: `references/block-authoring.md`
- Coding practice: `references/coding-problems.md`
- UI server and event logging: `references/ui-server.md`
