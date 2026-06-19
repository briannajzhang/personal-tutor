import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const skillDir = join(process.cwd(), "skills", "personal-tutor");
const referencesDir = join(skillDir, "references");
const assetDir = join(skillDir, "assets", "tutor-kit");
const corpusDir = join(skillDir, "assets", "karpathy-corpus");

const expectedReferences = [
  "karpathy-corpus.md",
  "karpathy-source-index.md",
  "karpathy-teaching-taste.md",
  "lesson-authoring.md",
  "lesson-generation.md",
  "practice-and-assessment.md",
  "review-and-verification.md",
  "sources.md",
  "tutor-kit-api.md"
].sort();

test("skill folder has UI metadata, wrapper script, and no macOS packaging artifacts", () => {
  assert.ok(existsSync(join(skillDir, "agents", "openai.yaml")));
  assert.ok(existsSync(join(skillDir, "scripts", "tutor-kit.mjs")));
  assert.deepEqual(readdirSync(skillDir).filter((name) => name === ".DS_Store"), []);
});

test("SKILL.md frontmatter stays within the supported YAML subset", () => {
  const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter, "SKILL.md should start with YAML frontmatter");

  const fields = new Map<string, string>();
  for (const line of frontmatter[1].split("\n")) {
    const match = line.match(/^([a-z_]+): (.+)$/);
    assert.ok(match, `unsupported frontmatter line: ${line}`);
    fields.set(match[1], match[2]);
  }

  assert.equal(fields.get("name"), "personal-tutor");
  const description = fields.get("description") ?? "";
  assert.ok(description.length > 0);
  assert.doesNotMatch(description, /:\s/, "plain YAML description must not contain unquoted colon-space");
});

test("bundled Tutor Kit asset exposes the documented CLI surface", () => {
  assert.ok(existsSync(join(assetDir, "package-lock.json")));
  assert.ok(existsSync(join(assetDir, "dist", "compile", "verify-coding.js")));

  const help = execFileSync("node", [join(assetDir, "dist", "cli", "index.js"), "--help"], {
    encoding: "utf8"
  });

  assert.match(help, /add block <p\|heading\|list\|codeBlock\|mathBlock\|callout\|transformation\|quiz\|codingProblem>/);
  assert.match(help, /init \[--starter\]/);
  assert.match(help, /compile \[--textbook textbook-id\]/);
  assert.match(help, /doctor \[--textbook textbook-id\]/);
  assert.match(help, /verify coding-problems \[--textbook textbook-id\]/);
});

test("Tutor Kit wrapper delegates to the bundled CLI", () => {
  const help = execFileSync("node", [join(skillDir, "scripts", "tutor-kit.mjs"), "--help"], {
    encoding: "utf8"
  });

  assert.match(help, /Tutor Kit/);
  assert.match(help, /doctor \[--textbook textbook-id\]/);
});

test("SKILL.md references the consolidated one-level reference set", () => {
  const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
  const actualReferences = readdirSync(referencesDir).filter((name) => name.endsWith(".md")).sort();
  const referenced = [...new Set(skill.match(/references\/[a-z0-9-]+\.md/g) ?? [])]
    .map((path) => path.replace("references/", ""))
    .sort();

  assert.deepEqual(actualReferences, expectedReferences);
  assert.deepEqual(referenced, expectedReferences);
  for (const reference of referenced) {
    assert.ok(existsSync(join(referencesDir, reference)), `missing referenced file ${reference}`);
  }
});

test("long references have contents and do not create nested reference paths", () => {
  for (const reference of expectedReferences) {
    const file = join(referencesDir, reference);
    const contents = readFileSync(file, "utf8");
    const lineCount = contents.split("\n").length;

    if (lineCount > 100) {
      assert.match(contents, /^## Contents$/m, `${reference} should include a contents section`);
    }

    assert.doesNotMatch(contents, /\[[^\]]+\]\([^)]*\.md\)/, `${reference} should not link to nested markdown references`);
  }
});

test("skill references focus on durable lesson authoring rather than live tutoring mode", () => {
  const referenceText = expectedReferences
    .map((reference) => readFileSync(join(referencesDir, reference), "utf8"))
    .join("\n");

  assert.doesNotMatch(referenceText, /live tutoring/i);
  assert.doesNotMatch(referenceText, /chat-only/i);
  assert.doesNotMatch(referenceText, /chat only/i);
});

test("Karpathy corpus manifest ships primary sources, transcripts, and cards", () => {
  const manifestPath = join(corpusDir, "manifest.json");
  assert.ok(existsSync(manifestPath), "Karpathy corpus manifest should exist");

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.updated_at, "2026-06-17");
  assert.ok(Array.isArray(manifest.sources));
  assert.ok(Array.isArray(manifest.cards));
  assert.ok(manifest.sources.length >= 25);
  assert.ok(manifest.cards.length >= 5);
  assert.deepEqual(
    readdirSync(join(corpusDir, "transcripts")).filter((name) => name.endsWith(".jsonl")),
    [],
    "transcripts should ship as plain text, not JSONL"
  );

  const ids = new Set<string>();
  for (const source of manifest.sources) {
    assert.equal(source.provenance, "primary", `${source.id} should be a primary-source entry`);
    assert.match(source.id, /^[a-z0-9-]+$/);
    assert.match(source.url, /^https:\/\//);
    assert.equal(typeof source.license, "string");
    assert.equal(typeof source.fetched_at, "string");
    assert.equal(ids.has(source.id), false, `duplicate source id ${source.id}`);
    ids.add(source.id);

    if (source.kind === "video") {
      assert.equal(source.status, "transcript-fetched");
      assert.match(source.youtube_id, /^[A-Za-z0-9_-]+$/);
      assert.match(source.transcript_file, /^[a-z0-9-]+\.txt$/);
      const transcriptPath = join(corpusDir, "transcripts", source.transcript_file);
      assert.ok(existsSync(transcriptPath), `missing transcript ${source.transcript_file}`);
      const transcript = readFileSync(transcriptPath, "utf8");
      const lines = transcript.split("\n");
      assert.equal(lines[0], `Title: ${source.title}`);
      assert.equal(lines[1], `Source ID: ${source.id}`);
      assert.equal(lines[2], `URL: ${source.url}`);
      assert.equal(lines[3], `Video ID: ${source.youtube_id}`);
      assert.ok(transcript.split(/\s+/).length > 100, `${source.transcript_file} should contain transcript text`);
      assert.doesNotMatch(transcript, /"start_sec"|"duration_sec"|"source_id"|"video_id"/);
    }
  }

  for (const card of manifest.cards) {
    assert.match(card.id, /^[a-z0-9-]+$/);
    assert.match(card.file, /^cards\/[a-z0-9-]+\.md$/);
    assert.ok(existsSync(join(corpusDir, card.file)), `missing card ${card.file}`);
    assert.ok(card.source_ids.length > 0, `${card.id} should cite source ids`);
    for (const sourceId of card.source_ids) {
      assert.ok(ids.has(sourceId), `${card.id} cites unknown source ${sourceId}`);
    }
  }
});

test("skill instructs agents to start the Tutor Kit app after authoring", () => {
  const skill = readFileSync(join(skillDir, "SKILL.md"), "utf8");
  const apiReference = readFileSync(join(referencesDir, "tutor-kit-api.md"), "utf8");

  assert.match(skill, /Start .*Tutor Kit app/i);
  assert.match(skill, /tutor dev/);
  assert.match(skill, /localhost URL|URL/i);
  assert.match(apiReference, /start the local UI/i);
  assert.match(apiReference, /tutor dev --port <port>/);
});

test("OpenAI UI metadata matches the refocused skill", () => {
  const metadata = readFileSync(join(skillDir, "agents", "openai.yaml"), "utf8");

  assert.match(metadata, /display_name: "Personal Tutor"/);
  assert.match(metadata, /short_description: ".*Tutor Kit.*"/);
  assert.match(metadata, /default_prompt: "Use \$personal-tutor /);
  assert.match(metadata, /start the local Tutor Kit app/i);
  assert.doesNotMatch(metadata, /study plan/i);
  assert.doesNotMatch(metadata, /chat/i);
});
