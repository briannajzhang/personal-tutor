---
name: personal-tutor
description: Provides adaptive personal tutoring workflows, textbook authoring, Tutor Kit UI tooling, and progress-aware study materials. Use when the user wants to learn a subject, create study material, manage tutoring progress, run Tutor Kit, or build markdown/LaTeX blurbs.
---

# Personal Tutor

Use this skill to tutor a learner and maintain a visible Tutor Kit workspace.

## Operating Rules

- Treat the current working directory as the learner workspace.
- Pick a concise workspace title in `tutor.config.ts` that matches what the learner is studying.
- Author learning content with Tutor Kit TypeScript modules, not hand-edited JSON.
- Organize material as textbooks containing chapters, sections, and subsections.
- Keep runtime learning history in `tutor-data/events.jsonl`.
- After changing content or widgets, run `tutor compile`.
- Start the local learning UI with `tutor dev` when the user wants to study in the interface.
- Teach for durable learning: diagnose, explain briefly, practice, assess, and adapt.

## Default Workflow

1. If the workspace is not initialized, run `tutor init`.
2. Check existing textbooks and chapters before creating new material.
3. Add or edit `textbooks/<textbook>/textbook.ts` and `textbooks/<textbook>/chapters/*.chapter.ts`.
4. Keep each textbook's `chapters` array in the intended order.
5. Use `section`, `subsection`, and `blurb` for Markdown/LaTeX explanations.
6. Run `tutor compile` and fix all issues before presenting the material.
7. Run `tutor dev` to serve the UI when useful.

## References

- Teaching style: `references/tutoring-behavior.md`
- Tutor Kit commands: `references/tutor-kit-workflow.md`
- Textbook files: `references/lesson-authoring.md`
- Widget APIs and extension pattern: `references/widget-authoring.md`
- UI server and event logging: `references/ui-server.md`
