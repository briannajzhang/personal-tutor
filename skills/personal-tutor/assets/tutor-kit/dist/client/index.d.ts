/// <reference types="vite/client" preserve="true" />
import type { JsonData, JsonValue } from "../core/types.js";
export type { JsonData, JsonValue } from "../core/types.js";
export interface TutorComponentLocation {
    textbookId: string;
    chapterId: string;
    sectionId: string;
    subsectionId?: string;
    blockId: string;
}
export interface TutorComponentServices {
    assets: {
        url(path: string): string;
    };
    events: {
        emit(type: string, payload?: JsonData): Promise<void>;
    };
    theme: {
        mode: "light" | "dark";
        tokens: Readonly<Record<string, string>>;
    };
}
export interface TutorComponentContext<Props extends JsonValue = JsonValue> {
    root: HTMLElement;
    host: HTMLElement;
    props: Readonly<Props>;
    signal: AbortSignal;
    location: TutorComponentLocation;
    services: TutorComponentServices;
}
export type TutorComponentCleanup = () => void | Promise<void>;
export type TutorComponentMount<Props extends JsonValue = JsonValue> = (context: TutorComponentContext<Props>) => void | TutorComponentCleanup | Promise<void | TutorComponentCleanup>;
export declare function defineComponent<Props extends JsonValue = JsonValue>(mount: TutorComponentMount<Props>): TutorComponentMount<Props>;
