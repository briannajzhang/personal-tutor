export function packageJsonTemplate(packageSpec) {
    return `${JSON.stringify({
        type: "module",
        scripts: {
            compile: "tutor compile",
            dev: "tutor dev"
        },
        dependencies: {
            "tutor-kit": packageSpec
        },
        devDependencies: {
            typescript: "^5.8.3"
        }
    }, null, 2)}\n`;
}
export function tsconfigTemplate() {
    return `${JSON.stringify({
        compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            jsx: "react-jsx",
            noEmit: true
        },
        include: [
            "tutor.config.ts",
            "textbooks/**/*.ts",
            "textbooks/**/*.tsx",
            "tutor/**/*.ts",
            "tutor/**/*.tsx"
        ],
        exclude: [
            "textbooks/**/chapters/problems/**",
            "textbooks/**/problems/**"
        ]
    }, null, 2)}\n`;
}
export function configTemplate() {
    return `import type { TutorConfig } from "tutor-kit";

const config: TutorConfig = {
  title: "Study",
  textbooksDir: "textbooks",
  dataDir: "tutor-data",
  codeRunner: {
    runtimes: {
      python: { command: "python3" }
    }
  }
};

export default config;
`;
}
export function welcomeTextbookTemplate() {
    return `import { textbook } from "tutor-kit";
import welcome from "./chapters/welcome.chapter.js";

export default textbook({
  id: "getting-started",
  title: "Getting Started",
  description: "A starter textbook for checking Tutor Kit.",
  tags: ["starter"],
  chapters: [welcome]
});
`;
}
export function welcomeChapterTemplate() {
    return `import { callout, chapter, codeBlock, codingProblem, list, p, projectFiles, quiz, section, subsection } from "tutor-kit";

const project = projectFiles(import.meta.url, "./problems/classify-workspace-paths");

export default chapter({
  id: "welcome",
  title: "Chapter 1: Welcome",
  description: "A tiny starter chapter for checking Tutor Kit.",
  tags: ["starter"],
  sections: [
    section({
      id: "workspace-source",
      title: "Workspace Source",
      blocks: [
        p({
          id: "source-files",
          body: "Tutor Kit keeps learning material in visible TypeScript files so the agent and the learner can both inspect the same source of truth. A textbook owns ordered chapters; each chapter is divided into sections and subsections; semantic blocks inside those units contain the actual teaching prose, examples, formulas, and callouts. This structure is intentionally close to a real textbook, because it gives the agent a durable place to add material without turning the workspace into a pile of disconnected notes."
        }),
        p({
          id: "planning-artifacts",
          body: "Generated textbooks may also include authoring artifacts such as \`prompt.md\`, \`curriculum-map.md\`, \`chapter-specs.md\`, \`review-notes.md\`, and \`compile-result.md\`. These files are not learner history; they preserve the plan and review trail for future edits."
        }),
        list({
          id: "workspace-guided-practice",
          items: [
            "Open the chapter file and identify which block introduces the main idea.",
            "Name one place where durable curriculum lives and one place where runtime activity lives.",
            "Explain why \`tutor-data/events.jsonl\` should not be edited as if it were lesson source."
          ]
        })
      ],
      subsections: [
        subsection({
          id: "authoring-loop",
          title: "Authoring Loop",
          blocks: [
            p({
              id: "compile-loop",
              body: "After editing content, run \`tutor compile\` before opening the study UI. The compile step is deliberately boring: it checks that the TypeScript imports resolve, that IDs are stable and unique, and that block text has balanced Markdown and LaTeX delimiters. Treat it like a spellcheck for the learning environment, not as an optional finishing step."
            }),
            codeBlock({
              id: "chapter-file-example",
              language: "ts",
              code: "section({ id: \\\"arrays\\\", title: \\\"Arrays\\\", blocks: [p({ id: \\\"intro\\\", body: \\\"...\\\" })] })"
            })
          ]
        })
      ]
    }),
    section({
      id: "practice-and-review",
      title: "Practice And Review",
      blocks: [
        codingProblem({
          id: "classify-workspace-paths",
          title: "Classify Tutor Kit Paths",
          prompt: "Implement \`classify_path(path)\` so it returns \`\\\"curriculum\\\"\` for authored textbook source paths and \`\\\"runtime\\\"\` for Tutor Kit runtime-history paths. Then implement \`should_edit(path)\` so it returns \`true\` only for files an agent should edit when changing lesson content.",
          language: "python",
          files: [
            project.file("main.py", { editable: true }),
            project.file("solution.py", { hidden: true }),
            project.file("tests.py")
          ],
          run: "$PYTHON main.py",
          test: "$PYTHON tests.py",
          verification: {
            actionId: "test",
            referenceFiles: { "main.py": "solution.py" }
          },
          review: "Check whether the learner understands the difference between authored curriculum files and runtime-history files, not just whether the tests pass."
        }),
        callout({
          id: "authoring-rule",
          tone: "key-idea",
          title: "Authoring rule",
          body: "Use blocks the way you would use HTML: paragraphs for prose, headings for local structure, lists for scanability, code blocks for exact syntax, math blocks for displayed formulas, and callouts for emphasis."
        }),
        quiz({
          id: "authoring-review",
          title: "Chapter Review: Tutor Kit Authoring",
          mode: "review",
          questions: [
            {
              id: "source-file-location",
              prompt: "Which path pattern stores authored chapter source?",
              choices: [
                { id: "a", body: "\`textbooks/<textbook>/chapters/*.chapter.ts\`" },
                { id: "b", body: "\`tutor-data/events.jsonl\`" },
                { id: "c", body: "\`node_modules/tutor-kit\`" },
                { id: "d", body: "\`package-lock.json\`" }
              ],
              answer: "a",
              explanation: "Authored curriculum lives in chapter source files under \`textbooks/<textbook>/chapters/*.chapter.ts\`. Runtime history belongs in \`tutor-data/events.jsonl\`.",
              tags: ["tutor-kit", "curriculum-source"],
              difficulty: "easy"
            },
            {
              id: "runtime-history-location",
              prompt: "What should \`tutor-data/events.jsonl\` represent?",
              choices: [
                { id: "a", body: "The durable lesson source for a chapter" },
                { id: "b", body: "Runtime learner activity and event history" },
                { id: "c", body: "The TypeScript compiler configuration" },
                { id: "d", body: "The built Tutor Kit package files" }
              ],
              answer: "b",
              explanation: "\`tutor-data/events.jsonl\` records runtime activity. Changing lesson content should happen in textbook and chapter source files instead.",
              tags: ["tutor-kit", "runtime-history"],
              difficulty: "easy"
            },
            {
              id: "compile-purpose",
              prompt: "Why should an author run \`tutor compile\` after editing lesson content?",
              choices: [
                { id: "a", body: "To erase old learner event history" },
                { id: "b", body: "To automatically write all chapter prose" },
                { id: "c", body: "To check imports, IDs, and block structure before the learner opens the UI" },
                { id: "d", body: "To publish the textbook to a remote server" }
              ],
              answer: "c",
              explanation: "\`tutor compile\` catches structural and TypeScript problems early. It does not rewrite learner history or publish the course.",
              tags: ["tutor-kit", "compile"],
              difficulty: "medium"
            },
            {
              id: "semantic-block-purpose",
              prompt: "Why does Tutor Kit prefer semantic blocks like \`p\`, \`callout\`, \`quiz\`, and \`codingProblem\` instead of one giant Markdown string?",
              choices: [
                { id: "a", body: "Semantic blocks make each teaching move explicit and easier to validate or render." },
                { id: "b", body: "Markdown strings cannot contain code examples." },
                { id: "c", body: "Semantic blocks prevent authors from writing prose." },
                { id: "d", body: "The UI only supports one block per chapter." }
              ],
              answer: "a",
              explanation: "Semantic blocks preserve the teaching structure. The UI and validator can understand a paragraph, callout, quiz, or runnable coding task as different learning moves.",
              tags: ["tutor-kit", "semantic-blocks"],
              difficulty: "medium"
            }
          ]
        })
      ]
    })
  ]
});
`;
}
export function welcomeProblemMainTemplate() {
    return `def classify_path(path):
    return "other"


def should_edit(path):
    return False


if __name__ == "__main__":
    print(classify_path("textbooks/getting-started/chapters/welcome.chapter.ts"))
`;
}
export function welcomeProblemTestsTemplate() {
    return `from main import classify_path, should_edit


assert classify_path("textbooks/getting-started/chapters/welcome.chapter.ts") == "curriculum"
assert classify_path("tutor-data/events.jsonl") == "runtime"
assert classify_path("README.md") == "other"

assert should_edit("textbooks/getting-started/chapters/welcome.chapter.ts") is True
assert should_edit("tutor-data/events.jsonl") is False

print("ok")
`;
}
export function welcomeProblemSolutionTemplate() {
    return `def classify_path(path):
    if path.startswith("textbooks/") and path.endswith(".chapter.ts"):
        return "curriculum"
    if path.startswith("tutor-data/"):
        return "runtime"
    return "other"


def should_edit(path):
    return classify_path(path) == "curriculum"
`;
}
export function registryTemplate() {
    return `import { coreBlocks } from "./blocks/core.js";

export const blockRegistry = {
  ...coreBlocks
};
`;
}
//# sourceMappingURL=workspace.js.map