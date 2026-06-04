export function packageJsonTemplate(packageSpec = "^0.1.0"): string {
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

export function tsconfigTemplate(): string {
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
    ]
  }, null, 2)}\n`;
}

export function configTemplate(): string {
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

export function welcomeTextbookTemplate(): string {
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

export function welcomeChapterTemplate(): string {
  return `import { callout, chapter, codeBlock, codingProblem, list, p, projectFiles, section, subsection } from "tutor-kit";

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
            }),
            codingProblem({
              id: "classify-workspace-paths",
              title: "Classify Tutor Kit Paths",
              prompt: "Implement \`classify_path(path)\` so it returns \`\\\"curriculum\\\"\` for authored textbook source paths and \`\\\"runtime\\\"\` for Tutor Kit runtime-history paths. Then implement \`should_edit(path)\` so it returns \`true\` only for files an agent should edit when changing lesson content.",
              language: "python",
              files: [
                project.file("main.py", { editable: true }),
                project.file("tests.py")
              ],
              run: "$PYTHON main.py",
              test: "$PYTHON tests.py",
              review: "Check whether the learner understands the difference between authored curriculum files and runtime-history files, not just whether the tests pass."
            }),
            callout({
              id: "authoring-rule",
              tone: "key-idea",
              title: "Authoring rule",
              body: "Use blocks the way you would use HTML: paragraphs for prose, headings for local structure, lists for scanability, code blocks for exact syntax, math blocks for displayed formulas, and callouts for emphasis."
            }),
            list({
              id: "authoring-mastery-check",
              items: [
                "Without looking back, name the command you should run after editing content.",
                "Describe one validation error that compile can catch before the UI opens.",
                "Explain which file should change if the lesson content changes but learner history should stay untouched."
              ]
            })
          ]
        })
      ]
    })
  ]
});
`;
}

export function welcomeProblemMainTemplate(): string {
  return `def classify_path(path):
    if path.startswith("textbooks/") and path.endswith(".chapter.ts"):
        return "curriculum"
    if path.startswith("tutor-data/"):
        return "runtime"
    return "other"


def should_edit(path):
    return classify_path(path) == "curriculum"


if __name__ == "__main__":
    print(classify_path("textbooks/getting-started/chapters/welcome.chapter.ts"))
`;
}

export function welcomeProblemTestsTemplate(): string {
  return `from main import classify_path, should_edit


assert classify_path("textbooks/getting-started/chapters/welcome.chapter.ts") == "curriculum"
assert classify_path("tutor-data/events.jsonl") == "runtime"
assert classify_path("README.md") == "other"

assert should_edit("textbooks/getting-started/chapters/welcome.chapter.ts") is True
assert should_edit("tutor-data/events.jsonl") is False

print("ok")
`;
}

export function registryTemplate(): string {
  return `import { coreBlocks } from "./blocks/core.js";

export const blockRegistry = {
  ...coreBlocks
};
`;
}
