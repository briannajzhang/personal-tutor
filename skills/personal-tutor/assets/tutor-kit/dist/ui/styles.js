import { baseCss } from "./styles/base.js";
import { glossaryCss } from "./styles/glossary.js";
import { learningBlocksCss } from "./styles/learning-blocks.js";
import { codingCss } from "./styles/coding.js";
export function css() {
    return [
        baseCss(),
        glossaryCss(),
        learningBlocksCss(),
        codingCss()
    ].join("\n");
}
//# sourceMappingURL=styles.js.map