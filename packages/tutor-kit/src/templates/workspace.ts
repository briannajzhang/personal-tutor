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
  return `import { blurb, chapter, section, subsection } from "tutor-kit";

export default chapter({
  id: "welcome",
  title: "Welcome",
  description: "A tiny starter chapter for checking Tutor Kit.",
  tags: ["starter"],
  sections: [
    section({
      id: "workspace-source",
      title: "1.1 Workspace Source",
      widgets: [
        blurb({
          id: "source-files",
          title: "Visible Files",
          body: "Textbooks are TypeScript modules. Sections and subsections hold Markdown and inline $LaTeX$ blurbs."
        })
      ],
      subsections: [
        subsection({
          id: "authoring-loop",
          title: "1.1.1 Authoring Loop",
          widgets: [
            blurb({
              id: "compile-loop",
              title: "Compile Often",
              body: "After editing content, run \`tutor compile\` before opening the study UI."
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
  return `import { blurbWidget } from "./widgets/blurb.js";

export const widgetRegistry = {
  blurb: blurbWidget
};
`;
}
