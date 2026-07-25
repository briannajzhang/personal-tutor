import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

test("skill wrapper uses one central learner library by default", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "personal-tutor-home-"));
  const wrapper = join(skillDir, "scripts", "tutor-kit.mjs");
  const env = { ...process.env, HOME: homeDir };
  delete env.PERSONAL_TUTOR_HOME;
  const output = execFileSync(process.execPath, [wrapper, "brief", "--json"], {
    encoding: "utf8",
    env
  });

  assert.equal(JSON.parse(output).workspace, join(homeDir, ".personal-tutor"));
});

test("skill wrapper stores textbooks in a configured central learner library", () => {
  const libraryDir = mkdtempSync(join(tmpdir(), "personal-tutor-library-"));
  const workingDir = mkdtempSync(join(tmpdir(), "personal-tutor-project-"));
  const wrapper = join(skillDir, "scripts", "tutor-kit.mjs");
  const env = { ...process.env, PERSONAL_TUTOR_HOME: libraryDir };

  execFileSync(process.execPath, [wrapper, "init"], {
    encoding: "utf8",
    cwd: workingDir,
    env
  });
  execFileSync(process.execPath, [wrapper, "add", "textbook", "sql", "SQL Foundations"], {
    encoding: "utf8",
    cwd: workingDir,
    env
  });

  assert.equal(existsSync(join(libraryDir, "textbooks", "sql", "textbook.ts")), true);
  assert.equal(existsSync(join(workingDir, "textbooks")), false);
});

test("explicit cwd overrides the central learner library", () => {
  const libraryDir = mkdtempSync(join(tmpdir(), "personal-tutor-library-"));
  const separateDir = mkdtempSync(join(tmpdir(), "personal-tutor-workspace-"));
  const wrapper = join(skillDir, "scripts", "tutor-kit.mjs");
  const output = execFileSync(process.execPath, [wrapper, "--cwd", separateDir, "brief", "--json"], {
    encoding: "utf8",
    env: { ...process.env, PERSONAL_TUTOR_HOME: libraryDir }
  });

  assert.equal(JSON.parse(output).workspace, separateDir);
});

test("bundled Tutor Kit matches the package build", () => {
  const output = execFileSync(process.execPath, [join(root, "scripts", "build-skill.mjs"), "--check"], {
    encoding: "utf8"
  });

  assert.match(output, /up to date/);
});

test("Tutor Kit runtime lockfile covers every package dependency", () => {
  const packageDir = join(root, "packages", "tutor-kit");
  const packageJson = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8")) as {
    dependencies: Record<string, string>;
  };
  const packageLock = JSON.parse(readFileSync(join(packageDir, "package-lock.json"), "utf8")) as {
    packages: Record<string, { dependencies?: Record<string, string> }>;
  };

  assert.deepEqual(packageLock.packages[""]?.dependencies, packageJson.dependencies);
  for (const dependency of Object.keys(packageJson.dependencies)) {
    assert.ok(packageLock.packages[`node_modules/${dependency}`], `package-lock.json is missing ${dependency}`);
  }
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

test("personal tutor frames custom blocks by representation fit", () => {
  const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
  const quality = readFileSync(join(skillDir, "references", "quality-core.md"), "utf8");
  const lessonAuthoring = readFileSync(join(skillDir, "references", "lesson-authoring.md"), "utf8");
  const quickstart = readFileSync(join(skillDir, "references", "authoring-quickstart.md"), "utf8");
  const customGuidance = [skill, quality, lessonAuthoring, quickstart].join("\n");

  assert.match(skill, /## Representation fit/);
  assert.match(skill, /Choose the teaching medium based on the move the learner needs to understand/);
  assert.match(
    skill,
    /When changing a variable, stepping through a process, manipulating state, revealing a consequence, or comparing live cases is central to understanding the lesson, read `references\/lesson-authoring\.md` before settling on a representation, even if the user did not request an interactive component/
  );
  assert.match(skill, /when purpose-built interaction, animation, simulation, or learner-controlled state would teach it materially better/);
  assert.match(skill, /even if the user did not request an interactive component/);

  assert.match(quality, /a component lets learners vary, step through, manipulate, simulate, or compare live state/);
  assert.match(quality, /makes an important relationship more inspectable/);

  assert.match(lessonAuthoring, /## Custom Interactions/);
  assert.match(lessonAuthoring, /A component earns its place when learner action changes visible state/);
  assert.match(lessonAuthoring, /narrow it to the smallest faithful interaction/);
  assert.match(lessonAuthoring, /rather than automatically replacing it with prose or a static diagram/);
  assert.match(
    lessonAuthoring,
    /When a physical or practical lesson asks learners to connect visible outcomes to controllable variables, images may ground recognition while a component can make the cause-and-effect relationship inspectable/
  );

  assert.match(quickstart, /Custom blocks are authored as `component\(\.\.\.\)`/);
  assert.match(quickstart, /materially improves the teaching move/);

  assert.doesNotMatch(customGuidance, /unusual interaction/);
  assert.doesNotMatch(customGuidance, /cannot be expressed clearly with built[- ]in blocks/);
  assert.doesNotMatch(customGuidance, /Prefer built[- ]in blocks before creating a component/);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
