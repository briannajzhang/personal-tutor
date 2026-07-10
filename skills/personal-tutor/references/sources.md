# Sources

Use this reference when a user provides or names sources that should influence Tutor Kit generation.

## Purpose

Sources preserve reusable content for future generation. They help the tutor use user-provided or user-named sources without asking the user to repeat content.

## Source Roles

Classify each source by how it should influence generation:

- `primary`: defines course scope, order, terminology, or assessment emphasis
- `supplementary`: adds examples, practice ideas, alternate explanations, or local context
- `reference`: supports factual checks or grounding without driving the course

If the role is unclear and it affects generation, ask a short intake question. Do not ask the user to classify every source when the role is obvious from the request.

Named external sources count as sources. Treat them as `reference` by default unless the user says they should define course scope, order, terminology, or assessment emphasis.

## Textbook Artifacts

When sources are used, keep source context in the textbook directory:

```txt
textbooks/<textbook-id>/
  materials-index.md
  source-notes.md
```

`materials-index.md` records source identity, role, availability, and location.

Keep this artifact name; it is the source registry for Tutor Kit textbooks.

Use `path` for local files and `url` for web sources. Reference raw sources in place by default.

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

When a source includes a visual artifact that materially improves the next lesson, such as a figure, screenshot, scanned diagram, or slide image, preserve, extract, screenshot, or recreate it as a textbook asset under `textbooks/<textbook-id>/assets/`. Reference it with `image({ src: "assets/..." })` and record source context or credit when known. Do not extract every visual by default.

## Workflow

Before authoring from sources:

- Read existing `materials-index.md` and relevant `source-notes.md` sections
- Add new source entries with stable lowercase kebab-case IDs
- Extract only notes that are useful for the next publication or planned course arc
- Reflect source-driven scope, terminology, examples, or practice in `curriculum-map.md`
- Write or update specs only for chapters being published now

When continuing a textbook, use existing source notes first. Reopen raw sources only when the notes are insufficient for the next small publication and the path or URL is available.

## Duplicate And Missing Sources

Treat exact normalized path or URL matches as duplicates. Do not reprocess them.

If a source is missing, unreadable, or partially extractable:

- record `status: missing`, `status: unreadable`, or `status: partial`
- use available notes when unrelated generation can proceed
- ask before relying on an unavailable source for the next chapter

## Guardrails

- Do not claim a chapter is aligned to a source unless relevant source notes exist.
- Do not use missing or unreadable sources as a source basis.
- Keep notes proportional to the next generation task.
