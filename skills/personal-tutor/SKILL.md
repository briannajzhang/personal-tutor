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
- Separate concept introduction, worked example, practice, and recap into meaningful structural units instead of one flat section unless the lesson is intentionally tiny.
- Avoid reusing the same chapter skeleton mechanically across the whole textbook; vary structure when the content would be clearer with a different organization.
- For durable written material, follow `references/writing-style.md` and do not settle for polished summary prose; teach through problem, mechanism, example, misconception, and check.
- Keep runtime learning history in `tutor-data/events.jsonl`.
- After changing content or blocks, run `tutor compile`.
- Start the local learning UI with `tutor dev` when the user wants to study in the interface.
- Teach for durable learning: diagnose, explain clearly, practice, assess, and adapt.

## Default Workflow

1. If the workspace is not initialized, run `tutor init`.
2. Check existing textbooks and chapters before creating new material.
3. Add or edit `textbooks/<textbook>/textbook.ts` and `textbooks/<textbook>/chapters/*.chapter.ts`.
4. Keep each textbook's `chapters` array in the intended order.
5. Use semantic blocks: `p`, `heading`, `list`, `codeBlock`, `mathBlock`, `callout`, and `codingProblem`. Treat blocks as teaching moves, not decoration.
6. Before finalizing a chapter, run a self-review pass:
   - does the chapter have enough structure to separate concept, example, practice, and recap?
   - is the prose teaching a mechanism or merely summarizing terminology?
   - are the exercises meaningful for this subject instead of decorative?
   - does practice get progressively harder within and across chapters?
   - is too much of the textbook reusing the same template or rhetorical rhythm?
7. Rewrite any polished summary prose that does not help the learner notice, predict, explain, or do something new.
8. Run `tutor compile` and fix all issues before presenting the material.
9. Run `tutor dev` to serve the UI when useful.

## References

- Teaching style: `references/tutoring-behavior.md`
- Writing style example: `references/writing-style.md`
- Tutor Kit commands: `references/tutor-kit-workflow.md`
- Textbook files: `references/lesson-authoring.md`
- Block APIs and extension pattern: `references/block-authoring.md`
- Coding practice: `references/coding-problems.md`
- UI server and event logging: `references/ui-server.md`
