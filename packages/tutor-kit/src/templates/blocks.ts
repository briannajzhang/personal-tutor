export function coreBlocksTemplate(): string {
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
`;
}

export function chapterTemplate(id: string, title: string): string {
  return `import { callout, chapter, codeBlock, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "${id}",
  title: "${title}",
  sections: [
    section({
      id: "${id}-core-idea",
      title: "Core Idea",
      blocks: [
        p({
          id: "${id}-learner-goal",
          body: "Goal: state what the learner should be able to do after this chapter."
        }),
        p({
          id: "${id}-intro",
          body: "Start from the learner's likely task or confusion. Define the key idea in ordinary language, then explain the mechanism that makes it work."
        }),
        p({
          id: "${id}-example-intro",
          body: "Before the example, tell the learner what to inspect."
        }),
        codeBlock({
          id: "${id}-worked-example",
          language: "text",
          code: "Input or setup\\nOperation\\nExpected output"
        }),
        p({
          id: "${id}-example-explained",
          body: "After the example, explain what happened and why it matters."
        }),
        callout({
          id: "${id}-common-trap",
          tone: "caution",
          title: "Common trap",
          body: "Name a realistic mistake, tempting wrong model, or boundary case."
        })
      ],
      subsections: [
        subsection({
          id: "${id}-guided-practice",
          title: "Guided Practice",
          blocks: [
            list({
              id: "${id}-guided-tasks",
              items: [
                "Predict what happens in a small case.",
                "Explain which part of the example controls the result.",
                "Fix or improve a realistic mistake."
              ]
            })
          ]
        })
      ]
    }),
    section({
      id: "${id}-independent-practice",
      title: "Independent Practice",
      blocks: [
        list({
          id: "${id}-mastery-check",
          items: [
            "Apply the idea to a new case.",
            "Explain the mechanism without looking back.",
            "Name one symptom that would help you debug a mistake."
          ]
        })
      ]
    })
  ]
});
`;
}

export function textbookTemplate(id: string, title: string): string {
  return `import { textbook } from "tutor-kit";

export default textbook({
  id: "${id}",
  title: "${title}",
  chapters: []
});
`;
}

export function courseTemplate(title: string): string {
  return `# Course: ${title}

## Learner

Goal:
Background:
Pace and practice:

## Outcome

After this course, the learner can:

## Course map

- [ ] Add the first planned chapter.

## Active publication

Outcome:
Ideas worth developing:
Possible worked examples:
Likely learner difficulty:
Practice and feedback opportunities:
`;
}
