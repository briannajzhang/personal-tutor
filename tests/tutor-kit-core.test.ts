import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { balancedQuiz, callout, chapter, codeBlock, codingProblem, heading, list, mathBlock, p, projectFiles, quiz, section, subsection, textbook, transformation, validateTextbook } from "../packages/tutor-kit/dist/index.js";
import { clearWorkspaceCaches, discoverTextbookFiles, resolveWorkspace } from "../packages/tutor-kit/dist/compile/discover.js";

test.afterEach(() => {
  clearWorkspaceCaches();
});

function quizQuestions(answerIds: string[], prefix = "question") {
  return answerIds.map((answer, index) => ({
    id: `${prefix}-${index + 1}`,
    prompt: `Apply concept ${index + 1}.`,
    choices: [
      { id: "a", body: "First choice" },
      { id: "b", body: "Second choice" },
      { id: "c", body: "Third choice" },
      { id: "d", body: "Fourth choice" }
    ],
    answer,
    explanation: `Choice ${answer} follows from the tested concept.`,
    tags: [`topic-${index % 3}`],
    difficulty: index % 2 === 0 ? "easy" as const : "medium" as const
  }));
}

function textbookWithQuizzes(quizzes: ReturnType<typeof quiz>[]) {
  return textbook({
    id: "quiz-validation",
    title: "Quiz Validation",
    chapters: [chapter({
      id: "quiz-validation",
      title: "Quiz Validation",
      sections: [section({
        id: "quizzes",
        title: "Quizzes",
        blocks: quizzes
      })]
    })]
  });
}

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
              transformation({
                id: "double-trace",
                title: "Inspect: Doubling A Value",
                focus: "Track how multiplying the input by 2 changes the result.",
                input: [{ format: "markdown", body: "Start with `2`." }],
                operation: { format: "math", body: "2 \\times 2" },
                output: [
                  { format: "code", language: "text", body: "4" },
                  { format: "table", columns: ["input", "output"], rows: [["2", "4"]] }
                ],
                explanation: "Multiplying the input by 2 produces the doubled value."
              }),
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

test("transformation builder applies defaults and preserves supported artifacts", () => {
  const built = transformation({
    id: "evidence-to-claim",
    title: "Inspect: Evidence To Claim",
    focus: "Track how the source detail supports a limited claim.",
    input: [{ label: "Evidence", format: "markdown", body: "A dated source." }],
    operation: { format: "code", body: "connect(source, claim)" },
    output: [{ format: "table", columns: ["claim"], rows: [] }],
    explanation: "The reasoning move supports a limited claim."
  });

  assert.equal(built.props.inputLabel, "Input");
  assert.equal(built.props.operationLabel, "Operation");
  assert.equal(built.props.outputLabel, "Output");
  assert.equal(built.props.layout, "auto");
  assert.equal(built.props.input[0]?.format, "markdown");
  assert.equal(built.props.operation.format, "code");
  assert.deepEqual(built.props.output[0], { label: undefined, format: "table", columns: ["claim"], rows: [] });
});

test("transformation builder accepts constrained layout overrides and requires focus", () => {
  const base = {
    title: "Inspect: One Change",
    focus: "Track the changed value.",
    input: [{ format: "markdown" as const, body: "Before" }],
    operation: { format: "markdown" as const, body: "Change it" },
    output: [{ format: "markdown" as const, body: "After" }],
    explanation: "The operation changes the visible value."
  };

  assert.equal(transformation({ id: "flow", layout: "flow", ...base }).props.layout, "flow");
  assert.equal(transformation({ id: "compare", layout: "compare", ...base }).props.layout, "compare");
  assert.throws(() => transformation({ id: "missing-focus", ...base, focus: "" }), /transformation.focus is required/);
});

test("validation rejects malformed transformation artifacts", () => {
  const built = textbook({
    id: "transformations",
    title: "Transformations",
    chapters: [chapter({
      id: "broken",
      title: "Broken Transformations",
      sections: [section({
        id: "examples",
        title: "Examples",
        blocks: [{
          kind: "transformation",
          id: "broken-transformation",
          props: {
            title: "",
            focus: "",
            layout: "wide",
            inputLabel: "Evidence",
            operationLabel: "Move",
            outputLabel: "Claim",
            input: [],
            operation: { format: "diagram", body: "unsupported" },
            output: [{
              format: "table",
              columns: ["a", 2],
              rows: [["one"], ["two", 3]]
            }],
            explanation: ""
          }
        }]
      })]
    })]
  });

  const messages = validateTextbook(built).map((problem) => problem.message).join("\n");
  assert.match(messages, /Text is required/);
  assert.match(messages, /layout must be auto, flow, or compare/);
  assert.match(messages, /non-empty array/);
  assert.match(messages, /format must be markdown, code, math, or table/);
  assert.match(messages, /columns must be strings/);
  assert.match(messages, /row width must match its column count/);
  assert.match(messages, /cells must be strings/);
});

test("transformation blocks do not satisfy chapter practice requirements", () => {
  const example = transformation({
    id: "worked-example",
    title: "Practice: Starting State To Result",
    focus: "Track how the rule changes the starting state.",
    input: [{ format: "markdown", body: "Starting state" }],
    operation: { format: "markdown", body: "Apply the rule" },
    output: [{ format: "markdown", body: "Visible result" }],
    explanation: "The rule accounts for the visible result."
  });
  const built = textbook({
    id: "transformation-only",
    title: "Transformation Only",
    chapters: [chapter({
      id: "transformation-only",
      title: "Transformation Only",
      sections: [
        section({
          id: "examples",
          title: "Examples",
          blocks: [example, { ...example, id: "worked-example-two" }, { ...example, id: "worked-example-three" }, { ...example, id: "worked-example-four" }]
        }),
        section({ id: "ending", title: "Ending", blocks: [] })
      ]
    })]
  });

  const messages = validateTextbook(built).map((problem) => problem.message).join("\n");
  assert.match(messages, /exposition-heavy/);
  assert.match(messages, /missing a retrieval, review, or mastery-check move/);
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

test("validation accepts long textbooks without practice-test quizzes", () => {
  const chapters = ["one", "two", "three", "four", "five", "six", "seven", "eight"].map((id) => chapter({
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

  assert.doesNotMatch(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /practice-test quiz/
  );
});

test("validation rejects chapters containing both review and practice-test quizzes", () => {
  const built = textbookWithQuizzes([
    quiz({
      id: "review",
      title: "Chapter Review",
      mode: "review",
      questions: quizQuestions(["a", "b", "c", "d"], "review")
    }),
    quiz({
      id: "practice-test",
      title: "Practice Test",
      mode: "practice-test",
      questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"], "practice")
    })
  ]);

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /must not contain both review and practice-test quizzes/
  );
});

test("validation rejects non-trivial chapters with review quizzes outside the final section", () => {
  const built = textbook({
    id: "review-placement",
    title: "Review Placement",
    chapters: [chapter({
      id: "review-placement",
      title: "Review Placement",
      sections: [
        section({
          id: "instruction",
          title: "Instruction",
          blocks: [
            p({ id: "one", body: "First explanation." }),
            p({ id: "two", body: "Second explanation." }),
            p({ id: "three", body: "Third explanation." }),
            p({ id: "four", body: "Fourth explanation." }),
            quiz({
              id: "review",
              title: "Chapter Review",
              mode: "review",
              questions: quizQuestions(["a", "b", "c", "d"])
            })
          ],
          subsections: [subsection({
            id: "example",
            title: "Example",
            blocks: [p({ id: "example-body", body: "A focused example." })]
          })]
        }),
        section({
          id: "after-review",
          title: "After Review",
          blocks: [
            list({ id: "task", items: ["Apply the idea independently."] }),
            p({ id: "closing", body: "The chapter closes after the review." })
          ]
        })
      ]
    })]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /review quiz must appear in the chapter's final section/
  );
});

test("validation accepts non-trivial chapters with review quizzes in the final section", () => {
  const built = textbook({
    id: "review-placement",
    title: "Review Placement",
    chapters: [chapter({
      id: "review-placement",
      title: "Review Placement",
      sections: [
        section({
          id: "instruction",
          title: "Instruction",
          blocks: [
            p({ id: "one", body: "First explanation." }),
            p({ id: "two", body: "Second explanation." }),
            p({ id: "three", body: "Third explanation." }),
            p({ id: "four", body: "Fourth explanation." }),
            list({ id: "task", items: ["Apply the idea independently."] })
          ],
          subsections: [subsection({
            id: "example",
            title: "Example",
            blocks: [p({ id: "example-body", body: "A focused example." })]
          })]
        }),
        section({
          id: "review",
          title: "Chapter Review",
          blocks: [
            p({ id: "review-intro", body: "Use the review to check the chapter outcome." }),
            quiz({
              id: "review",
              title: "Chapter Review",
              mode: "review",
              questions: quizQuestions(["a", "b", "c", "d"])
            })
          ]
        })
      ]
    })]
  });

  assert.doesNotMatch(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /review quiz must appear/
  );
});

test("validation accepts a dedicated practice-test chapter without a review quiz", () => {
  const built = textbook({
    id: "practice-test",
    title: "Practice Test",
    chapters: [chapter({
      id: "practice-test",
      title: "Cumulative Practice Test",
      sections: [
        section({
          id: "prepare",
          title: "Prepare",
          blocks: [
            p({ id: "intro", body: "This assessment mixes earlier ideas." }),
            p({ id: "context", body: "Choose the relevant method for each scenario." }),
            list({ id: "synthesis", items: ["Explain how two earlier ideas work together."] })
          ],
          subsections: [subsection({
            id: "strategy",
            title: "Strategy",
            blocks: [p({ id: "strategy-body", body: "Read each scenario before choosing a method." })]
          })]
        }),
        section({
          id: "assessment",
          title: "Cumulative Assessment",
          blocks: [
            p({ id: "assessment-intro", body: "Complete the mixed assessment without relying on chapter labels." }),
            list({ id: "diagnosis", items: ["Diagnose one multi-step failure and explain the correction."] }),
            p({ id: "bridge", body: "The quiz now checks transfer across the earlier material." }),
            quiz({
              id: "practice-test",
              title: "Practice Test",
              mode: "practice-test",
              questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"])
            })
          ]
        })
      ]
    })]
  });

  const messages = validateTextbook(built).map((issue) => issue.message).join("\n");
  assert.doesNotMatch(messages, /should end with a review quiz/);
  assert.doesNotMatch(messages, /must not contain both review and practice-test quizzes/);
});

test("validation rejects inconsistent chapter descriptions", () => {
  const built = textbook({
    id: "descriptions",
    title: "Descriptions",
    chapters: [
      chapter({
        id: "described",
        title: "Described",
        description: "A learner-facing capability.",
        sections: [section({ id: "one", title: "One", blocks: [p({ id: "one-p", body: "Small chapter." })] })]
      }),
      chapter({
        id: "undescribed",
        title: "Undescribed",
        sections: [section({ id: "two", title: "Two", blocks: [p({ id: "two-p", body: "Small chapter." })] })]
      })
    ]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /Chapter descriptions should be used consistently/
  );
});

test("validation accepts textbooks with all or no chapter descriptions", () => {
  const makeChapter = (id: string, description?: string) => chapter({
    id,
    title: id,
    ...(description ? { description } : {}),
    sections: [section({ id: `${id}-section`, title: id, blocks: [p({ id: `${id}-p`, body: "Small chapter." })] })]
  });
  const allDescriptions = textbook({
    id: "all-descriptions",
    title: "All Descriptions",
    chapters: [makeChapter("one", "First capability."), makeChapter("two", "Second capability.")]
  });
  const noDescriptions = textbook({
    id: "no-descriptions",
    title: "No Descriptions",
    chapters: [makeChapter("one"), makeChapter("two")]
  });

  assert.doesNotMatch(
    validateTextbook(allDescriptions).map((issue) => issue.message).join("\n"),
    /Chapter descriptions should be used consistently/
  );
  assert.doesNotMatch(
    validateTextbook(noDescriptions).map((issue) => issue.message).join("\n"),
    /Chapter descriptions should be used consistently/
  );
});

test("validation accepts only documented chapter and section roles", () => {
  const built = textbook({
    id: "roles",
    title: "Roles",
    chapters: [chapter({
      id: "roles",
      title: "Roles",
      role: "invalid" as any,
      sections: [section({
        id: "roles",
        title: "Roles",
        role: "invalid" as any,
        blocks: [p({ id: "intro", body: "Role validation." })]
      })]
    })]
  });

  const messages = validateTextbook(built).map((issue) => issue.message).join("\n");
  assert.match(messages, /Chapter role must be instruction or cumulative-checkpoint/);
  assert.match(messages, /Section role must be instruction, practice, review, or assessment/);
});

test("validation accepts legacy textbooks without semantic roles", () => {
  const built = textbook({
    id: "legacy",
    title: "Legacy",
    chapters: [chapter({
      id: "legacy",
      title: "Legacy",
      sections: [section({
        id: "legacy",
        title: "Legacy",
        blocks: [p({ id: "intro", body: "Legacy textbooks remain valid without roles." })]
      })]
    })]
  });

  assert.deepEqual(validateTextbook(built), []);
});

test("validation accepts instruction chapters with separated practice and review roles", () => {
  const built = textbook({
    id: "instruction",
    title: "Instruction",
    chapters: [chapter({
      id: "instruction",
      title: "Instruction",
      role: "instruction",
      sections: [
        section({
          id: "instruction",
          title: "Instruction",
          role: "instruction",
          blocks: [
            p({ id: "one", body: "Define the idea." }),
            p({ id: "two", body: "Explain the mechanism." }),
            p({ id: "three", body: "Interpret an example." }),
            quiz({ id: "check", title: "Check", mode: "check", questions: quizQuestions(["a"]) })
          ],
          subsections: [subsection({
            id: "example",
            title: "Example",
            blocks: [p({ id: "example-body", body: "A focused example." })]
          })]
        }),
        section({
          id: "practice",
          title: "Practice",
          role: "practice",
          blocks: [
            list({ id: "guided", items: ["Apply the idea to a new case."] }),
            p({ id: "practice-bridge", body: "Now use the idea independently." })
          ]
        }),
        section({
          id: "review",
          title: "Review",
          role: "review",
          blocks: [
            p({ id: "review-intro", body: "Retrieve the chapter outcome without looking back." }),
            quiz({
              id: "review",
              title: "Chapter Review",
              mode: "review",
              questions: quizQuestions(["a", "b", "c", "d"])
            })
          ]
        })
      ]
    })]
  });

  assert.deepEqual(validateTextbook(built), []);
});

test("validation rejects instruction chapters containing practice-test quizzes", () => {
  const built = textbook({
    id: "instruction",
    title: "Instruction",
    chapters: [chapter({
      id: "instruction",
      title: "Instruction",
      role: "instruction",
      sections: [section({
        id: "assessment",
        title: "Assessment",
        role: "assessment",
        blocks: [quiz({
          id: "practice-test",
          title: "Practice Test",
          mode: "practice-test",
          questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"])
        })]
      })]
    })]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /Instruction chapters must not contain practice-test quizzes/
  );
});

test("validation rejects non-trivial instruction chapters without a final review role", () => {
  const built = textbook({
    id: "instruction",
    title: "Instruction",
    chapters: [chapter({
      id: "instruction",
      title: "Instruction",
      role: "instruction",
      sections: [
        section({
          id: "instruction",
          title: "Instruction",
          role: "instruction",
          blocks: [
            p({ id: "one", body: "Define the idea." }),
            p({ id: "two", body: "Explain the mechanism." }),
            p({ id: "three", body: "Interpret an example." }),
            p({ id: "four", body: "Name a boundary case." }),
            quiz({ id: "check", title: "Check", mode: "check", questions: quizQuestions(["a"]) })
          ],
          subsections: [subsection({
            id: "example",
            title: "Example",
            blocks: [p({ id: "example-body", body: "A focused example." })]
          })]
        }),
        section({
          id: "practice-and-review",
          title: "Practice and Review",
          role: "practice",
          blocks: [
            list({ id: "practice", items: ["Apply the idea independently."] }),
            quiz({
              id: "review",
              title: "Chapter Review",
              mode: "review",
              questions: quizQuestions(["a", "b", "c", "d"])
            })
          ]
        })
      ]
    })]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /must end with a section whose role is review/
  );
});

test("validation accepts cumulative checkpoints with assessment and non-quiz practice", () => {
  const built = textbook({
    id: "checkpoint",
    title: "Checkpoint",
    chapters: [chapter({
      id: "checkpoint",
      title: "Checkpoint",
      role: "cumulative-checkpoint",
      sections: [section({
        id: "assessment",
        title: "Assessment",
        role: "assessment",
        blocks: [
          list({ id: "synthesis", items: ["Diagnose a scenario combining two earlier ideas."] }),
          quiz({
            id: "practice-test",
            title: "Practice Test",
            mode: "practice-test",
            questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"])
          })
        ]
      })]
    })]
  });

  assert.deepEqual(validateTextbook(built), []);
});

test("validation rejects cumulative checkpoints without a final assessment role", () => {
  const built = textbook({
    id: "checkpoint",
    title: "Checkpoint",
    chapters: [chapter({
      id: "checkpoint",
      title: "Checkpoint",
      role: "cumulative-checkpoint",
      sections: [section({
        id: "mixed-practice",
        title: "Mixed Practice",
        role: "practice",
        blocks: [
          list({ id: "synthesis", items: ["Diagnose a mixed scenario."] }),
          quiz({
            id: "practice-test",
            title: "Practice Test",
            mode: "practice-test",
            questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"])
          })
        ]
      })]
    })]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /must end with a section whose role is assessment/
  );
});

test("validation rejects cumulative checkpoints with check or review quizzes", () => {
  const built = textbook({
    id: "checkpoint",
    title: "Checkpoint",
    chapters: [chapter({
      id: "checkpoint",
      title: "Checkpoint",
      role: "cumulative-checkpoint",
      sections: [section({
        id: "assessment",
        title: "Assessment",
        role: "assessment",
        blocks: [
          list({ id: "synthesis", items: ["Diagnose a mixed scenario."] }),
          quiz({ id: "check", title: "Check", mode: "check", questions: quizQuestions(["a"]) }),
          quiz({ id: "review", title: "Review", mode: "review", questions: quizQuestions(["a", "b", "c", "d"]) }),
          quiz({
            id: "practice-test",
            title: "Practice Test",
            mode: "practice-test",
            questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"])
          })
        ]
      })]
    })]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /Cumulative-checkpoint chapters must not contain check or review quizzes/
  );
});

test("validation rejects cumulative checkpoints containing only a quiz", () => {
  const built = textbook({
    id: "checkpoint",
    title: "Checkpoint",
    chapters: [chapter({
      id: "checkpoint",
      title: "Checkpoint",
      role: "cumulative-checkpoint",
      sections: [section({
        id: "assessment",
        title: "Assessment",
        role: "assessment",
        blocks: [quiz({
          id: "practice-test",
          title: "Practice Test",
          mode: "practice-test",
          questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"])
        })]
      })]
    })]
  });

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /must include at least one concrete non-quiz task/
  );
});

test("validation rejects review and assessment section quiz-mode mismatches", () => {
  const built = textbook({
    id: "section-roles",
    title: "Section Roles",
    chapters: [chapter({
      id: "section-roles",
      title: "Section Roles",
      sections: [
        section({
          id: "review",
          title: "Review",
          role: "review",
          blocks: [quiz({
            id: "practice-test",
            title: "Practice Test",
            mode: "practice-test",
            questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"])
          })]
        }),
        section({
          id: "assessment",
          title: "Assessment",
          role: "assessment",
          blocks: [quiz({
            id: "review",
            title: "Review",
            mode: "review",
            questions: quizQuestions(["a", "b", "c", "d"])
          })]
        })
      ]
    })]
  });

  const messages = validateTextbook(built).map((issue) => issue.message).join("\n");
  assert.match(messages, /Review sections must not contain practice-test quizzes/);
  assert.match(messages, /Assessment sections must not contain review quizzes/);
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

test("balancedQuiz reorders choices to satisfy answer-position validation", () => {
  const questions = Array.from({ length: 8 }, (_, index) => ({
    id: `biased-${index + 1}`,
    prompt: `Question ${index + 1}?`,
    choices: [
      { id: "a", body: `Correct body ${index + 1}` },
      { id: "b", body: "Distractor B" },
      { id: "c", body: "Distractor C" },
      { id: "d", body: "Distractor D" }
    ],
    answer: "a",
    explanation: "The first semantic choice is correct.",
    tags: ["bias"],
    difficulty: "easy" as const
  }));
  const unbalanced = textbookWithQuizzes([
    quiz({ id: "unbalanced", title: "Unbalanced", mode: "review", questions })
  ]);
  const balanced = textbookWithQuizzes([
    balancedQuiz({ id: "unbalanced", title: "Unbalanced", mode: "review", questions })
  ]);

  assert.match(
    validateTextbook(unbalanced).map((issue) => issue.message).join("\n"),
    /answer-position bias|at least 3 different choice positions/
  );
  assert.doesNotMatch(
    validateTextbook(balanced).map((issue) => issue.message).join("\n"),
    /answer-position bias|at least 3 different choice positions/
  );
});

test("balancedQuiz preserves semantic answer identity and stable output", () => {
  const input = {
    id: "identity",
    title: "Identity",
    mode: "review" as const,
    questions: [{
      id: "q1",
      prompt: "Which choice names the mechanism?",
      choices: [
        { id: "a", body: "Correct mechanism" },
        { id: "b", body: "Tempting misconception" },
        { id: "c", body: "Unrelated detail" },
        { id: "d", body: "Overbroad claim" }
      ],
      answer: "a",
      explanation: "The mechanism choice is correct.",
      tags: ["identity"],
      difficulty: "medium" as const
    }, {
      id: "q2",
      prompt: "Which short answer is valid?",
      choices: [
        { id: "yes", body: "Yes" },
        { id: "no", body: "No" }
      ],
      answer: "yes",
      explanation: "The short answer is valid.",
      tags: ["identity"],
      difficulty: "easy" as const
    }]
  };
  const original = structuredClone(input);
  const first = balancedQuiz(input);
  const second = balancedQuiz(input);
  const firstQuestion = first.props.questions[0];
  const correctChoice = firstQuestion.choices.find((choice) => choice.id === firstQuestion.answer);

  assert.deepEqual(input, original);
  assert.deepEqual(first, second);
  assert.equal(firstQuestion.answer, "a");
  assert.equal(correctChoice?.body, "Correct mechanism");
  assert.deepEqual(new Set(firstQuestion.choices.map((choice) => choice.id)), new Set(["a", "b", "c", "d"]));
  assert.deepEqual(first.props.questions[0].tags, ["identity"]);
  assert.equal(first.props.questions[0].difficulty, "medium");
  assert.deepEqual(first.props.questions[1].choices, input.questions[1].choices);
});

test("validation requires at least 10 practice-test questions", () => {
  const built = textbookWithQuizzes([
    quiz({
      id: "short-practice-test",
      title: "Short Practice Test",
      mode: "practice-test",
      questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d"])
    })
  ]);

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /Practice-test quiz should contain at least 10 questions/
  );
});

test("validation accepts a 10-question practice test", () => {
  const built = textbookWithQuizzes([
    quiz({
      id: "complete-practice-test",
      title: "Complete Practice Test",
      mode: "practice-test",
      questions: quizQuestions(["a", "b", "c", "d", "a", "b", "c", "d", "a", "b"])
    })
  ]);

  assert.doesNotMatch(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /Practice-test quiz should contain/
  );
});

test("validation rejects long quizzes using only two answer positions", () => {
  const built = textbookWithQuizzes([
    quiz({
      id: "two-position-practice-test",
      title: "Two Position Practice Test",
      mode: "practice-test",
      questions: quizQuestions(["a", "b", "a", "b", "a", "b", "a", "b", "a", "b"])
    })
  ]);

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /at least 3 different choice positions/
  );
});

test("validation rejects textbook-wide underrepresented answer positions", () => {
  const answers = ["a", "b", "c", "a", "b", "c", "a", "b"];
  const built = textbookWithQuizzes([
    quiz({ id: "review-one", title: "Review One", mode: "review", questions: quizQuestions(answers, "one") }),
    quiz({ id: "review-two", title: "Review Two", mode: "review", questions: quizQuestions(answers, "two") }),
    quiz({ id: "review-three", title: "Review Three", mode: "review", questions: quizQuestions(answers, "three") })
  ]);

  assert.match(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /each position containing at least 10%/
  );
});

test("validation accepts balanced textbook-wide answer positions", () => {
  const answers = ["a", "b", "c", "d", "a", "b", "c", "d"];
  const built = textbookWithQuizzes([
    quiz({ id: "review-one", title: "Review One", mode: "review", questions: quizQuestions(answers, "one") }),
    quiz({ id: "review-two", title: "Review Two", mode: "review", questions: quizQuestions(answers, "two") }),
    quiz({ id: "review-three", title: "Review Three", mode: "review", questions: quizQuestions(answers, "three") })
  ]);

  assert.doesNotMatch(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /choice positions/
  );
});

test("validation does not apply answer-position diversity checks to short local checks", () => {
  const built = textbookWithQuizzes([
    quiz({
      id: "short-check",
      title: "Short Check",
      mode: "check",
      questions: quizQuestions(["a", "a"])
    })
  ]);

  assert.doesNotMatch(
    validateTextbook(built).map((issue) => issue.message).join("\n"),
    /choice positions/
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
