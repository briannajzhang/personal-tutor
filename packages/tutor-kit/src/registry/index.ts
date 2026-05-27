import { blurbDefinition } from "../widgets/blurb/index.js";

export const builtInWidgetRegistry = {
  blurb: blurbDefinition
};

export type BuiltInWidgetKind = keyof typeof builtInWidgetRegistry;
