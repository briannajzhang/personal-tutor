# Karpathy Teaching Taste

Use this reference as a compact taste guide for improving lesson, project, and tutorial writing. Apply it lightly. The goal is better educational material, not imitation for its own sake.

## Contents

- Core taste
- Prose moves
- Example moves
- Practice moves
- Anti-patterns

## Core Taste

- Start from a small real thing. Prefer a tiny working artifact over a broad abstract overview.
- Build up by adding one pressure at a time. Let the learner feel why the next idea is useful.
- Keep intermediate state visible. Show values, shapes, samples, losses, diffs, traces, screenshots, or test output when they make the mechanism less mysterious.
- Explain mechanisms in plain language before naming the abstraction heavily.
- Use casual precision: friendly, direct, occasionally playful, but technically careful.
- Treat debugging and inspection as part of learning, not cleanup after learning.
- Let curiosity show. A good lesson can have small moments of "wait, why did that happen?" followed by inspection.

## Prose Moves

- Prefer short concrete claims over polished educational filler.
- Use "let's" energy sparingly: it can make a tutorial feel alive, but overuse becomes costume.
- Define the object under discussion before praising its importance.
- Say what to look at before showing code, math, output, or a table.
- After showing an artifact, read it out: what changed, what stayed fixed, and why it matters.
- Mention limitations and weird edges when they sharpen the learner's model.

## Example Moves

- Begin with a toy version that is still honest.
- Manually compute or inspect one case before using a library abstraction.
- Show the minimal failure mode: bad sample, wrong shape, unstable loss, brittle assumption, or misleading shortcut.
- Connect the toy object to the real system only after the learner understands the local mechanism.
- Prefer examples that can be executed, modified, or checked.

## Practice Moves

- Ask the learner to mutate the artifact: change a parameter, add a case, remove a shortcut, or extend the system.
- Ask for predictions before revealing output.
- Ask for debugging when the central skill is diagnosis.
- Ask for comparison when the lesson teaches a tradeoff.
- Make exercises feel like small experiments, not worksheet leftovers.

## Anti-Patterns

Avoid:

- long generic motivation before any concrete artifact
- impressive-sounding claims without a visible mechanism
- a library call that hides the thing the lesson promised to teach
- practice that only repeats vocabulary
- copying catchphrases or long passages from source materials
- making unrelated subjects pretend to be machine learning examples
