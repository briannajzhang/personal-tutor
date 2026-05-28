# Tutor Kit Workflow

Tutor Kit is the TypeScript SDK, CLI, and local UI used by this skill.

## Commands

```bash
tutor init
tutor --package-spec file:/path/to/tutor-kit init
tutor add textbook <id> [title]
tutor add chapter <textbook-id> <id> [title]
tutor add block <p|heading|list|codeBlock|mathBlock|callout|codingProblem>
tutor list textbooks
tutor inspect textbook <id>
tutor compile
tutor dev
```

Use `--cwd <path>` when operating on a workspace that is not the shell cwd.
Use `--package-spec` during local dogfooding when Tutor Kit is installed from a source checkout instead of npm.

## Workflow

1. Run `tutor init` in the learner workspace if Tutor Kit files are missing.
2. Run `tutor list textbooks` and inspect the closest existing textbook before adding material.
3. Add a textbook with `tutor add textbook <id> [title]` if no existing textbook fits.
4. Add chapter files under `textbooks/<textbook-id>/chapters/`.
5. Import each new chapter in `textbooks/<textbook-id>/textbook.ts` and add it to the ordered `chapters` array.
6. Put content in chapter `sections` and `subsections` using semantic `blocks`.
7. Run `tutor compile`.
8. Fix TypeScript or Tutor Kit validation errors.
9. Run `tutor dev` when the user wants the local UI.

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
