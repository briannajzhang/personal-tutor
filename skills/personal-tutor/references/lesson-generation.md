# Lesson Generation

Use this reference when creating a new Tutor Kit course/module, continuing an existing textbook, or adding focused durable lesson material.

## Contents

- Default output
- Generation modes
- Tailoring intake
- Learner defaults
- Curriculum maps
- Chapter specs
- Seed workflow
- Continuation workflow
- Focused material workflow
- Scope and pacing rules

## Default Output

For new broad courses, resolve tailoring intake before applying the default output workflow below.

The default deliverable is maintained Tutor Kit source, not a conversational explanation.

For broad learning requests, publish a small verified slice now and leave the rest as a planned backlog:

- Create or continue one textbook for the requested subject.
- Plan the whole course or module arc briefly in `course.md`.
- Publish the first or next 1-2 learner-ready chapters.
- Keep learner context, the course map, and the active publication contract concise in `course.md`.
- Let `doctor --record` write `compile-result.md`.
- When sources are provided, persist `materials-index.md` and `source-notes.md`.
- Do not create placeholder future `.chapter.ts` files.

For narrow requests, add or revise durable material inside the closest existing textbook: a section, quiz, exercise set, review set, coding problem, practice-test chapter, or focused chapter.

## Generation Modes

Use seed mode when no suitable textbook exists.

Use continuation mode when a relevant textbook already exists.

Use focused material mode when the user asks for a specific durable artifact, such as:

- "add practice questions for joins"
- "make a review quiz"
- "add coding exercises"
- "write a lesson on indexes"
- "create a practice-test chapter"
- "improve chapter 2"

If the user asks for a complete textbook or large batch, still publish incrementally in verified batches. A plan can be broad; the current publication should be learner-ready.

## Tailoring intake

Use `brief` when workspace state may clarify whether a request continues existing work, targets focused material, depends on existing sources, or already has a relevant course. For an unrelated new broad course, do not let `brief`, existing workspace state, or generic defaults silently determine the learner's intent.

Read the workspace-level `memory.md` before resolving intake. Use relevant saved preferences for choices such as pace and practice. The current request and the current course state take priority. Do not let saved context from another subject decide the learner's current goal, intended use, or course direction. Copy only context that is relevant to this course into `course.md`.

Ask at most one intake question, and only when its answer would materially change the course or initial publication. Infer the remaining profile from the request and record it briefly in `course.md`.

If sources are involved, inspect existing source artifacts before intake and ask only about unresolved choices that affect generation.

When a broad new course names only a subject or leaves the learner's intended use unclear, treat learner intent as usually unresolved enough to ask one course-shaping question: a generic beginner path may be possible, but it can still produce the wrong first publication. Infer instead when the request already implies a useful direction, the learner asks the agent to choose, explicitly says not to ask, or the likely answer would not materially change the initial publication.

When one question is needed for a new course, choose the highest value unresolved question from:

- What should you be able to do with this subject?
- What background should the material assume?
- Do you want practical fluency, conceptual depth, interview/exam prep, academic support, or project-building?
- Should the pace feel gentle, normal, or intensive?
- Which practice mix do you want: quizzes, written exercises, runnable/checkable tasks, projects, or a blend?
- Is there a time horizon or chapter size to target?

For continuation, use `tutor progress --textbook <id>` first. Ask one question only when learner activity and existing course state do not resolve choices such as:

- Should the next publication introduce new material, add practice, add review, or repair a weak chapter?
- What felt too easy, too hard, or unclear in the existing material?
- Do you want more conceptual checks, runnable practice, cumulative review, or project-style work next?
- Is there a specific chapter, skill, or upcoming use case to prioritize?

For focused quizzes/practice, ask only what is missing:

- target concept or skill
- difficulty
- number of questions/tasks
- desired format and feedback style

## Learner Defaults

After any needed intake, apply relevant saved preferences before using the defaults below. Infer any remaining profile fields instead of asking for every preference.

Minimum profile fields:

- `learnerLevel`: beginner, intermediate, or advanced
- `goal`: practical fluency, interview prep, academic support, workplace use, project building, or conceptual understanding
- `depth`: overview, standard, or deep
- `pace`: gentle, normal, or intensive
- `practiceIntensity`: light, medium, or heavy

After deciding inference is appropriate for a broad prompt such as "Teach me SQL" or "I want to learn statistics", default to:

- beginner-friendly scaffolding
- practical fluency
- deep mechanism explanation
- normal pace
- heavy practice

Beginner does not mean shallow. It means more explicit definitions, smaller early examples, more misconception checks, and more guided practice before independent practice.

If the user asks for a quick overview, cheat sheet, cram plan, or lightweight introduction, narrow the scope and reduce practice density explicitly.

## Curriculum Maps

Keep the course map in `course.md`. Older workspaces may continue using `curriculum-map.md`.

A good curriculum map includes:

- original user request or continuation goal
- inferred learner profile
- scope type: complete beginner textbook, foundations module, focused skill module, cram guide, reference workbook, or practice workbook
- final learner outcome
- ordered chapters/modules
- prerequisite flow
- source basis when sources affect scope, order, examples, or practice
- planned review points
- cumulative tasks or checkpoints
- `Published now` and `Planned next` markers
- deferred topics when scope is intentionally narrow

Use concept-based chapter names. Avoid schedule labels such as `Week 1` unless the user explicitly asked for a calendar.

For broad requests, either cover the expected beginner core scope in the plan or clearly label the artifact as a scoped module and record what is deferred.

## Chapter specs

For an ordinary chapter, use the short active publication fields in `course.md`: outcome, ideas worth developing, possible worked examples, likely learner difficulty, and practice or feedback opportunities. When a broad or concept-dense chapter needs a teaching sketch, keep it informal and short: central mechanism, terms that need a clear introduction before repeated use, what can wait, and optionally one likely learner action.

Write a longer `chapter-specs.md` entry only when the chapter has unusual prerequisite, source, assessment, visual, or interaction risk.

When a longer spec is warranted, use this format for the risky parts rather than filling every field mechanically:

```md
# Chapter Spec: <chapter title>

## Learner Outcome
After this chapter, the learner should be able to...

## Prerequisites
- ...

## Terms To Teach In Prose
- term: plain-language definition

These are terms the chapter must introduce clearly in the lesson flow. Do not treat this list as a glossary plan by default.

## Central Mechanism Or Mental Model
...

## Tempting Wrong Model Or Trap
Wrong model:
...

Better model:
...

## Teaching Path
1. Start from...
2. Define...
3. Show...
4. Check...
5. Practice...
6. Review...

## Scope And Depth Plan
Central mechanisms this chapter promises to teach:
- mechanism:
  - explanation:
  - inspectable example:
  - learner action:
  - local check:

Secondary mechanisms introduced but deferred:
- ...

## Worked Example Plan
- input, context, or starting state:
- operation, reasoning step, or action:
- visible result, output, or conclusion:
- explanation of why that result follows:
- representation: prose plus artifact, table, code block, diagram, image scaffold, transformation, quiz, or practice, with the learner-inspection reason; decide whether the learner is tracing one case, comparing several cases, classifying examples, retrieving facts, or practicing a decision, and choose transformation only when co-locating the starting artifact, reasoning/action, and result makes one visible thread clearer
- visual representation, if useful: what should be grounded or inspected, which of `image(...)`, `diagram(...)`, `chart(...)`, `transformation(...)`, or none fits, and why; for `image(...)`, name what the learner should notice, what learner action the scaffold should prompt, and whether a caption, inspection list, companion diagram, cue-to-meaning table, or transformation is needed; use transformation with images only when visible cues are being mapped to reasoning or outcomes

## Practice Plan
- guided practice:
- independent practice:
- retrieval or self-test:
- cumulative practice, if relevant:

## Practice Readiness
For each independent task, list the required concepts and where each was taught or scaffolded.

## Check And Review Plan
- local checks:
- chapter review targets:
- quiz, concrete task, coding problem, or project format:
- final review section role:

## Blocks To Author
- `p`:
- worked examples and artifacts: choose prose, table, code block, diagram, image scaffold, transformation, quiz, or practice based on the learner move; prefer ordinary blocks for comparison or classification coverage, and use transformation only when the combined start/action/result view improves inspectability for one visible reasoning thread
- `image` / `diagram` / `chart`: visual grounding or inspection purpose, if a visual block is useful; note whether the visual is for appearance/context/evidence, structure/flow, or numeric comparison, and note any scaffold needed to make image details readable
- `quiz`: learner move, question format, and review target
- `codingProblem`:
- `glossary`: omit unless there is a later-retrieval reason; if included, name the term cluster and retrieval purpose

## Mastery Check
The chapter is complete only if the learner can...
```

Reject vague specs before writing prose. A spec should instantiate examples and practice, not merely promise to include them.

## Seed Workflow

1. Initialize the workspace if needed.
2. Run `tutor list textbooks` and inspect existing candidates.
3. Add one textbook for the requested subject if no suitable textbook exists.
4. If sources are provided, create or update `materials-index.md` and `source-notes.md`.
5. Record the learner, outcome, short course map, and active publication contract in `course.md`.
6. Add a longer spec only when the publication has unusual risk.
7. Author complete learner-ready chapters.
8. Add purposeful practice, quizzes, review, and coding problems where they fit the learner outcome.
9. Run the acceptance gate and revise blocking issues.
10. Run `doctor --textbook <id> --record`.
11. Update the next publication entry in `course.md` only if the plan changed.

## Continuation Workflow

1. Run `tutor brief --textbook <id>` and `tutor progress --textbook <id>`, then inspect only the course and chapter files needed for the decision.
2. Choose the smallest useful publication:
   - improve the active chapter
   - add focused practice/review material
   - publish the next planned chapter
   - publish a dedicated practice-test chapter
3. Update the active publication fields in `course.md`. Use a longer chapter spec only when risk warrants it.
4. Publish only learner-ready material.
5. Run review and verification.
6. Let `doctor --record` write verification evidence, then update the next course-map item if needed.

## Focused Material Workflow

For a request to add practice questions, quizzes, exercises, or coding practice:

1. Inspect the target chapter or nearest relevant chapter.
2. Identify the learner outcome and concepts already taught.
3. Add material where it fits the teaching sequence.
4. Choose the question format by the learner move. Consult `practice-and-assessment.md` for the relevant quiz-design guidance.
5. Add concrete tasks or coding problems when the learner must produce, debug, design, transform, or implement.
6. Verify that practice does not require untaught moves.
7. Run `doctor --textbook <id> --record`.

## Scope And Pacing Rules

- Do not compress an entire broad subject into shallow chapters.
- Let chapter complexity determine explanation, examples, practice, and check density.
- Split overloaded chapters before authoring.
- Do not force every chapter into the same section shape.
- Plan cumulative review across longer textbooks.
- A longer duration should increase structure, practice, review, and cumulative work. It should not turn the textbook into a list of short summaries.
