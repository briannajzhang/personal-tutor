# Generation Workflow

Use this workflow when generating new curriculum from a learner request. Default to incremental publishing: plan the course arc, publish 1-2 learner-ready chapters, and leave the rest as a backlog until requested.

## Contents

- Default phases
- Request interpretation and learner profile
- Curriculum map and persisted planning artifacts
- Sequence, duration, and pacing checks
- Chapter specs, checks, and practice planning
- Authoring validation vs pedagogical audit
- Chapter generation, critique, revision, and compile evidence
- Avoid list

## Default Phases

1. Interpret the learner request.
2. Infer or establish a learner profile.
3. Draft a curriculum map for the full course arc and persist it in the textbook directory.
4. Mark chapters as `Published now` or `Planned next`.
5. Draft chapter specs only for chapters being published now, usually 1-2 chapters.
6. In each active spec, plan assessment: local checks, chapter review, cumulative review targets, and the best block type for each.
7. Generate published chapters one at a time.
8. Run concise authoring validation, including the generated textbook acceptance gate, then persist review notes.
9. Revise weak chapters or blocking acceptance-gate failures before publishing more.
10. Run `tutor compile` and persist compile evidence.
11. Run `tutor verify coding-problems --textbook <textbook-id>` when the textbook contains coding problems and persist verification evidence.
12. Start `tutor dev` when the user wants the interface.

## Phase 1: Interpret The Request

Clarify the practical learning goal before authoring:

- What is the learner trying to become able to do?
- Is the goal conceptual understanding, interview prep, project fluency, academic support, workplace use, or another concrete use case?
- Is the user asking for a seed course, continuation of an existing course, full textbook, cram plan, or reference workbook?

Do not treat "learn X" as a request to publish an entire textbook in one turn.

## Phase 2: Infer A Learner Profile

Use `learner-profiles.md` to infer a reasonable default profile when the user is vague.

At minimum, decide:

- learner level
- likely goal
- pace
- depth
- practice intensity

Before generating chapters, check that the inferred learner profile matches `learner-profiles.md`. If the user gave only a broad vague topic, do not silently downgrade depth, practice intensity, or review density.

## Phase 3: Draft A Curriculum Map

Before writing chapter prose, sketch the plan:

- final learner outcome
- ordered modules or chapters
- prerequisite flow
- major review points
- cumulative tasks or checkpoints
- planned cumulative practice-test chapters, when mixed cumulative assessment is warranted

The map can be brief, but it should be real. Do not skip directly to prose blocks if the sequence is still fuzzy.

Prefer concept-based chapter names in the map. Do not label chapters as `Week 1`, `Phase 2`, or similar schedule containers unless the user explicitly asked for a time-based course plan.

The curriculum map must declare a scope type:

- complete beginner textbook
- foundations module
- focused skill module
- cram guide
- reference workbook
- practice workbook

For a broad vague prompt, default to `complete beginner textbook` unless the user asks for a short, compact, focused, or cram-style artifact.

If choosing a narrower scope, explicitly label the textbook title or description as a scoped module and list deferred topics. Do not reduce broad-topic scope merely to make generation, compile, or verification easier.

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
- sensible placement for cumulative review or practice tests

Audit the requirements of each chapter's independent practice, mastery check, and runnable problems against the curriculum sequence. Move the task, move the prerequisite concept, or add explicit teaching and guided practice before prose generation.

Audit scope against intended depth. Scope should be small enough to teach the central mechanisms with explanation, inspectable examples, learner action, and useful checks. Let chapter complexity determine explanation, example, practice, and check density. Do not force simpler and more complex chapters into uniform length or structure. Split or narrow overloaded chapters before authoring.

If the map feels like a table of contents instead of a learning path, revise it before generating chapters.

## Phase 6: Duration And Pacing

When the user gives a duration, use it to allocate scope and review, not to create shallow schedule buckets.

A longer course should usually expand depth, repetition, practice, and cumulative work. It should not become a list of short summaries.

For time-based plans, define:

- sessions per week
- approximate session length
- chapter/module density
- review cadence
- expected practice volume

## Phase 7: Draft Specs For Published Chapters

Before writing full chapter prose, draft a short spec for each chapter being published now. Future chapters can stay as backlog notes in the curriculum map until the user asks to continue.

Each chapter spec should include:

- learner-facing goal
- prerequisite ideas the chapter assumes
- new terms that must be defined before use
- central mechanism or mental model
- tempting wrong model or misconception to correct
- worked example plan with input/context, operation, visible result, and explanation
- guided practice plan
- independent practice plan
- assessment plan
- cumulative review target, when relevant
- mastery check

For chapters being published now, reject incomplete or compressed specs before prose generation. Every non-trivial active spec must include all required fields from `chapter-specs.md`, including the scope and depth plan, practice flow plan, and practice readiness. Do not treat a short paragraph that mentions several fields as a substitute for the required planning decisions.

Generated chapters must use semantic roles:

- `chapter({ role: "instruction" })` for chapters that teach new central mechanisms
- `chapter({ role: "cumulative-checkpoint" })` for dedicated mixed cumulative assessment
- section roles `instruction`, `practice`, `review`, and `assessment` according to their teaching purpose

The assessment plan should identify:

- local checks near new concepts, worked examples, misconceptions, or boundary cases
- end-of-chapter review targets
- ideas that should reappear in later mixed review
- whether each check belongs as a quiz, concrete task, written prompt, project task, coding problem, or another practice block

Do not write full prose until the chapter spec makes the teaching path clear.

A chapter spec is not a summary of the chapter. It is a plan for how the learner will move from confusion to usable skill.

## Phase 8: Check And Practice Planning

Plan assessment before writing final chapter prose. Do not add quizzes or practice blocks as decorative afterthoughts.

A check is any moment where the learner has to show understanding. Some checks should be `quiz(...)` blocks. Others should be concrete practice tasks, written prompts, projects, or `codingProblem(...)` blocks.

Use `quiz(...)` for fast conceptual diagnosis, prediction, classification, misconception checks, retrieval, chapter review, and local scoring.

Use concrete practice blocks when the learner needs to produce, debug, design, solve, explain, or revise a larger artifact.

Do not assume one assessment format covers every need. When a likely misconception needs fast diagnosis, plan a local check before or near larger practice.

Use quiz modes, tags, and difficulty according to `lesson-authoring.md`.

## Authoring Validation Vs Pedagogical Audit

During ordinary generation, run authoring validation. Authoring validation is required and checks whether the textbook is safe to finalize: scope honesty, coverage claim honesty, runnable practice, prerequisite safety, transformation use/coherence, compile status, and coding verification.

A pedagogical audit is deeper and optional. It evaluates whether the textbook is genuinely strong for learners: explanation depth, pacing, example quality, quiz quality, repetition, and learner experience. Do not perform a full pedagogical audit during every generation unless the user requests it.

Do not confuse passing authoring validation with being a strong textbook. Passing validation means the textbook is usable and internally consistent; it does not mean the textbook is pedagogically excellent.

## Phase 9: Publish Chapters One At A Time

Do not compress the entire curriculum into one shallow pass.

For each chapter being published:

- state the learner-facing goal
- build the chapter to satisfy the canonical learning contract in `lesson-authoring.md`
- use quiz blocks according to `lesson-authoring.md` for concept checks, chapter reviews, and practice-test chapters
- match prose quality expectations in `writing-style.md`
- rewrite any chapter that feels like an outline instead of a usable learning artifact

## Phase 10: Authoring Validation And Revision

After drafting chapters, review them with the authoring validation mode in `review-rubric.md`.

Compare the authored chapter against its spec's scope and depth, practice flow, practice readiness, worked-example, and assessment plans. Confirm that actual chapter and section roles match the planned teaching purpose. Reject chapters whose final tasks require untaught moves, whose promised inspectable examples were reduced to prose descriptions, or whose activity transitions are unclear.

Revise chapters that are:

- structurally flat
- mostly summary prose
- light on practice
- missing inspectable worked examples for major mechanisms
- missing useful checks near major new ideas
- missing an end-of-chapter review or mastery check
- using quiz modes incorrectly
- using quizzes where the learner should produce, debug, design, or revise something
- missing cumulative reuse of earlier material
- repetitive in rhetoric or chapter shape
- compressed into the same structural budget as materially simpler chapters
- repeating a uniform structure that contradicts materially different scope and depth plans
- disconnected from the learner goal

Persist concise review notes focused on acceptance-gate results, blocking issues, revisions applied, remaining known issues, and targeted chapter notes only for chapters that required revision or still have risks. Do not produce full per-chapter score tables during ordinary generation unless the user asks for a pedagogical audit.

## Phase 11: Generated Textbook Acceptance Gate

Before recording final compile evidence, run this blocking gate. If any item fails, revise the textbook before finalizing.

### Scope Honesty

If the original request is broad, such as "Teach me SQL", "Teach me statistics", or "Teach me databases", the generated artifact must either:

- cover the expected beginner core scope for that subject, or
- explicitly label itself as a scoped module, such as "SQL Querying Foundations, Part 1"

If the textbook is a scoped module, record:

- what scope it covers
- what major topics it defers
- why narrowing is appropriate for this request

Do not silently narrow a broad request and then review it as a complete textbook.

### Coverage Claim Honesty

Do not claim that the textbook or chapter teaches a mechanism unless the authored material prepares the learner to use it.

A mechanism counts as taught only if it is:

* defined or framed plainly
* demonstrated in a concrete example or transformation
* checked, used in guided practice, or deliberately scaffolded before independent use

If a topic is only named, previewed, used in a review question, or used inside an answer explanation, label it as introduced or previewed, not taught.

If the curriculum map claims the textbook covers a mechanism, the chapter sequence should actually teach it. Otherwise, revise the curriculum claim, defer the topic explicitly, or add teaching material before requiring it.

### Runnable Practice

For practical technical topics where learners should produce executable or checkable artifacts, include runnable practice when appropriate.

Missing direct runtime support is not an acceptable reason to downgrade to prose-only practice. Use an available harness when execution would improve feedback.

If runnable practice is omitted, record the user-facing reason. Convenience, missing target runtime, or avoiding verification work are not valid reasons.

### Prerequisite Safety

Every independent task, coding problem, project, practice test, and mastery check must use only concepts, syntax, mechanisms, and edge cases that were:

- taught earlier in the chapter
- taught in a prerequisite chapter
- deliberately scaffolded inside the task

Check the prompt, starter files, tests, reference solution, review focus, and answer explanations.

### Transformation Use And Coherence

For each central worked example, check whether it has:

- concrete input or starting context
- a specific operation, rule, reasoning move, or action
- a visible result, output, conclusion, or changed artifact
- learner benefit from inspecting the relationship

If yes, use `transformation(...)` unless ordinary semantic blocks are clearer.

If no `transformation(...)` blocks are used in a generated textbook with data, code, math, revision, or evidence-to-claim examples, review notes must explicitly justify why none of the worked examples were transformation-suitable.

"Not applicable" is not a valid review result merely because no transformations were authored.

Every `transformation(...)` block must show a coherent input → move → result relationship. If the explanation relies on a baseline, intermediate result, temporary state, rejected input, or comparison output, that artifact must be visible. A transformation does not count as learner practice.

### Review Honesty

Review notes must begin with the acceptance gate result.

Do not assign 5/5 or write "Known Issues: None" when there are scope limitations, prerequisite violations, missing runnable practice, missed transformation-suitable examples, unsupported examples, weak distractors, or unresolved readability issues.

Review notes must record:

- blocking issues found
- revisions applied
- remaining known issues

If no revisions were applied, explain why the first draft passed every blocking gate.

## Phase 12: Compile Evidence

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

Record whether the command was a targeted compile or a full workspace compile. A targeted compile proves the selected textbook is usable in isolation. Only a successful full `tutor compile` proves the whole workspace is healthy.

For generated coding problems, also record:

- command run, normally `tutor verify coding-problems --textbook <textbook-id>`
- starter failure for the intended assertion reason
- reference-solution success
- setup or runtime failures separately from assertion failures

## What To Avoid

- generating a large multi-week course as one giant prose pass
- writing chapters before checking sequence and scope
- treating a duration like "12 weeks" as enough guidance by itself
- defaulting to schedule-style labels like `Week 1` or `Phase A` when the artifact is meant to read like a textbook rather than a calendar
- producing an outline that looks like a textbook but lacks real teaching density
- adding quizzes only at the end instead of placing local checks near the ideas they assess
