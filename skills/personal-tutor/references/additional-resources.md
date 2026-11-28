# Additional resources

Use this reference when selecting or replacing optional chapter `resources`, or rechecking them on request. These are next steps after a self-contained lesson. Inputs that ground lesson generation follow [sources.md](sources.md); being a lesson source does not automatically earn a learner-facing recommendation.

## 1. Decide whether discovery is useful

Consider the need for resources in every chapter, but search only when there is a clear learner benefit: extra practice, greater depth, a canonical lookup, or a different explanation. A learner's explicit request for resources also gives a reason to look. Omission is the default; zero resources is a successful result. Do not invent a gap merely to add links, or outsource required instruction, practice, or visual evidence.

A useful candidate encountered during ordinary lesson research can still qualify without a separate resource search. This policy concerns optional follow-up links; research needed to support the lesson itself remains necessary.

## 2. Find candidates with existing tools

Use the authoring agent's available search and page-reading tools during authoring. Recommendations are saved in the chapter, not generated when a learner opens it. No separate recommendation service is required.

Start with supplied links and relevant existing course materials: the current request, `materials-index.md`, relevant `source-notes.md`, and recorded course references. Local documents can suggest candidates but do not supply a public HTTPS URL automatically. Never reconstruct a URL from a remembered title.

Prefer official project documentation, primary sources, standards publishers, government or institutional material, and original papers for facts within their expertise. Universities and reputable educational organizations can offer strong teaching material; purpose-built exercises, datasets, visualizations, and secondary explanations can be better fits for a particular learner need.

This is a starting order, not an exclusive publisher list. Broaden discovery when supplied or authoritative candidates do not meet the need. An advanced official paper can be a worse beginner practice recommendation than an accessible university lab. Supplied links, official branding, popularity, and search rank never establish suitability by themselves. Respect the learner's source constraints and keep discovery proportional; do not collect a large candidate inventory for its own sake.

## 3. Open and inspect exact destinations

Before selecting a new or replacement resource, use browsing to open its exact URL and inspect enough relevant content to establish:

- **Destination and title:** the actual page and recognizable title; follow redirects and use the inspected final destination when it preserves the intended material.
- **Authority and applicability:** who published it, their expertise for this subject, and the relevant date, jurisdiction, or software version when those affect correctness.
- **Learner fit:** the specific chapter concept, intended level, prerequisites, language, and scope.
- **Added value:** what the learner can do or understand beyond the chapter, supported by the actual content.
- **Access:** whether the relevant content is readable or usable, including login, payment, subscription, or other requirements.
- **Useful location:** a relevant section or video segment when the destination is long; inspect any section link or timestamp the recommendation depends on.

A search snippet, title, thumbnail, or successful HTTP response is insufficient. A response might contain a login wall or unrelated page. If a particular destination cannot be inspected, omit that candidate; other inspected candidates can still be selected. Do not claim feedback, exercises, interactivity, or other benefits that the page does not provide.

Prefer freely accessible material. A gated resource can qualify only when the learner has access or explicitly wants it, and the relevant content can actually be inspected. Disclose the barrier in the description. Do not create accounts or purchase access for verification.

Use absolute HTTPS URLs without embedded credentials. Prefer stable canonical destinations over shortened, temporary, signed, session-bound, or token-bearing links. Reject search-result pages, generic homepages, content farms, and affiliate or heavily promotional destinations. Social posts qualify only when the post itself is the relevant primary artifact and passes the same checks. Long videos need an inspected relevant segment and a concrete benefit, rather than a promising generic title.

For medical, legal, financial, safety-sensitive, or rapidly changing subjects, require current authoritative evidence applicable to the learner's context. Reject user-generated high-stakes advice and stale or inapplicable guidance. Omit a candidate when current applicability cannot be established.

## 4. Without browsing, omit the selection

If browsing is unavailable, omit all resources from any new or replacement selection, including exact URLs supplied by the learner or recorded in trusted course notes. Earlier inspections, excerpts, and remembered destinations do not substitute for opening the page for this selection. Do not guess URLs or describe an unavailable page as freshly checked.

If resources were explicitly requested, briefly explain the verification limitation in the handoff. Continue the lesson when its own content is adequately supported; if necessary facts for the lesson cannot be established, narrow the claim or request the missing source instead of inventing details.

This does not trigger removal of untouched links from existing chapters; the rechecking scope below still applies.

## 5. Compare survivors with reasons

Use reasoned comparison rather than a numerical scoring formula or required worksheet. First exclude candidates that fail verification, credibility, relevance, or the learner's access constraints. Strength elsewhere cannot compensate for an unverified destination.

Compare the survivors by how directly they meet the learner's next-step need, fit their level, add something beyond the chapter, remain usable, and differ from other selections. A concrete chapter-specific description should make the reason for inclusion apparent. Do not require a separate planning or justification artifact.

## 6. Prefer website variety without enforcing it

Normally choose the strongest page from a website rather than several similar pages from the same documentation site. Different paths or fragments do not make repeated material diverse. Compare the learning benefits, not merely URL strings.

Website variety is a recommendation only. Two pages from the same website can both earn a place when they contribute distinct value, such as a practice lab and an exact reference. Do not reject useful complementary pages automatically, or choose weaker websites merely to create variety. This preference applies within a chapter, not across the whole textbook. There is no runtime site limit or automatic removal rule.

## 7. Let added value determine the count

Start with zero, select the strongest candidate, and add another only while it offers a worthwhile distinct next step. Prefer zero to three; this is guidance, not a quota or ceiling. More than three is allowed when the added choices each justify the learner's attention, including when a learner requests a broader selection. Do not truncate automatically, issue a count warning, or add weak links to reach three. No purpose coverage quota applies.

Exact normalized duplicate URLs remain invalid under the runtime contract. Even when different fragments or query strings pass structural validation, omit recommendations that repeat the same learning value. Preserve meaningful section and timestamp parameters; remove tracking only if the resulting destination is inspected.

## 8. Describe the primary learner benefit

Use a recognizable title supported by the inspected page, its exact inspected URL, one specific description, and one primary purpose. Classify by the main benefit, not format or publisher:

| Purpose | Learner's main reason to open it |
| --- | --- |
| `deepen` | "I understand; take me further with more detail or rigor." |
| `practice` | "Let me apply this through an activity or exercise." |
| `reference` | "I need to look up the exact rules or canonical information." |
| `alternate-explanation` | "Help me understand the same idea through a different framing." |

A lab with a deeper explanation can primarily be `practice`. Choose `deepen` when additional detail is the main value and `alternate-explanation` when a different framing is the main value. A video can serve any purpose. Assign one purpose even when several apply. A `reference` recommendation is not a substitute for grounding a lesson claim.

Descriptions connect the resource to this chapter's learner. For an inspected lab that actually supports the activity, "Reorder two transactions to reproduce the lost update from this chapter, then test how locking changes the result" is useful. "Learn more about transactions" does not explain its added value. Avoid promotional claims and unsupported promises.

Author selections as chapter metadata, not resource blocks or duplicate lesson sections. Follow [tutor-kit-api.md](tutor-kit-api.md) for the four-field schema. Do not add author, date, format, verification, or scoring fields. Tutor Kit renders nonempty selections in the collapsed **Continue exploring** disclosure and omits the disclosure for missing or empty resources.

## 9. Recheck existing resources on request

Rechecking means opening an already recommended page again to establish whether it still works and fits. Do this only when the learner requests a resource review or reports a link problem, within the requested scope. Elapsed time, ordinary chapter edits, continuation, and opening a chapter to study do not trigger an audit. Preserve untouched existing resource metadata during unrelated edits.

Adding or replacing a recommendation always requires the page inspection above; this is initial verification of that selection, not a background audit. On a requested review, inspect the scoped pages again, keep those that still qualify, and propose updates, replacements, or removals for those that do not. If browsing is unavailable for a requested new selection or review, propose no resources and explain the limitation; never claim the previous inspection was a fresh recheck. Apply authorized changes through the normal work-area and publication workflow.

Do not create scheduled checks, monthly maintenance, or library-wide link reviews without a separate request. Verification establishes what was observed during authoring or review; it does not guarantee future availability.

## 10. Review the selection before publishing

Before publishing, check the selection against these rules and run the normal Tutor Kit checks. Runtime validation verifies structure, required fields, supported purpose, HTTPS syntax, credentials, and exact normalized duplicates. It does not open websites, judge learning value, or enforce count and website-diversity preferences.
