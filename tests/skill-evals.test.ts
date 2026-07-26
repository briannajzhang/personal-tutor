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
  }
];

test("custom block eval scenarios cover positive and negative representation fit", () => {
  assert.deepEqual(scenarios.map((scenario) => scenario.id), [
    "transaction-isolation-component-fit",
    "static-term-distinction-no-component"
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
});
