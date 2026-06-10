# UI Server

Use `tutor dev` to start the local Tutor UI.

## Behavior

- Loads `tutor.config.ts`.
- Discovers `textbooks/<textbook>/textbook.ts` and ordered chapter arrays.
- Serves a textbook dashboard and chapter reader.
- Renders semantic blocks.
- Runs `codingProblem` actions in temporary local project directories.
- Persists current quiz selections and submitted attempt history under `tutor-data/quiz-state/`.
- Appends lightweight `quiz_checked` events to `tutor-data/events.jsonl`.
- Reads coding feedback from `tutor-data/feedback/...` when present.
- Appends learner activity to `tutor-data/events.jsonl`.

## API

```txt
GET  /api/textbooks
GET  /api/textbooks/:id
GET  /api/textbooks/:textbookId/chapters/:chapterId
POST /api/coding/run
GET  /api/coding/draft
PUT  /api/coding/draft
GET  /api/coding/feedback
POST /api/events
```

`POST /api/events` accepts JSON and appends `createdAt` before writing the event.
Coding APIs are for trusted local learner code, not adversarial sandboxing.

## Agent Rule

Do not edit `events.jsonl` to fake progress. Let the UI write learner events. Only inspect events when summarizing progress or choosing review material.
