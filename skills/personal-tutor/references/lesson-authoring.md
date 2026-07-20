# Lesson Authoring

Use this reference when writing learner-facing Tutor Kit chapters, sections, examples, and prose blocks.

## Contents

- Learning contract
- Chapter structure
- Teaching prose
- Worked examples
- Semantic blocks
- Choosing visual blocks
- Glossaries
- Transformation blocks
- Quizzes in lessons
- Titles and descriptions
- Anti-patterns

## Rich lesson prompts

Aim to help the learner do something, not only read about something. Treat the following moves as a rich default and a source of ideas. They are not a required chapter schema.

Depending on the subject and scope, consider:

- a learner-facing goal or problem
- clear term introductions when a term carries the explanation
- explanation of the central mechanism
- worked examples with inspectable input and result
- local concept checks near major ideas, examples, traps, or boundary cases
- guided practice
- independent practice
- retrieval or self-test prompts
- a final review or mastery check
- realistic misconceptions, traps, or boundary cases

A lesson often becomes richer when the learner can use, test, predict, compare, classify, explain, debug, or create with the idea. Let a deliberately brief lesson stay brief when that matches the request.

## Chapter Structure

Use sections and subsections as teaching structure, not decoration.

- Use sections and subsections when they help the learner see the teaching structure.
- Separate concept introduction, worked examples, exploration, practice, and review when that improves the learning flow.
- Combine or omit those parts when a different shape works better.
- Use semantic roles when they clarify purpose. No role or section count is required for an ordinary lesson.

Use roles:

```ts
chapter({ role: "instruction", ... })
section({ role: "instruction", ... })
section({ role: "practice", ... })
section({ role: "review", ... })

chapter({ role: "cumulative-checkpoint", ... })
section({ role: "assessment", ... })
```

Roles describe teaching purpose. They do not require every chapter to use the same layout.

## Teaching Prose

Teach the idea itself, not just its importance.

Apply the mechanism guidance from `quality-core.md`: make important terms usable before the lesson relies on them, and ground evaluative language in concrete reasons.

Useful teaching moves include:

- motivation: what confusion, task, or failure makes the idea worth learning
- definition: what the key term means in plain language
- mechanism: how the idea works, or why it is true
- example: what concrete case makes the idea visible
- boundary: what mistake, misconception, or edge case the learner should watch for
- check: what the learner should now predict, explain, compare, debug, or apply

Choose and order these moves based on what the topic and learner need. A short explanation may only need a definition and example; a difficult mechanism may need several cycles of example, boundary, and check.

Weak:

```txt
Indexes improve performance.
```

Better:

```txt
An index is a separate lookup structure. It can help a database find matching rows without scanning every row, but it adds maintenance work when data changes.
```

This pair is illustrative, not a required prose template. The better version works because it gives the learner the lookup benefit and the write-maintenance cost, not just an evaluative label.

## Worked Examples

A worked example should make the mechanism visible.

Usually include:

- input, context, or starting state
- operation, reasoning step, or action
- visible result, output, or conclusion
- explanation of why that result follows

For examples involving data, code, math, diagrams, images, revisions, evidence, or other artifacts, show the artifacts. Do not only describe the result in prose.

Before an example, tell the learner what to inspect. After an example, explain what happened and why it matters.

## Semantic Blocks

Use semantic blocks as teaching moves:

- `p`: introduce, define, explain, or connect ideas.
- `heading`: add local structure inside a larger section.
- `list`: give concrete tasks, comparisons, retrieval prompts, or scan-friendly points.
- `codeBlock`: show exact code, queries, commands, schemas, or structured examples.
- `mathBlock`: show displayed equations or formal notation.
- `diagram`: show a flow, relationship, hierarchy, state transition, or system structure.
- `chart`: show a small numeric comparison or trend.
- `image`: show a durable raster artifact such as a screenshot, source figure, generated illustration, photo, scanned figure, UI capture, or concrete visual example.
- `component`: mount trusted frontend code for an interaction, simulation, or animation that built in blocks cannot express.
- `callout`: protect the learner from a misconception, warning, boundary, or key idea.
- `transformation`: model an inspectable input-to-result relationship.
- `glossary`: give compact retrieval support for important terms already introduced in prose.
- `quiz` and `balancedQuiz`: create local checks, review, and cumulative assessment.
- `codingProblem`: create runnable or checkable practice.

Prefer several semantic blocks over one giant Markdown string.

Prefer built in blocks before creating a component. When a component is justified, keep one clear teaching purpose, give the learner a meaningful control, and show a visible consequence. The component runs in the lesson page and can use the DOM, SVG, Canvas, WebGL, workers, browser storage, and installed frontend packages. It is trusted application code, not isolated content.

Before a `codeBlock`, `mathBlock`, table, diagram, image, formal notation, or example, tell the learner what to inspect. After it, explain what it showed.

`explanation` and `blurb` are legacy aliases. Do not use them in new material.

## Choosing Visual Blocks

Use visual blocks when seeing something helps the learner build or check the mental model, not because a chapter needs decoration.

An image block is not automatically visual grounding. When the learner must recognize a real-world appearance, use observational images that preserve the relevant perceptual cues. A schematic drawing saved as PNG or SVG is still a diagram and usually does not satisfy this need.

Use diagrams and transformations alongside appearance evidence to explain causes, processes, or reasoning, not as substitutes for the appearance the learner must inspect.

When no suitable source or user image is available and image-generation tools are available, use them to create photo-like teaching exemplars rather than schematic stand-ins when realism affects the teaching claim. Generated examples should be labeled as generated. In medical, safety-critical, scientific-evidence, or authenticity-sensitive contexts, prefer authoritative real examples; generated images should not be presented as diagnostic ground truth.

Use `image(...)` for durable raster artifacts that ground the learner in visual appearance, context, evidence, examples, source figures, screenshots, generated illustrations, or concrete real-world referents. An image can be supportive context; it does not need to carry the whole teaching move, but it should be tied to nearby explanation, alt text, and a useful caption or readout.

When the teaching move depends on the learner noticing particular regions, parts, states, differences, symptoms, or cues inside an image, add the lightest inspection scaffold that makes the image readable. Good scaffolds include a focused caption/readout, numbered inspection prompts, a companion `diagram(...)`, a cue-to-meaning table, or a `transformation(...)`. Use images for recognition and grounding; use transformations only when the learner should inspect how visible cues lead to reasoning or outcomes. Do not force a whole cue catalog into one transformation. Do not assume the image is self-explanatory, and do not label every image by default.

For recognition practice, phrase the scaffold as a learner action or cue rather than authoring meta-commentary. Prefer prompts such as "first identify the structures by shape and position" or "scan where edges smear and which distance plane stays sharp" over captions that explain the design choice, such as saying the image is unlabeled on purpose. If visible labels would answer the task too early, use prompts, delayed checks, answer keys, companion diagrams, or cue-to-meaning readouts as appropriate.

Use `diagram(...)` when the learner needs to trace abstract relationships, routes, flows, hierarchies, ownership, sequence, boundaries, branching, handoffs, loops, or state changes. Good diagrams make arrow meanings and node labels concrete.

For diagrams, match the visual shape to the teaching claim. Boundaries should look like zones, flows should label payloads or actions, sequences should preserve order, and state changes should show transitions. A diagram should answer one inspection question: what connects, moves, changes, branches, or owns the work?

Use `chart(...)` when the learner needs to compare numeric magnitude, direction, trend, threshold, or outlier. Good charts use a defined metric or scale.

For charts, make one numeric inspection question visible: what magnitude, direction, trend, threshold, or outlier should the learner compare? Axis labels should name the category or time dimension and the measured unit or denominator, such as `Outcome` and `Percent of checkout attempts`. Avoid vague labels like `Signal`, `Score`, or `Value` unless the surrounding text defines the metric or scale. Avoid mixing different units or denominators in one chart.

When a lesson involves something learners would naturally benefit from seeing, consider `image(...)` even if a diagram or `transformation(...)` is also useful. Use both when helpful: image for grounding, context, evidence, or recognition; diagram for labels, structure, flow, or abstraction; chart for numeric comparison or trend.

Project-bound images belong under `textbooks/<textbook-id>/assets/` and should be referenced with `src: "assets/..."`. The agent may generate images, extract or screenshot useful visuals from user-provided PDFs/slides/notes, use user-provided images, or use online images while authoring. Save the chosen asset locally before referencing it. For online images, include credit or source context when known, especially if the material may be shared.

For generated, extracted, screenshot, user-provided, or online images, audit whether the important visible features are accurate and distinguishable enough for the teaching claim. If not, revise the image choice or add a companion scaffold before relying on it.

Prefer prose, lists, code, math, `transformation(...)`, or a table when the teaching move is qualitative, definitional, or a concrete input-to-output model.

Avoid visuals with vague node names, unlabeled arrows that mix meanings, decorative flowcharts, or scores that imply precision without a defined scale. Split or replace diagrams that mix unrelated meanings, such as buyer/user roles, data movement, and product output in one unclear picture. Frame what to inspect before the visual and explain the takeaway afterward.

## Glossaries

Use `glossary(...)` only when later retrieval or distinction-making is genuinely useful to the learner. A glossary is optional; it is not a chapter-completion marker, a summary block, or the natural destination for every term defined in prose.

First decide whether the learner will need to recall, distinguish, or reuse a meaningful cluster of terms after the current explanation is over. If not, define the terms inline and rely on examples, checks, practice, or review instead.

For term selection, prefer durable retrieval handles: recurring formal terms, central mechanisms, syntax or API names, and concepts that are easy to confuse with neighboring ideas. Skip ordinary language, one-off labels, local example names, section headings, broad topic categories, and vocabulary the chapter mentions but does not build on.

Treat glossary terms as retrieval handles. Use the exact form the learner saw in the lesson, with inline code formatting for code-like terms.

A term can be important enough to define in prose without being important enough for a glossary. Prefer a smaller set the learner would actually study over a complete-looking list.

Place a glossary where it best supports retrieval after use. Chapter review is a good default for chapter-wide durable terms; a section or subsection ending is better for a local cluster that will not carry across the whole chapter. If a term cluster recurs across many chapters, prefer a small chapter glossary only when it supports the current chapter's practice, and let the textbook glossary aggregate repeated terms. Do not move a glossary earlier just to define terms; teach first, then make the terms retrievable.

Teach concepts first with prose, examples, mechanisms, boundary cases, and checks. A glossary should not be the first or only teaching move for a concept.

Many good chapters should simply define terms inline and use practice or review instead of a glossary.

Do not place visible definitions immediately before definition-recall questions unless the section is intentionally guided.

## Transformation Blocks

Use `transformation(...)` when seeing a starting artifact, reasoning move or action, and result together makes a mechanism easier to inspect. The widget should make the relationship clearer than ordinary prose, a list, table, code block, diagram, image scaffold, quiz, or practice would.

Distinguish worked decisions from classification coverage. Use a transformation when one representative case needs the starting artifact, reasoning/action, and result visible together. When the learner is sorting several examples into categories, prefer a table, list, matching quiz, or practice unless the transformation view makes the decision process more inspectable.

The learner should be able to follow one visible thread from starting artifact through reasoning/action to result. If the block depends on row IDs, letters, or repeated labels to connect many cases across separate panels, it is probably cross-reference or classification work; use a single table, list, quiz, or practice unless the split view materially clarifies one decision path.

Keep the worked relationship small enough to read at normal lesson size. If the artifact becomes a catalog, broad comparison, summary, dense reference table, generic before/after decoration, or answer key before the learner has attempted the task, use another teaching move.

Labels, focus text, and surrounding prose should clarify the domain roles and inspection task. Use nearby framing or readout when the built-in explanation is not enough for the learner to generalize the mechanism. Put broader coverage in ordinary semantic blocks, checks, or practice.

## Quizzes In Lessons

Use quizzes for fast conceptual diagnosis, retrieval, misconception checks, prediction, classification, chapter review, and cumulative mixed review.

Choose quiz format and builder from the assessment purpose. Keep each quiz close to the concept, example, trap, or review target it checks.

Use:

- `mode: "check"` for local comprehension near a new idea or example. Use 1-3 questions.
- `mode: "review"` for chapter mastery in the final review section. Use 4-10 questions.
- `mode: "practice-test"` only in dedicated cumulative checkpoint chapters. Use at least 10 questions.

Quiz explanations should teach the mechanism. Do not merely restate the answer.

Use plausible distractors that require understanding to reject and leave one answer clearly best; see `practice-and-assessment.md` for quiz design guidance.

## Titles And Descriptions

Prefer learner-facing, concept-based titles.

Weak:

```txt
Week 2
Phase B
Practice Section
```

Better:

```txt
Filtering Rows With WHERE
Debugging Off-By-One Loops
Comparing Evidence And Claims
```

Use chapter descriptions consistently within a textbook: either every non-trivial chapter has a concise description or none do.

## Anti-Patterns

Avoid:

- exposition-only chapters
- one giant section with headings doing all structural work
- practice that appears only as a vague list at the end
- examples without visible input and result
- code, notation, or tables without surrounding interpretation
- glossaries used as first teaching
- glossaries that preview untaught vocabulary
- visible definitions immediately before unguided definition recall
- quizzes used as decoration
- chapter review questions copied from local checks without new context
- identical chapter shapes reused regardless of topic complexity
- independent tasks that require untaught concepts
- programming chapters with code examples but no runnable practice when runnable practice would improve feedback
