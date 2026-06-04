# Chapter Specs

Use this file when planning chapters before writing full Tutor Kit prose or TypeScript blocks.

A chapter spec is a short planning artifact. It sits between the curriculum map and the authored chapter.

Do not skip from a high-level curriculum map directly to finished chapter prose. First write a chapter spec that explains how the chapter will teach the learner from confusion to usable skill.

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
4. Practice...
5. Reuse...
6. Check...

## Worked Example Plan

Use a small example where:

- setup:
- what the learner should notice:
- walkthrough:
- why it matters:

## Practice Plan

Guided practice:

- ...

Independent practice:

- ...

Retrieval or self-test:

- ...

Cumulative practice, if relevant:

- ...

For programming chapters, decide during the spec whether independent practice should become a runnable `codingProblem(...)`. If yes, the spec should name the intended function, behavior, starter files, tests, and review focus before chapter prose is written.

## Blocks To Author

Likely Tutor Kit blocks:

- `p`: ...
- `codeBlock`: ...
- `callout`: ...
- `list`: ...
- `codingProblem`: ...

## Mastery Check

The chapter is complete only if the learner can:

- ...
- ...
- ...
```

## Required Fields

Every non-trivial chapter spec must include:

* learner outcome
* prerequisites
* new terms to define
* central mechanism or mental model
* worked example plan
* practice plan
* mastery check

Most chapter specs should also include:

* tempting wrong model or misconception
* cumulative reuse of earlier material
* expected Tutor Kit block types
* notes about pacing or depth

## Learner Outcome

Write the outcome as an ability, not a topic label.

Weak:

> Learn SQL joins.

Better:

> Write a query that combines rows from two related tables, predict when the join will repeat rows, and explain why missing or incorrect join conditions produce wrong results.

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

- read a basic `SELECT ... FROM ... WHERE ...` query
- identify a table, row, and column
- understand that IDs can connect records across tables

Briefly review IDs before introducing foreign keys.
```

## New Terms To Define

List technical terms that must be defined before use.

Do not let the chapter lean on these terms in abstract claims before defining them.

Example:

```md
## New Terms To Define

- join: a way to create output rows by matching rows from two tables
- join condition: the rule that decides which rows match
- primary key: a column or set of columns that uniquely identifies a row
- foreign key: a column whose values refer to rows in another table
```

## Central Mechanism Or Mental Model

State the core mechanism the learner must understand.

This is usually more useful than a polished summary.

Weak:

> Joins are important for relational databases.

Better:

> A join creates one output row for each pair of rows that satisfies the match condition. If one row on the left matches three rows on the right, the result contains three joined rows.

Weak:

> Indexes improve performance.

Better:

> An index is a separate lookup structure. It can help the database find matching rows without scanning the whole table, but it adds maintenance work when data changes.

## Tempting Wrong Model Or Trap

Name the plausible mistake the chapter should correct.

Good chapters often replace a natural but wrong model with a better model.

Example:

```md
## Tempting Wrong Model Or Trap

Wrong model:

A join glues two tables together side by side.

Better model:

A join creates one output row for each matching pair. This means the output can have more rows than either input table.
```

## Teaching Path

The teaching path explains the chapter flow before prose is written.

It should not be a table of contents. It should describe the learner's progression.

Weak:

```md
1. Introduce joins
2. Explain inner joins
3. Practice joins
```

Better:

```md
1. Start with a question that cannot be answered from one table alone.
2. Define a join as a row-matching operation.
3. Show a tiny `customers` and `orders` example.
4. Ask the learner to predict how many rows one customer with two orders produces.
5. Walk through the `ON` condition.
6. Name the one-to-many trap.
7. Give guided queries with partial scaffolding.
8. End with an independent query and a debugging prompt.
```

## Worked Example Plan

A worked example should make the mechanism visible.

Before writing the example, specify:

* the small setup
* what the learner should notice
* how the walkthrough will proceed
* what mistake or boundary case the example reveals

Example:

```md
## Worked Example Plan

Setup:

Use `customers(customer_id, name)` and `orders(order_id, customer_id, total)`.

What the learner should notice:

One customer can match multiple orders, so the joined result may repeat the customer name.

Walkthrough:

Show two customers and three orders. Ask the learner to predict the output before showing the query result.

Why it matters:

This prepares the learner to debug duplicate-looking rows and wrong counts in later aggregation queries.
```

## Practice Plan

Do not describe practice vaguely. Instantiate it.

Weak:

> Practice writing joins.

Better:

> Given `customers(customer_id, name)` and `orders(order_id, customer_id, total)`, write a query that returns each customer's name and each order total. Then modify it to include customers with no orders.

A good practice plan usually includes more than one mode:

* guided practice
* prediction
* debugging
* independent application
* cumulative review

Example:

```md
## Practice Plan

Guided practice:

- Fill in the missing `ON` condition for a join between `customers` and `orders`.
- Predict how many rows appear when customer 1 has three matching orders.

Independent practice:

- Write a query that returns customer names and order totals.
- Change the query so customers with no orders still appear.

Debugging practice:

- Fix a query that joins on the wrong ID and produces incorrect matches.

Cumulative practice:

- Add a `WHERE` condition from the previous chapter to filter joined results.
```

## Blocks To Author

Use Tutor Kit blocks as teaching moves, not decorations.

A chapter spec may name likely blocks before the chapter is written:

```md
## Blocks To Author

- `p`: introduce the learner problem and define join
- `codeBlock`: show the first join query
- `callout`: warn that repeated rows can be correct in one-to-many joins
- `list`: guided prediction checks
- `codingProblem`: independent SQL query task, if runnable SQL practice is supported
```

Do not force every chapter into the same block sequence. Match the block shape to the teaching path.

## Mastery Check

The mastery check should verify usable skill, not passive recognition.

Weak:

> Review the key ideas about joins.

Better:

> Given two small tables, predict the joined rows before running the query. Then explain why a customer appears multiple times or disappears from the result.

A chapter is not ready if the mastery check only asks the learner to reread or summarize.

## Spec Quality Check

Before writing the chapter, check:

* Is the learner outcome an ability, not a topic label?
* Are prerequisite ideas named?
* Are new terms listed before prose generation begins?
* Is the central mechanism clear?
* Is there a concrete worked example plan?
* Is practice instantiated rather than merely described?
* Does the spec include at least one learner action: predict, explain, debug, compare, apply, create, or test?
* Does the chapter reuse earlier material when appropriate?
* Would this spec prevent an outline-like chapter?

If the spec is vague, revise the spec before writing prose.
