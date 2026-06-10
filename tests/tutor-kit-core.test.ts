import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { callout, chapter, codeBlock, codingProblem, heading, list, mathBlock, p, projectFiles, quiz, section, subsection, textbook, validateTextbook } from "../packages/tutor-kit/dist/index.js";
import { clearWorkspaceCaches, discoverTextbookFiles, resolveWorkspace } from "../packages/tutor-kit/dist/compile/discover.js";

test.afterEach(() => {
  clearWorkspaceCaches();
});

test("builders create valid textbooks", () => {
  const built = textbook({
    id: "programming",
    title: "Programming",
    chapters: [
      chapter({
        id: "abstractions",
        title: "Chapter 1: Abstractions",
        sections: [
          section({
            id: "elements",
            title: "1.1 Elements",
            blocks: [
              p({ id: "intro", body: "Hello $x$." }),
              heading({ id: "what-next", text: "What comes next" }),
              list({
                id: "self-check",
                items: [
                  "Read the expression.",
                  "Evaluate it.",
                  "Without looking back, explain what this block is trying to teach."
                ]
              }),
              codeBlock({ id: "code", language: "js", code: "const x = 1;" }),
              mathBlock({ id: "math", body: "x^2 + y^2 = z^2" }),
              callout({ id: "note", tone: "key-idea", body: "Blocks are semantic." }),
              codingProblem({
                id: "double",
                title: "Double",
                prompt: "Implement `double(x)` so it returns a value that is exactly twice the numeric input. For example, `double(2)` should return `4`, and the implementation should work for the additional integer cases covered by the tests.",
                language: "python",
                files: [
                  { path: "main.py", content: "def double(x):\n    return x\n", editable: true },
                  { path: "solution.py", content: "def double(x):\n    return x * 2\n", hidden: true },
                  { path: "tests.py", content: "from main import double\nassert double(2) == 4\n", editable: false }
                ],
                setup: "$PYTHON -c \"print('ready')\"",
                test: "$PYTHON tests.py",
                verification: { actionId: "test", referenceFiles: { "main.py": "solution.py" } }
              })
            ],
            subsections: [
              subsection({
                id: "calls",
                title: "1.1.1 Calls",
                blocks: []
              })
            ]
          }),
          section({
            id: "review",
            title: "1.2 Review",
            blocks: [
              list({
                id: "mastery-check",
                items: [
                  "Explain how the code example and math expression represent the same idea.",
                  "Predict what `double(5)` should return before running the tests."
                ]
              }),
              quiz({
                id: "concept-check",
                title: "Concept Check",
                mode: "review",
                questions: [
                  {
                    id: "double-purpose",
                    prompt: "What should `double(x)` return?",
                    choices: [
                      { id: "a", body: "The input unchanged" },
                      { id: "b", body: "The input multiplied by 2" },
                      { id: "c", body: "The input plus 2" },
                      { id: "d", body: "The input converted to a string" }
                    ],
                    answer: "b",
                    explanation: "`double(x)` should produce a result that is twice the original input.",
                    tags: ["functions", "return-values"],
                    difficulty: "easy"
                  },
                  {
                    id: "double-five",
                    prompt: "What should `double(5)` return?",
                    choices: [
                      { id: "a", body: "`5`" },
                      { id: "b", body: "`7`" },
                      { id: "c", body: "`10`" },
                      { id: "d", body: "`25`" }
                    ],
                    answer: "c",
                    explanation: "Doubling means multiplying the input by 2, so `5 * 2` returns `10`.",
                    tags: ["functions", "return-values"],
                    difficulty: "easy"
                  },
                  {
                    id: "return-vs-print",
                    prompt: "Why should `double(x)` return the computed value instead of only printing it?",
                    choices: [
                      { id: "a", body: "The tests need a returned value to compare against the expected result." },
                      { id: "b", body: "Printing automatically makes a function faster." },
                      { id: "c", body: "A function cannot use multiplication if it returns a value." },
                      { id: "d", body: "Python ignores returned numbers." }
                    ],
                    answer: "a",
                    explanation: "A return value lets callers and tests use the result. Printing only writes text to stdout and does not give the caller the computed value.",
                    tags: ["functions", "return-values"],
                    difficulty: "medium"
                  },
                  {
                    id: "implementation-choice",
                    prompt: "Which implementation correctly doubles the input?",
                    choices: [
                      { id: "a", body: "`return x`" },
                      { id: "b", body: "`return x + 2`" },
                      { id: "c", body: "`return x * 2`" },
                      { id: "d", body: "`print(x * 2)`" }
                    ],
                    answer: "c",
                    explanation: "`return x * 2` computes twice the input and gives that value back to the caller.",
                    tags: ["functions", "implementation"],
                    difficulty: "medium"
                  }
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  assert.deepEqual(validateTextbook(built), []);
});

test("validation rejects malformed quiz blocks", () => {
  const built = textbook({
    id: "programming",
    title: "Programming",
    chapters: [
      chapter({
        id: "checks",
        title: "Checks",
        sections: [
          section({
            id: "quiz-section",
            title: "Quiz Section",
            blocks: [
              quiz({
                id: "broken-quiz",
                title: "Broken Quiz",
                questions: [
                  {
                    id: "same",
                    prompt: "Which option is correct?",
                    choices: [
                      { id: "a", body: "First option" },
                      { id: "a", body: "Duplicate option id" }
                    ],
                    answer: "missing",
                    explanation: "The correct answer must point at one of the choice ids.",
                    difficulty: "easy"
                  },
                  {
                    id: "same",
                    prompt: "Which option is also correct?",
                    choices: [
                      { id: "true", body: "True" }
                    ],
                    answer: "true",
                    explanation: "This question does not have enough choices.",
                    difficulty: "invalid" as any
                  }
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  const messages = validateTextbook(built).map((issue) => issue.message).join("\n");
  assert.match(messages, /Duplicate quiz choice id: a/);
  assert.match(messages, /answer must match a choice id/);
  assert.match(messages, /Duplicate quiz question id: same/);
  assert.match(messages, /choices must contain at least 2 choices/);
  assert.match(messages, /difficulty must be easy, medium, or hard/);
});

test("validation flags non-trivial chapters without review quizzes", () => {
  const built = textbook({
    id: "programming",
    title: "Programming",
    chapters: [
      chapter({
        id: "flow",
        title: "Flow",
        sections: [
          section({
            id: "concept",
            title: "Concept",
            blocks: [
              p({ id: "intro", body: "Control flow decides which code runs." }),
              p({ id: "branch", body: "A branch chooses between paths." }),
              p({ id: "condition", body: "A condition is the expression that makes the choice." }),
              p({ id: "case", body: "A true condition takes one path and a false condition takes another." }),
              p({ id: "trap", body: "A common mistake is treating assignment as comparison." }),
              p({ id: "example", body: "For example, `if score >= 80` checks whether the score is high enough." }),
              quiz({
                id: "branch-check",
                title: "Check: Branches",
                mode: "check",
                questions: [
                  {
                    id: "condition-role",
                    prompt: "What job does the condition do in an `if` statement?",
                    choices: [
                      { id: "a", body: "It decides which branch can run." },
                      { id: "b", body: "It always repeats the code." },
                      { id: "c", body: "It deletes false values." },
                      { id: "d", body: "It converts code into text." }
                    ],
                    answer: "a",
                    explanation: "The condition evaluates to true or false, and that result determines which branch runs.",
                    tags: ["control-flow", "conditions"],
                    difficulty: "easy"
                  }
                ]
              }),
              p({ id: "wrap", body: "After the check, the learner should compare two nearby cases." })
            ]
          }),
          section({
            id: "practice",
            title: "Practice",
            blocks: [
              list({
                id: "tasks",
                items: [
                  "Predict which branch runs when `score` is `72`.",
                  "Explain why assignment is not the same as comparison."
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /Non-trivial chapter should end with a review quiz/
  );
});

test("validation flags multi-chapter textbooks without practice-test quizzes", () => {
  const chapters = ["one", "two", "three", "four"].map((id) => chapter({
    id,
    title: id,
    sections: [
      section({
        id: `${id}-section`,
        title: "Small Section",
        blocks: [
          p({ id: `${id}-intro`, body: "This intentionally small chapter is only here to test textbook-level quiz validation." })
        ]
      })
    ]
  }));

  const built = textbook({
    id: "programming",
    title: "Programming",
    chapters
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /Textbook should include at least one cumulative practice-test quiz/
  );
});

test("validation rejects quiz answer-position bias", () => {
  const questions = ["one", "two", "three", "four"].map((id) => ({
    id,
    prompt: `Question ${id}?`,
    choices: [
      { id: "a", body: "First" },
      { id: "b", body: "Second" },
      { id: "c", body: "Third" },
      { id: "d", body: "Fourth" }
    ],
    answer: "a",
    explanation: "The first choice is correct.",
    tags: ["bias"],
    difficulty: "easy" as const
  }));
  const built = textbook({
    id: "bias",
    title: "Bias",
    chapters: [chapter({
      id: "bias",
      title: "Bias",
      sections: [section({
        id: "review",
        title: "Review",
        blocks: [quiz({ id: "biased", title: "Biased", mode: "review", questions })]
      })]
    })]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /answer-position bias/
  );
});

test("validation accepts valid coding-problem verification metadata", () => {
  const problem = codingProblem({
    id: "verified",
    title: "Verified",
    prompt: "Implement the function so it returns the expected output and passes the provided tests.",
    files: [
      { path: "main.py", content: "pass\n", editable: true },
      { path: "solution.py", content: "def answer(): return 42\n", hidden: true },
      { path: "tests.py", content: "pass\n" }
    ],
    test: "python3 tests.py",
    verification: { actionId: "test", referenceFiles: { "main.py": "solution.py" } }
  });
  const built = textbook({
    id: "verified",
    title: "Verified",
    chapters: [chapter({
      id: "verified",
      title: "Verified",
      sections: [section({ id: "practice", title: "Practice", blocks: [problem] })]
    })]
  });

  assert.deepEqual(
    validateTextbook(built).filter((issue) => issue.path.includes("verification")),
    []
  );
});

test("validation rejects invalid coding-problem verification mappings", () => {
  const problem = codingProblem({
    id: "invalid-verification",
    title: "Invalid Verification",
    prompt: "Implement the function so it returns the expected output and passes the provided tests.",
    files: [
      { path: "main.py", content: "pass\n", editable: true },
      { path: "solution.py", content: "pass\n" }
    ],
    test: "python3 tests.py",
    verification: {
      actionId: "missing-action",
      referenceFiles: { "missing.py": "solution.py", "main.py": "absent.py" }
    }
  });
  const built = textbook({
    id: "invalid-verification",
    title: "Invalid Verification",
    chapters: [chapter({
      id: "invalid-verification",
      title: "Invalid Verification",
      sections: [section({ id: "practice", title: "Practice", blocks: [problem] })]
    })]
  });
  const messages = validateTextbook(built).map((issue) => issue.message).join("\n");

  assert.match(messages, /actionId must match an action/);
  assert.match(messages, /target must match an editable file/);
  assert.match(messages, /reference file must be hidden/);
  assert.match(messages, /reference file does not exist/);
});

test("validation flags exposition-heavy chapters without practice moves", () => {
  const built = textbook({
    id: "history",
    title: "History",
    chapters: [
      chapter({
        id: "causes",
        title: "Causes",
        sections: [
          section({
            id: "overview",
            title: "Overview",
            blocks: [
              p({ id: "intro", body: "This chapter explains a major historical cause." }),
              p({ id: "detail", body: "It adds more explanatory detail." }),
              callout({ id: "trap", tone: "caution", body: "Do not confuse trigger and cause." }),
              p({ id: "more-detail", body: "It still never asks the learner to do anything." })
            ]
          })
        ]
      })
    ]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /exposition-heavy/
  );
});

test("validation flags code-heavy chapters without coding problems", () => {
  const built = textbook({
    id: "pandas",
    title: "Pandas",
    chapters: [
      chapter({
        id: "filtering",
        title: "Filtering",
        sections: [
          section({
            id: "masks",
            title: "Boolean Masks",
            blocks: [
              p({ id: "intro", body: "Boolean masks help choose rows." }),
              codeBlock({ id: "example", language: "python", code: "recent = df[df['year'] >= 2020]" }),
              callout({ id: "trap", tone: "caution", body: "Use `&` instead of `and` with pandas conditions." }),
              list({
                id: "guided-practice",
                items: [
                  "Write a mask that keeps rows where `score >= 80`.",
                  "Explain why `and` does not work here.",
                  "Predict what changes if `|` is used instead."
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /no codingProblem/
  );
});

test("discoverTextbookFiles skips symlink directory cycles", () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  const textbooksDir = join(dir, "textbooks");
  const nestedDir = join(textbooksDir, "loop");
  mkdirSync(nestedDir, { recursive: true });
  writeFileSync(join(textbooksDir, "textbook.ts"), "export default {};\n");
  symlinkSync(textbooksDir, join(nestedDir, "back"), "dir");

  const files = discoverTextbookFiles(textbooksDir);
  assert.deepEqual(files, [join(textbooksDir, "textbook.ts")]);
});

test("resolveWorkspace reports the config path on syntax errors", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  writeFileSync(join(dir, "tutor.config.ts"), "export default {\n");

  await assert.rejects(
    resolveWorkspace(dir),
    /Failed to load tutor config .*tutor\.config\.ts/
  );
});
