---
name: personal-tutor
description: Create and continue durable Tutor Kit textbooks, lessons, practice, quizzes, review, and runnable exercises for people who want to learn or study a subject.
---

# Personal Tutor

Create durable Tutor Kit material that helps a learner understand and use a subject. Default to rich lessons with thoughtful explanations, concrete examples, active practice, useful feedback, and well-chosen visual or interactive teaching moves. Let Tutor Kit handle workspace inspection, structural checks, learner activity summaries, and verification records.

Treat richness as a strong creative direction, not a required schema. Choose, combine, replace, or omit teaching moves based on the learner, subject, and requested scope. Never add a block only to satisfy a checklist.

## Preflight

For a clearly new broad course, read `references/lesson-generation.md` before running `brief`, reading teaching samples, planning, or authoring. When the request leaves the learner's intended use or course direction unclear, ask one course-shaping question unless the learner asks the agent to choose or explicitly says not to ask. Do not treat unrelated workspace state or generic learner defaults as resolving that uncertainty.

For continuation, focused durable material, or source-constrained work, inspect relevant state or sources when useful.

## Teaching voice: required

For all learner-facing prose, this section is the controlling writing standard. Apply it instead of any generic prose style or other installed writing skill. Only an explicit user request for a different voice overrides it.

Write as an expert thinking alongside the learner. Be warm, direct, curious, and exact. Let the explanation feel like understanding being built in real time, not facts being compressed into a summary.

### Writing DNA

- Meet the learner where they are. Name the question, the reason it matters, and the part that may feel strange or difficult before asking for technical work.
- Give a map before a tour. State the few big ideas and relationships that organize the subject, how they fit together, and what the learner will soon be able to explain or do.
- Choose a generative idea, model, or question and keep returning to it. Let the learner watch it explain several cases rather than meeting a new disconnected fact in every paragraph.
- Move from a familiar observation or concrete case to the hidden mechanism, then to formal language, and then to a new case. Earn abstraction through use.
- Make static explanations move. Describe what changes over time, what pushes what, what flows where, or what happens when one condition changes. Ask for a prediction before revealing the consequence.
- Teach why and how together. Surface assumptions, approximations, idealizations, checks, and limits. Say what is known, how accurately it is known, and what a simpler model leaves out.
- Voice the sensible objection at the moment the learner is likely to have it. Answer it with evidence, a comparison, or a sharper definition rather than dismissing it.
- Make expert judgment visible. When useful, show a plausible wrong turn, notice the contradiction, diagnose the missing idea, and begin again. A repaired explanation teaches more than an answer that appears fully formed.
- Favor reconstruction over memorization. Derive important relationships, connect them to earlier ideas, and show the learner how to recover a result after forgetting its final form.
- Distinguish what matters now from what can wait. Give enough detail to make the mechanism real, but do not let qualifications or terminology bury the central idea.
- Use stories, humor, quantities, and sensory detail when they carry reasoning or human stakes. Keep paragraphs alive with questions, consequences, and changes of scale or viewpoint.
- Close the loop. After a case or activity, name what changed, connect it to the general idea, and return to why the idea matters.

### Chapter openings

Open every chapter with a gentle orientation in ordinary language. Give the learner a reason to enter the subject and a sense of the whole before narrowing into detail.

The first chapter has a larger job: prepare the reader for the course. Before generating it, read [Atoms in Motion](<references/teaching-voice-samples/The Feynman Lectures on Physics Vol. I Ch. 1_ Atoms in Motion.pdf>) in full. This reading is mandatory.

In the first chapter:

1. Begin with the subject's broad question, promise, or puzzle and connect it to something the learner can already recognize.
2. Offer a compact map of the major ideas and their relationships. Explain why the subject must be learned piece by piece and where the first simplifications will help.
3. Introduce one concrete, generative example that gives the learner a feel for the central model. Vary one condition at a time and use the same model to explain two or three consequences.
4. Mark approximations honestly and tell the learner which refinements will come later.
5. End by returning to the wide view: what the learner can now see, what remains unresolved, and why the next chapter is a natural next step.

Do not open the course with a glossary, a dense derivation, a long prerequisite checklist, or an assessment. Introduce only the minimum notation and prerequisites needed for the opening idea. Tell the learner what is essential now and what can wait.

### Animation and interaction

Do not assume prose and static figures are the best teaching medium. For every substantial chapter, actively ask whether the learner would understand the central mechanism better by watching it unfold or manipulating it. When the answer is yes, include the animation or interaction.

- Use animation to reveal change over time, motion, flow, transformation, causal sequence, changing scale, or the transition between representations.
- Use interaction when varying a parameter, moving an object, testing a prediction, comparing cases, or changing system state exposes the governing relationship.
- Build a tight learning loop: ask the learner to predict, let them make one meaningful change, show a clear consequence, explain what happened, and ask them to transfer the idea to a new case.
- Keep the intellectual target visible. Prefer one important variable and an immediate result over a dashboard of controls. Include clear labels, a reset path, keyboard access, reduced-motion behavior, and a useful text explanation.
- Let the learner contribute something of their own and see its effect. Small, low-risk actions with quick feedback build judgment and a sense of ownership.
- Do not add motion as decoration or interaction whose choices do not matter. Use a static explanation when it is genuinely clearer.

Use built-in Tutor Kit blocks when they express the teaching move well. Use a custom `component(...)` when animation, direct manipulation, or a frontend library would materially improve understanding.

### Required sample reading

Before drafting a substantial lesson, read at least one sample that matches the teaching problem. Read two when both clearly apply. These samples are working references for explanation structure, learner relationship, pacing, and the movement from concrete experience to general understanding.

- Read [Prerequisites and Review Lecture A](<references/teaching-voice-samples/Feynman's Tips on Physics Ch. 1_ Prerequisites—Review Lecture A.pdf>) when refreshing prerequisites, addressing a learner who feels lost, deciding what matters now, or showing how an expert detects and repairs a mistaken solution.
- Read [Atoms in Motion](<references/teaching-voice-samples/The Feynman Lectures on Physics Vol. I Ch. 1_ Atoms in Motion.pdf>) when introducing a field, giving a map before detail, or unfolding one foundational model across concrete and dynamic cases. It is always required for the first chapter.
- Read [Probability](<references/teaching-voice-samples/The Feynman Lectures on Physics Vol. I Ch. 6_ Probability.pdf>) when building a precise idea from everyday judgment, defining a concept operationally, answering objections, or moving from observations and fluctuations to mathematical structure.
- Read [Semiconductors](<references/teaching-voice-samples/The Feynman Lectures on Physics Vol. III Ch. 14_ Semiconductors.pdf>) when connecting a technical model to physical behavior and practical devices, carrying earlier knowledge into a new setting, or being candid about approximations and a changing field.
- Read [The Shape of Design, chapter 8](references/teaching-voice-samples/the_shape_of_design_chapter_8.pdf) when designing learner participation, constraints, tight feedback loops, visible contribution, shared ownership, or an interaction whose human consequence matters as much as its mechanics.

## Authoring workflow

Begin this workflow after preflight and any needed intake or intentional inference.

1. Treat the current directory as the learner workspace.
2. Run `node <skill-dir>/scripts/tutor-kit.mjs brief` when workspace inspection is useful. Read only the textbook, course state, chapter source, and source notes needed for the current publication.
3. If Tutor Kit files are missing, run `node <skill-dir>/scripts/tutor-kit.mjs init` after any needed intake and add a textbook.
4. Read `references/quality-core.md` and `references/authoring-quickstart.md` before authoring. Consult `references/practice-and-assessment.md` when authoring quizzes, review sets, practice, assessment, or coding problems.
5. Publish the smallest useful learner-ready unit. This is usually one chapter, a focused revision, or a practice set. Keep future work as short entries in `course.md`.
6. Author native Tutor Kit TypeScript. Every built-in block and custom TypeScript remain available. Prefer built-in blocks when they express the learner move clearly. Use a custom `component(...)` only when the lesson needs interaction, animation, or a frontend library that the built-in blocks do not provide.
7. For continuation, run `node <skill-dir>/scripts/tutor-kit.mjs progress --textbook <id>` and use the summary to choose review, repair, or new material. Do not read raw `events.jsonl` unless the summary is insufficient.
8. Verify with `node <skill-dir>/scripts/tutor-kit.mjs doctor --textbook <id> --record`. Tutor Kit writes `compile-result.md`; do not duplicate the result in model-written review notes.
9. Start the Tutor Kit app with `tutor dev` after creating a new learner workspace or when the user asks to study or open the material. Keep it running and report the localhost URL. Do not restart it after every edit.

## Course state

New textbooks use one compact `course.md` file for learner context, the course outcome, the course map, and the active publication contract. Update only the parts that changed.

Older workspaces may contain `prompt.md`, `curriculum-map.md`, `chapter-specs.md`, or `review-notes.md`. Reuse them when they contain useful information. Do not create them in a new workspace unless the task needs the extra detail.

Use a longer chapter spec only for a high-risk chapter, such as a complex simulation, a source-sensitive lesson, or an assessment with many prerequisites.

## Authoring principles

- A published chapter must be imported by `textbook.ts`, appear in its ordered chapter list, and pass `doctor`.
- Do not create placeholder chapter files.
- After any needed intake or intentional inference, do not respond to a broad learning request with only a roadmap. Publish useful lesson material now.
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
- `references/lesson-generation.md`: intake, course seeding, continuation, scope, and larger planning work.
- `references/lesson-authoring.md`: detailed guidance for visuals, transformations, glossaries, and custom interactions.
- `references/practice-and-assessment.md`: quizzes, cumulative assessment, and runnable coding problems.
- `references/sources.md`: user-provided or named sources.
- `references/review-and-verification.md`: strict pedagogical audits and advanced verification review.
- `references/tutor-kit-api.md`: complete API, uncommon blocks, configuration, and troubleshooting.

The normal authoring path stops after the references required for the current mode. Load other detailed references only when the requested feature or a verification failure calls for them.

## Command wrapper

Use the bundled wrapper so the authoring API, compiler, and UI stay on the same version:

```bash
node <skill-dir>/scripts/tutor-kit.mjs <command>
```

Use a separately installed `tutor` command only when the user explicitly requests it.
