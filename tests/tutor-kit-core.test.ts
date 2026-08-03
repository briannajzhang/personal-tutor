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

function rawQuizBlock(
  id: string,
  mode: "check" | "review" | "practice-test",
  positions: number[],
  preserveChoiceOrder = false
) {
  return {
    kind: "quiz",
    id,
    props: {
      title: id,
      mode,
      preserveChoiceOrder,
      questions: positions.map((position, index) => {
        const question = choiceQuestion(index + 1);
        const correct = question.choices[0]!;
        const distractors = question.choices.slice(1);
        distractors.splice(position, 0, correct);
        return { ...question, id: `${id}-question-${index + 1}`, choices: distractors };
      })
    }
  };
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

test("quiz balances ordinary four-choice questions by default", () => {
  const source = Array.from({ length: 8 }, (_, index) => choiceQuestion(index + 1));
  const first = quiz({ id: "balanced", title: "Balanced", mode: "review", questions: source });
  const second = quiz({ id: "balanced", title: "Balanced", mode: "review", questions: source });
  const positions = first.props.questions.map((question) => {
    assert.equal(question.kind, "multiple-choice");
    return question.choices.findIndex((choice) => choice.id === question.answer);
  });

  assert.deepEqual(first, second);
  assert.deepEqual(source.map((question) => question.choices.map((choice) => choice.id)),
    source.map(() => ["a", "b", "c", "d"]));
  assert.deepEqual(new Set(positions), new Set([0, 1, 2, 3]));
  assert.deepEqual(validateTextbook(textbookWithBlocks([first])), []);
});

test("balancedQuiz remains an alias for default quiz balancing", () => {
  const source = Array.from({ length: 8 }, (_, index) => choiceQuestion(index + 1));
  const input = { id: "balanced", title: "Balanced", mode: "review" as const, questions: source };

  assert.deepEqual(balancedQuiz(input), quiz(input));
  assert.equal(balancedQuiz({ ...input, preserveChoiceOrder: true }).props.preserveChoiceOrder, false);
});

test("quiz preserves authored order only when requested and leaves ineligible questions unchanged", () => {
  const fourChoice = choiceQuestion(1);
  const threeChoice = { ...choiceQuestion(2), choices: choiceQuestion(2).choices.slice(0, 3) };
  const matching = matchingQuestion();
  const sourceOrder = fourChoice.choices.map((choice) => choice.id);
  const preserved = quiz({
    id: "preserved",
    title: "Preserved",
    preserveChoiceOrder: true,
    questions: [fourChoice]
  });
  const mixed = quiz({ id: "mixed", title: "Mixed", questions: [threeChoice, matching] });
  const built = textbook({
    id: "preserved-course",
    title: "Preserved course",
    chapters: [chapter({
      id: "preserved-chapter",
      title: "Preserved chapter",
      sections: [section({ id: "preserved-section", title: "Preserved section", blocks: [preserved, mixed] })]
    })]
  });
  const builtBlocks = built.chapters[0]!.sections[0]!.blocks as Array<ReturnType<typeof quiz>>;

  assert.equal(preserved.props.preserveChoiceOrder, true);
  assert.deepEqual(preserved.props.questions[0]?.kind === "multiple-choice"
    ? preserved.props.questions[0].choices.map((choice) => choice.id)
    : [], sourceOrder);
  assert.deepEqual(mixed.props.questions[0]?.kind === "multiple-choice"
    ? mixed.props.questions[0].choices.map((choice) => choice.id)
    : [], ["a", "b", "c"]);
  assert.deepEqual(mixed.props.questions[1]?.kind === "matching"
    ? mixed.props.questions[1].pairs.map((pair) => pair.id)
    : [], ["one", "two"]);
  assert.deepEqual(matching.pairs.map((pair) => pair.id), ["one", "two"]);
  assert.deepEqual(builtBlocks[0]!.props.questions[0]?.kind === "multiple-choice"
    ? builtBlocks[0]!.props.questions[0].choices.map((choice) => choice.id)
    : [], sourceOrder);
  assert.deepEqual(builtBlocks[1]!.props.questions[0]?.kind === "multiple-choice"
    ? builtBlocks[1]!.props.questions[0].choices.map((choice) => choice.id)
    : [], ["a", "b", "c"]);
});

test("textbook balances repeated one-question quiz identities across chapter context without mutation", () => {
  const chapters = Array.from({ length: 4 }, (_, index) => chapter({
    id: `chapter-${index + 1}`,
    title: `Chapter ${index + 1}`,
    sections: [section({
      id: "lesson",
      title: "Lesson",
      blocks: [quiz({
        id: "lesson-check",
        title: "Check",
        questions: [{ ...choiceQuestion(1), id: "same-question" }]
      })]
    })]
  }));
  const before = chapters.map((chapterValue) => structuredClone(chapterValue));
  const localPositions = chapters.map((chapterValue) => {
    const block = chapterValue.sections[0]!.blocks[0]!;
    assert.equal(block.kind, "quiz");
    const question = (block as ReturnType<typeof quiz>).props.questions[0]!;
    assert.equal(question.kind, "multiple-choice");
    return question.choices.findIndex((choice) => choice.id === question.answer);
  });

  const built = textbook({ id: "contextual-course", title: "Course", chapters });
  const contextualPositions = built.chapters.map((chapterValue) => {
    const block = chapterValue.sections[0]!.blocks[0] as ReturnType<typeof quiz>;
    const question = block.props.questions[0]!;
    assert.equal(question.kind, "multiple-choice");
    return question.choices.findIndex((choice) => choice.id === question.answer);
  });

  assert.equal(new Set(localPositions).size, 1);
  assert.deepEqual(new Set(contextualPositions), new Set([0, 1, 2, 3]));
  assert.deepEqual(chapters, before);
  assert.deepEqual(validateTextbook(built), []);
});

test("textbook balances check, review, and practice-test cohorts independently", () => {
  const modes = ["check", "review", "practice-test"] as const;
  const blocks = Array.from({ length: 4 }, (_, index) => modes.map((mode) => quiz({
    id: `${mode}-${index + 1}`,
    title: `${mode} ${index + 1}`,
    mode,
    questions: [{ ...choiceQuestion(index + 1), id: `${mode}-question-${index + 1}` }]
  }))).flat();
  const built = textbook({
    id: "mode-course",
    title: "Mode course",
    chapters: [chapter({
      id: "mode-chapter",
      title: "Mode chapter",
      sections: [section({ id: "mode-section", title: "Mode section", blocks })]
    })]
  });

  for (const mode of modes) {
    const positions = built.chapters[0]!.sections[0]!.blocks
      .filter((block): block is ReturnType<typeof quiz> => block.kind === "quiz" && (block as ReturnType<typeof quiz>).props.mode === mode)
      .map((block) => {
        const question = block.props.questions[0]!;
        assert.equal(question.kind, "multiple-choice");
        return question.choices.findIndex((choice) => choice.id === question.answer);
      });
    assert.deepEqual(new Set(positions), new Set([0, 1, 2, 3]));
  }
});

test("validation aggregates local checks by chapter and reports cohort counts", () => {
  const checks = Array.from({ length: 4 }, (_, index) => rawQuizBlock(`check-${index + 1}`, "check", [0]));
  const messages = issueMessages(textbookWithBlocks(checks));

  assert.match(messages, /Chapter check cohort/);
  assert.match(messages, /A=4, B=0, C=0, D=0/);

  const threeQuestionMessages = issueMessages(textbookWithBlocks([
    rawQuizBlock("check-1", "check", [0]),
    rawQuizBlock("check-2", "check", [0]),
    rawQuizBlock("check-3", "check", [0])
  ]));
  assert.match(threeQuestionMessages, /Chapter check cohort/);
});

test("validation keeps review questions from masking biased checks and excludes preserved order", () => {
  const checks = Array.from({ length: 4 }, (_, index) => rawQuizBlock(`check-${index + 1}`, "check", [0]));
  const review = rawQuizBlock("review", "review", [0, 1, 2, 3, 0, 1, 2, 3]);
  const biasedMessages = issueMessages(textbookWithBlocks([...checks, review]));
  const preservedChecks = Array.from({ length: 4 }, (_, index) => rawQuizBlock(`preserved-${index + 1}`, "check", [0], true));
  const preservedMessages = issueMessages(textbookWithBlocks([...preservedChecks, review]));

  assert.match(biasedMessages, /Chapter check cohort/);
  assert.doesNotMatch(preservedMessages, /correct-answer positions/);
});

test("validation applies its textbook backstop to each mode at eight questions", () => {
  const chapters = Array.from({ length: 8 }, (_, index) => ({
    id: `chapter-${index + 1}`,
    title: `Chapter ${index + 1}`,
    sections: [{
      id: "lesson",
      title: "Lesson",
      blocks: [rawQuizBlock("same-check", "check", [0])],
      subsections: []
    }]
  }));
  const messages = issueMessages({ id: "course", title: "Course", chapters });

  assert.match(messages, /Textbook check cohort/);
  assert.match(messages, /A=8, B=0, C=0, D=0/);
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
