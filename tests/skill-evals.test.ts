import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const scenarios = [
  {
    id: "seed-beginner-course",
    query: "Use $personal-tutor to teach me SQL from scratch.",
    expectedBehavior: [
      "Uses tutor brief to inspect or initializes a Tutor Kit workspace",
      "Creates one SQL textbook if none fits",
      "Keeps learner context, course map, and active publication state in one compact course file",
      "Publishes 1-2 rich learner-ready chapters using examples, practice, feedback, visuals, or interaction when they improve learning",
      "Leaves future chapters as planned backlog rather than placeholder chapter files",
      "Lets doctor --record write verification evidence"
    ]
  },
  {
    id: "continue-existing-textbook",
    query: "Use $personal-tutor to continue the existing statistics textbook with the next lesson.",
    expectedBehavior: [
      "Uses tutor brief and tutor progress before opening only the relevant source files",
      "Uses weak tags and failed practice to choose repair, review, or new material",
      "Updates only the changed part of course.md and adds a longer spec only for unusual risk",
      "Publishes the next smallest useful learner-ready chapter or improvement",
      "Runs doctor --record and does not rewrite its evidence"
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
  },
  {
    id: "broad-llm-under-the-hood",
    query: "Use $personal-tutor to teach me about how LLMs work under the hood. I am a SWE with minimal experience in LLMs aside from using them.",
    expectedBehavior: [
      "Asks at most one high-value bundled intake question if goal, depth, or practice style would materially change the initial publication or course direction, or records inferred defaults in course.md",
      "Records a compact active-publication sketch with the central mechanism, terms that need clear introduction before repeated use, and what can wait",
      "Defines recurring terms such as token, embedding, matrix, attention, context, or representation before relying on them",
      "Separates the intuitive model from formulas or notation so the first chapter does not become a vocabulary dump"
    ]
  },
  {
    id: "scoped-llm-follow-up",
    query: "Use $personal-tutor to add a follow-up chapter that explains tokens and embeddings more technically, with examples for a software engineer.",
    expectedBehavior: [
      "Continues the existing textbook rather than restarting the course",
      "Deepens token and embedding concepts with concrete cases, notation only after plain-language meaning, and useful boundaries",
      "Names what technical details can still wait instead of overloading the follow-up chapter",
      "Adds learner action or practice that asks the learner to predict, distinguish, trace, or explain the terms"
    ]
  }
];

test("skill eval scenarios cover the refocused lesson-authoring workflows", () => {
  assert.equal(scenarios.length, 10);
  assert.deepEqual(scenarios.map((scenario) => scenario.id), [
    "seed-beginner-course",
    "continue-existing-textbook",
    "generate-review-quiz",
    "coding-practice-verification",
    "seed-course-from-sources",
    "visual-grounding-with-supportive-images",
    "transformation-widget-fit",
    "http-status-block-choice",
    "broad-llm-under-the-hood",
    "scoped-llm-follow-up"
  ]);

  for (const scenario of scenarios) {
    assert.match(scenario.query, /\$personal-tutor/);
    assert.ok(scenario.expectedBehavior.length >= 4, `${scenario.id} should have a useful behavior rubric`);
  }
});

test("default skill path stays compact while preserving the quality contract", () => {
  const root = join(process.cwd(), "skills", "personal-tutor");
  const skill = readFileSync(join(root, "SKILL.md"), "utf8");
  const quality = readFileSync(join(root, "references", "quality-core.md"), "utf8");
  const quickstart = readFileSync(join(root, "references", "authoring-quickstart.md"), "utf8");
  const generation = readFileSync(join(root, "references", "lesson-generation.md"), "utf8");
  const defaultWords = `${skill}\n${quality}\n${quickstart}`.trim().split(/\s+/).length;

  assert.ok(defaultWords < 3500, `default instruction path should stay below 3500 words, found ${defaultWords}`);
  assert.match(skill, /Create durable Tutor Kit material that helps a learner understand and use a subject/i);
  assert.match(skill, /## Preflight/i);
  assert.match(skill, /## Authoring workflow/i);
  assert.match(skill, /normal authoring path stops after the references required for the current mode/i);
  assert.match(skill, /For a clearly new broad course, read `references\/lesson-generation\.md` before running `brief`, reading teaching samples, planning, or authoring/i);
  assert.match(skill, /ask one course-shaping question unless the learner asks the agent to choose or explicitly says not to ask/i);
  assert.match(skill, /Do not treat unrelated workspace state or generic learner defaults as resolving that uncertainty/i);
  assert.match(skill, /Begin this workflow after preflight and any needed intake or intentional inference/i);
  assert.match(skill, /After any needed intake or intentional inference, do not respond to a broad learning request with only a roadmap/i);
  assert.ok(skill.indexOf("## Preflight") < skill.indexOf("## Teaching voice: required"), "preflight should appear before teaching voice");
  assert.ok(skill.indexOf("## Preflight") < skill.indexOf("### Required sample reading"), "preflight should appear before sample reading");
  assert.match(skill, /Before drafting a substantial lesson, read at least one sample/i);
  assert.doesNotMatch(skill, /Before tool use or authoring, decide whether/i);
  assert.doesNotMatch(skill, /missing direction as usually material/i);
  assert.doesNotMatch(skill, /usually ask one course-shaping question before authoring/i);
  assert.match(skill, /Every built-in block and custom TypeScript remain available/i);
  assert.match(quality, /Teach the mechanism/i);
  assert.match(quality, /Define important terms on first serious use/i);
  assert.match(quality, /State what the idea changes, enables, prevents, or makes difficult/i);
  assert.match(quality, /made usable before the lesson relies on them/i);
  assert.match(quality, /Make an example inspectable/i);
  assert.match(quality, /Invite learner action/i);
  assert.match(quality, /Give useful feedback/i);
  assert.match(quality, /Adapt from evidence/i);
  assert.match(quality, /chapter shape fit this subject and learner/i);
  assert.match(quality, /not acceptance criteria/i);
  assert.match(quality, /Do not confuse richness with length or block count/i);
  assert.match(quickstart, /not a required chapter shape/i);
  assert.match(quickstart, /does not restrict the authoring API/i);
  assert.match(generation, /Use `brief` when workspace state may clarify whether a request continues existing work/i);
  assert.match(generation, /do not let `brief`, existing workspace state, or generic defaults silently determine the learner's intent/i);
  assert.match(generation, /resolve tailoring intake before applying the default output workflow below/i);
  assert.match(generation, /Ask at most one intake question/i);
  assert.match(generation, /broad new course/i);
  assert.match(generation, /course or initial publication/i);
  assert.match(generation, /names only a subject or leaves the learner's intended use unclear/i);
  assert.match(generation, /learner intent as usually unresolved enough to ask one course-shaping question/i);
  assert.doesNotMatch(generation, /no stated goal, use case, relevant background, or desired emphasis/i);
  assert.match(generation, /generic beginner path may be possible, but it can still produce the wrong first publication/i);
  assert.match(generation, /After deciding inference is appropriate/i);
  assert.match(generation, /When one question is needed for a new course, choose the highest value unresolved question/i);
  assert.doesNotMatch(generation, /For example:/i);
  assert.match(generation, /central mechanism, terms that need a clear introduction before repeated use, what can wait/i);
  assert.match(generation, /keep it informal and short: central mechanism/i);
  assert.match(generation, /Write a longer `chapter-specs\.md` entry only when/i);
  assert.doesNotMatch(generation, /Run `tutor brief` first/i);
  assert.doesNotMatch(generation, /ask 3-5/i);
  assert.doesNotMatch(generation, /required quizzes/i);
  assert.doesNotMatch(generation, /required coding problems/i);
  assert.doesNotMatch(generation, /required section counts/i);
  assert.doesNotMatch(generation, /create `chapter-specs\.md` by default/i);
});
