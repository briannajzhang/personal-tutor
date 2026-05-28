import { callout, codeBlock, codingProblem, heading, list, mathBlock, p } from "../../core/builders.js";
export declare const coreBlockDefinitions: {
    p: {
        kind: string;
        title: string;
        create: typeof p;
    };
    heading: {
        kind: string;
        title: string;
        create: typeof heading;
    };
    list: {
        kind: string;
        title: string;
        create: typeof list;
    };
    codeBlock: {
        kind: string;
        title: string;
        create: typeof codeBlock;
    };
    mathBlock: {
        kind: string;
        title: string;
        create: typeof mathBlock;
    };
    callout: {
        kind: string;
        title: string;
        create: typeof callout;
    };
    codingProblem: {
        kind: string;
        title: string;
        create: typeof codingProblem;
    };
};
