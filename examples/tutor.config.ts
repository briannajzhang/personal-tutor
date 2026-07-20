import type { TutorConfig } from "tutor-kit";

const config: TutorConfig = {
  title: "Study",
  textbooksDir: "textbooks",
  dataDir: "tutor-data",
  codeRunner: {
    runtimes: {
      python: { command: "python3" }
    }
  }
};

export default config;
