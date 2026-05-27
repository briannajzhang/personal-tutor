export function blurbWidgetTemplate() {
    return `import type { BlurbWidget } from "tutor-kit";

export const blurbWidget = {
  kind: "blurb",
  title: "Blurb",
  renderText(widget: BlurbWidget): string {
    return widget.props.body;
  }
};
`;
}
export function chapterTemplate(id, title) {
    return `import { blurb, chapter, section, subsection } from "tutor-kit";

export default chapter({
  id: "${id}",
  title: "${title}",
  sections: [
    section({
      id: "${id}-section",
      title: "1.1 Start Here",
      widgets: [
        blurb({
          id: "${id}-intro",
          title: "Core Idea",
          body: "Write the core idea here. Use Markdown and inline $LaTeX$ when useful."
        })
      ],
      subsections: [
        subsection({
          id: "${id}-subsection",
          title: "1.1.1 Details",
          widgets: []
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
//# sourceMappingURL=widgets.js.map