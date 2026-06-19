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

The default deliverable is maintained Tutor Kit source, not a conversational explanation.

For broad learning requests, publish a small verified slice now and leave the rest as a planned backlog:

- Create or continue one textbook for the requested subject.
- Plan the whole course/module arc in `curriculum-map.md`.
- Publish the first or next 1-2 learner-ready chapters.
- Persist `prompt.md`, `chapter-specs.md`, `review-notes.md`, and `compile-result.md`.
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

## Tailoring Intake

Inspect the workspace first, then ask a concise intake before authoring. Ask only questions whose answers will change the lesson design, practice, difficulty, or sequencing.

If sources are involved, inspect existing source artifacts before intake and ask only unresolved choices that affect generation.

For a new course/module, ask 3-5 of:

- What should you be able to do with this subject?
- What background should the material assume?
- Do you want practical fluency, conceptual depth, interview/exam prep, academic support, or project-building?
- Should the pace feel gentle, normal, or intensive?
- Which practice mix do you want: quizzes, written exercises, runnable/checkable tasks, projects, or a blend?
- Is there a time horizon or chapter size to target?

For continuation, ask 2-4 of:

- Should the next publication introduce new material, add practice, add review, or repair a weak chapter?
- What felt too easy, too hard, or unclear in the existing material?
- Do you want more conceptual checks, runnable practice, cumulative review, or project-style work next?
- Is there a specific chapter, skill, or upcoming use case to prioritize?

For focused quizzes/practice, ask only what is missing:

- target concept or skill
- difficulty
- number of questions/tasks
- desired format and feedback style

If the user declines intake or asks the agent to choose, use the defaults below and record them in `prompt.md` or `curriculum-map.md`.

## Learner Defaults

After intake, infer any remaining profile fields instead of asking for every preference.

Minimum profile fields:

- `learnerLevel`: beginner, intermediate, or advanced
- `goal`: practical fluency, interview prep, academic support, workplace use, project building, or conceptual understanding
- `depth`: overview, standard, or deep
- `pace`: gentle, normal, or intensive
- `practiceIntensity`: light, medium, or heavy

For broad prompts such as "Teach me SQL" or "I want to learn statistics", default to:

- beginner-friendly scaffolding
- practical fluency
- deep mechanism explanation
- normal pace
- heavy practice

Beginner does not mean shallow. It means more explicit definitions, smaller early examples, more misconception checks, and more guided practice before independent practice.

If the user asks for a quick overview, cheat sheet, cram plan, or lightweight introduction, narrow the scope and reduce practice density explicitly.

## Curriculum Maps

Before writing chapter prose, create or update `curriculum-map.md`.

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

## Chapter Specs

Write chapter specs before authoring new or substantially revised chapters. Store them in `chapter-specs.md`.

Use this format for each active chapter:

```md
# Chapter Spec: <chapter title>

## Learner Outcome
After this chapter, the learner should be able to...

## Prerequisites
- ...

## New Terms To Define
- term: plain-language definition

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
- representation: `transformation(...)` or ordinary semantic blocks, with reason

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
- `transformation`:
- `balancedQuiz`:
- `codingProblem`:

## Mastery Check
The chapter is complete only if the learner can...
```

Reject vague specs before writing prose. A spec should instantiate examples and practice, not merely promise to include them.

## Seed Workflow

1. Initialize the workspace if needed.
2. Run `tutor list textbooks` and inspect existing candidates.
3. Add one textbook for the requested subject if no suitable textbook exists.
4. If sources are provided, create or update `materials-index.md` and `source-notes.md`.
5. Save the original request in `prompt.md`.
6. Draft `curriculum-map.md`.
7. Draft specs only for chapters being published now, usually 1-2 chapters.
8. Author complete learner-ready chapters.
9. Add purposeful practice, quizzes, review, and coding problems where they fit the learner outcome.
10. Run the acceptance gate and revise blocking issues.
11. Run compile/doctor and coding-problem verification when present.
12. Record evidence and next-publication notes.

## Continuation Workflow

1. Inspect `tutor.config.ts`, the relevant `textbook.ts`, existing chapter files, planning artifacts, source artifacts when present, and recent events if they inform review needs.
2. Choose the smallest useful publication:
   - improve the active chapter
   - add focused practice/review material
   - publish the next planned chapter
   - publish a dedicated practice-test chapter
3. Update `curriculum-map.md` and `chapter-specs.md` before authoring.
4. Publish only learner-ready material.
5. Run review and verification.
6. Record what changed and what should be published next.

## Focused Material Workflow

For a request to add practice questions, quizzes, exercises, or coding practice:

1. Inspect the target chapter or nearest relevant chapter.
2. Identify the learner outcome and concepts already taught.
3. Add material where it fits the teaching sequence.
4. Use `balancedQuiz(...)` for generated multiple-choice checks unless answer order matters.
5. Add concrete tasks or coding problems when the learner must produce, debug, design, transform, or implement.
6. Verify that practice does not require untaught moves.
7. Compile and record evidence.

## Scope And Pacing Rules

- Do not compress an entire broad subject into shallow chapters.
- Let chapter complexity determine explanation, examples, practice, and check density.
- Split overloaded chapters before authoring.
- Do not force every chapter into the same section shape.
- Plan cumulative review across longer textbooks.
- A longer duration should increase structure, practice, review, and cumulative work. It should not turn the textbook into a list of short summaries.
