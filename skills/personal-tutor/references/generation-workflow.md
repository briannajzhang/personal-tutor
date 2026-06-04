# Generation Workflow

Use this workflow when generating new curriculum from a learner request. Do not jump straight from topic request to full textbook prose in one pass.

## Default Phases

1. Interpret the learner request.
2. Infer or establish a learner profile.
3. Draft a curriculum map before writing chapters and persist it in the textbook directory.
4. Check the sequence for progression, scope, and review coverage.
5. Draft chapter specs before writing full chapter prose and persist them in the textbook directory.
6. Generate chapters one at a time.
7. Review each chapter for structure, prose quality, practice quality, and repetition, then persist review notes.
8. Revise weak chapters before moving on.
9. Run `tutor compile` and persist compile evidence.
10. Start `tutor dev` when the user wants the interface.

## Phase 1: Interpret The Request

Clarify the practical learning goal before authoring:

- What is the learner trying to become able to do?
- Is the goal conceptual understanding, interview prep, project fluency, academic support, or workplace use?
- Is the user asking for a full textbook, a short course, a cram plan, or a reference workbook?

Do not treat "learn X" as sufficient curriculum design by itself.

## Phase 2: Infer A Learner Profile

Use `learner-profiles.md` to infer a reasonable default profile when the user is vague.

At minimum, decide:

- learner level
- likely goal
- pace
- depth
- practice intensity

## Phase 3: Draft A Curriculum Map

Before writing chapter prose, sketch the plan:

- final learner outcome
- ordered modules or chapters
- prerequisite flow
- major review points
- cumulative tasks or checkpoints

The map can be brief, but it should be real. Do not skip directly to prose blocks if the sequence is still fuzzy.

Prefer concept-based chapter names in the map. Do not label chapters as `Week 1`, `Phase 2`, or similar schedule containers unless the user explicitly asked for a time-based course plan.

## Phase 4: Persist Planning Artifacts

For generated textbooks, persist lightweight authoring artifacts inside the textbook directory unless the user explicitly asks for a throwaway draft.

Recommended files:

```txt
textbooks/<textbook-id>/prompt.md
textbooks/<textbook-id>/curriculum-map.md
textbooks/<textbook-id>/chapter-specs.md
textbooks/<textbook-id>/review-notes.md
textbooks/<textbook-id>/compile-result.md
```

These files are authoring artifacts. They help future agents understand what was generated, why it was generated, how the curriculum was planned, and whether the final result passed review.

`prompt.md` should include the original user request that caused the textbook to be generated. If the request was vague, preserve it as-is. Do not rewrite it into a more specific version.

Do not treat planning as complete only because it happened in the conversation. If the generated textbook is meant to be kept, preserve the plan next to the textbook.

## Phase 5: Check Sequence And Coverage

Before chapter generation, inspect the map for:

- concepts introduced in a learner-friendly order
- enough repetition and spiral review
- enough practice to support the goal
- realistic pacing for the stated duration
- missing bridge concepts that would make later chapters feel abrupt

If the map feels like a table of contents instead of a learning path, revise it before generating chapters.

## Phase 6: Duration And Pacing

When the user gives a duration, use it to allocate scope and review, not to create shallow schedule buckets.

A 12-week course should usually expand depth, repetition, practice, and cumulative projects. It should not become 12 short paragraphs.

For time-based plans, define:
- sessions per week
- approximate session length
- chapter/module density
- review cadence
- expected practice volume

## Phase 7: Draft Chapter Specs Before Prose

Before writing full chapter prose, draft a short spec for each chapter.

Each chapter spec should include:

- learner-facing goal
- prerequisite ideas the chapter assumes
- new terms that must be defined before use
- central mechanism or mental model
- tempting wrong model or misconception to correct
- worked example plan
- guided practice plan
- independent practice plan
- cumulative review target, when relevant
- mastery check

Do not write full prose until the chapter spec makes the teaching path clear.

A chapter spec is not a summary of the chapter. It is a plan for how the learner will move from confusion to usable skill.

## Phase 8: Generate Chapters One At A Time

Do not compress the entire curriculum into one shallow pass.

For each chapter:

- state the learner-facing goal
- build the chapter to satisfy the canonical learning contract in `lesson-authoring.md`
- match prose quality expectations in `writing-style.md`
- rewrite any chapter that feels like an outline instead of a usable learning artifact

## Phase 9: Critique And Revise

After drafting each chapter, review it with the rubric in `review-rubric.md`.

Revise chapters that are:

- structurally flat
- mostly summary prose
- light on practice
- missing cumulative reuse of earlier material
- repetitive in rhetoric or chapter shape
- disconnected from the learner goal

## Phase 10: Compile Evidence

After running `tutor compile`, record the result in:

```txt
textbooks/<textbook-id>/compile-result.md
```

Include:

- command run
- whether it passed or failed
- timestamp if available
- any errors fixed
- remaining known issues, if any

Do not claim compilation succeeded unless `tutor compile` actually ran successfully.

## What To Avoid

- generating a large multi-week course as one giant prose pass
- writing chapters before checking sequence and scope
- treating a duration like "12 weeks" as enough guidance by itself
- defaulting to schedule-style labels like `Week 1` or `Phase A` when the artifact is meant to read like a textbook rather than a calendar
- producing an outline that looks like a textbook but lacks real teaching density
