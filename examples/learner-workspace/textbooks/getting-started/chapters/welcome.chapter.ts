import { blurb, chapter, section, subsection } from "tutor-kit";

export default chapter({
  id: "welcome",
  title: "Chapter 1: Welcome To Tutor Kit",
  description: "A tiny chapter that exercises blurbs and the UI.",
  tags: ["starter", "mvp"],
  sections: [
    section({
      id: "what-this-is",
      title: "1.1 What This Is",
      widgets: [
        blurb({
          id: "what-this-is-blurb",
          title: "What this is",
          body: "Tutor Kit textbooks are TypeScript modules. A blurb can include Markdown, `code`, and inline $LaTeX$."
        })
      ],
      subsections: [
        subsection({
          id: "workspace-source",
          title: "1.1.1 Workspace Source",
          widgets: [
            blurb({
              id: "workspace-source-blurb",
              title: "Workspace source",
              body: "Authored content lives in visible `textbooks/<textbook>/chapters/*.chapter.ts` files. Runtime activity belongs in `tutor-data/events.jsonl`."
            })
          ]
        })
      ]
    })
  ]
});
