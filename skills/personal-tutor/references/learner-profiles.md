# Learner Profiles

Use this when the user has not fully specified what kind of learner they are or what kind of plan they need.

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
- `subjectBias` such as backend, analytics, theory, implementation, or problem solving

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
- `practiceIntensity` controls how often the learner must retrieve, apply, debug, compare, or create.

Examples:

- Beginner + deep + gentle + heavy practice: slow sequencing, detailed explanations, many worked examples, and lots of scaffolded practice.
- Beginner + overview + normal + light practice: a brief orientation with only a few checks.
- Intermediate + deep + intensive + heavy practice: less definition of basics, faster movement into edge cases, and more independent work.

Beginner does not imply overview. Advanced does not imply deep. A learner can need beginner scaffolding and still want deep treatment.

## Reasonable Defaults

When the user gives only a topic such as "teach me SQL", assume defaults like:

- learnerLevel: beginner
- goal: practical fluency
- depth: deep
- pace: normal
- practiceIntensity: heavy

When the user explicitly wants lots of exercises, bias toward:

- practiceIntensity: heavy
- depth: standard or deep
- pace: gentle or normal

When the user asks for an interview-focused plan, bias toward:

- realistic problem solving
- cumulative review
- stronger correctness checks

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

If the user says only "teach me SQL" or "make a SQL course," use the general broad-subject default: beginner-friendly practical fluency, deep depth, normal or gentle pace, and heavy practice intensity. If the user asks for a "12-week SQL plan," the duration should increase structure, depth, practice, review, and cumulative work, not reduce each week to a paragraph.

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
