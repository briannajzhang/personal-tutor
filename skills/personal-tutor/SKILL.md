---
name: personal-tutor
description: Create and continue durable Tutor Kit textbooks, lessons, practice, quizzes, review, and runnable exercises for people who want to learn or study a subject.
---

# Personal Tutor

After any needed intake or intentional inference, create durable Tutor Kit material that helps a learner understand and use a subject: rich lessons with concrete examples, active practice, useful feedback, and well-chosen visual or interactive moves. Treat richness as a creative direction, not a schema -- choose, combine, or omit teaching moves to fit the learner, subject, and requested scope. Never add a block only to satisfy a checklist; let short lessons stay short.

## Preflight

For a clearly new broad course, read `references/lesson-generation.md` before running `brief`, reading teaching samples, planning, or authoring. When the request leaves the learner's intended use or course direction unclear, ask one course-shaping question unless the learner asks the agent to choose or explicitly says not to ask. Do not treat unrelated workspace state or generic learner defaults as resolving that uncertainty.

During preflight, identify whether the intended learning outcome requires learners to recognize, compare, or diagnose something from its real-world appearance.

When it does, treat representative visual evidence as part of the instructional requirement rather than optional enrichment, and read `references/lesson-authoring.md` before authoring. Detailed choices about image type, sourcing, generation, placement, and scaffolding remain authoring decisions. Do not replace required appearance evidence with prose, diagrams, or schematic illustrations solely because they are easier to author or compile.

For continuation, focused durable material, or source-constrained work, inspect relevant state or sources when useful.

## Representation fit

Choose the teaching medium based on the move the learner needs to understand, not only on implementation convenience.

When a chapter's central idea becomes clearer by changing a variable, stepping through a process, revealing a consequence, comparing live states, manipulating a system, or testing a prediction, consider an interactive or animated representation.

When changing a variable, stepping through a process, manipulating state, revealing a consequence, or comparing live cases is central to understanding the lesson, read `references/lesson-authoring.md` before settling on a representation, even if the user did not request an interactive component.

Use the lightest representation that makes the governing relationship inspectable. Prefer built-in blocks when they teach the intended move clearly; use a custom block, authored as `component(...)`, when purpose-built interaction, animation, simulation, or learner-controlled state would teach it materially better.

## Voice

For all learner-facing prose this is the controlling writing standard: apply it instead of any generic prose style or other installed writing skill, unless the user explicitly asks for a different voice.

Write as an expert thinking alongside the learner -- warm, direct, exact -- so a chapter reads like understanding being built, not facts being summarized. The failure mode to avoid is the information dump: a tidy inventory of definitions, bullet lists, and importance claims that a learner can read start to finish without ever having to think. Cut generic statements too: a sentence that could sit unchanged in a lesson on another subject teaches nothing here.

Four goals govern every judgment call:

1. **Build intuition before formalism.** Start from something the learner can already picture or observe, move to the hidden mechanism, and earn each abstraction through use.
2. **Teach mechanisms, not labels.** Show how an idea works, what it changes or prevents, and where it breaks. Introduce every term in plain language before the lesson leans on it. Never let "important" or "powerful" stand in for an explanation.
3. **Keep the learner thinking.** Ask for a prediction before revealing a consequence. Voice the sensible objection at the moment the learner would have it. Show a plausible wrong turn found, diagnosed, and repaired.
4. **Let the subject choose the shape.** First chapters on probability, poetry, and Postgres should not look alike. Vary structure, pacing, examples, and interaction to fit this subject and this learner.

These are goals to reason from, not a checklist to satisfy. `references/quality-core.md` shows the craft in practice.

## Voice samples (required reading)

Before drafting the first chapter of any course -- or any lesson that introduces a field, gives a map before detail, or unfolds one generative model across many cases -- read [Atoms in Motion](<references/teaching-voice-samples/The Feynman Lectures on Physics Vol. I Ch. 1_ Atoms in Motion.md>) in full; for first chapters this reading is mandatory. Before any other substantial lesson, read at least one matching sample -- two when both clearly apply. Use these as voice samples, not as technical sources:

- [Prerequisites and Review Lecture A](<references/teaching-voice-samples/Feynman's Tips on Physics Ch. 1_ Prerequisites—Review Lecture A.md>): a lost learner, deciding what matters now, watching an expert detect and repair a mistaken solution.
- [Probability](<references/teaching-voice-samples/The Feynman Lectures on Physics Vol. I Ch. 6_ Probability.md>): building a precise idea from everyday judgment, defining operationally, answering objections.
- [Semiconductors](<references/teaching-voice-samples/The Feynman Lectures on Physics Vol. III Ch. 14_ Semiconductors.md>): carrying a model into devices and practice, with candor about approximations.
- [The Shape of Design, chapter 8](references/teaching-voice-samples/the_shape_of_design_chapter_8.md): designing participation, constraints, and tight feedback loops.

## Authoring workflow

Begin this workflow after preflight and any needed intake or intentional inference.

1. Use the central learner library at `~/.personal-tutor`. The wrapper selects it automatically. If `PERSONAL_TUTOR_HOME` is set, use that location instead. Use `--cwd <path>` only when the user asks for a separate workspace or wants to continue an existing local Tutor Kit workspace.
2. Run `node <skill-dir>/scripts/tutor-kit.mjs brief` when workspace inspection is useful. Its `workspace` line gives the exact library path. For continuation, also run `progress --textbook <id>`. Read only the textbook, course state, chapter source, and source notes the current publication needs.
3. Run `begin <id> [title]`. It initializes missing Tutor Kit files in the central library, creates or resumes `tutor-work/<id>`, and copies the current published source there when the textbook already exists. Capture the exact work area printed by the command.
4. Read `references/quality-core.md` and `references/authoring-quickstart.md`. Do not draft learner-facing prose before this step. Add `references/practice-and-assessment.md` when authoring quizzes, practice, assessment, or coding problems.
5. Work only inside the printed work area. Pass `--cwd <work-area>` to authoring, compile, inspect, and doctor commands. Publish the smallest useful learner-ready unit, usually one chapter, a focused revision, or a practice set. Keep future work as short entries in `course.md`.
6. Author native Tutor Kit TypeScript. Every built-in block and custom TypeScript remain available. Prefer built-in blocks when they teach the intended move clearly. Use `component(...)` when purpose-built interaction, animation, simulation, or learner-controlled state would make an important relationship materially clearer or more inspectable.
7. Run `publish <id>` against the central library. Publish compiles the staged textbook, verifies coding problems, writes `compile-result.md`, installs the source, and loads the textbook from its published location before reporting success. If verification or the final load fails, the prior source is restored and the work area remains available for repair.
8. Start the Tutor Kit app with the wrapper's `dev` command after creating the central learner library or when the user asks to study the material. Read any textbook load issues printed at startup. Fix them before continuing if no textbook can load. A mixed library can still start with warnings for the broken textbooks. Keep the app running and report the localhost URL; do not restart after every edit.

## Course state

New textbooks use one compact `course.md` for learner context, the course outcome, the course map, and the active publication contract. Update only the parts that changed. Older workspaces may contain `prompt.md`, `curriculum-map.md`, `chapter-specs.md`, or `review-notes.md`; reuse them when useful but never create new ones. Write a longer chapter spec only for a high-risk chapter: complex simulation, source-sensitive lesson, assessment with many prerequisites.

## Hard rules

- A published chapter must be imported by `textbook.ts`, appear in its ordered chapter list, and pass `doctor`.
- Do not edit published source under `textbooks/<id>` directly. Use `begin`, work in `tutor-work/<id>`, and use `publish`.
- Do not create placeholder chapter files.
- After any needed intake or intentional inference, do not answer a broad learning request with only a roadmap -- publish useful lesson material now.
- A custom component is trusted application code; it may use browser APIs and installed frontend packages. Create one only in a trusted local workspace.
- Use learner history to change the next publication, not merely to describe prior scores.
- Do not edit runtime history to fake progress.

## Reference routing

Read only what the task needs:

- `references/quality-core.md`: required -- teaching craft, voice exemplars, and quality moves.
- `references/authoring-quickstart.md`: required -- common API and command path.
- `references/lesson-generation.md`: intake questions, course seeding, continuation, and scope.
- `references/lesson-authoring.md`: representation choices, visuals, transformations, glossaries, and interactions.
- `references/practice-and-assessment.md`: quizzes, cumulative assessment, and runnable coding problems.
- `references/sources.md`: user-provided or named sources.
- `references/review-and-verification.md`: strict pedagogical audits and advanced verification.
- `references/tutor-kit-api.md`: complete API, uncommon blocks, configuration, and troubleshooting.

The normal authoring path stops after the references required for the current mode. Load other detailed references only when the requested feature or a verification failure calls for them.

## Command wrapper

Use the bundled wrapper so the authoring API, compiler, and UI stay on the same version:

```bash
node <skill-dir>/scripts/tutor-kit.mjs <command>
```

The wrapper stores every textbook in the central learner library by default. Pass `--cwd <path>` for a separate workspace.

Use a separately installed `tutor` command only on explicit user request.
