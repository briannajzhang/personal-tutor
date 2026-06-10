# Review Rubric

Use this rubric after drafting a chapter or curriculum map and before finalizing files.

## Review Questions

### Structure

- Does the chapter satisfy the canonical learning contract in `lesson-authoring.md`?
- Does the structure separate concept, example, practice, and review clearly enough for the learner to navigate?
- Are sections and subsections doing real teaching work, or are they decorative wrappers?
- Does the chapter shape fit the topic, or does it feel copied from the previous chapter?
- Do chapter, section, and subsection titles name the concept or task instead of sounding like schedule buckets such as `Week 2` or `Phase B`?
- Does a substantial chapter review have a dedicated section or explicit transition, rather than appearing abruptly after instruction or practice?

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
- Do quiz explanations teach the mechanism rather than merely restating the answer?

### Progression

- Does practice get harder within the chapter?
- Does practice move from supported to more independent work?
- Does the chapter build naturally on prior chapters?
- Is there some cumulative reuse of earlier ideas?

### Repetition

- Is too much of the curriculum reusing the same template or rhetorical rhythm?
- Are the chapter openings, examples, checks, and recaps distinct enough from one another?

### Review Evidence

- Do review notes cite concrete chapter content, examples, blocks, or questions as evidence?
- Do scores of 4 or 5 identify specific generated content that satisfies the criterion?
- Does the review flag missing visible results, weak distractors, sparse local checks, and under-specified practice when present?

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
- A coding problem’s tests require core behavior that is not stated in the prompt, starter comments, or visible task description.
- Quiz distractors are obviously wrong, joke answers, or unrelated to realistic learner mistakes.
- Quiz questions repeat the same shape without increasing transfer, difficulty, or context.

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
