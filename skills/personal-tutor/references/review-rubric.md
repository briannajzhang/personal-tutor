# Review Rubric

Use this rubric after drafting a chapter or curriculum map and before finalizing files.

## Review Questions

### Structure

- Does the chapter satisfy the canonical learning contract in `lesson-authoring.md`?
- Does the structure separate concept, example, practice, and review clearly enough for the learner to navigate?
- Are sections and subsections doing real teaching work, or are they decorative wrappers?
- Does the chapter shape fit the topic, or does it feel copied from the previous chapter?
- Do chapter, section, and subsection titles name the concept or task instead of sounding like schedule buckets such as `Week 2` or `Phase B`?

### Prose Quality

- Is the prose teaching a mechanism instead of merely summarizing terminology?
- Does the opening connect to a real learner confusion or task?
- Are key terms defined before they are used in abstract claims or analogies?
- Is there at least one realistic misconception, trap, or boundary case?
- Does the chapter sound specific to the topic instead of like generic educational filler?
- Do code blocks have enough surrounding explanation to be readable by the intended learner?
- Does the chapter avoid vague claims such as "X matters" or "X protects Y" unless the mechanism is explained immediately?
- Does the prose avoid leaning on "beginners often..." framing when a direct object-level explanation would be clearer?

### Practice Quality

- Are exercises meaningful for this subject?
- Does the learner get repeated opportunities to retrieve, apply, or debug?
- Does the chapter use more than one practice mode?
- Is the practice format honest about how feedback will happen?
- Is enough of the learner-facing content practice-oriented, rather than mostly exposition?
- For programming chapters, is `codingProblem(...)` used when the learner should actually implement, debug, refactor, or run code?

### Progression

- Does practice get harder within the chapter?
- Does practice move from supported to more independent work?
- Does the chapter build naturally on prior chapters?
- Is there some cumulative reuse of earlier ideas?

### Repetition

- Is too much of the curriculum reusing the same template or rhetorical rhythm?
- Are the chapter openings, examples, and recaps distinct enough from one another?

## Minimum Quality Scores

Score each chapter from 1–5:

- Teaching flow
- Definition clarity
- Mechanism clarity
- Example quality
- Practice quality
- Local coherence
- Learner action

Revise any category below 4 before compile.

## Reject If

Reject and revise the chapter if any of these are true:

- The chapter could be summarized as an outline rather than used as a lesson.
- A section contains explanation but no example, check, or learner action.
- A code block appears without prose telling the learner what to inspect.
- Practice is only described, not instantiated.
- The learner is told to "practice X" without being given a concrete task.
- The chapter introduces terms that are not defined before being used in explanations.
- The chapter has no worked example.
- The chapter has no independent task.
- The chapter ends with recap only, not application.
- The prose contains vague claims that could apply to almost any topic.

## Revision Rule

Revise before finalizing when the chapter is:

- structurally flat
- mostly polished summary
- using undefined terms before they are clearly explained
- making vague claims without explaining the mechanism
- thin on practice
- using prose-only programming exercises where runnable `codingProblem(...)` practice should exist
- repetitive in shape or tone
- titled like a schedule or outline when the content should read like a textbook
- unclear about what the learner should now be able to do
