import { callout, codeBlock, codingProblem, heading, list, mathBlock, p, quiz, transformation } from "../../core/builders.js";
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
    transformation: {
        kind: string;
        title: string;
        create: typeof transformation;
    };
    codingProblem: {
        kind: string;
        title: string;
        create: typeof codingProblem;
    };
    quiz: {
        kind: string;
        title: string;
        create: typeof quiz;
    };
};
