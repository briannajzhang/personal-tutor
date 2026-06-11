# Writing Style Reference

Use this when authoring explanation-heavy Tutor Kit prose blocks.

This file governs explanation quality: how to teach an idea clearly in prose. It does not govern full curriculum sequencing, chapter anatomy, or practice volume. For those requirements, follow the canonical learning contract in `lesson-authoring.md`.

## Contents

- Reference model and core principle
- Default teaching pattern
- Define-before-use and mechanism guidance
- Wrong-model contrast and local coherence
- Code, notation, quiz, and check style
- Template-prose avoidance
- Voice, number style, examples, and final check

## Reference Model

Use John Ousterhout's *A Philosophy of Software Design* as a loose style model for clear technical explanation: plain definitions, concrete mechanisms, purposeful headings, and examples that make the idea visible.

Do not copy from the reference. Borrow the style principles:

* lead with a problem the learner can recognize
* define central terms plainly
* explain the mechanism, not just the label
* contrast a tempting wrong model with a better one
* keep examples small enough that the concept remains visible
* end with something the learner can now notice, predict, explain, debug, or do

## Core Principle

Teach the idea itself, not just its importance.

Do not write prose that sounds insightful but leaves the learner unable to define the term, explain the mechanism, predict the outcome, or use the idea in a simple case.

A strong explanation changes what the learner can notice, predict, explain, debug, or do.

Good teaching prose should:

* define the key idea plainly
* explain how it works
* show the idea in a concrete example
* name a realistic mistake, misconception, or boundary case
* give the learner a concrete check or action

## Default Teaching Pattern

For each substantial teaching unit, use this pattern unless there is a good reason not to:

1. Problem: what confusion, task, or failure mode motivates the idea?
2. Definition: what does the key term mean in plain language?
3. Mechanism: how does it work, or why is it true?
4. Example: what small concrete case makes the idea visible?
5. Boundary: what mistake, misconception, or edge case should the learner watch for?
6. Check: what should the learner now predict, explain, compare, debug, or apply?

These do not need to be six separate blocks. They are teaching moves, not a rigid template. A section that skips most of these moves is usually a summary, not a lesson.

## Define Before Use

Do not lean on a technical term before the learner has a usable definition for it.

The first serious use of a term should either:

* define it immediately, or
* come after a plain-language setup that makes the term easier to understand

Avoid sentences where the learner must already understand the term in order to understand the explanation.

Weak:

> Photosynthesis converts light into energy.

Better:

> Photosynthesis is the process plants use to turn light, water, and carbon dioxide into sugar they can store and use. The light does not become energy by magic; it powers a set of chemical reactions that build sugar molecules.

## Explain Mechanisms, Not Just Claims

Do not make abstract claims without explaining the concrete mechanism or consequence.

Weak:

> Evidence supports an argument.

Better:

> Evidence supports an argument when it gives the reader a concrete reason to believe the claim. If the claim is that a policy reduced traffic, useful evidence might show traffic counts before and after the policy changed.

Weak:

> Negative slopes can be confusing.

Better:

> A negative slope means y decreases as x increases. On a graph, the line moves downward as you read it from left to right.

## Contrast the Wrong Model With the Better Model

When a concept is commonly misunderstood, name the tempting wrong model before replacing it.

Do not only state the correct definition. Explain what the learner might incorrectly assume and why that assumption fails.

Weak:

> Correlation does not prove causation.

Better:

> Correlation means two things move together, but it does not prove one caused the other. Ice cream sales and swimming accidents may both rise in summer because hot weather affects both. The shared pattern alone does not show that ice cream causes accidents.

Weak:

> An index makes searching faster.

Better:

> An index is not a magic speed switch. It is a separate lookup structure that can help a system find matching records without scanning everything. It speeds up some reads, but it adds maintenance work when data changes.

Use this pattern especially when the learner is likely to have a plausible but incomplete mental model.

## Local Coherence

A teaching section should feel like one continuous explanation, not a set of related notes.

Each paragraph, callout, code block, table, diagram, notation block, or question should have a clear job:

* introduce a problem
* define a term
* explain a rule
* demonstrate an example
* name a common mistake
* ask the learner to apply the idea

Do not drop in a code block, callout, table, diagram, notation block, or question without context.

Before an example, tell the learner what to look for.
After an example, explain what happened and why it matters.

Weak flow:

1. Explain slope.
2. Show the formula.
3. Add a callout about negative slopes.
4. Ask questions.

Better flow:

1. Explain that slope compares vertical change to horizontal change.
2. Show two points on a line.
3. Ask the learner to identify the rise and run.
4. Show the formula.
5. Walk through why the numerator is vertical change.
6. State the common trap of swapping rise and run.
7. Ask the learner to apply the rule to a new pair of points.

## Code, Notation, and Semantic Blocks

Use code and notation to clarify an idea, not to decorate the page.

If you include a `codeBlock`, `mathBlock`, query, schema, table, diagram, or formal notation, the surrounding prose should do at least one of these:

* define unfamiliar syntax before the example
* tell the learner what to inspect
* walk through the important lines, symbols, cells, or labels after the example
* explain what would change or break if one important part were removed or changed

If the example is not explained, shorten it or remove it.

Use semantic blocks as teaching moves:

* `p` should introduce, define, explain, or connect ideas
* `codeBlock` should make a mechanism visible when exact code matters
* `mathBlock` should clarify a relationship that prose alone would make harder to see
* `callout` should protect the learner from a mistake, boundary, or tempting wrong model
* `list` should help the learner compare, recall, predict, debug, or apply

A block should earn its place by making the learner understand or do something more clearly.

## Quiz and Check Writing Style

This section governs quiz wording. For where quizzes belong and which quiz mode to use, follow `lesson-authoring.md`.

Prompts should be concrete and scenario-based. Prefer questions that ask the learner to predict, classify, debug, compare, or apply a concept.

Weak:

> What is slope?

Better:

> A line moves 3 units up every time it moves 1 unit right. What does that tell you about its slope?

Weak:

> Why is evidence useful?

Better:

> A paragraph claims that a new bus lane reduced commute times. Which evidence would most directly support that claim?

Choices should include plausible distractors based on real learner mistakes.

For every distractor, be able to name the realistic mistake or incomplete mental model it represents. If no plausible learner reasoning leads to the choice, replace it.

Avoid:

- joke answers
- obviously impossible answers
- choices that differ only by wording
- choices where more than one answer could reasonably be defended
- distractors that test reading tricks instead of the concept

Explanations should teach:

- State why the correct answer is correct.
- Explain the underlying concept or mechanism.
- If a wrong answer is tempting, name the misconception.
- Do not merely restate the selected answer.

Avoid predictable answer-position patterns across a quiz. Do not let learners succeed by guessing the same choice position repeatedly.

Weak explanation:

> The answer is B because B is correct.

Weak explanation:

> Correct, because this is the definition.

Better explanation:

> The evidence needs to test the claim directly. If the claim is about commute times, before-and-after commute data is stronger than a general statement that bus lanes are helpful.

## No Floating Insight

Avoid sentences whose main purpose is to sound insightful.

A sentence should teach by doing at least one of these:

* defining a term
* explaining a cause
* naming a consequence
* contrasting two cases
* walking through an example
* giving the learner something to inspect or predict

If a sentence only says that something is important, difficult, abstract, powerful, subtle, or easy to misunderstand, revise it so it names the concrete reason.

Weak:

> A learner can understand an idea in theory and still lose time because the environment feels opaque.

Better:

> A learner may know the formula for slope but still get the wrong answer if they choose the points in the wrong order or divide horizontal change by vertical change. The mistake is not the formula itself; it is misidentifying the two changes the formula compares.

## Avoid Template Prose

The default teaching pattern is a guide, not a script.

Do not make every section use the same rhythm with only the nouns swapped. Vary the teaching shape based on the concept.

A section may begin with:

* a tempting wrong model
* a tiny example
* a practical failure mode
* a comparison between two nearby ideas
* a debugging symptom
* a question the learner is likely to ask

Consistency is useful. Sameness is not.

Reuse a pattern when it clarifies the material, not because it is the easiest template to continue.

## Preferred Voice

Prefer prose that is:

* direct
* concrete
* specific to the topic
* technically precise
* willing to define terms plainly
* willing to name the exact mistake or bad case

Avoid prose that is:

* vague
* inflated
* pseudo-profound
* overly dramatic
* focused on learner archetypes instead of the concept
* made of generic statements that could apply to any topic

If a sentence could be pasted into a lesson about almost any topic, it is probably too generic.

## Number Style

Use numerals for technical values, counts, dimensions, thresholds, scores, quiz choice counts, and code/data values.

Examples:

- 3 rows
- 4 choices
- 60-90 minutes
- 2 sections
- `score >= 80`

Use words when the number is part of ordinary prose and precision does not matter.

## Bad vs Better

Weak:

> Slope is important in math. It tells you how steep a line is. You should understand rise over run.

Better:

> Slope compares vertical change to horizontal change. If a line moves 6 units up while moving 3 units right, its slope is 6 / 3, or 2. That means y increases by 2 each time x increases by 1.

Weak:

> Lazy evaluation can make performance confusing for learners.

Better:

> With lazy evaluation, a line like `c = a + b` may not perform the addition immediately. It may only record the operation that should happen later. If you time only that line, your benchmark can look unrealistically fast because you measured expression construction, not the actual computation.

Weak:

> Evidence is useful because it makes arguments stronger.

Better:

> Evidence makes an argument stronger when it directly tests the claim. If the claim is that a medicine lowered fever, the strongest evidence would compare temperatures before and after treatment, not simply say the medicine is popular.

Use the better pattern as the default:

1. Name the learner's problem or task.
2. Define the term plainly.
3. Explain the mechanism.
4. Show the realistic mistake or tradeoff.
5. Leave the learner with an actionable check.

## Final Check

Before finalizing a chapter or subsection, ask:

* Does the opening start from a real learner confusion, task, or failure mode?
* Is the key term defined before the prose leans on it?
* Does each paragraph have a clear teaching job?
* Does the explanation show how or why, not just that something matters?
* Is there a concrete example, mechanism, or scenario?
* If there is code, notation, table, diagram, or formal representation, is it introduced and interpreted?
* Does every callout protect the learner from a mistake, boundary, or tempting wrong model?
* Does the section flow from one teaching move to the next?
* Does this section sound distinct from the last one, or does it feel like the same template reused?
* Could the learner test themselves after reading?
* After reading, could the learner notice, predict, explain, debug, or do something they could not do before?
