import { textbook } from "tutor-kit";
import welcome from "./chapters/welcome.chapter.js";

export default textbook({
  id: "getting-started",
  title: "Getting Started",
  description: "A starter textbook that exercises blurbs and the UI.",
  tags: ["starter", "mvp"],
  chapters: [welcome]
});
