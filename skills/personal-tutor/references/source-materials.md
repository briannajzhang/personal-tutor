# Source Materials

Use this reference when a user provides or names materials that should influence Tutor Kit generation.

## Purpose

Source materials preserve reusable content for future generation. They help the tutor use user-provided sources without asking the user to repeat content. 

## Material Roles

Classify each material by how it should influence generation:

- `primary`: defines course scope, order, terminology, or assessment emphasis
- `supplementary`: adds examples, practice ideas, alternate explanations, or local context
- `reference`: supports factual checks or grounding without driving the course

If the role is unclear and it affects generation, ask a short intake question. Do not ask the user to classify every material when the role is obvious from the request.

Named external sources count as source materials. Treat them as `reference` by default unless the user says they should define course scope, order, terminology, or assessment emphasis.

## Textbook Artifacts

When materials are used, keep source context in the textbook directory:

```txt
textbooks/<textbook-id>/
  materials-index.md
  source-notes.md
```

`materials-index.md` records material identity, role, availability, and location.

Use `path` for local files and `url` for web sources. Reference raw materials in place by default. 

`source-notes.md` stores concise teaching notes grouped by topic.

Good source notes capture only details that affect generation:

- definitions or terminology to preserve
- examples worth adapting
- practice ideas
- common traps or misconceptions
- sequencing signals
- version, dialect, or syntax constraints
- factual details that reduce hallucination risk

Do not summarize every page by default.

## Workflow

Before authoring from materials:

- Read existing `materials-index.md` and relevant `source-notes.md` sections
- Add new material entries with stable lowercase kebab-case IDs.
- Extract only notes that are useful for the next publication or planned course arc.
- Reflect source-driven scope, terminology, examples, or practice in curriculum-map.md.
- Write or update specs only for chapters being published now.

When continuing a textbook, use existing source notes first. Reopen raw materials only when the notes are insufficient for the next small publication and the path or URL is available.

## Duplicate And Missing Materials

Treat exact normalized path or URL matches as duplicates. Do not reprocess them.

If material is missing, unreadable, or partially extractable:

- record `status: missing`, `status: unreadable`, or `status: partial`
- use available notes when unrelated generation can proceed
- ask before relying on unavailable material for the next chapter

## Guardrails

- Do not claim a chapter is aligned to a material unless relevant source notes exist.
- Do not use missing or unreadable materials as a source basis.
- Keep notes proportional to the next generation task.
