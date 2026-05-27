# UI Server

Use `tutor dev` to start the local Tutor UI.

## Behavior

- Loads `tutor.config.ts`.
- Discovers `textbooks/<textbook>/textbook.ts` and ordered chapter arrays.
- Serves a textbook dashboard and chapter reader.
- Renders semantic blocks.
- Appends learner activity to `tutor-data/events.jsonl`.

## API

```txt
GET  /api/textbooks
GET  /api/textbooks/:id
GET  /api/textbooks/:textbookId/chapters/:chapterId
POST /api/events
```

`POST /api/events` accepts JSON and appends `createdAt` before writing the event.

## Agent Rule

Do not edit `events.jsonl` to fake progress. Let the UI write learner events. Only inspect events when summarizing progress or choosing review material.
