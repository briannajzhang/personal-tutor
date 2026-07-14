---
name: personal-tutor
description: Create and continue durable Tutor Kit textbooks, lessons, practice, quizzes, review, and runnable exercises for people who want to learn or study a subject.
---

# Personal Tutor

Create durable Tutor Kit material that helps a learner understand and use a subject. Default to rich lessons with thoughtful explanations, concrete examples, active practice, useful feedback, and well-chosen visual or interactive teaching moves. Let Tutor Kit handle workspace inspection, structural checks, learner activity summaries, and verification records.

Treat richness as a strong creative direction, not a required schema. Choose, combine, replace, or omit teaching moves based on the learner, subject, and requested scope. Never add a block only to satisfy a checklist.

## Default workflow

1. Treat the current directory as the learner workspace.
2. Run `node <skill-dir>/scripts/tutor-kit.mjs brief`. This is the default inspection step. Read only the textbook, course state, chapter source, and source notes needed for the current publication.
3. If Tutor Kit files are missing, run `node <skill-dir>/scripts/tutor-kit.mjs init` and add a textbook.
4. Read `references/quality-core.md` and `references/authoring-quickstart.md` before authoring.
5. Ask at most one intake question, and only when its answer would materially change the course. Otherwise infer sensible defaults and record them briefly in `course.md`.
6. Publish the smallest useful learner-ready unit. This is usually one chapter, a focused revision, or a practice set. Keep future work as short entries in `course.md`.
7. Author native Tutor Kit TypeScript. Every built-in block and custom TypeScript remain available. Prefer built in blocks when they express the learner move clearly. Use a custom `component(...)` only when the lesson needs interaction, animation, or a frontend library that the built in blocks do not provide.
8. For continuation, run `node <skill-dir>/scripts/tutor-kit.mjs progress --textbook <id>` and use the summary to choose review, repair, or new material. Do not read raw `events.jsonl` unless the summary is insufficient.
9. Verify with `node <skill-dir>/scripts/tutor-kit.mjs doctor --textbook <id> --record`. Tutor Kit writes `compile-result.md`; do not duplicate the result in model-written review notes.
10. Start the Tutor Kit app with `tutor dev` after creating a new learner workspace or when the user asks to study or open the material. Keep it running and report the localhost URL. Do not restart it after every edit.

## Course state

New textbooks use one compact `course.md` file for learner context, the course outcome, the course map, and the active publication contract. Update only the parts that changed.

Older workspaces may contain `prompt.md`, `curriculum-map.md`, `chapter-specs.md`, or `review-notes.md`. Reuse them when they contain useful information. Do not create them in a new workspace unless the task needs the extra detail.

Use a longer chapter spec only for a high-risk chapter, such as a complex simulation, a source-sensitive lesson, or an assessment with many prerequisites.

## Authoring principles

- A published chapter must be imported by `textbook.ts`, appear in its ordered chapter list, and pass `doctor`.
- Do not create placeholder chapter files.
- Do not respond to a broad learning request with only a roadmap. Publish useful lesson material now.
- Aim for enough depth that the learner can see how the central idea works, inspect it in concrete cases, try it, and learn from the result.
- Enrich a lesson with contrasting examples, misconceptions, visuals, simulations, retrieval, projects, or alternate explanations when they improve learning.
- Prefer meaningful learner choices and visible consequences over passive reading when interaction fits the subject.
- A custom component is trusted application code. It may use browser APIs and installed frontend packages. Create one only in a trusted local workspace.
- Use runnable practice when execution gives the learner useful feedback.
- Let short lessons stay short when that best serves the request. Do not require a block count, section pattern, quiz, exercise type, visual, or review format.
- Use learner history to change the next publication, not merely to describe prior scores.
- Do not edit runtime history to fake progress.

## Reference routing

Read only references that apply to the current task:

- `references/quality-core.md`: required compact prompts for rich teaching.
- `references/authoring-quickstart.md`: required common API and command path.
- `references/lesson-generation.md`: course seeding, continuation, scope, and larger planning work.
- `references/lesson-authoring.md`: detailed guidance for visuals, transformations, glossaries, and custom interactions.
- `references/practice-and-assessment.md`: quizzes, cumulative assessment, and runnable coding problems.
- `references/sources.md`: user-provided or named sources.
- `references/review-and-verification.md`: strict pedagogical audits and advanced verification review.
- `references/tutor-kit-api.md`: complete API, uncommon blocks, configuration, and troubleshooting.

The normal path stops after the two required references. Load the detailed references only when the requested feature or a verification failure calls for them.

## Command wrapper

Use the bundled wrapper so the authoring API, compiler, and UI stay on the same version:

```bash
node <skill-dir>/scripts/tutor-kit.mjs <command>
```

Use a separately installed `tutor` command only when the user explicitly requests it.
