# Personal Tutor

Personal Tutor is a skill source repo for turning coding agents into long-lived,
adaptive tutors.

The first package in this repo is `personal-tutor`: a Claude/Codex-compatible
skill plus **Tutor Kit**, a TypeScript SDK/CLI/UI for authoring textbooks as code.

## Repo Shape

```txt
skills/personal-tutor/      installable skill
packages/tutor-kit/         TypeScript SDK, CLI, compile checks, dev server
examples/learner-workspace/ example workspace authored with Tutor Kit
tests/                      scaffold and validation tests
```

Learner memory is not stored in this repo by default. The skill treats the
user's current folder as the learner workspace and creates visible files there.

## Development

```bash
npm install
npm run build
npm test
```

Try the example workspace:

```bash
npm run tutor -- --cwd examples/learner-workspace compile
npm run tutor -- --cwd examples/learner-workspace dev
```
