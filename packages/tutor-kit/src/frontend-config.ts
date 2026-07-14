import type { UserConfig } from "vite";

export type TutorFrontendConfig = Omit<UserConfig, "root" | "base" | "appType" | "server" | "build">;

export function defineFrontendConfig(config: TutorFrontendConfig): TutorFrontendConfig {
  return config;
}
