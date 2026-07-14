import { coreClientJs } from "./client/core.js";
import { glossaryClientJs } from "./client/glossary.js";
import { chapterClientJs } from "./client/chapter.js";
import { highlightsClientJs } from "./client/highlights.js";
import { blocksClientJs } from "./client/blocks.js";
import { quizzesClientJs } from "./client/quizzes.js";
import { codingClientJs } from "./client/coding.js";
import { shellClientJs } from "./client/shell.js";
import { componentsClientJs } from "./client/components.js";
import { highlightClientJs } from "./highlight-client.js";

export function clientJs(): string {
  return [
    highlightClientJs(),
    coreClientJs(),
    componentsClientJs(),
    glossaryClientJs(),
    chapterClientJs(),
    highlightsClientJs(),
    blocksClientJs(),
    quizzesClientJs(),
    codingClientJs(),
    shellClientJs()
  ].join("\n\n");
}
