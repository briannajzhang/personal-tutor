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
  },
  {
    id: "transformation-widget-fit",
    query: "Use $personal-tutor to add a worked example to the Pandas filtering chapter that shows how a boolean mask keeps rows, and add practice after it.",
    expectedBehavior: [
      "Chooses the block shape from the learner move rather than defaulting to a transformation for every input/output relationship",
      "Uses a transformation when co-locating the starting rows, boolean mask, and kept rows makes the filtering mechanism easier to inspect",
      "Avoids transformation for definitions, catalogs, broad summaries, dense comparisons, reference coverage, or answer keys before an independent attempt",
      "Uses ordinary tables, lists, matching quizzes, or practice for category sorting instead of wrapping classification matrices in transformations by default",
      "Moves broader coverage into ordinary prose, tables, lists, diagrams, images, quizzes, or practice when those better fit the teaching move",
      "Treats readability and inspectability at normal lesson size as part of choosing between transformation and simpler block combinations",
      "Adds framing before the worked example and a readout, generalization, boundary case, or learner action before moving into assessment when the mechanism is central"
    ]
  },
  {
    id: "http-status-block-choice",
    query: "Use $personal-tutor to create a beginner HTTP API behavior lesson about how one update endpoint can return 401, 403, 404, 409, 422, or 204 depending on request conditions.",
    expectedBehavior: [
      "Chooses the block shape from whether the learner is tracing one status decision, comparing several cases, classifying examples, retrieving facts, or practicing a decision",
      "Uses an ordinary table, list, matching quiz, or practice for the broader condition/status/caller-action matrix",
      "Does not split classification coverage into separate input and output tables that learners must join with row letters, IDs, or repeated labels",
      "Uses a transformation only for a representative status decision when the visible condition, server check, and response meaning are clearer together",
      "Keeps broader status coverage outside the transformation and connected to practice or retrieval"
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
    "seed-course-from-sources",
    "visual-grounding-with-supportive-images",
    "transformation-widget-fit",
    "http-status-block-choice"
  ]);

  for (const scenario of scenarios) {
    assert.match(scenario.query, /\$personal-tutor/);
    assert.ok(scenario.expectedBehavior.length >= 4, `${scenario.id} should have a useful behavior rubric`);
  }
});
