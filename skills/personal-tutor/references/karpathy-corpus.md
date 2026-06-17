# Karpathy Corpus

Use this reference when a lesson, project, tutorial, or course would benefit from better educational taste: clearer buildup, more concrete examples, livelier prose, stronger pacing, and more inspectable artifacts.

## Contents

- Purpose
- What is bundled
- How to use it
- Search patterns
- Attribution guardrails

## Purpose

This skill includes a primary-source corpus inspired by Andrej Karpathy's public educational work. Treat it as a taste layer and reference shelf, not a mandatory template. It should help Personal Tutor write material that feels more concrete, curious, code-forward, and carefully built up.

Do not make every lesson mention Karpathy. Do not claim that Karpathy authored, reviewed, or endorsed generated material. It is fine to describe this project as an homage when the user asks about the skill or project identity.

## What Is Bundled

The corpus lives in `assets/karpathy-corpus/`:

- `manifest.json`: primary-source metadata, URLs, licenses/provenance, transcript status, and file pointers.
- `transcripts/*.jsonl`: normalized transcript rows for public YouTube lectures and talks.
- `cards/*.md`: distilled teaching observations with source pointers and timestamp hints.

The corpus intentionally avoids fan notes and broad web summaries in v1. Prefer primary-source material.

## How To Use It

Use the corpus selectively when improving learning material. Good moments include:

- a chapter draft feels generic, flat, or textbook-ish
- a project tutorial explains too much before showing a real artifact
- examples are abstract when they could be runnable, inspectable, or surprising
- practice asks the learner to recall instead of change, debug, extend, or test something
- pacing jumps from concept to abstraction before the learner has seen why the abstraction exists

Start with `references/karpathy-teaching-taste.md`. If more grounding would help, search the corpus assets and read only the matching transcript/card snippets.

## Search Patterns

Prefer targeted `rg` searches over loading full transcripts:

```bash
rg -n "from scratch|spelled out|exercise|debug|shape|gradient|loss|sample|inspect" <skill-dir>/assets/karpathy-corpus
rg -n "tiny|simple|manual|under the hood|build" <skill-dir>/assets/karpathy-corpus/cards
rg -n "source_id.*zero-to-hero-gpt|self-attention|token" <skill-dir>/assets/karpathy-corpus/transcripts
```

When using transcript rows, read nearby rows around the timestamp instead of copying large passages. Summarize patterns in your own words.

## Attribution Guardrails

- Use high-level style and pedagogical patterns, not long copied passages.
- Cite or mention source inspiration when the user asks for provenance, when a lesson directly adapts a specific public exercise, or when a project-level note discusses the homage.
- Keep ordinary learner-facing lessons focused on the learner and the subject, not on the corpus.
- Do not imply affiliation, endorsement, authorship, or approval by Andrej Karpathy.
