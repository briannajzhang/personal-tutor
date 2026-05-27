export declare const builtInWidgetRegistry: {
    blurb: {
        kind: string;
        title: string;
        create: typeof import("../index.js").blurb;
    };
};
export type BuiltInWidgetKind = keyof typeof builtInWidgetRegistry;
