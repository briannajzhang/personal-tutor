import { callout, chapter, codeBlock, heading, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "welcome",
  title: "Chapter 1: Welcome To Tutor Kit",
  description: "A small chapter that exercises semantic blocks and the UI.",
  tags: ["starter", "mvp"],
  sections: [
    section({
      id: "what-this-is",
      title: "1.1 What This Is",
      blocks: [
        p({
          id: "what-this-is",
          body: "Tutor Kit treats learning material as code because agents are already good at reading and editing code. A textbook is a TypeScript module, a chapter is a structured object, and blocks are semantic pieces of teaching material: paragraphs, headings, lists, code, math, and callouts. That gives the agent enough structure to add material carefully, while keeping the result easy for a human to inspect."
        }),
        heading({
          id: "semantic-blocks-heading",
          text: "Semantic blocks"
        }),
        list({
          id: "semantic-blocks",
          items: [
            "`p(...)` holds ordinary teaching prose.",
            "`heading(...)` adds local structure inside a section or subsection.",
            "`codeBlock(...)`, `mathBlock(...)`, and `callout(...)` make examples and emphasis explicit."
          ]
        })
      ],
      subsections: [
        subsection({
          id: "workspace-source",
          title: "1.1.1 Workspace Source",
          blocks: [
            p({
              id: "workspace-source",
              body: "Authored content lives in visible `textbooks/<textbook>/chapters/*.chapter.ts` files. Runtime activity belongs in `tutor-data/events.jsonl`. This separation matters: the textbook is the durable curriculum, while events are the learner's interaction history. When an agent changes the curriculum, it should edit the TypeScript files and run `tutor compile`; it should not fake progress by editing event logs."
            }),
            codeBlock({
              id: "chapter-file-example",
              language: "ts",
              code: "section({ id: \"arrays\", title: \"1.1 Arrays\", blocks: [p({ id: \"intro\", body: \"...\" })] })"
            }),
            callout({
              id: "compile-reminder",
              tone: "key-idea",
              title: "Authoring habit",
              body: "Run `tutor compile` after changing curriculum files. It catches structural problems before the learner opens the UI."
            })
          ]
        })
      ]
    })
  ]
});
