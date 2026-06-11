# Textbook Authoring

Textbooks are TypeScript modules named `textbooks/<textbook-id>/textbook.ts`.
Chapters are usually separate modules in `textbooks/<textbook-id>/chapters/*.chapter.ts`.

## Contents

- Textbook and chapter examples
- Authoring rules
- Canonical learning contract
- Chapter structure and required anatomy
- Teaching readiness, practice taxonomy, and quiz usage
- Quantitative guidance and recommended shapes
- Anti-patterns and final quality check

## Textbook Example

```ts
import { textbook } from "tutor-kit";
import foundations from "./chapters/foundations.chapter.js";

export default textbook({
  id: "mlx",
  title: "MLX",
  description: "Learning Apple's MLX framework.",
  chapters: [foundations]
});
```

## Chapter Example

```ts
import { callout, chapter, codeBlock, codingProblem, list, p, projectFiles, quiz, section, subsection } from "tutor-kit";

const project = projectFiles(import.meta.url, "./problems/filter-rows");

export default chapter({
  id: "filtering-rows",
  title: "Chapter 1: Filtering Rows With Boolean Masks",
  sections: [
    section({
      id: "core-idea",
      title: "Choosing Rows Deliberately",
      blocks: [
        p({
          id: "filtering-problem",
          body: "Beginners often know the rows they want in plain English before they know how to express that choice in code. With pandas, the usual move is to build a Boolean mask: one expression that marks each row as keep or discard."
        }),
        p({
          id: "filtering-mechanism",
          body: "A Boolean mask is a Series of `True` and `False` values aligned to the DataFrame's index. When you write `df[mask]`, pandas keeps the rows where the mask is `True`. The important part is alignment: the mask must describe the same rows as the DataFrame you are filtering."
        }),
        codeBlock({
          id: "filtering-example",
          language: "python",
          code: "recent = df[\"year\"] >= 2020\\nresult = df[recent]"
        }),
        quiz({
          id: "mask-check",
          title: "Check: Boolean Masks",
          mode: "check",
          questions: [
            {
              id: "kept-rows",
              prompt: "When pandas evaluates `df[mask]`, which rows are kept?",
              choices: [
                { id: "a", body: "Rows where the mask value is `True`." },
                { id: "b", body: "Rows where the mask value is `False`." },
                { id: "c", body: "Only the first row of the DataFrame." },
                { id: "d", body: "Every row, because the mask only affects columns." }
              ],
              answer: "a",
              explanation: "`df[mask]` keeps the rows where the aligned mask value is `True`. The mask is a row-selection rule.",
              tags: ["filtering", "boolean-mask"],
              difficulty: "easy"
            }
          ]
        }),
        callout({
          id: "filtering-trap",
          tone: "caution",
          title: "Common trap",
          body: "Using Python's `and` or `or` with pandas comparisons usually fails. Combine pandas conditions with `&` and `|`, and wrap each comparison in parentheses."
        }),
        list({
          id: "guided-practice",
          items: [
            "Write a mask that keeps rows where `score` is at least `80`.",
            "Predict whether `df[df[\"city\"] == \"Paris\"]` keeps or removes non-Paris rows.",
            "Rewrite `df[df[\"year\"] >= 2020 and df[\"passed\"]]` so it uses pandas operators correctly."
          ]
        })
      ],
      subsections: [
        subsection({
          id: "worked-example",
          title: "Walking Through One Filter",
          blocks: [
            p({
              id: "worked-example-setup",
              body: "Suppose a table has columns `name`, `year`, and `passed`, and you want only rows where `year >= 2020` and `passed` is true. Build each condition first, then combine them into one mask."
            }),
            codeBlock({
              id: "worked-example-code",
              language: "python",
              code: "recent = df[\"year\"] >= 2020\\npassed = df[\"passed\"]\\nresult = df[recent & passed]"
            }),
            list({
              id: "retrieval-checks",
              items: [
                "Name the expression that creates the first mask.",
                "Explain why the final line uses `&` instead of `and`.",
                "Predict what changes if `recent | passed` is used instead."
              ]
            })
          ]
        })
      ]
    }),
    section({
      id: "independent-practice",
      title: "Practice Filtering Real Data",
      blocks: [
        codingProblem({
          id: "filter-rows",
          title: "Filter Rows With Two Conditions",
          prompt: "Implement `select_recent_passes(df)` so it returns only rows where `year >= 2020` and `passed` is true. Then fix `select_city_or_high_score(df)` so it keeps rows where `city` is `\"Paris\"` or `score >= 90`.",
          language: "python",
          files: [
            project.file("main.py", { editable: true }),
            project.file("tests.py")
          ],
          setup: "uv --version",
          test: "$PYTHON tests.py",
          review: "Check mask construction, operator choice, and whether the learner understands why the filters work."
        }),
        quiz({
          id: "filtering-review",
          title: "Chapter Review: Filtering Rows",
          mode: "review",
          questions: [
            {
              id: "operator-choice",
              prompt: "Why does `recent & passed` express the row filter better than `recent and passed`?",
              choices: [
                { id: "a", body: "`&` combines the two masks row by row." },
                { id: "b", body: "`&` sorts the rows before filtering." },
                { id: "c", body: "`and` works only when the DataFrame has one column." },
                { id: "d", body: "`and` changes `False` values into `True` values." }
              ],
              answer: "a",
              explanation: "Each comparison creates a Boolean Series. `&` combines those Series element by element, which is what a row filter needs.",
              tags: ["filtering", "boolean-mask", "operators"],
              difficulty: "medium"
            }
          ]
        })
      ]
    })
  ]
});
```

This example is intentionally compact for documentation purposes, but it still shows the full loop: concept framing, worked example, local concept check, guided practice, retrieval, independent practice, and a review quiz. Real generated chapters should usually contain more explanation, more examples, and more practice than this sample.

## Rules

- Use stable lowercase kebab-case IDs.
- Keep textbook IDs unique across the workspace.
- Keep chapter IDs unique within a textbook.
- Keep section IDs unique within a chapter.
- Keep subsection IDs unique within a section.
- Keep block IDs unique within their section or subsection.
- Before adding content, inspect existing textbooks and chapters.
- Prefer semantic blocks over giant Markdown strings.
- Run `tutor compile` after every content edit.
- Prefer learner-facing, concept-based titles over schedule labels.
- Ordinary chapter numbering is fine when it reads naturally, but do not default to schedule labels such as `Week 1` or `Phase A` unless the user explicitly wants a time-based plan.
- Section and subsection titles should name the idea or task, not their position in a sequence.

## Canonical Learning Contract

This is the source of truth for what a real learning artifact should contain. Other skill references should point here instead of restating the full contract differently.

Treat the framework as subject-generic. The artifact should instantiate differently for languages, math, history, science, programming, and other topics, but the learning loop stays the same.

- Do not generate exposition-only chapters.
- Every chapter must include substantial learner practice.
- Checkpoint bullets and summaries do not count as practice unless they are written as concrete learner tasks.
- Design for active use, not passive reading.
- A chapter is incomplete unless the learner has been asked to use, test, explain, compare, predict, classify, debug, or create with the ideas.
- Prefer a learning loop: introduce, model, check, practice with support, practice independently, review, and synthesize.
- Adapt the form of practice to the subject, but do not omit practice.
- Use quizzes as assessment tools, not decoration.

## Chapter Structure

Use sections and subsections to reflect the teaching plan, not just the schema.

- Treat a chapter as non-trivial unless it is intentionally tiny.
- For non-trivial chapters, use at least 2 sections.
- Most non-trivial chapters should also include at least 1 subsection, while intentionally small chapters may use none.
- Do not collapse concept introduction, worked example, practice, and recap into one flat section unless the lesson is intentionally very small.
- If every chapter in a textbook ends up with the same exact shape, stop and ask whether the structure matches the content or just your template.

For generated textbooks, use semantic roles to identify purpose without forcing a fixed section count:

```ts
chapter({ role: "instruction", ... })
section({ role: "instruction", ... })
section({ role: "practice", ... })
section({ role: "review", ... })

chapter({ role: "cumulative-checkpoint", ... })
section({ role: "assessment", ... })
```

Roles describe teaching purpose. They do not require every instructional chapter to have the same number or order of non-review sections.

## Required Chapter Anatomy

Non-trivial chapters should contain these teaching moves somewhere in their structure:

- a learner-facing goal or problem
- a concept introduction
- at least one worked example
- local concept checks near major new mechanisms, worked examples, misconceptions, or boundary cases, usually as `quiz({ mode: "check" })` when multiple choice fits
- guided practice
- independent practice
- retrieval or self-test prompts
- an end-of-chapter review or mastery check, usually as `quiz({ mode: "review" })` when multiple choice fits
- at least one misconception, trap, or boundary case

Across a longer textbook, also include when appropriate:

- cumulative mixed practice
- a short synthesis or mini-project when appropriate
- a dedicated practice-test chapter when mixed cumulative assessment is warranted

These moves do not have to appear as separate headings, but they should all be present in the chapter.

### What Counts

- Concept introduction: defines the new idea and explains why it matters now.
- Worked example: walks through a concrete case rather than only naming the rule. A worked example is incomplete if the learner cannot inspect what changed. A complete worked example should usually include:
  - input, context, or starting state
  - operation, reasoning step, or action
  - visible result, output, or conclusion
  - explanation of why that result follows

For examples involving data, code, math, diagrams, text, evidence, or other artifacts, the input and result should usually be shown as inspectable artifacts, not only described in prose.
- Local concept check: asks the learner to predict, classify, identify, compare, or apply the idea soon after it is introduced.
- Guided practice: gives the learner a concrete task with support, scaffolding, prompts, partial setup, or a model to lean on.
- Independent practice: asks the learner to perform the target move with less support.
- Retrieval or self-test: asks the learner to recall, explain, predict, classify, or apply without simply rereading the prose.
- End-of-chapter review or mastery check: verifies whether the learner can use the chapter's ideas in a coherent way.
- Misconception or trap: protects the learner from a realistic mistake.
- Cumulative mixed practice: requires reuse of earlier material, not only the newest concept.

If a chapter is missing several of these moves, it is probably an outline, not a strong learning unit.

## Teach The Moves You Assess

A chapter does not teach a mechanism merely by naming it. Any mechanism required by independent practice, chapter review, or mastery assessment should first be:

1. defined or framed plainly
2. demonstrated through an inspectable example
3. used in guided practice or a local check

An intentionally difficult transfer task may combine previously taught mechanisms, but it should not silently introduce a new required technique.

## Practice Taxonomy

Choose multiple practice modes that fit the subject instead of repeating one prompt shape.

- recall
- prediction
- classification
- explanation
- comparison
- debugging or error diagnosis
- application to new cases
- creation or design
- synthesis or review

Map those to the topic:

- language learning: translation, usage, error correction
- math: solve, justify, spot the misconception
- history: compare causes, explain significance, interpret evidence
- programming: implement, debug, refactor, explain behavior
- science: predict outcome, explain mechanism, interpret data

Use the taxonomy generically. The point is not to force the same exercises into every subject, but to force the generator to convert the learning move into a topic-appropriate task.

When the subject is programming, topic-appropriate tasks should usually become runnable tasks. Prefer `codingProblem(...)` for implementation, debugging, refactoring, and code-behavior exercises when the learner benefits from executing real code.

## Quiz Widget Usage

Use the `quiz(...)` builder as a first-class check and review block.

Quizzes are for fast conceptual diagnosis, retrieval, misconception checks, prediction, classification, chapter review, and cumulative mixed review. They should complement concrete practice, not replace it.

Do not skip quizzes only because a subject also needs hands-on practice. Many strong lessons need both:

- quizzes to check whether the learner understands the concept
- concrete tasks to check whether the learner can use the concept

Quizzes should appear in three places:

1. **Concept checks**

- Placement: immediately after a new concept, mental model, worked example, boundary case, or common trap.
- Mode: `"check"`
- Size: 1-3 questions.
- Purpose: catch misunderstanding before moving on.

2. **Chapter review quizzes**

- Placement: dedicated final review or mastery-check section of a non-trivial instructional chapter.
- Mode: `"review"`
- Size: 4-8 questions.
- Purpose: retrieval practice across the chapter.

Every non-trivial instructional chapter should have a dedicated final `review` section. It may include a short review introduction, retrieval prompts, mastery checks, and one review quiz when multiple choice fits. It must not double as the chapter's primary independent-practice section.

Review questions should assess the current chapter's outcomes. Normally use new scenarios, applications, or comparisons instead of duplicating local checks verbatim. Provide all context needed to answer without reconstructing an earlier example. Direct repetition is appropriate when deliberately retrieving a fundamental concept.

3. **Practice-test chapters**

- Placement: after a cluster of chapters, at the end of a module, or at the end of the textbook.
- Mode: `"practice-test"`
- Size: 10-25 questions.
- Purpose: mixed transfer across several earlier chapters with local scoring.

Practice tests are optional and must earn their inclusion. Put them in dedicated `cumulative-checkpoint` chapters with an `assessment` section, not at the end of an instructional chapter. They should require the learner to choose and combine earlier ideas without being told which chapter or technique applies. Provide enough local context for every question.

Each practice-test chapter should include at least one non-quiz cumulative task, such as synthesis, diagnosis, comparison, design, explanation, or runnable practice. It should not introduce new central mechanisms or contain a chapter-review quiz. Do not add a practice test merely because the textbook reached a particular chapter count.

The mode distinction matters:

- `"check"` = local comprehension
- `"review"` = chapter mastery
- `"practice-test"` = mixed cumulative assessment

Do not use these modes interchangeably.

## Practice And Review Transitions

Written tasks and coding problems may share a `practice` section when they reinforce the same learner move. Introduce each task so the learner knows whether it is a model-supported exercise, runnable implementation, debugging task, or independent transfer. Separate unrelated tasks instead of placing them next to one another.

Retrieval prompts belong in the final `review` section. Introduce them with a short framing block that tells the learner whether to recall, explain, diagnose, or transfer without looking back.

After an interactive or runnable task, add a transition before switching to a different scenario, retrieval, review, or assessment activity.

Use quizzes for checks like:

- predicting an output, result, next step, or consequence
- choosing which rule, concept, or method applies
- classifying an example
- identifying a misconception
- distinguishing nearby concepts
- checking whether a boundary case changes the answer
- interpreting a small scenario, snippet, diagram, dataset, passage, or equation

Use another practice block when the learner needs to produce a larger artifact, such as:

- writing or revising a substantive answer
- solving a multi-step problem
- debugging a multi-step issue
- designing a schema, system, proof, experiment, or project artifact
- comparing tradeoffs in their own words
- building or revising something

If a chapter already includes checkpoint or review questions that can be represented as multiple-choice questions, prefer a `quiz({ mode: "review" })` block instead of a plain list.

Use plain lists or prose prompts for open-ended reflection, free-response questions, project planning, or tasks that do not fit multiple choice.

## Insufficient Practice

The following do not count as substantial practice by themselves:

- "Practice writing about X."
- "Try building a small project."
- "Review the key ideas."
- "Explain this concept in your own words." when used as the only practice mode
- a list of broad suggestions with no concrete input, expected output, scenario, or target behavior
- a quiz question that only asks for a memorized definition when the learner needs to apply the idea

A practice task should usually give the learner at least one of:

- a concrete input
- a concrete scenario
- a specific artifact to produce
- a bug to diagnose
- an output to predict
- a comparison to make
- a constraint to satisfy
- a solution behavior to test

## Quantitative Guidance

- At least 40% of learner-facing content should be practice-oriented.
- Each chapter should include multiple distinct practice modes, not just repeated short-answer prompts.
- Each textbook should contain both local practice and cumulative practice.
- Practice should progress from more supported to more independent work.
- A chapter should not end immediately after explanation; it should end after the learner has been asked to use the material.
- In programming chapters, do not rely on prose-only exercises when runnable practice is appropriate. Use `codingProblem(...)` as the default independent-practice block for real coding work.

### When To Start A New Section

Create a new section when the learner is changing tasks in a meaningful way, for example:

- moving from concept introduction to worked example
- moving from one major subtopic to another
- moving from explanation to practice
- moving from one kind of practice to cumulative review
- moving from local comprehension to chapter-level review

Sections should feel like major teaching moves, not just visual wrappers.

### When To Add A Subsection

Add a subsection when a section needs one narrower unit inside it, for example:

- a misconception or boundary case that deserves focused treatment
- a worked example that should not be buried in a larger section
- a practice cluster around one specific skill
- a comparison between two closely related ideas

Subsections are useful when the learner benefits from one more level of structure, not when they merely rename the same content.

## Recommended Shapes

### Small Chapter

Use this only when the topic is intentionally narrow.

- 2 sections
- 0-1 subsections

Example:

- Section 1: core idea, small example, and local check
- Section 2: focused practice and review

### Standard Chapter

This should be the default shape for most beginner lessons.

- 2-3 sections
- 1-3 subsections total

Example:

- Section 1: learner problem, concept introduction, and concept check
- Section 2: worked example and guided practice
  Add a subsection for the misconception, edge case, or a second example
- Section 3: independent practice
- Final section: chapter review and mastery check

### Larger Chapter

Use this when the learner must connect several related ideas.

- 3-4 sections
- multiple subsections where they clarify distinct skills or traps

Example:

- Section 1: central concept and local concept check
- Section 2: mechanism and example
- Section 3: second related concept or comparison
- Section 4: cumulative practice
- Final section: chapter review and mastery check

## Anti-Patterns

Avoid these common weak structures:

- one giant section with headings doing all the real structural work
- zero subsections across an entire textbook
- every chapter repeating the exact same flat template without regard to the topic
- practice appearing only as one list at the very end of a long explanation section
- practice that is really only summary bullets or reflective prompts with no concrete task
- one practice mode repeated over and over with no shift from support to independence
- chapters that never require cumulative reuse of earlier material
- review questions left as plain bullet lists when they could be represented as scored quiz questions
- titles and headings that read like schedule containers instead of naming the actual concept or skill
- worked examples embedded as one small block inside a section that is really doing three jobs at once
- quizzes used as decoration rather than diagnosis or retrieval
- practice-test chapters that only review the immediately preceding chapter
- practice tests appended to instructional chapters
- practice-test chapters that contain only another quiz without mixed transfer or a non-quiz cumulative task
- chapter reviews that repeat local checks without new context or deliberate fundamental retrieval

If the structure looks clean but does not help the learner navigate the lesson, rewrite it.

## Final Quality Check

Before finalizing, ask:

- Can the learner do something with this chapter, or only read it?
- Is there a progression from easier tasks to harder tasks?
- Are the tasks concrete enough to complete?
- Are there opportunities for retrieval without looking back?
- Are concept checks placed near the ideas they test?
- Does the chapter end with a meaningful review or mastery check?
- Are earlier ideas reused later?
- Does the textbook include cumulative mixed practice?
- When a practice-test chapter is present, does it earn its inclusion through mixed transfer and non-quiz cumulative practice?
- Does the artifact teach toward mastery or just coverage?

## Chapter Descriptions

Use chapter descriptions consistently within a textbook. When used, every non-trivial chapter should include one concise learner-facing description stating the capability or problem addressed rather than repeating the title.
