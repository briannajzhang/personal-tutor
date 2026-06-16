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
  callout: { kind: "callout", title: "Callout" },
  transformation: { kind: "transformation", title: "Transformation" }
};
