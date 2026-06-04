# Writing Style Reference

Use this when authoring explanation-heavy Tutor Kit prose blocks.

This file governs explanation quality: how to teach an idea clearly in prose. It does not govern full curriculum sequencing, chapter anatomy, or practice volume. For those requirements, follow the canonical learning contract in `lesson-authoring.md`.

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

> Normalization can sound abstract until repeated facts start disagreeing with each other.

Better:

> Normalization means designing tables so each fact is stored in one appropriate place. For example, a customer's email should usually live in the `customers` table, not be copied into every order row. If the email is copied into many rows, one missed update can leave two different emails for the same customer.

## Explain Mechanisms, Not Just Claims

Do not make abstract claims without explaining the concrete mechanism or consequence.

Weak:

> Foreign keys protect relationships.

Better:

> A foreign key is a rule that says values in one column must match existing rows in another table. If `orders.customer_id` references `customers.customer_id`, the database rejects an order whose customer does not exist. That prevents rows from pointing to missing records.

Weak:

> Joins can create surprising results.

Better:

> A join creates one output row for each matching pair of rows. If one customer matches three orders, that customer appears in three joined rows. The repeated customer values are not automatically a mistake; they reflect the one-to-many relationship.

## Contrast the Wrong Model With the Better Model

When a concept is commonly misunderstood, name the tempting wrong model before replacing it.

Do not only state the correct definition. Explain what the learner might incorrectly assume and why that assumption fails.

Weak:

> Joins combine data from multiple tables.

Better:

> A join does not simply glue two tables together. It creates one output row for each pair of rows that satisfies the match condition. If one customer matches three orders, that customer appears in three output rows.

Weak:

> Indexes make queries faster.

Better:

> An index is not a magic speed switch. It is a separate lookup structure that helps the database find matching rows without scanning every row in the table. It speeds up some reads, but it also adds work when rows are inserted, updated, or deleted.

Use this pattern especially when the learner is likely to have a plausible but incomplete mental model.

## Local Coherence

A teaching section should feel like one continuous explanation, not a set of related notes.

Each paragraph, callout, code block, table, or question should have a clear job:

* introduce a problem
* define a term
* explain a rule
* demonstrate an example
* name a common mistake
* ask the learner to apply the idea

Do not drop in a code block, callout, table, or question without context.

Before an example, tell the learner what to look for.
After an example, explain what happened and why it matters.

Weak flow:

1. Explain joins.
2. Show a SQL query.
3. Add a callout about multiplicity.
4. Ask questions.

Better flow:

1. Explain that joins create row pairs.
2. Show a tiny case where one customer has two orders.
3. Ask the learner to predict the number of output rows.
4. Show the SQL query.
5. Walk through why the customer appears twice.
6. State the general rule about multiplicity.
7. Ask the learner to apply the rule to a new case.

## Code, Notation, and Semantic Blocks

Use code and notation to clarify an idea, not to decorate the page.

If you include a `codeBlock`, `mathBlock`, query, schema, table, or formal notation, the surrounding prose should do at least one of these:

* define unfamiliar syntax before the example
* tell the learner what to inspect
* walk through the important lines or symbols after the example
* explain what would change or break if one important part were removed or changed

If the example is not explained, shorten it or remove it.

Use semantic blocks as teaching moves:

* `p` should introduce, define, explain, or connect ideas
* `codeBlock` should make a mechanism visible
* `mathBlock` should clarify a relationship that prose alone would make harder to see
* `callout` should protect the learner from a mistake, boundary, or tempting wrong model
* `list` should help the learner compare, recall, predict, debug, or apply

A block should earn its place by making the learner understand or do something more clearly.

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

> A learner can understand SQL ideas in theory and still lose time because the environment feels opaque.

Better:

> SQL errors can be hard to debug because the database usually tells you where parsing failed, not what mental model was wrong. If a query with a `JOIN` returns too many rows, the database will not say, "Your join matched multiple orders per customer." You have to inspect the data shape yourself.

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

## Bad vs Better

Weak:

> Joins combine data from multiple tables. A primary key uniquely identifies a row. A foreign key refers to a primary key in another table. Joins are important in relational databases.

Better:

> A join helps you answer questions that need data from more than one table. Suppose one table lists students and another lists enrollments. If you want to know which classes Maya is taking, SQL has to connect Maya's row to the matching enrollment rows. It usually makes that connection with IDs. The primary key is the ID that uniquely identifies a row, such as `students.student_id`. The foreign key stores that ID in another table, such as `enrollments.student_id`. If you match the wrong columns, the query may still run, but the answer will be wrong.

Weak:

> Lazy evaluation can make performance confusing for learners.

Better:

> With lazy evaluation, a line like `c = a + b` may not perform the addition immediately. It may only record the operation that should happen later. If you time only that line, your benchmark can look unrealistically fast because you measured expression construction, not the actual computation.

Weak:

> Caching is useful because it improves performance and reduces repeated work.

Better:

> A cache stores a result so the system can reuse it instead of recomputing or refetching it. For example, if a product page asks for the same product details many times, the app can keep the result in memory and serve later requests faster. The tradeoff is staleness: the cached value may no longer match the source of truth.

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
* If there is code or notation, is it introduced and interpreted?
* Does every callout protect the learner from a mistake, boundary, or tempting wrong model?
* Does the section flow from one teaching move to the next?
* Does this section sound distinct from the last one, or does it feel like the same template reused?
* Could the learner test themselves after reading?
* After reading, could the learner notice, predict, explain, debug, or do something they could not do before?
