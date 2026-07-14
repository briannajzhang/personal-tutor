# Personal Tutor

Personal Tutor is a skill source repo for turning coding agents into long-lived,
adaptive tutors.

The first package in this repo is `personal-tutor`: a Claude/Codex-compatible
skill plus **Tutor Kit**, a TypeScript SDK/CLI/UI for authoring textbooks as code.
Tutor Kit is intentionally bundled as skill runtime assets rather than installed
as a separate global tool, so the agent follows one skill workflow and gets the
matching SDK, CLI, and local UI.

## Install The Skill

After the package is published to npm, install the skill into Codex with:

```bash
npx personal-tutor@latest
```

By default this copies the skill to:

```txt
${CODEX_HOME:-~/.codex}/skills/personal-tutor
```

Useful options:

```bash
npx personal-tutor@latest --dry-run
npx personal-tutor@latest --force
npx personal-tutor@latest --skills-dir ~/.codex/skills
```

Use `--force` to replace an existing installed copy. Without `--force`, the
installer refuses to overwrite local changes.

The installer also installs and verifies the bundled Tutor Kit runtime
dependencies from the shipped lockfile, so the skill works without a separate
setup step and avoids version skew. Use `--skip-deps` only when you intentionally
want to copy the skill without preparing Tutor Kit:

```bash
npx personal-tutor@latest --skip-deps
```

From a local checkout, test the same installer with:

```bash
npm exec --package file:. -- personal-tutor --dry-run
```

## Repo Shape

```txt
bin/personal-tutor.js       npx-friendly skill installer
skills/personal-tutor/      installable skill
packages/tutor-kit/         TypeScript SDK, CLI, compile checks, dev server
tests/                      scaffold and validation tests
```

Learner memory is not stored in this repo by default. The skill treats the
user's current folder as the learner workspace and creates visible files there.

Tutor Kit keeps the model-facing workflow compact:

```bash
tutor brief
tutor progress --textbook <id>
tutor doctor --textbook <id> --record
```

`brief` summarizes the workspace, `progress` compacts learner activity, and the
recorded doctor command writes verification evidence. New textbooks keep the
learner profile, course map, and active publication contract in one `course.md`
file. The full TypeScript block API remains available for advanced lessons.
Trusted workspaces can also mount custom frontend modules directly in the lesson
page through Tutor Kit's Vite pipeline.

## Development

```bash
npm install
npm run build
npm test
```

Refresh the bundled Tutor Kit asset inside the skill:

```bash
npm run build:skill
```

Check that the checked-in bundled asset is fresh:

```bash
npm run build:skill:check
```

Check the npm package contents before publishing:

```bash
npm pack --dry-run
```
