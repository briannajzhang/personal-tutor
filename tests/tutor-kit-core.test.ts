import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  balancedQuiz,
  callout,
  chapter,
  chart,
  codeBlock,
  codingProblem,
  diagram,
  glossary,
  heading,
  image,
  list,
  mathBlock,
  p,
  quiz,
  section,
  textbook,
  transformation,
  validateTextbook
} from "../packages/tutor-kit/dist/index.js";
import {
  clearWorkspaceCaches,
  discoverTextbookFiles,
  resolveWorkspace
} from "../packages/tutor-kit/dist/compile/discover.js";
import { css } from "../packages/tutor-kit/dist/ui/styles.js";

test.afterEach(() => clearWorkspaceCaches());

test("Tutor Kit CSS exposes the component palette tokens", () => {
  const stylesheet = css();
  assert.match(stylesheet, /--tutor-color-red:\s*#a33b2f;/);
  assert.match(stylesheet, /--tutor-color-blue-soft:\s*#e4e8e9;/);
  assert.match(stylesheet, /--tutor-color-success:\s*#2f7d46;/);
  assert.match(stylesheet, /--tutor-color-category-3-strong:\s*#624172;/);
});

function choiceQuestion(index: number, answer = "a") {
  return {
    kind: "multiple-choice" as const,
    id: `question-${index}`,
    prompt: `What is the result for case ${index}?`,
    choices: [
      { id: "a", body: "First result" },
      { id: "b", body: "Second result" },
      { id: "c", body: "Third result" },
      { id: "d", body: "Fourth result" }
    ],
    answer,
    explanation: `Choice ${answer} is correct for this case.`,
    tags: ["core"],
    difficulty: "medium" as const
  };
}

function matchingQuestion() {
  return {
    kind: "matching" as const,
    id: "matching-question",
    prompt: "Match each input to its result.",
    pairs: [
      { id: "one", left: "1", right: "2" },
      { id: "two", left: "2", right: "3" }
    ],
    explanation: "Each operation adds one.",
    tags: ["core"],
    difficulty: "medium" as const
  };
}

function textbookWithBlocks(blocks: unknown[]) {
  return {
    id: "course",
    title: "Course",
    chapters: [{
      id: "chapter",
      title: "Chapter",
      sections: [{ id: "section", title: "Section", blocks, subsections: [] }]
    }]
  };
}

function issueMessages(value: unknown): string {
  return validateTextbook(value).map((entry) => entry.message).join("\n");
}

test("builders create a valid textbook across the built-in block types", () => {
  const review = balancedQuiz({
    id: "review",
    title: "Review",
    mode: "review",
    questions: [choiceQuestion(1), choiceQuestion(2), choiceQuestion(3), matchingQuestion()]
  });
  const practice = codingProblem({
    id: "add-one",
    title: "Add one",
    prompt: "Implement add_one so it returns the integer input plus one and passes every provided test case.",
    files: [
      { path: "main.py", content: "def add_one(x): return x\n", editable: true },
      { path: "solution.py", content: "def add_one(x): return x + 1\n", hidden: true },
      { path: "tests.py", content: "from main import add_one\nassert add_one(2) == 3\n" }
    ],
    test: "$PYTHON tests.py",
    verification: { actionId: "test", referenceFiles: { "main.py": "solution.py" } }
  });
  const blocks = [
    p({ id: "intro", body: "Start with $x$." }),
    heading({ id: "heading", text: "Inspect the parts" }),
    list({ id: "steps", items: ["Read the input."] }),
    codeBlock({ id: "code", language: "js", code: "const x = 1;" }),
    mathBlock({ id: "math", body: "x^2" }),
    diagram({ id: "diagram", body: "flowchart LR\nA --> B" }),
    chart({
      id: "chart",
      title: "Values",
      type: "line" as const,
      points: [{ label: "A", value: 1 }, { label: "B", value: 2 }]
    }),
    image({ id: "image", src: "assets/example.png", alt: "An example." }),
    callout({ id: "note", body: "Keep this in mind." }),
    glossary({ id: "terms", entries: [{ term: "Input", definition: "A supplied value." }] }),
    transformation({
      id: "trace",
      title: "Trace a value",
      focus: "Follow the value through the operation.",
      input: [{ format: "markdown", body: "Start with `2`." }],
      operation: { format: "math", body: "2 + 1" },
      output: [{ format: "code", body: "3" }],
      explanation: "Adding one changes 2 to 3."
    }),
    practice,
    review
  ];
  const built = textbook({
    id: "programming",
    title: "Programming",
    chapters: [chapter({
      id: "basics",
      title: "Basics",
      sections: [section({ id: "lesson", title: "Lesson", blocks })]
    })]
  });

  assert.deepEqual(validateTextbook(built), []);
  assert.deepEqual(
    built.chapters[0]?.sections[0]?.blocks.map((block) => block.kind),
    ["p", "heading", "list", "codeBlock", "mathBlock", "diagram", "chart", "image", "callout", "glossary", "transformation", "codingProblem", "quiz"]
  );
});

test("validation reports structural errors and unsafe content", () => {
  const messages = issueMessages(textbookWithBlocks([
    { kind: "p", id: "same", props: { body: "Unclosed $math" } },
    { kind: "p", id: "same", props: { body: "Duplicate id" } },
    { kind: "image", id: "unsafe-image", props: { src: "../secret.png", alt: "Secret" } },
    {
      kind: "transformation",
      id: "bad-table",
      props: {
        title: "Bad table",
        focus: "Inspect it.",
        layout: "sideways",
        inputLabel: "Input",
        operationLabel: "Operation",
        outputLabel: "Output",
        input: [{ format: "table", columns: ["a", "b"], rows: [["one"]] }],
        operation: { format: "math", body: "x" },
        output: [{ format: "markdown", body: "Done" }],
        explanation: "The row is malformed."
      }
    }
  ]));

  assert.match(messages, /unmatched \$ delimiter/);
  assert.match(messages, /Duplicate block id: same/);
  assert.match(messages, /Image src must reference a textbook asset path/);
  assert.match(messages, /Transformation layout must be auto, flow, or compare/);
  assert.match(messages, /row width must match its column count/);
});

test("balancedQuiz preserves answers while spreading their positions", () => {
  const source = Array.from({ length: 8 }, (_, index) => choiceQuestion(index + 1));
  const first = balancedQuiz({ id: "balanced", title: "Balanced", mode: "review", questions: source });
  const second = balancedQuiz({ id: "balanced", title: "Balanced", mode: "review", questions: source });
  const positions = first.props.questions.map((question) => {
    assert.equal(question.kind, "multiple-choice");
    return question.choices.findIndex((choice) => choice.id === question.answer);
  });

  assert.deepEqual(first, second);
  assert.deepEqual(source.map((question) => question.choices.map((choice) => choice.id)),
    source.map(() => ["a", "b", "c", "d"]));
  assert.deepEqual(new Set(positions), new Set([0, 1, 2, 3]));
  assert.deepEqual(validateTextbook(textbookWithBlocks([first])), []);

  const biased = quiz({ id: "biased", title: "Biased", mode: "review", questions: source });
  assert.match(issueMessages(textbookWithBlocks([biased])), /overly concentrated in one choice position/);
});

test("coding problem validation protects project paths and reference mappings", () => {
  const problem = codingProblem({
    id: "add-one",
    title: "Add one",
    prompt: "Implement add_one so it returns the integer input plus one and passes every provided test case.",
    files: [
      { path: "main.py", content: "def add_one(x): return x\n", editable: true },
      { path: "solution.py", content: "def add_one(x): return x + 1\n", hidden: true },
      { path: "tests.py", content: "from main import add_one\nassert add_one(2) == 3\n" }
    ],
    test: "$PYTHON tests.py",
    verification: { actionId: "test", referenceFiles: { "main.py": "solution.py" } }
  });
  assert.deepEqual(validateTextbook(textbookWithBlocks([problem])), []);

  const invalid = structuredClone(problem);
  invalid.props.files[0]!.path = "../main.py";
  invalid.props.verification!.referenceFiles = { "missing.py": "tests.py" };
  const messages = issueMessages(textbookWithBlocks([invalid]));

  assert.match(messages, /file paths must be relative/);
  assert.match(messages, /Verification target must match an editable file/);
  assert.match(messages, /Verification reference file must be hidden/);
});

test("textbook discovery skips symlink directory cycles", () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-discovery-"));
  const textbooksDir = join(dir, "textbooks");
  const nestedDir = join(textbooksDir, "loop");
  mkdirSync(nestedDir, { recursive: true });
  writeFileSync(join(textbooksDir, "textbook.ts"), "export default {};\n");
  symlinkSync(textbooksDir, join(nestedDir, "back"), "dir");

  assert.deepEqual(discoverTextbookFiles(textbooksDir), [join(textbooksDir, "textbook.ts")]);
});

test("workspace loading reports the config path on syntax errors", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-config-"));
  writeFileSync(join(dir, "tutor.config.ts"), "export default {\n");

  await assert.rejects(resolveWorkspace(dir), /Failed to load tutor config .*tutor\.config\.ts/);
});
