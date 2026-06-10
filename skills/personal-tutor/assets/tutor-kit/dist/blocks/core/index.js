import { callout, codeBlock, codingProblem, heading, list, mathBlock, p, quiz } from "../../core/builders.js";
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
    callout: {
        kind: "callout",
        title: "Callout",
        create: callout
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