export function coreBlocksTemplate() {
    return `import type { TutorBlock } from "tutor-kit";

export const coreBlocks = {
  p: {
    kind: "p",
    title: "Paragraph",
    renderText(block: TutorBlock): string {
      const props = block.props as { body?: unknown };
      return String(props.body ?? "");
    }
  },
  heading: { kind: "heading", title: "Heading" },
  list: { kind: "list", title: "List" },
  codeBlock: { kind: "codeBlock", title: "Code Block" },
  mathBlock: { kind: "mathBlock", title: "Math Block" },
  callout: { kind: "callout", title: "Callout" }
};
`;
}
export function chapterTemplate(id, title) {
    return `import { callout, chapter, codeBlock, heading, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "${id}",
  title: "${title}",
  sections: [
    section({
      id: "${id}-section",
      title: "1.1 Start Here",
      blocks: [
        p({
          id: "${id}-intro",
          body: "Write a clear teaching paragraph here. Start from the learner's likely mental model, introduce the new idea in ordinary language, then connect it to one concrete example."
        }),
        heading({
          id: "${id}-local-heading",
          text: "What to notice"
        }),
        list({
          id: "${id}-checks",
          items: [
            "What problem does this concept solve?",
            "What mistake should the learner avoid?"
          ]
        }),
        codeBlock({
          id: "${id}-code",
          language: "ts",
          code: "// Add a small example when code makes the idea sharper."
        }),
        callout({
          id: "${id}-key-idea",
          tone: "key-idea",
          title: "Key idea",
          body: "End with a practical check: what should the learner now be able to notice, predict, or do?"
        })
      ],
      subsections: [
        subsection({
          id: "${id}-subsection",
          title: "1.1.1 Details",
          blocks: []
        })
      ]
    })
  ]
});
`;
}
export function textbookTemplate(id, title) {
    return `import { textbook } from "tutor-kit";

export default textbook({
  id: "${id}",
  title: "${title}",
  chapters: []
});
`;
}
//# sourceMappingURL=blocks.js.map