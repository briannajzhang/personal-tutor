# Chapter Specs

Use this file when planning chapters before writing full Tutor Kit prose or TypeScript blocks.

A chapter spec is a short planning artifact. It sits between the curriculum map and the authored chapter.

Do not skip from a high-level curriculum map directly to finished chapter prose. First write a chapter spec that explains how the chapter will teach the learner from confusion to usable skill.

## Contents

- Purpose and when to use
- Default spec format
- Required fields
- Field guidance, practice readiness, and examples
- Blocks to author
- Mastery and spec quality checks

## Purpose

A chapter spec prevents shallow, random, or outline-like chapters.

It should answer:

* What should the learner be able to do after this chapter?
* What prior ideas does the chapter assume?
* What new terms must be defined before use?
* What mechanism or mental model does the chapter teach?
* What wrong model, misconception, or trap should the chapter correct?
* What worked example will make the idea visible?
* What concrete practice will the learner do?
* How will this chapter reuse earlier material?
* How will the learner check mastery?

A chapter spec is not learner-facing prose. It is a plan for the authoring agent.

## When To Use

Create chapter specs after drafting and checking the curriculum map, before writing chapter files.

Use specs for:

* new textbooks
* new chapters
* major rewrites
* generated courses with multiple chapters
* chapters that include coding, math, technical concepts, or multi-step reasoning

For a tiny one-off chapter, the spec may be brief. For a full generated textbook, every non-trivial chapter should have a spec before prose generation.

## Spec Format

Use this format by default:

```md
# Chapter Spec: <chapter title>

## Learner Outcome

After this chapter, the learner should be able to...

## Prerequisites

This chapter assumes the learner already understands:

- ...
- ...

## New Terms To Define

Define these before relying on them:

- term: plain-language definition
- term: plain-language definition

## Central Mechanism Or Mental Model

The chapter should teach this mechanism:

...

## Tempting Wrong Model Or Trap

The learner may incorrectly think:

...

The chapter should replace that with:

...

## Teaching Path

1. Start from...
2. Define...
3. Show...
4. Check...
5. Practice...
6. Reuse...
7. Review...

## Scope And Depth Plan

Central mechanisms the chapter promises to teach:

- mechanism:
  - explanation:
  - inspectable example:
  - learner action:
  - local check:

Secondary mechanisms introduced but deliberately deferred:

- ...

Split or narrow the chapter:

- ...

## Worked Example Plan

Use a small example where:

- input, context, or starting state:
- operation, reasoning step, or action:
- visible result, output, or conclusion the chapter will show:
- explanation of why that result follows:
- misconception or boundary case revealed, if relevant:

## Practice Plan

Guided practice:

- ...

Independent practice:

- ...

Retrieval or self-test:

- ...

Cumulative practice, if relevant:

- ...

## Practice Flow Plan

For each learner task, identify:

- task:
- form: written/open-ended, runnable, retrieval, or assessment
- teaching purpose:
- intended order:
- transition needed before or after a substantially different task:

For each coding problem, also identify:

- classification: construct, debug, complete, or extend
- central learner move:

## Practice Readiness

For each independent task, coding problem, project, or mastery check, list the concepts and learner moves required to complete it. Mark each requirement as:

- taught earlier in this chapter
- taught in a prerequisite chapter
- deliberately scaffolded inside the task

A task is not ready when it requires a mechanism that appears for the first time only in the task prompt, starter files, tests, review focus, or answer explanation.

## Check And Review Plan

Local concept checks:

- ...

Chapter review:

- review targets:
- dedicated final review section:
- review format:

Cumulative practice-test chapter, if warranted:

- covered prior chapters and outcomes:
- how the assessment requires selection or transfer:
- planned non-quiz cumulative task:
- why a dedicated practice test is warranted:

Generated chapter and section roles:

- chapter role: `instruction` or `cumulative-checkpoint`
- section roles: `instruction`, `practice`, `review`, or `assessment`

Best formats:

- quiz:
- concrete task:
- written/open-ended prompt:
- coding problem, if relevant:
- project or synthesis task, if relevant:

## Blocks To Author

Likely Tutor Kit blocks:

- `p`: ...
- `codeBlock`: ...
- `mathBlock`: ...
- `callout`: ...
- `list`: ...
- `quiz`: ...
- `codingProblem`: ...

## Mastery Check

The chapter is complete only if the learner can:

- ...
- ...
- ...
```

For programming chapters, decide during the spec whether independent practice should become a runnable `codingProblem(...)`. If yes, the spec should name the intended function, behavior, starter files, tests, and review focus before chapter prose is written.

## Required Fields

Every non-trivial chapter spec must include:

* learner outcome
* prerequisites
* new terms to define
* central mechanism or mental model
* scope and depth plan
* worked example plan
* practice plan
* practice flow plan
* practice readiness
* check and review plan
* mastery check

Most chapter specs should also include:

* tempting wrong model or misconception
* cumulative reuse of earlier material
* expected Tutor Kit block types
* notes about pacing or depth

Generated textbook specs must use the full required format rather than compressed substitutes that omit required fields. A cumulative checkpoint needs its own chapter spec. It should cover multiple prior outcomes, require mixed transfer, and introduce no new central mechanism.

## Learner Outcome

Write the outcome as an ability, not a topic label.

Weak:

> Learn slope.

Better:

> Given two points or a small graph, explain slope as a rate of change, calculate it, and predict whether a line rises, falls, or stays flat.

Weak:

> Understand caching.

Better:

> Decide when a cached value is safe to reuse, implement a basic cache-aside flow, and explain how stale data can appear.

## Prerequisites

List the ideas the chapter assumes. This helps prevent abrupt explanations.

For each prerequisite, decide whether the chapter should:

* assume it
* briefly review it
* reteach it because it is essential

Example:

```md
## Prerequisites

This chapter assumes the learner can:

- read points on a coordinate plane
- subtract two numbers
- distinguish horizontal change from vertical change

Briefly review coordinate pairs before introducing slope.
```

## New Terms To Define

List technical terms that must be defined before use.

Do not let the chapter lean on these terms in abstract claims before defining them.

Example:

```md
## New Terms To Define

- slope: the ratio of vertical change to horizontal change
- rise: the vertical change between two points
- run: the horizontal change between two points
- rate of change: how much one quantity changes compared with another
```

## Central Mechanism Or Mental Model

State the core mechanism the learner must understand.

This is usually more useful than a polished summary.

Weak:

> Slope is important for lines.

Better:

> Slope compares how much y changes for a fixed change in x. If two lines move the same distance right, the one that moves farther up has the greater slope.

Weak:

> Indexes improve performance.

Better:

> An index is a separate lookup structure. It can help a system find matching records without scanning everything, but it adds maintenance work when data changes.

## Tempting Wrong Model Or Trap

Name the plausible mistake the chapter should correct.

Good chapters often replace a natural but wrong model with a better model.

Example:

```md
## Tempting Wrong Model Or Trap

Wrong model:

A steeper line is just a line that "looks taller."

Better model:

Steepness compares vertical change to horizontal change. A line is steeper when it rises or falls more for the same horizontal movement.
```

## Teaching Path

The teaching path explains the chapter flow before prose is written.

It should not be a table of contents. It should describe the learner's progression.

Weak:

```md
1. Introduce slope
2. Explain formula
3. Practice slope
```

Better:

```md
1. Start with two ramps that move the same distance forward but rise different amounts.
2. Define slope as vertical change divided by horizontal change.
3. Show two points and ask the learner to identify rise and run before calculating.
4. Use a quiz check to ask which line is steeper when the run is the same.
5. Give guided practice calculating slope from two points.
6. Show a boundary case: horizontal line versus vertical line.
7. End with independent practice and a review quiz.
```

## Worked Example Plan

A worked example should make the mechanism visible.

Before writing the example, specify:

* the input, context, or starting state the learner can inspect
* the operation, reasoning step, or action being performed
* the visible result, output, or conclusion the chapter will show
* the explanation of why that result follows
* any mistake or boundary case the example reveals

Do not treat a worked example as planned if it only names the kind of example to include or promises to "show the visible result." The spec should identify the actual input/context, operation, result/output/conclusion, and explanation the authored chapter will display.

Example:

```md
## Worked Example Plan

Input, context, or starting state:

Use two points: (1, 2) and (4, 8).

Operation, reasoning step, or action:

Ask the learner to identify the horizontal change first, then the vertical change, then compute 6 / 3.

Visible result, output, or conclusion:

The horizontal change is 3, the vertical change is 6, and the slope is 2.

Explanation of why that result follows:

Slope compares vertical change to horizontal change. Because y increases by 6 while x increases by 3, the slope is 6 / 3 = 2.

Misconception or boundary case revealed, if relevant:

This prevents treating slope as just "how tall the line looks" or accidentally dividing run by rise.
```

## Scope And Depth Plan

Plan depth according to the number and complexity of the chapter's central mechanisms.

For every central mechanism the learner outcome promises, identify:

1. how it will be explained
2. the inspectable example that will demonstrate it
3. the learner action that will use it
4. the local check that will diagnose misunderstanding, when a local check fits

Name secondary mechanisms that are intentionally introduced but deferred. If the teaching path cannot support every central mechanism at the intended depth, split the chapter or narrow its learner outcome before writing prose.

Do not plan chapters to a uniform word, block, section, or subsection count. Similar chapter size is acceptable only when the teaching work is genuinely similar.

## Practice Plan

Do not describe practice vaguely. Instantiate it.

Weak:

> Practice calculating slope.

Better:

> Given the points (2, 3) and (6, 11), identify the horizontal change, identify the vertical change, and calculate the slope. Then explain what the value means in words.

A good practice plan usually includes more than one mode:

* guided practice
* prediction
* classification
* debugging or error diagnosis
* independent application
* cumulative review

Example:

```md
## Practice Plan

Guided practice:

- Label the rise and run between two marked points.
- Choose which of two lines is steeper before calculating.

Independent practice:

- Calculate slope from three pairs of points.
- Explain one slope value in words.

Error diagnosis:

- Fix a solution that divides run by rise instead of rise by run.

Cumulative practice:

- Reuse earlier coordinate-plane reading skills to identify points before calculating slope.
```

## Practice Readiness

Independent practice should assess or combine moves the learner has already been prepared to use.

For every independent task, coding problem, project, or mastery check:

1. list the concepts and learner moves needed to complete it
2. identify where each requirement was taught earlier in the chapter or curriculum
3. identify any requirement deliberately scaffolded inside the task

A task is not ready when a required mechanism appears for the first time only in the task prompt, starter files, tests, review focus, or answer explanation. Move the task, teach the mechanism earlier, or add explicit scaffolding before prose generation.

## Practice Flow Plan

Plan how learner actions connect instead of placing valid tasks next to one another without a reason.

For every written task, runnable task, retrieval prompt, and assessment:

1. identify its form and teaching purpose
2. state why it appears at that point in the learning sequence
3. identify the transition needed when the next task changes scenario, support level, or activity type

Written and runnable tasks may share a practice section when they reinforce the same learner move. If they use unrelated scenarios or assess different moves, separate them or introduce each task explicitly.

For every coding problem, name its `construct`, `debug`, `complete`, or `extend` classification and central learner move.

## Check And Review Plan

Checks and review should be planned before writing prose.

A good check and review plan identifies:

- local concept checks near new concepts, examples, traps, or boundary cases
- chapter review targets
- cumulative review targets, when relevant
- which checks should be quizzes versus concrete tasks, written prompts, coding problems, project tasks, or other practice blocks

Use quizzes for fast conceptual diagnosis, prediction, classification, misconception checks, retrieval, and local scoring.

Use other practice blocks when the learner must produce a larger artifact, solve a multi-step problem, debug a multi-step issue, design something, write a longer response, or build/revise a project artifact.

For every non-trivial instructional chapter, plan a dedicated final review section that clearly signals the move from instruction or practice into review.

Example:

```md
## Check And Review Plan

Local concept checks:

- Quiz: Given two lines with the same run but different rise, choose the steeper line.
- Quiz: Identify whether a slope is positive, negative, zero, or undefined from a small graph.

Chapter review:

- Dedicated final section covering slope from points, slope from graph, and common mistakes.
- Use new scenarios where possible; directly repeat only fundamentals worth deliberate retrieval.

Concrete task:

- Calculate slope from three pairs of points and explain one answer in words.

Cumulative practice-test chapter, if warranted:

- Cover slope, coordinate-plane reading, and linear equations.
- Require the learner to choose which earlier method applies.
- Include a non-quiz error-diagnosis task.
- Use a dedicated chapter because the assessment mixes several earlier outcomes.
```

## Blocks To Author

Use Tutor Kit blocks as teaching moves, not decorations.

A chapter spec may name likely blocks before the chapter is written:

```md
## Blocks To Author

- `p`: introduce the learner problem and define slope
- `mathBlock`: show the slope formula
- `callout`: warn about swapping rise and run
- `quiz`: local prediction check
- `list`: guided practice
- `quiz`: chapter review
- `codingProblem`: only if the chapter includes runnable code practice
```

Use `mathBlock` for displayed equations or formal notation. Use `codeBlock` for executable code, queries, commands, or exact structured examples.

Do not force every chapter into the same block sequence. Match the block shape to the teaching path.

## Mastery Check

The mastery check should verify usable skill, not passive recognition.

Weak:

> Review the key ideas about slope.

Better:

> Given two points, calculate slope, explain the meaning of the value, and identify whether a mistaken solution swapped rise and run.

A chapter is not ready if the mastery check only asks the learner to reread or summarize.

## Spec Quality Check

Before writing the chapter, check:

- Is the learner outcome an ability, not a topic label?
- Are prerequisite ideas named?
- Are new terms listed before prose generation begins?
- Is the central mechanism clear?
- Does the scope and depth plan identify explanation, demonstration, learner action, and checking for every central mechanism?
- Does planned depth reflect conceptual complexity, or is the chapter being forced into the same structural size as simpler chapters?
- Is there a concrete worked example plan?
- Is practice instantiated rather than merely described?
- Does the practice flow plan explain how written, runnable, retrieval, and assessment tasks connect?
- Can the learner complete every independent task using concepts already taught or deliberately scaffolded?
- Does the check and review plan include local checks and chapter review?
- Does the spec identify which checks should be quizzes versus other practice blocks?
- Does the spec include at least one learner action: predict, explain, debug, compare, classify, apply, create, or test?
- Does the chapter reuse earlier material when appropriate?
- Would this spec prevent an outline-like chapter?

If the spec is vague, revise the spec before writing prose.
