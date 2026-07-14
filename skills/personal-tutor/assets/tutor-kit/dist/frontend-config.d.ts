import type { UserConfig } from "vite";
export type TutorFrontendConfig = Omit<UserConfig, "root" | "base" | "appType" | "server" | "build">;
export declare function defineFrontendConfig(config: TutorFrontendConfig): TutorFrontendConfig;
