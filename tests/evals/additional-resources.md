# Additional-resource selection evaluations

These cases evaluate agent behavior, not whether documentation contains particular wording. Use the current `skills/personal-tutor/SKILL.md` and its references. Give the actor the request and evidence only; keep review criteria separate until judging its response. Ask for proposed chapter `resources` (or omission), a short rationale, and observed browsing actions. No course publication, learner-library access, account changes, purchases, or scheduling is part of these evaluations.

Run cases in fresh agent sessions when possible. For controlled cases, `example.org` URLs are fixtures, not live recommendations: the listed page observations stand in for browsing-tool responses. They test decisions given known evidence, not whether a real tool was invoked. When browsing is marked unavailable, disable it in the harness or explicitly withhold its use. Supplement controlled cases with a live-web trial and inspect its tool trace for exact-page opening; do not infer verification from the final prose alone.

The repository's `npm test` command does not launch these model evaluations. It verifies runtime and package behavior. Do not report these cases as passed unless an actor actually attempted them.

## 1. No discovery without a useful next step

**Request:** Finish a short beginner lesson distinguishing authentication from authorization. Its explanation, examples, and local check already meet the learner's need. No additional reading was requested or specific external next step identified. Propose optional resources if appropriate.

**Evidence:** No candidates supplied; browsing is available.

**Review:** Omit resources without searching merely to populate the field. Do not invent a gap or move required instruction out of the lesson. Resource discovery is separate from factual research needed for the lesson.

## 2. Source preference, learner fit, and primary purpose

**Request:** Choose next steps for a beginner chapter on lost updates. The learner wants hands-on practice and an exact reference for the course's v4 database guarantees. Supplied course notes identify the official documentation as a candidate. Inspect candidates before selecting.

**Page observations:**

| URL | Observed content |
| --- | --- |
| `https://example.org/db/v4/isolation` | Official v4 documentation; title “Isolation guarantees”; exact guarantees, publicly readable. |
| `https://university.example.org/labs/lost-update` | Public university “Lost update lab”; suitable transaction-reordering exercises, feedback, and some deeper explanation. |
| `https://example.org/blog/isolation-intro` | Accurate introduction repeating the chapter's example; no new tasks. |
| `https://example.org/db/` | Official product homepage; announcements, no useful isolation treatment. |
| `https://papers.example.org/serializability` | Credible original paper; assumes advanced mathematics the learner lacks. |

**Review:** Select the lab primarily as `practice` and the exact guarantees as `reference`. Reject the redundant introduction, generic homepage, and unsuitable paper. Authority alone does not outrank fit. Do not fill a third slot merely because it is available.

## 3. No browsing, even with recorded evidence

**Request:** Browsing is unavailable. Select optional practice resources for a new arithmetic chapter using existing course notes if appropriate.

**Evidence:** Trusted notes contain `https://example.org/math/fractions`, title “Fraction practice,” an earlier inspection record, and excerpts of suitable university exercises with feedback. The learner also supplies an exact URL and excerpt for `https://example.org/math/visual-model`. A remembered animation has no exact recorded URL.

**Review:** Propose no resources, including both exact documented URLs. Do not fall back to old inspections, reconstruct the remembered URL, or claim fresh verification. Explain the limitation because resources were requested. The lesson can proceed if its content is otherwise supported.

## 4. Destination inspection, not snippets or response codes

**Request:** Choose further reading for a completed chapter. Browsing works, but some candidates may fail.

**Page observations:** One promising search result cannot be opened. Another returns status 200 but redirects to an unrelated homepage. A third shows a login wall without readable relevant content. A fourth, `https://university.example.org/transactions/visual`, opens publicly with title “Two transactions on a timeline” and a suitable different framing of the same chapter concept.

**Review:** Only the inspected relevant fourth page qualifies. Do not reject it because other candidates failed, or use snippets, successful responses, or login-page titles as proof of content. Describe the supported visual benefit as `alternate-explanation`.

## 5. Count is advisory

**Request:** I want four optional follow-ups: an accessible deeper derivation, active practice with feedback, a canonical lookup, and a visual alternate explanation. Choose suitable resources for each need if the inspected candidates support them.

**Page observations:** `https://depth.example.org/derivation`, `https://practice.example.org/exercises`, `https://reference.example.org/guarantees`, and `https://visual.example.org/timeline` each open publicly with those recognizable titles and exactly the requested distinct benefit. They match the learner's level, are credible for their roles, and add material beyond the chapter. No other candidates are supplied.

**Review:** Four resources are allowed and meet the explicit request. Do not truncate to three, warn about exceeding a maximum, or claim compilation rejects four. Assign primary purposes from the observed benefits. This case does not create a general requirement to cover all purposes.

## 6. Website variety as a preference

**Request:** Select extra practice for a beginner chapter. I do not need a particular number of links.

**Page observations:** Two public pages at `https://example.org/docs/practice-a` and `https://example.org/docs/practice-b` contain substantially the same exercises; A is clearer and has better feedback. A third at `https://another.example.org/intro` is public but shallow, promotional, and repeats the lesson. All titles and relevant content have been inspected.

**Review:** Normally choose A alone. Different paths do not make the first two contributions diverse. Do not add the weak third candidate just to use another website or reach a count. Assess the reasoning, not a mechanical domain count.

## 7. Complementary same-website resources are allowed

**Request:** I want an optional hands-on concurrency lab and an exact reference for isolation guarantees. Select resources that meet both needs; website variety is only a preference.

**Page observations:** `https://example.org/labs/concurrency` is a suitable public “Concurrency lab” with practice and feedback. `https://example.org/docs/isolation` is a suitable public “Isolation guarantees” reference. Each contributes a distinct requested benefit beyond the chapter. A different website has only an advanced, redundant article. All relevant content has been inspected.

**Review:** Both same-website pages can earn a place, as `practice` and `reference`. Do not enforce one-per-domain, invent exceptions that require permission, or choose the inferior alternative for variety. Runtime validation has no site-count restriction.

## 8. Access, URL confidence, and duplicates

**Request:** Recommend free exercises without an account requirement.

**Page observations:** `https://example.org/exercises/locking` provides suitable public exercises and feedback. `https://EXAMPLE.org:443/exercises/locking` is the same normalized address; `https://example.org/exercises/locking#intro` adds no separate learning value. Other relevant candidates require a paid subscription or free account. A remembered HTTPS rewrite of an HTTP-only candidate has not been opened. A temporary signed URL contains a private access token.

**Review:** Choose at most one version of the public exercises. Reject gated candidates under the learner's constraint, uninspected URL rewrites, and token-bearing destinations. Do not put rejected links in lesson blocks. Exact duplicate URLs are invalid; different fragments can still be educationally redundant.

**Variant:** The learner explicitly wants a paid course and confirms subscription access. Its relevant content can be inspected. It may qualify with the barrier stated in the description. A login wall alone never establishes the content's value.

## 9. Current authority and applicability

**Request:** Choose an optional reference for a safety-sensitive lesson governed by the learner's local official guidance.

**Page observations:** A current applicable official page directly addresses the lesson's question. A popular forum offers conflicting anecdotes. An official archived page says it was superseded, but its replacement cannot be inspected. A current page from another jurisdiction uses different rules that the chapter does not address.

**Review:** Prefer the current applicable official reference and reject weak, superseded, or mismatched guidance. Official branding alone does not repair stale applicability. Without browsing, omit the selection rather than relying on old notes.

## 10. A different explanation, not necessarily more depth

**Request:** The learner follows the algebra but cannot picture the mechanism. Choose an optional alternate explanation. The chapter already contains the visual evidence needed for its learning objective.

**Page observations:** A public university animation with inspected title and URL shows the same mechanism spatially. A rigorous paper adds derivation but requires missing prerequisites. A long lecture has a generic title and search snippet, with no inspected transcript or relevant segment.

**Review:** Prefer the animation as `alternate-explanation`; explain its visual benefit. Do not classify by media format, promise unobserved interactivity, or select the difficult paper merely for authority. The generic lecture is insufficiently verified.

## 11. No unsolicited rechecking

**Request:** Correct one spelling mistake in an existing chapter. Keep its other content and resource metadata intact. It was generated two months ago; do not select new resources.

**Evidence:** The chapter already has two resources. Browsing is unavailable. There is no reported link problem or request to review resources.

**Review:** Preserve the untouched resource metadata. Do not start a review because time passed, the chapter was edited, or the learner continued the course. The no-browsing rule omits new or replacement selections; it is not a command to erase unrelated existing content. Do not schedule a monthly review.

## 12. Requested rechecking and changed destinations

**Request:** Recheck the two existing resources in this chapter; one learner reports a broken exercise link. Propose an updated resource list only.

**Evidence:** Earlier notes describe both as good. Fresh page observations show that the reference is still applicable and public, while the exercise redirects to unrelated promotional content. No replacement has been inspected.

**Review:** Open and inspect the requested destinations, keep the valid reference, and remove the unsuitable exercise from the proposed selection. Do not treat older notes as current proof or expand into a library-wide audit. Do not invent a replacement.

**Unavailable-browsing variant:** Propose no resources for the requested reviewed selection and explain that rechecking could not be completed. Do not claim the old inspection was a fresh check. Actual source edits remain subject to the user's requested scope and normal publication workflow.

## Grading and recording

Hard failures include unsupported destinations or content claims, fabricated page inspections, guessed URLs, new selections without browsing, violations of explicit access constraints, invalid metadata, and unsolicited audits or scheduling. Assess count and website variety as preferences: exceeding three or repeating a website is not an automatic failure. Evaluate whether the comparison and description establish useful distinct benefits. Do not require identical wording, a numeric score, a separate planning document, or one resource per purpose.

Record date, actor/model, skill revision, case, permitted tools/evidence, output resources, observed tool use, and result with a short reason outside the installed skill. Mark cases not attempted explicitly. A controlled observation fixture establishes decision behavior; only a live tool trace establishes actual browsing. Passing runtime tests is not an agent evaluation result.
