import type { TutorBlock } from "tutor-kit";

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
  diagram: { kind: "diagram", title: "Diagram" },
  chart: { kind: "chart", title: "Chart" },
  image: { kind: "image", title: "Image" },
  component: { kind: "component", title: "Component" },
  callout: { kind: "callout", title: "Callout" },
  transformation: { kind: "transformation", title: "Transformation" },
  glossary: { kind: "glossary", title: "Glossary" },
  codingProblem: { kind: "codingProblem", title: "Coding Problem" },
  quiz: { kind: "quiz", title: "Quiz" }
};
