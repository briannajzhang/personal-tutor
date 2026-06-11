# Review Rubric

Use this rubric after drafting a chapter or curriculum map and before finalizing files.

## Contents

- Review questions
- Minimum quality scores
- Reject conditions
- Revision rule

## Review Questions

### Structure

- Does the chapter satisfy the canonical learning contract in `lesson-authoring.md`?
- Does the structure separate concept, example, practice, and review clearly enough for the learner to navigate?
- Are sections and subsections doing real teaching work, or are they decorative wrappers?
- Does the chapter shape fit the topic, or does it feel copied from the previous chapter?
- Do chapter, section, and subsection titles name the concept or task instead of sounding like schedule buckets such as `Week 2` or `Phase B`?
- Does every non-trivial instructional chapter use a dedicated final review section?
- Does chapter depth reflect conceptual complexity, or do materially different chapters appear generated to the same structural budget?
- For generated textbooks, do chapter and section roles match their actual teaching purpose?

### Curriculum Map Quality

- Does the inferred learner profile follow `learner-profiles.md`, especially for broad vague prompts?
- If the plan chooses compact pacing, overview depth, or light practice, is that justified by the user request?

### Prose Quality

- Is the prose teaching a mechanism instead of merely summarizing terminology?
- Does the opening connect to a real learner confusion or task?
- Are key terms defined before they are used in abstract claims or analogies?
- Is there at least one realistic misconception, trap, or boundary case?
- Does the chapter sound specific to the topic instead of like generic educational filler?
- Do code blocks, notation blocks, examples, diagrams, or formal representations have enough surrounding explanation to be readable by the intended learner?
- Does the chapter avoid vague claims such as "X matters" or "X protects Y" unless the mechanism is explained immediately?
- Does the prose avoid leaning on "beginners often..." framing when a direct object-level explanation would be clearer?

### Example Quality

- Does each major worked example include enough input, context, or starting state for the learner to understand the setup?
- Does the example show the operation, reasoning step, or action being performed?
- Does the example show a visible result, output, or conclusion?
- Is the result, output, or conclusion shown in a form the learner can inspect, rather than only described in prose?
- If the chapter spec promised a visible result, does the authored chapter display the actual result, output, or conclusion?
- Does the prose explain why that result follows, instead of leaving the learner to infer the mechanism?
- Are examples specific enough to make the concept visible without becoming unnecessarily large?

### Practice Quality

- Are exercises meaningful for this subject?
- Does the learner get repeated opportunities to retrieve, apply, predict, compare, debug, classify, or create?
- Does the chapter use more than one practice mode?
- Is the practice format honest about how feedback will happen?
- Is enough of the learner-facing content practice-oriented, rather than mostly exposition?
- When the learner should produce a larger artifact, is there concrete practice rather than only quiz questions or reflection prompts?
- For programming chapters, is `codingProblem(...)` used when the learner should actually implement, debug, refactor, or run code?
- When runnable practice would benefit the learner but the target runtime is not configured, did the chapter use an appropriate harness instead of downgrading the task to prose-only practice?
- For coding problems, does the prompt state the core behavior, inputs, outputs, constraints, and important edge cases needed to solve the task without requiring the learner to reverse-engineer the tests?
- Does the coding-problem starter preserve the central learner move, or does it perform most of the reasoning the task claims to assess?
- Is each coding problem tied to a central or cumulative learner move planned in the chapter spec?
- Do follow-up tasks interpret, extend, debug, or retrieve from the coding problem instead of appearing as an unrelated list?
- Does every automatically verified coding problem have verification metadata, an appropriate hidden reference solution, and evidence that the starter fails for the intended reason while the reference solution passes under `tutor verify coding-problems`?

### Check And Review Quality

- Does the chapter include a local concept check near major new ideas, worked examples, misconceptions, or boundary cases?
- Does the chapter include an end-of-chapter review or mastery check?
- When multiple-choice checking fits, are concept checks and review checks represented with `quiz(...)` blocks?
- Are quiz modes used intentionally: `"check"` for local comprehension, `"review"` for chapter mastery, and `"practice-test"` for mixed cumulative review?
- Do quizzes complement concrete practice instead of replacing it?
- Does concrete practice complement quizzes instead of becoming a reason to omit fast conceptual checks?
- Are local checks placed after major new mechanisms, worked examples, misconceptions, or boundary cases, rather than merely one per chapter?
- Are quiz distractors plausible and based on realistic learner mistakes?
- Are correct-answer positions not predictably concentrated in one choice slot?
- Do concept checks, review quizzes, and practice-test questions avoid repeating the same question shape without increasing transfer, difficulty, or context?
- Are chapter-review questions self-contained and normally new applications rather than duplicated local checks?
- When present, is a practice test a dedicated cumulative chapter with mixed transfer and at least one non-quiz cumulative task?
- Are retrieval prompts framed so the learner knows how to use them?
- Are written and runnable tasks clearly related or separately introduced?
- Do quiz explanations teach the mechanism rather than merely restating the answer?

### Progression

- Does practice get harder within the chapter?
- Does practice move from supported to more independent work?
- Does every independent task use only previously taught or explicitly scaffolded concepts?
- Does each mechanism named in the learner outcome receive explanation, demonstration, and learner action?
- Does the chapter build naturally on prior chapters?
- Is there some cumulative reuse of earlier ideas?

### Repetition

- Is too much of the curriculum reusing the same template or rhetorical rhythm?
- Are the chapter openings, examples, checks, and recaps distinct enough from one another?

### Review Evidence

- Do review notes cite concrete chapter content, examples, blocks, or questions as evidence?
- Do scores of 4 or 5 identify specific generated content that satisfies the criterion?
- Does the review flag missing visible results, weak distractors, sparse local checks, and under-specified practice when present?
- Does the review flag missing required spec fields, unclear activity transitions, and role mismatches when present?

A score of 4 or 5 must cite specific chapter, section, or block evidence. A score of 5 means no meaningful gap was found for that category. If a reject condition applies, the affected category cannot score above 3 until revised. Review notes must record unresolved known issues rather than claiming none remain.

## Minimum Quality Scores

Score each chapter from 1-5:

- Teaching flow
- Definition clarity
- Mechanism clarity
- Example quality
- Practice quality
- Check and review quality
- Local coherence
- Learner action
- Review evidence

Revise any category below 4 before compile.

## Reject If

Reject and revise the chapter if any of these are true:

- The chapter could be summarized as an outline rather than used as a lesson.
- A section contains explanation but no example, check, or learner action.
- A code block, notation block, formal representation, or example appears without prose telling the learner what to inspect.
- Practice is only described, not instantiated.
- The learner is told to "practice X" without being given a concrete task.
- The chapter introduces terms that are not defined before being used in explanations.
- The chapter has no worked example.
- The chapter has no independent task.
- The chapter has no local concept check for major new ideas.
- The chapter has no end-of-chapter review or mastery check.
- The chapter ends with recap only, not application.
- Quiz questions are used as decoration rather than checking understanding.
- Quizzes replace concrete practice when the learner needs to produce, debug, design, or revise something.
- Concrete practice replaces quizzes when the learner also needs fast conceptual diagnosis.
- The prose contains vague claims that could apply to almost any topic.
- A worked example lacks enough context, operation, result, or explanation for the learner to understand what happened.
- A major worked example describes the result in prose but does not show enough input/context and result/output/conclusion for the learner to inspect what changed.
- An independent task, coding problem, or mastery check requires a mechanism that has not been taught or explicitly scaffolded.
- A chapter claims to teach a mechanism that is only named, reviewed, or assessed.
- Several central mechanisms receive only summary-level coverage.
- A chapter is forced into the same structural budget as materially simpler chapters, leaving its central mechanisms under-taught.
- A coding problem’s tests require core behavior that is not stated in the prompt, starter comments, or visible task description.
- A coding-problem starter performs most of the central reasoning the task claims to assess.
- Quiz distractors are obviously wrong, joke answers, or unrelated to realistic learner mistakes.
- Quiz questions repeat the same shape without increasing transfer, difficulty, or context.
- A non-trivial instructional chapter does not use a dedicated final review section.
- A practice test is appended to an instructional chapter, reviews only the immediately preceding chapter, duplicates nearby review questions, or contains no non-quiz cumulative task.
- Practice and review are combined in one section despite semantic roles.
- A generated chapter spec omits a required planning field.
- Written and runnable tasks are placed together without a clear relationship or transition.
- Retrieval prompts appear after unrelated practice without framing.
- A coding problem was added without a planned central or cumulative learner move.
- Repeated chapter shapes contradict their scope and depth plans.
- An inspectable artifact's layout makes the intended comparison difficult to read.

## Revision Rule

Revise before finalizing when the chapter is:

- structurally flat
- mostly polished summary
- using undefined terms before they are clearly explained
- making vague claims without explaining the mechanism
- thin on practice
- missing local checks or chapter review
- using quiz modes incorrectly
- using prose-only programming exercises where runnable `codingProblem(...)` practice should exist
- containing a coding problem whose starter failure and reference-solution success were not both verified
- repetitive in shape or tone
- titled like a schedule or outline when the content should read like a textbook
- unclear about what the learner should now be able to do
