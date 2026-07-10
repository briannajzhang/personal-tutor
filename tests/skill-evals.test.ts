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
    id: "seed-course-from-sources",
    query: "Use $personal-tutor to create a SQL textbook from these database class PDFs.",
    expectedBehavior: [
      "Clarifies how the provided sources should influence the textbook when needed",
      "Records source locations in materials-index without copying raw files by default",
      "Distills useful teaching context into source-notes",
      "Publishes a small learner-ready slice and leaves the rest planned"
    ]
  },
  {
    id: "visual-grounding-with-supportive-images",
    query: "Use $personal-tutor to create a beginner textbook on recognizing common photo exposure and focus problems. Build the first chapter around comparing correctly exposed, overexposed, underexposed, motion-blurred, and out-of-focus examples, with checks and practice.",
    expectedBehavior: [
      "Considers image blocks when learner recognition depends on visual appearance or concrete examples",
      "Uses image(...) for durable visual grounding when it adds educational context, or records why another visual block is clearer",
      "Adds a lightweight inspection scaffold when learners must notice specific regions, states, differences, or cues inside an image",
      "Phrases recognition scaffolds as learner actions or cues rather than authoring meta-commentary",
      "Uses diagrams or transformations separately when structure, flow, or input-to-output reasoning is the main teaching move",
      "Saves any chosen visual assets under the textbook assets directory and references them with assets/... paths",
      "Keeps visuals educational, captioned or read out in surrounding prose, and connected to practice"
    ]
  }
];

test("skill eval scenarios cover the refocused lesson-authoring workflows", () => {
  assert.equal(scenarios.length, 6);
  assert.deepEqual(scenarios.map((scenario) => scenario.id), [
    "seed-beginner-course",
    "continue-existing-textbook",
    "generate-review-quiz",
    "coding-practice-verification",
    "seed-course-from-sources",
    "visual-grounding-with-supportive-images"
  ]);

  for (const scenario of scenarios) {
    assert.match(scenario.query, /\$personal-tutor/);
    assert.ok(scenario.expectedBehavior.length >= 4, `${scenario.id} should have a useful behavior rubric`);
  }
});
