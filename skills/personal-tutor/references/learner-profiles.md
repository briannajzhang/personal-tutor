# Learner Profiles

Use this when the user has not fully specified what kind of learner they are or what kind of plan they need.

## Contents

- Purpose
- Core dimensions
- Beginner support
- Default quality bias
- Depth, pace, and practice distinctions
- Reasonable defaults and duration defaults
- Check, practice, and output implications

## Purpose

The user should not need to know how to design a good curriculum request. Infer a reasonable learner profile when they are vague, then generate material that fits that profile.

## Core Dimensions

At minimum, infer or decide:

- `learnerLevel`: beginner, intermediate, advanced
- `goal`: practical fluency, interviews, workplace use, academic support, project building, conceptual understanding
- `depth`: overview, standard, deep
- `pace`: gentle, normal, intensive
- `practiceIntensity`: light, medium, heavy

Optional dimensions when useful:

- `priorKnowledge`
- `timeHorizon`
- `sessionLength`
- `subjectBias` such as theory, implementation, analysis, communication, problem solving, or project building

## Beginner Means

Beginner does not mean shallow.

Beginner means:

- slower sequencing
- more explicit definitions
- smaller early examples
- less assumed background
- more misconception checks
- more guided practice before independent practice

A beginner plan can still be deep if the sequencing and support are strong.

## Default Quality Bias

When the user asks to learn a broad subject without specifying depth, bias toward a serious learning artifact rather than a lightweight overview.

Default to:

- deeper explanation of mechanisms
- concrete examples that make the idea visible
- frequent learner action
- guided practice before independent practice
- cumulative review across chapters
- misconception checks for realistic mistakes

Do not reduce depth because the learner is a beginner. Reduce assumed background, slow the sequencing, and add more scaffolding.

If the user asks for a quick overview, cheat sheet, cram plan, or short introduction, then choose lighter depth and lower practice intensity.

## Depth, Pace, And Practice Are Separate

Do not collapse learner level, depth, pace, and practice intensity into one vague difficulty setting.

- `learnerLevel` controls assumed background.
- `depth` controls how thoroughly the material explains mechanisms, tradeoffs, and edge cases.
- `pace` controls how quickly new complexity is introduced.
- `practiceIntensity` controls how often the learner must retrieve, apply, debug, compare, classify, or create.

Examples:

- Beginner + deep + gentle + heavy practice: slow sequencing, detailed explanations, many worked examples, and lots of scaffolded practice.
- Beginner + overview + normal + light practice: a brief orientation with only a few checks.
- Intermediate + deep + intensive + heavy practice: less definition of basics, faster movement into edge cases, and more independent work.

Beginner does not imply overview. Advanced does not imply deep. A learner can need beginner scaffolding and still want deep treatment.

## Reasonable Defaults

When the user gives only a broad topic such as "teach me statistics" or "make a course on databases," assume defaults like:

- learnerLevel: beginner
- goal: practical fluency
- depth: deep
- pace: normal
- practiceIntensity: heavy

For a broad vague request such as "Teach me SQL", "Teach me statistics", or "Teach me databases", do not choose compact, overview, or light-practice defaults unless the user asks for a quick overview, cram plan, or lightweight introduction.

Default broad-topic generation should favor:

- beginner-friendly scaffolding
- deep mechanism explanation
- heavy practice
- cumulative review

When the user explicitly wants lots of exercises, bias toward:

- practiceIntensity: heavy
- depth: standard or deep
- pace: gentle or normal

When the user asks for an interview-focused, exam-focused, or performance-focused plan, bias toward:

- realistic problem solving
- cumulative review
- stronger correctness checks
- mixed practice under review conditions

## Duration Defaults

When the user gives no duration, choose a reasonable default based on scope:

- narrow topic: 1-3 chapters
- medium topic: 4-8 chapters
- broad subject: 8-12 chapters or modules

When the user gives a duration, use it to allocate scope, practice, review, and cumulative work. Do not convert duration into shallow schedule buckets.

For time-based plans, infer or define:

- approximate sessions per week
- approximate session length
- expected chapter/module density
- review cadence
- cumulative checkpoints

If the user asks for a broad course with no other constraints, use the general broad-subject default: beginner-friendly practical fluency, deep depth, normal or gentle pace, and heavy practice intensity. If the user asks for a multi-week plan, the duration should increase structure, practice, review, and cumulative work, not reduce each week to a paragraph.

## Check And Practice Implications

Use the learner profile to adjust check density and practice format.

- Heavier practice intensity should usually mean more local checks, more concrete practice, and more cumulative review.
- Deeper treatment should usually include more misconception checks and more transfer questions.
- Gentler pace should usually include more guided checks before independent practice.
- Interview, exam, or performance goals should usually include more mixed review and practice-test chapters when the textbook is long enough.

Use a mix of check formats that fits the learner profile and subject: quizzes for fast diagnosis, and concrete tasks when the learner needs to produce or apply something.

## Output Implications

Use the learner profile to change:

- concept order
- explanation density
- amount and type of practice
- cumulative review frequency
- how quickly new complexity is introduced

Do not treat learner level, depth, and pace as the same setting.

The learner profile should also change the generated artifact's density:

- more depth means more mechanism, examples, tradeoffs, and boundary cases
- more practice intensity means more concrete learner tasks, not just more reflection prompts
- gentler pace means more bridges between concepts, not less content
- shorter time horizons mean tighter scope, not vague summaries
