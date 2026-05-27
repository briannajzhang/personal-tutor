# Widget Authoring

The MVP widget is `blurb`.

## Blurb

Use for compact teaching material with Markdown and inline LaTeX.

```ts
blurb({
  id: "derivative-intuition",
  title: "Derivative Intuition",
  body: "The derivative measures instantaneous rate of change: $dy/dx$."
});
```

## Extension Pattern

New widgets should follow the built-in shape:

```txt
tutor/widgets/<kind>.tsx
packages/tutor-kit/src/widgets/<kind>/
```

Each widget needs:

- a typed builder or schema
- a renderer
- a registry entry
- compile-time validation
- event names if the widget records learner activity
