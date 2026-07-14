# Quality core

Use these prompts to create rich Tutor Kit material. Treat them as a menu of high-value teaching moves, not acceptance criteria. Select the moves that fit the learner, subject, and requested scope. Omit or replace any move when another design teaches better.

## Default to richness

When the user has not asked for a brief treatment, develop the lesson generously. Build understanding through clear mechanism explanations, concrete cases, learner action, and feedback. Consider alternate representations, visual grounding, interactive exploration, misconception repair, and cumulative connections when they add learning value.

Do not confuse richness with length or block count. Every section and block should perform a useful teaching job.

## Start from a learner outcome

Give the publication a clear learner outcome when it helps focus the work. Prefer an observable action such as predict, explain, compare, solve, debug, design, or create.

Choose content that serves that outcome. Remove background material that does not help the learner reach it. If the requested subject is broad, plan the wider course briefly but publish one coherent unit now.

## Teach the mechanism

Define important terms before relying on them. Explain how the central idea works or why it is true. Do not replace the explanation with claims that the idea is useful or important.

Consider a realistic wrong model, mistake, or boundary when it helps the learner distinguish correct use from a tempting error.

## Make an example inspectable

Prefer concrete cases that expose how the idea works. A useful worked case often includes the starting state, the reasoning or operation, the visible result, and why the result follows.

Tell the learner what to inspect before a code sample, equation, table, diagram, image, or interactive block. Give a short readout afterward. Use the actual artifact when the subject involves code, data, math, evidence, or visual recognition.

## Invite learner action

Give the learner chances to do more than read. Invite them to predict, classify, explain, repair, apply, or produce something when active use fits the goal.

For a substantial lesson, consider moving from support toward independence:

1. Give a small guided action near the explanation.
2. Give an independent task with concrete input, output, behavior, or constraints.
3. End with retrieval, transfer, or a mastery check that uses a new case when possible.

A short focused explanation may use one example and one check. A rich chapter may use several cycles of explanation, inspection, action, and feedback. A cumulative checkpoint can mix prior material without introducing a new central mechanism.

## Give useful feedback

When checks are used, explain why an answer works. Let quiz distractors represent plausible mistakes. State runnable task behavior clearly so the learner does not have to reverse engineer the tests.

Do not reveal a practice answer before the learner acts. Keep answer explanations close enough that the learner can correct the model that led to the mistake.

## Adapt from evidence

For continuation, use `tutor progress --textbook <id>`. If it reports repeated misses, failed coding work, or glossary items marked again, repair those needs with a new example and short transfer check before adding harder material.

Treat the progress summary as evidence, not a command. The agent still decides whether the issue reflects a missing prerequisite, weak explanation, insufficient practice, or an isolated error.

## Choose blocks by learner need

Use any mix of blocks that serves the teaching move. Ordinary prose, lists, code, math, and quizzes cover many lessons. A diagram can reveal structure or flow. A chart can support a defined numeric comparison. An image can ground visual appearance or evidence. A transformation can keep an input, operation, and output visible together. A coding problem can provide direct execution feedback.

Use `customBlock(...)` only when manipulation, simulation, reveal, or another interaction cannot be expressed clearly with built-in blocks. Native Tutor Kit TypeScript is always available, so unusual subjects are not limited to the common path.

## Final reflection

Before running `doctor`, ask:

- Does the stated outcome match what the lesson actually develops?
- Can the learner understand the central idea rather than only remember a summary?
- Are the most useful examples accurate and inspectable?
- Does the learner get worthwhile opportunities to think, act, and learn from feedback?
- Would a visual, interaction, alternate explanation, or realistic application make the lesson meaningfully better?
- Does the chapter shape fit this subject and learner?

These questions guide judgment. They do not require every lesson to contain every kind of content. Use `doctor --textbook <id> --record` for structural and runnable verification. Review teaching quality with judgment because the compiler does not grade pedagogy.
