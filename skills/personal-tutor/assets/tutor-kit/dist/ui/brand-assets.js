import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export function wizardIconPath() {
    return join(packageRoot, "assets", "personal-tutor-wizard-icon.png");
}
//# sourceMappingURL=brand-assets.js.map