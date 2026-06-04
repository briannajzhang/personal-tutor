import { callout, chapter, codeBlock, codingProblem, heading, list, p, projectFiles, section, subsection } from "tutor-kit";

const pathProject = projectFiles(import.meta.url, "./problems/classify-workspace-paths");

export default chapter({
  id: "welcome",
  title: "Chapter 1: Welcome To Tutor Kit",
  description: "A small chapter that exercises semantic blocks and the UI.",
  tags: ["starter", "mvp"],
  sections: [
    section({
      id: "what-this-is",
      title: "Why Tutor Kit Uses Source Files",
      blocks: [
        p({
          id: "what-this-is",
          body: "Tutor Kit treats learning material as code because agents are already good at reading and editing code. A textbook is a TypeScript module, a chapter is a structured object, and blocks are semantic pieces of teaching material: paragraphs, headings, lists, code, math, and callouts. That gives the agent enough structure to add material carefully, while keeping the result easy for a human to inspect."
        }),
        heading({
          id: "source-truth-heading",
          text: "What belongs where"
        }),
        list({
          id: "workspace-guided-practice",
          items: [
            "Point to the part of this chapter file that defines durable curriculum rather than runtime activity.",
            "Name which path pattern stores authored chapter source and which path stores learner history.",
            "Explain why an agent should edit chapter files instead of `tutor-data/events.jsonl` when changing the lesson itself."
          ]
        })
      ],
      subsections: [
        subsection({
          id: "curriculum-and-runtime",
          title: "Curriculum Files and Runtime History",
          blocks: [
            p({
              id: "workspace-source",
              body: "Authored content lives in visible `textbooks/<textbook>/chapters/*.chapter.ts` files. Runtime activity belongs in `tutor-data/events.jsonl`. This separation matters: the textbook is the durable curriculum, while events are the learner's interaction history. When an agent changes the curriculum, it should edit the TypeScript files and run `tutor compile`; it should not fake progress by editing event logs."
            }),
            codeBlock({
              id: "chapter-file-example",
              language: "ts",
              code: "section({ id: \"arrays\", title: \"Arrays\", blocks: [p({ id: \"intro\", body: \"...\" })] })"
            }),
            list({
              id: "compile-guided-practice",
              items: [
                "Predict which file should change if you want to rewrite a chapter explanation.",
                "Predict which file should change when a learner submits work in the UI.",
                "Describe one mistake `tutor compile` could catch before the learner opens the chapter."
              ]
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
          prompt: "Implement `classify_path(path)` so it returns `\"curriculum\"` for authored textbook source paths and `\"runtime\"` for Tutor Kit runtime-history paths. Then implement `should_edit(path)` so it returns `True` only for files an agent should edit when changing lesson content.",
          language: "python",
          files: [
            pathProject.file("main.py", { editable: true }),
            pathProject.file("tests.py")
          ],
          run: "$PYTHON main.py",
          test: "$PYTHON tests.py",
          review: "Check whether the learner understands the difference between authored curriculum files and runtime-history files, not just whether the tests pass."
        }),
        callout({
          id: "compile-reminder",
          tone: "key-idea",
          title: "Authoring habit",
          body: "Run `tutor compile` after changing curriculum files. It catches structural problems before the learner opens the UI."
        }),
        list({
          id: "starter-mastery-check",
          items: [
            "Without looking back, name the file path pattern where chapter source lives.",
            "Explain why runtime history belongs in `tutor-data/events.jsonl` instead of chapter files.",
            "Describe what `tutor compile` should catch before the learner opens the UI.",
            "Explain why the coding problem in this chapter is really a test of source-of-truth reasoning, not just Python syntax."
          ]
        })
      ]
    })
  ]
});
