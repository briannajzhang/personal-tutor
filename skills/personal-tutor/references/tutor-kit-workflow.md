# Tutor Kit Workflow

Tutor Kit is the TypeScript SDK, CLI, and local UI used by this skill.

## Command Invocation

Prefer `tutor <command>` when the binary is already available in the learner workspace.

If `tutor` is not on PATH, use the bundled CLI from this skill:

```bash
node <skill-dir>/assets/tutor-kit/dist/cli/index.js <command>
```

Replace `<skill-dir>` with the absolute path to the `personal-tutor` skill folder.

The `npx personal-tutor@latest` installer installs the bundled Tutor Kit runtime dependencies automatically. If the direct `node` command reports missing packages, repair the install with:

```bash
npm install --prefix <skill-dir>/assets/tutor-kit --omit=dev --ignore-scripts --no-audit --fund=false
```

During local Tutor Kit development in this source repo, `npm run tutor -- <command>` is also valid.

## Commands

```bash
tutor init
tutor init --starter
tutor --package-spec file:/path/to/tutor-kit init
tutor add textbook <id> [title]
tutor add chapter <textbook-id> <id> [title]
tutor add block <p|heading|list|codeBlock|mathBlock|callout|transformation|quiz|codingProblem>
tutor list textbooks
tutor inspect textbook <id>
tutor compile
tutor compile --textbook <textbook-id>
tutor doctor
tutor doctor --textbook <textbook-id>
tutor verify coding-problems
tutor verify coding-problems --textbook <textbook-id>
tutor dev
```

Use `--cwd <path>` when operating on a workspace that is not the shell cwd.
`tutor init` is agent-oriented and creates an empty workspace by default. Use `--starter` only for demos, tests, or fixtures.

By default, `tutor init` writes a local `file:` dependency pointing at the Tutor Kit package that provided the CLI. Use `--package-spec` only when overriding that source.

## Workflow

1. Run `tutor init` in the learner workspace if Tutor Kit files are missing.
2. Run `tutor list textbooks` and inspect the closest existing textbook before adding material.
3. Add a textbook with `tutor add textbook <id> [title]` if no existing textbook fits.
4. Add chapter files under `textbooks/<textbook-id>/chapters/`.
5. Import each new chapter in `textbooks/<textbook-id>/textbook.ts` and add it to the ordered `chapters` array.
6. Put content in chapter `sections` and `subsections` using semantic `blocks`.
7. Run `tutor compile` or `tutor doctor`.
8. Fix TypeScript or Tutor Kit validation errors.

   If unrelated incomplete textbooks block full workspace compile, use `tutor compile --textbook <textbook-id>` while repairing the generated textbook. Record that result as targeted compile evidence only. A targeted compile proves the selected textbook is usable in isolation; it does not prove the whole workspace is healthy.

9. When the textbook contains coding problems, run `tutor verify coding-problems --textbook <textbook-id>` and fix any verification issues.

10. Before claiming the workspace is fully healthy, run full `tutor doctor` or `tutor compile` plus coding-problem verification.

11. Run `tutor dev` when the user wants the local UI.

## Workspace Files

```txt
package.json
tutor.config.ts
textbooks/
  <textbook-id>/
    textbook.ts
    chapters/
tutor/
  registry.ts
  blocks/
tutor-data/
  events.jsonl
  drafts/
  feedback/
```

The authored source of truth is `textbooks/<textbook-id>/textbook.ts` plus its chapter modules. Runtime history belongs in `tutor-data/events.jsonl`. Coding drafts and review feedback belong in `tutor-data/drafts/` and `tutor-data/feedback/`.

Set `title` in `tutor.config.ts` to a learner-facing name for the current workspace, such as `MLX Study` or `Linear Algebra`.
