# Teaching craft

Treat these prompts as a menu of high-value teaching moves, not acceptance criteria. Omit or replace any move when another design teaches this learner, subject, and scope better.

## The difference in practice

**Avoid (information dump):** "Indexes are a powerful feature of relational databases. The main types are B-tree, hash, GiST, and BRIN. Indexes speed up read queries but slow down writes, so it is important to choose the right index for your workload."

**Aim for:** "Suppose a library shelved its books in the order it bought them. To find *Moby-Dick*, you would walk every shelf. A card catalog fixes this: a small, sorted structure that tells you where to look instead of making you look everywhere. An index is the database's card catalog. Before we go further, predict something: if every card must be rewritten whenever a book moves, what happens to the cost of *adding* books? That trade — faster finding, paid for with slower changing — is the whole story, and each index type is a different bargain struck within it."

The first version names facts and asserts importance; most of its sentences could describe any feature of any system. The second builds a model the learner can run, then makes them run it. Hold every paragraph to this difference, in whatever form fits the subject.

## Default to richness

Unless the user asked for a brief treatment, develop the lesson generously — mechanism explanations, concrete cases, learner action, feedback, and, when they add learning value, alternate representations, visual grounding, interactive exploration, misconception repair, and cumulative connections.

Do not confuse richness with length or block count. Every section and block should perform a useful teaching job.

## Start from a learner outcome

Give the publication a clear learner outcome: an observable action such as predict, explain, compare, solve, debug, design, or create.

Choose content that serves that outcome and cut background that does not. If the requested subject is broad, plan the wider course briefly but publish one coherent unit now.

## Teach the mechanism

Define important terms on first serious use, before relying on them. Explain how the central idea works or why it is true. Do not substitute labels such as useful, important, powerful, or subtle for explanation. State what the idea changes, enables, prevents, or makes difficult.

Teach why and how together: surface assumptions, approximations, and limits, and say what a simpler model leaves out. Prefer reconstruction over memorization — show how to recover a result after forgetting its final form. A realistic wrong model or boundary case distinguishes correct use from a tempting error.

## Make an example inspectable

Prefer concrete cases that expose how the idea works: the starting state, the reasoning or operation, the visible result, and why it follows.

Tell the learner what to inspect before a code sample, equation, table, diagram, image, or interactive block. Give a short readout afterward. Use the actual artifact when the subject involves code, data, math, evidence, or visual recognition.

## Invite learner action

Give the learner chances to do more than read. Invite them to predict, classify, explain, repair, apply, or produce something when active use fits the goal.

For a substantial lesson, consider moving from support toward independence:

1. Give a small guided action near the explanation.
2. Give an independent task with concrete input, output, behavior, or constraints.
3. End with retrieval, transfer, or a mastery check that uses a new case when possible.

After a case or activity, close the loop: name what changed, connect it to the general idea, and return to why it matters. A short explanation may use one example and one check; a rich chapter, several such cycles.

## Give useful feedback

When checks are used, explain why an answer works. Let quiz distractors represent plausible mistakes. State runnable task behavior clearly so the learner need not reverse engineer the tests.

Do not reveal a practice answer before the learner acts. Keep answer explanations close enough to correct the model that led to the mistake.

## First chapters

The first chapter prepares the reader for the whole course. You have read *Atoms in Motion*; notice how it works: it opens with one enormous question, sketches a map of the territory in ordinary language, then lets a single generative idea explain evaporation, dissolving, and pressure one consequence at a time — marking each approximation honestly and closing at the wide view. Give your first chapter the same job using the subject's own materials: a reason to enter, a compact map, one generative example worked through several consequences, an honest account of what is simplified, and an ending that returns to the wide view — what the learner can now see, and why the next chapter follows.

Do not open a course with a glossary, a dense derivation, a long prerequisite checklist, or an assessment. Introduce only what the opening idea needs; say what can wait.

## Animation and interaction

For every substantial chapter, ask whether the learner would understand the central mechanism better by watching it unfold or manipulating it — change over time, flow, causal sequence, or a relationship exposed by varying a parameter.

When the answer is yes, build a tight loop: predict, make one meaningful change, see a clear consequence, hear why, transfer to a new case. Prefer one important variable with an immediate result over a dashboard of controls; include clear labels, a reset path, keyboard access, reduced-motion behavior, and a useful text explanation. Do not add motion as decoration or interaction whose choices do not matter; stay static when static is genuinely clearer.

## Choose blocks by learner need

Use any mix of blocks that serves the teaching move: ordinary prose, lists, code, math, and quizzes cover many lessons; a diagram reveals structure or flow; a chart supports a defined numeric comparison; an image grounds visual appearance or evidence; a transformation keeps an input, operation, and output visible together; a coding problem provides direct execution feedback.

Use `component(...)` only when manipulation, simulation, animation, reveal, or another interaction cannot be expressed clearly with built in blocks.

## Adapt from evidence

For continuation, use `tutor progress --textbook <id>`. If it reports repeated misses, failed coding work, or glossary items marked again, repair those with a new example and a short transfer check before harder material.

Treat the summary as evidence, not a command: decide whether the issue reflects a missing prerequisite, weak explanation, insufficient practice, or an isolated error.

## Final reflection

Before running `doctor`, ask:

- Can the learner understand the central idea rather than only remember a summary?
- Are important terms made usable before the lesson relies on them?
- Are the most useful examples accurate and inspectable?
- Does the learner get worthwhile opportunities to predict, act, and learn from feedback?
- Would a visual, interaction, or alternate explanation make the lesson meaningfully better?
- Does the chapter shape fit this subject and learner, or would the same skeleton fit any subject?

Use `doctor --textbook <id> --record` for structural verification; review teaching quality yourself — the compiler does not grade pedagogy.
