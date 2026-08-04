import assert from "node:assert/strict";
import test from "node:test";

const scenarios = [
  {
    id: "transaction-isolation-component-fit",
    query:
      "Use $personal-tutor to teach transaction isolation anomalies by helping the learner choose the interleaving of two transactions and inspect the resulting database state.",
    expectedBehavior: [
      "Uses Tutor Kit source rather than a conversational-only explanation",
      "Reads representation and custom-interaction guidance before settling on the lesson shape",
      "Authors a durable component(...) block without requiring the user to explicitly ask for a custom block",
      "The component lets the learner choose or step through transaction interleavings and inspect the resulting database state",
      "Keeps the interaction narrow enough to expose the anomaly without becoming a full SQL engine",
      "Frames the component with prediction, visible consequence, and readout or transfer practice"
    ]
  },
  {
    id: "static-term-distinction-no-component",
    query:
      "Use $personal-tutor to add a short beginner lesson distinguishing authentication from authorization, with one small comparison and a quick check.",
    expectedBehavior: [
      "Uses ordinary prose, a compact comparison, and a local check for the distinction",
      "Does not add a component when static blocks teach the intended distinction just as clearly",
      "Explains the mechanism behind the difference rather than only listing definitions",
      "Keeps the material brief because the request is narrow"
    ]
  },
  {
    id: "source-constrained-quiz-discrimination",
    query:
      "Use $personal-tutor to teach me how this repository balances four-choice quiz answers by default and when preserveChoiceOrder changes that behavior. Include a short quiz.",
    expectedBehavior: [
      "Inspects the repository and grounds the lesson in the actual quiz-builder behavior",
      "Explains answer balancing and preserveChoiceOrder in clear mechanism-focused prose",
      "Uses quiz options that express competing source interpretations or actions at comparable specificity",
      "Requires repository understanding rather than wording, length, tone, or implausibility to reject choices",
      "Keeps the full reasoning in feedback instead of placing it only in the correct choice"
    ]
  },
  {
    id: "no-credible-alternatives-format-fit",
    query:
      "Use $personal-tutor to add a narrow check for a source fact that has one meaningful response but does not support several credible multiple-choice alternatives.",
    expectedBehavior: [
      "Chooses a question shape that fits the available alternatives",
      "May sharpen the prompt, use fewer choices, or choose another practice format instead of padding multiple choice",
      "Does not invent unrelated or implausible options merely to reach a conventional choice count",
      "Keeps the practice proportional to the narrow request",
      "Preserves agent judgment about the strongest assessment form"
    ]
  }
];

test("skill eval scenarios cover representation and quiz-design fit", () => {
  assert.deepEqual(scenarios.map((scenario) => scenario.id), [
    "transaction-isolation-component-fit",
    "static-term-distinction-no-component",
    "source-constrained-quiz-discrimination",
    "no-credible-alternatives-format-fit"
  ]);

  for (const scenario of scenarios) {
    assert.match(scenario.query, /\$personal-tutor/);
    assert.ok(scenario.expectedBehavior.length >= 4, `${scenario.id} should have a useful behavior rubric`);
  }

  const positive = scenarios[0].expectedBehavior.join("\n");
  assert.match(positive, /Authors a durable component\(\.\.\.\) block/);
  assert.doesNotMatch(positive, /consider/i);
  assert.doesNotMatch(positive, /records? why not/i);

  const negative = scenarios[1].expectedBehavior.join("\n");
  assert.match(negative, /Does not add a component/);

  const sourceConstrainedQuiz = scenarios[2].expectedBehavior.join("\n");
  assert.match(sourceConstrainedQuiz, /competing source interpretations or actions at comparable specificity/);
  assert.match(sourceConstrainedQuiz, /repository understanding/);

  const formatFit = scenarios[3].expectedBehavior.join("\n");
  assert.match(formatFit, /instead of padding multiple choice/);
  assert.match(formatFit, /Preserves agent judgment/);

  const quizRubrics = `${sourceConstrainedQuiz}\n${formatFit}`;
  assert.doesNotMatch(quizRubrics, /equal word counts?|same number of words/i);
  assert.doesNotMatch(quizRubrics, /misconception table/i);
  assert.doesNotMatch(quizRubrics, /written planning artifact/i);
  assert.doesNotMatch(quizRubrics, /mandatory multi-pass review/i);
});
