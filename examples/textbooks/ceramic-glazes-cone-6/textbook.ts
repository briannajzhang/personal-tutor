import { textbook } from "tutor-kit";
import cumulativeTestPlan from "./chapters/cumulative-test-plan.chapter.js";
import fromRecipeToRevision from "./chapters/from-recipe-to-revision.chapter.js";
import glazeAsMoltenGlass from "./chapters/glaze-as-molten-glass.chapter.js";
import readingCommonDefects from "./chapters/reading-common-defects.chapter.js";
import safeCone6Testing from "./chapters/safe-cone-6-testing.chapter.js";
import whatIngredientsDo from "./chapters/what-ingredients-do.chapter.js";

export default textbook({
  id: "ceramic-glazes-cone-6",
  title: "Ceramic Glazes for Cone 6 Electric Kilns",
  description: "A practical beginner course on how cone 6 electric glazes melt, fit clay, fail, and get tested safely.",
  chapters: [
    glazeAsMoltenGlass,
    whatIngredientsDo,
    readingCommonDefects,
    safeCone6Testing,
    fromRecipeToRevision,
    cumulativeTestPlan
  ]
});
