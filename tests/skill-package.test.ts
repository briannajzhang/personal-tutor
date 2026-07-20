import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const skillDir = join(root, "skills", "personal-tutor");

test("skill package has a valid entry point and runnable bundled CLI", () => {
  const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);

  assert.ok(frontmatter, "SKILL.md should start with YAML frontmatter");
  assert.match(frontmatter[1], /^name: personal-tutor$/m);
  assert.match(frontmatter[1], /^description: .+$/m);
  assert.ok(existsSync(join(skillDir, "agents", "openai.yaml")));

  const help = execFileSync(process.execPath, [join(skillDir, "scripts", "tutor-kit.mjs"), "--help"], {
    encoding: "utf8"
  });
  assert.match(help, /Tutor Kit/);
  assert.match(help, /compile/);
  assert.match(help, /verify coding-problems/);
});

test("bundled Tutor Kit matches the package build", () => {
  const output = execFileSync(process.execPath, [join(root, "scripts", "build-skill.mjs"), "--check"], {
    encoding: "utf8"
  });

  assert.match(output, /up to date/);
});

test("personal tutor routes visual grounding before authoring", () => {
  const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
  const quality = readFileSync(join(skillDir, "references", "quality-core.md"), "utf8");
  const lessonAuthoring = readFileSync(join(skillDir, "references", "lesson-authoring.md"), "utf8");
  const visualPreflight =
    "During preflight, identify whether the intended learning outcome requires learners to recognize, compare, or diagnose something from its real-world appearance.";

  assert.doesNotMatch(skill, /rich lessons rich lessons/);
  assert.match(skill, new RegExp(escapeRegExp(visualPreflight)));
  assert.match(skill, /representative visual evidence as part of the instructional requirement rather than optional enrichment/);
  assert.match(skill, /Detailed choices about image type, sourcing, generation, placement, and scaffolding remain authoring decisions/);
  assert.match(skill, /Do not replace required appearance evidence with prose, diagrams, or schematic illustrations solely because they are easier to author or compile/);
  assert.ok(skill.indexOf(visualPreflight) < skill.indexOf("## Voice samples"));
  assert.ok(skill.indexOf(visualPreflight) < skill.indexOf("## Authoring workflow"));
  assert.match(skill, /Read only what the task needs/);
  assert.doesNotMatch(skill, /Read `references\/quality-core\.md` and `references\/authoring-quickstart\.md` and `references\/lesson-authoring\.md`/);
  assert.match(
    quality,
    /A lesson that claims to teach recognition or diagnosis from appearance is incomplete unless learners inspect representative visual evidence/
  );
  assert.match(lessonAuthoring, /Use `image\(\.\.\.\)` for durable raster artifacts/);
  assert.match(lessonAuthoring, /An image block is not automatically visual grounding/);
  assert.match(lessonAuthoring, /A schematic drawing saved as PNG or SVG is still a diagram and usually does not satisfy this need/);
  assert.match(lessonAuthoring, /not as substitutes for the appearance the learner must inspect/);
  assert.match(lessonAuthoring, /use them to create photo-like teaching exemplars rather than schematic stand-ins when realism affects the teaching claim/);
  assert.match(lessonAuthoring, /The agent may generate images/);
  assert.match(lessonAuthoring, /Project-bound images belong under `textbooks\/<textbook-id>\/assets\/`/);
  assert.match(lessonAuthoring, /add the lightest inspection scaffold/);
  assert.doesNotMatch(`${skill}\n${quality}\n${lessonAuthoring}`, /at least (one|1)[^.\n]*(image|visual)/i);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
