import { callout, chart, codeBlock, codingProblem, component, diagram, glossary, heading, image, list, mathBlock, p, quiz, transformation } from "../../core/builders.js";
export const coreBlockDefinitions = {
    p: {
        kind: "p",
        title: "Paragraph",
        create: p
    },
    heading: {
        kind: "heading",
        title: "Heading",
        create: heading
    },
    list: {
        kind: "list",
        title: "List",
        create: list
    },
    codeBlock: {
        kind: "codeBlock",
        title: "Code Block",
        create: codeBlock
    },
    mathBlock: {
        kind: "mathBlock",
        title: "Math Block",
        create: mathBlock
    },
    diagram: {
        kind: "diagram",
        title: "Diagram",
        create: diagram
    },
    chart: {
        kind: "chart",
        title: "Chart",
        create: chart
    },
    image: {
        kind: "image",
        title: "Image",
        create: image
    },
    component: {
        kind: "component",
        title: "Component",
        create: component
    },
    callout: {
        kind: "callout",
        title: "Callout",
        create: callout
    },
    glossary: {
        kind: "glossary",
        title: "Glossary",
        create: glossary
    },
    transformation: {
        kind: "transformation",
        title: "Transformation",
        create: transformation
    },
    codingProblem: {
        kind: "codingProblem",
        title: "Coding Problem",
        create: codingProblem
    },
    quiz: {
        kind: "quiz",
        title: "Quiz",
        create: quiz
    }
};
//# sourceMappingURL=index.js.map