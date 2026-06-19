import assert from "node:assert/strict";
import test from "node:test";

const scenarios = [
  {
    id: "seed-beginner-course",
    query: "Use $personal-tutor to teach me SQL from scratch.",
    expectedBehavior: [
      "Initializes or reuses a Tutor Kit workspace",
      "Creates one SQL textbook if none fits",
      "Persists prompt, curriculum map, chapter specs, review notes, and compile evidence",
      "Publishes 1-2 learner-ready chapters with examples, quizzes, practice, and review",
      "Leaves future chapters as planned backlog rather than placeholder chapter files"
    ]
  },
  {
    id: "continue-existing-textbook",
    query: "Use $personal-tutor to continue the existing statistics textbook with the next lesson.",
    expectedBehavior: [
      "Inspects the existing textbook, chapters, planning artifacts, and relevant learner history",
      "Updates the curriculum map and chapter specs before authoring",
      "Publishes the next smallest useful learner-ready chapter or improvement",
      "Runs compile or doctor and records the result"
    ]
  },
  {
    id: "generate-review-quiz",
    query: "Use $personal-tutor to add a review quiz and practice questions to the joins chapter.",
    expectedBehavior: [
      "Finds the target chapter and its learner outcome",
      "Adds durable practice material inside the Tutor Kit source",
      "Uses balancedQuiz for generated multiple-choice review when answer order is not meaningful",
      "Ensures questions test taught concepts and include useful explanations",
      "Compiles the changed textbook"
    ]
  },
  {
    id: "coding-practice-verification",
    query: "Use $personal-tutor to add a runnable Python practice problem for list filtering.",
    expectedBehavior: [
      "Adds a codingProblem block tied to a central learner move",
      "Stores starter, hidden reference solution, and tests as real problem files",
      "Includes verification metadata mapping editable files to hidden reference files",
      "Runs coding-problem verification and records starter-fails/reference-passes evidence"
    ]
  },
  {
    id: "seed-course-from-materials",
    query: "Use $personal-tutor to create a SQL textbook from these database class PDFs.",
    expectedBehavior: [
      "Clarifies how the provided materials should influence the textbook when needed",
      "Records material locations in materials-index without copying raw files by default",
      "Distills useful teaching context into source-notes",
      "Publishes a small learner-ready slice and leaves the rest planned"
    ]
  }
];

test("skill eval scenarios cover the refocused lesson-authoring workflows", () => {
  assert.equal(scenarios.length, 8);
  assert.deepEqual(scenarios.map((scenario) => scenario.id), [
    "seed-beginner-course",
    "continue-existing-textbook",
    "generate-review-quiz",
    "coding-practice-verification",
    "seed-course-from-materials",
    "add-materials-to-existing-textbook",
    "continue-from-source-notes",
    "material-edge-cases"
  ]);

  for (const scenario of scenarios) {
    assert.match(scenario.query, /\$personal-tutor/);
    assert.ok(scenario.expectedBehavior.length >= 4, `${scenario.id} should have a useful behavior rubric`);
  }
});
