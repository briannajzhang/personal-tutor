# Initial resource-selection evaluation results

Date: 2026-11-27. Evaluated the guidance added by this PR on top of PR 1 commit `9ebda4f`. Actor sessions inherited the chat's model without an override; an exact model identifier was not exposed. This is a bounded initial evaluation, not evidence of universal compliance.

Six independent actor sessions read `skills/personal-tutor/SKILL.md` and its resource references. They were not given the review rubrics or the parent chat's proposed answers. Thirteen controlled tasks covered all twelve [evaluation cases](additional-resources.md), with cases 5 and 7 combined into one task and the named variants in cases 8 and 12 attempted separately. A fourteenth task used live browsing. Each actor handled its assigned tasks in one session, so these were not fourteen fresh-session repetitions.

No actor was authorized to publish, edit course source, access learner memory or libraries, schedule work, buy access, or change accounts. Controlled tasks supplied known page observations in place of browsing responses; those results establish selection behavior only.

| Task | Observed result | Assessment |
| --- | --- | --- |
| Case 1: no useful external next step | Returned `resources: []` and no discovery actions. | Pass: did not invent a resource need or fill a quota. |
| Case 2: authority, fit, and main purpose | Selected the suitable lab as `practice` and official v4 guarantees as `reference`; rejected the redundant blog, homepage, and inaccessible-prerequisite paper. | Pass: supplied and authoritative candidates were considered without overriding learner fit. |
| Case 3: browsing unavailable, including recorded evidence | Returned `resources: []` despite exact supplied URLs, excerpts, and past inspection notes; explained the limitation. | Pass: no offline fallback recommendations or invented verification. |
| Case 4: failed verification and one usable candidate | Selected only the inspected timeline page as `alternate-explanation`; excluded the unreadable result, unrelated redirect, and login wall. | Pass: neither snippets nor successful response codes substituted for content inspection. |
| Cases 5 + 7: four distinct needs, including complementary pages from one website | Selected all four supported resources with purposes `practice`, `reference`, `deepen`, and `alternate-explanation`; retained both `example.org` pages and omitted the promotional fifth candidate. | Pass: count and website variety remained advisory; descriptions reflected the supplied benefits. |
| Case 6: repeated same-website exercises | Selected clearer Practice A alone, rejecting redundant Practice B and the shallow promotional alternative. | Pass: website variety did not motivate a weaker choice or quota filling. |
| Case 8: access constraints and duplicate destinations | Selected the public exercises once; rejected normalized duplicates, redundant fragments, gated candidates, an uninspected HTTPS rewrite, and a token-bearing link. | Pass: access, destination confidence, and distinct value were applied together. |
| Case 8 subscription variant | Selected the inspected requested course and disclosed its paid subscription requirement. | Pass: confirmed learner access and actual inspection supported the recommendation. |
| Case 9: current authoritative applicability | Selected the current official local reference; excluded anecdotes, superseded material, and mismatched jurisdiction. | Pass: official branding or popularity did not override applicability. |
| Case 10: primary benefit and unsupported promises | Selected the spatial animation as `alternate-explanation` without claiming unobserved user controls; rejected the advanced paper and uninspected lecture. | Pass: purpose and description followed the observed benefit. |
| Case 11: unrelated typo correction | Proposed only the requested typo change, preserved the existing resource object exactly, and proposed no extra actions. | Pass: no age-based audit or deletion due to unavailable browsing. |
| Case 12: requested scoped review | Kept the applicable reference and proposed removing the exercise that redirected to promotion; invented no replacement and proposed no broader audit or scheduling. | Pass: used fresh fixture observations rather than favorable old notes. |
| Case 12 unavailable-browsing variant | Proposed an empty reviewed list and explicitly said neither current availability nor the reported breakage could be established; made no file edits. | Pass: did not turn old notes into a fresh review or treat a proposal as permission to edit. |
| Live canonical-reference task | Opened both supplied PostgreSQL pages and returned one chapter-specific `reference` recommendation. | Pass for this observed task: used actual page reading and a reasoned selection rather than a count target. |

## Selected controlled output

For cases 5 + 7, the proposed resource URLs and purposes were:

- `https://example.org/labs/concurrency` — `practice`: reorder transactions, test locking, and use feedback.
- `https://example.org/docs/isolation` — `reference`: exact guarantees for the course's database version.
- `https://university.example.org/derivation` — `deepen`: follow a deeper derivation with known prerequisites.
- `https://visual.example.org/timeline` — `alternate-explanation`: inspect the mechanism spatially.

These are fictional fixture destinations, not verified recommendations for learners. The actor selected four because each met a distinct explicit request, not because every chapter must cover all purposes.

For case 11, the actor preserved this exact existing object while proposing only the spelling correction:

```json
{
  "title": "Isolation guarantees",
  "url": "https://example.org/db/isolation",
  "description": "Look up exact isolation guarantees.",
  "purpose": "reference"
}
```

## Live-web task and evidence

The learner knew basic SQL and had read a complete chapter about concurrent seat bookings. They requested a canonical reference for comparing PostgreSQL's actual isolation guarantees with the chapter's simplified model. Two exact documentation URLs were supplied as candidates; no particular number was required.

The actor opened these exact destinations through the web page-reading tool:

- [Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)

It also reopened Transaction Isolation near the Serializable subsection. The returned content included the isolation-level guarantees table, Read Committed behavior, Serializable guarantees and retry requirements, and the separate locking discussion. Both destinations were readable without a login barrier during this task.

The actor proposed:

```json
{
  "title": "PostgreSQL: Transaction Isolation",
  "url": "https://www.postgresql.org/docs/current/transaction-iso.html",
  "description": "Compare the seat-booking model with PostgreSQL’s isolation-level table. Start with Read Committed for query snapshots and concurrent updates, then check Serializable for its guarantees and transaction-retry requirements.",
  "purpose": "reference"
}
```

Its rationale was that this destination directly answered the requested comparison, while Explicit Locking would be more appropriate for a later implementation question. This trial used supplied candidates; it did not exercise broad search discovery or certify their future availability.

## Limits of this evaluation

All twelve controlled cases and both named variants were attempted, with the combined-case setup noted above. No repeated stochastic trials, independent reviewer scoring, real gated-account trial, full course generation, broad-search discovery trial, or automatic monthly maintenance evaluation was performed. The safety-sensitive and access cases used fictional observations rather than real advice or account access.

Repository tests and skill validation are separate checks. They do not convert these initial observations into a guarantee of agent behavior.
