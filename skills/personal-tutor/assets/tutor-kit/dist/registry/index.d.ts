export declare const builtInBlockRegistry: {
    p: {
        kind: string;
        title: string;
        create: typeof import("../index.js").p;
    };
    heading: {
        kind: string;
        title: string;
        create: typeof import("../index.js").heading;
    };
    list: {
        kind: string;
        title: string;
        create: typeof import("../index.js").list;
    };
    codeBlock: {
        kind: string;
        title: string;
        create: typeof import("../index.js").codeBlock;
    };
    mathBlock: {
        kind: string;
        title: string;
        create: typeof import("../index.js").mathBlock;
    };
    callout: {
        kind: string;
        title: string;
        create: typeof import("../index.js").callout;
    };
    codingProblem: {
        kind: string;
        title: string;
        create: typeof import("../index.js").codingProblem;
    };
    quiz: {
        kind: string;
        title: string;
        create: typeof import("../index.js").quiz;
    };
};
export declare const builtInWidgetRegistry: {
    p: {
        kind: string;
        title: string;
        create: typeof import("../index.js").p;
    };
    heading: {
        kind: string;
        title: string;
        create: typeof import("../index.js").heading;
    };
    list: {
        kind: string;
        title: string;
        create: typeof import("../index.js").list;
    };
    codeBlock: {
        kind: string;
        title: string;
        create: typeof import("../index.js").codeBlock;
    };
    mathBlock: {
        kind: string;
        title: string;
        create: typeof import("../index.js").mathBlock;
    };
    callout: {
        kind: string;
        title: string;
        create: typeof import("../index.js").callout;
    };
    codingProblem: {
        kind: string;
        title: string;
        create: typeof import("../index.js").codingProblem;
    };
    quiz: {
        kind: string;
        title: string;
        create: typeof import("../index.js").quiz;
    };
};
export type BuiltInBlockKind = keyof typeof builtInBlockRegistry;
