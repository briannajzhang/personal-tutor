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
  dataDir: "tutor-data"
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
  return `import { callout, chapter, heading, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "welcome",
  title: "Welcome",
  description: "A tiny starter chapter for checking Tutor Kit.",
  tags: ["starter"],
  sections: [
    section({
      id: "workspace-source",
      title: "1.1 Workspace Source",
      blocks: [
        p({
          id: "source-files",
          body: "Tutor Kit keeps learning material in visible TypeScript files so the agent and the learner can both inspect the same source of truth. A textbook owns ordered chapters; each chapter is divided into sections and subsections; semantic blocks inside those units contain the actual teaching prose, examples, formulas, and callouts. This structure is intentionally close to a real textbook, because it gives the agent a durable place to add material without turning the workspace into a pile of disconnected notes."
        }),
        heading({
          id: "workspace-parts-heading",
          text: "The moving parts"
        }),
        list({
          id: "workspace-parts",
          items: [
            "Textbook files define the durable curriculum.",
            "Chapter files hold sections, subsections, and semantic content blocks.",
            "Event logs record learner activity without pretending to be source material."
          ]
        })
      ],
      subsections: [
        subsection({
          id: "authoring-loop",
          title: "1.1.1 Authoring Loop",
          blocks: [
            p({
              id: "compile-loop",
              body: "After editing content, run \`tutor compile\` before opening the study UI. The compile step is deliberately boring: it checks that the TypeScript imports resolve, that IDs are stable and unique, and that block text has balanced Markdown and LaTeX delimiters. Treat it like a spellcheck for the learning environment, not as an optional finishing step."
            }),
            callout({
              id: "authoring-rule",
              tone: "key-idea",
              title: "Authoring rule",
              body: "Use blocks the way you would use HTML: paragraphs for prose, headings for local structure, lists for scanability, code blocks for exact syntax, math blocks for displayed formulas, and callouts for emphasis."
            })
          ]
        })
      ]
    })
  ]
});
`;
}

export function registryTemplate(): string {
  return `import { coreBlocks } from "./blocks/core.js";

export const blockRegistry = {
  ...coreBlocks
};
`;
}
