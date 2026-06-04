# Textbook Authoring

Textbooks are TypeScript modules named `textbooks/<textbook-id>/textbook.ts`.
Chapters are usually separate modules in `textbooks/<textbook-id>/chapters/*.chapter.ts`.

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
import { callout, chapter, codeBlock, codingProblem, list, p, projectFiles, section, subsection } from "tutor-kit";

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
        list({
          id: "mastery-check",
          items: [
            "Without looking back, write the rule for combining two pandas conditions with AND.",
            "Describe one bug that can happen if a mask does not align with the rows being filtered.",
            "Explain how you would test whether a filter keeps exactly the intended rows."
          ]
        })
      ]
    })
  ]
});
```

This example is intentionally compact for documentation purposes, but it still shows the full loop: concept framing, worked example, guided practice, retrieval, independent practice, and a mastery check. Real generated chapters should usually contain more explanation, more examples, and more practice than this sample.

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
- A chapter is incomplete unless the learner has been asked to use, test, explain, compare, or create with the ideas.
- Prefer a learning loop: introduce, model, practice with support, practice independently, review, and synthesize.
- Adapt the form of practice to the subject, but do not omit practice.

## Chapter Structure

Use sections and subsections to reflect the teaching plan, not just the schema.

- Treat a chapter as non-trivial unless it is intentionally tiny.
- For non-trivial chapters, use at least 2 sections.
- Most non-trivial chapters should also include at least 1 subsection, while intentionally small chapters may use none.
- Do not collapse concept introduction, worked example, practice, and recap into one flat section unless the lesson is intentionally very small.
- If every chapter in a textbook ends up with the same exact shape, stop and ask whether the structure matches the content or just your template.

## Required Chapter Anatomy

Non-trivial chapters should contain these teaching moves somewhere in their structure:

- a learner-facing goal or problem
- a concept introduction
- at least one worked example
- guided practice
- independent practice
- retrieval or self-test prompts
- an end-of-chapter review or mastery check
- at least one misconception, trap, or boundary case

Every few chapters should also include:

- cumulative mixed practice
- a short synthesis or mini-project when appropriate

These moves do not have to appear as separate headings, but they should all be present in the chapter.

### What Counts

- Concept introduction: defines the new idea and explains why it matters now.
- Worked example: walks through a concrete case rather than only naming the rule.
- Guided practice: gives the learner a concrete task with support, scaffolding, prompts, partial setup, or a model to lean on.
- Independent practice: asks the learner to perform the target move with less support.
- Retrieval or self-test: asks the learner to recall, explain, predict, classify, or apply without simply rereading the prose.
- End-of-chapter review or mastery check: verifies whether the learner can use the chapter's ideas in a coherent way.
- Misconception or trap: protects the learner from a realistic mistake.

If a chapter is missing several of these moves, it is probably an outline, not a strong learning unit.

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

## Insufficient Practice

The following do not count as substantial practice by themselves:

- "Practice writing queries about X."
- "Try building a small project."
- "Review the key ideas."
- "Explain this concept in your own words." when used as the only practice mode
- a list of broad suggestions with no concrete input, expected output, scenario, or target behavior

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

- Section 1: core idea and small example
- Section 2: focused practice and recap

### Standard Chapter

This should be the default shape for most beginner lessons.

- 2-3 sections
- 1-3 subsections total

Example:

- Section 1: learner problem and concept introduction
- Section 2: worked example and guided practice
  Add a subsection for the misconception, edge case, or a second example
- Section 3: independent practice and self-check

### Larger Chapter

Use this when the learner must connect several related ideas.

- 3-4 sections
- multiple subsections where they clarify distinct skills or traps

Example:

- Section 1: central concept
- Section 2: mechanism and example
- Section 3: second related concept or comparison
- Section 4: cumulative practice and recap or mastery check

## Anti-Patterns

Avoid these common weak structures:

- one giant section with headings doing all the real structural work
- zero subsections across an entire textbook
- every chapter repeating the exact same flat template without regard to the topic
- practice appearing only as one list at the very end of a long explanation section
- practice that is really only summary bullets or reflective prompts with no concrete task
- one practice mode repeated over and over with no shift from support to independence
- chapters that never require cumulative reuse of earlier material
- titles and headings that read like schedule containers instead of naming the actual concept or skill
- worked examples embedded as one small block inside a section that is really doing three jobs at once

If the structure looks clean but does not help the learner navigate the lesson, rewrite it.

## Final Quality Check

Before finalizing, ask:

- Can the learner do something with this chapter, or only read it?
- Is there a progression from easier tasks to harder tasks?
- Are the tasks concrete enough to complete?
- Are there opportunities for retrieval without looking back?
- Are earlier ideas reused later?
- Does the artifact teach toward mastery or just coverage?
