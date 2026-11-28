# Contributing

Issues and pull requests are welcome.

## Set up the repository

Personal Tutor requires Node.js 20.19.x, or Node.js 22.12.0 or newer. Node.js 21.x is not supported.

```bash
npm install
npm test
npm run build:skill:check
```

Run the browser tests when you change the Tutor Kit interface:

```bash
npm run test:browser
```

Keep changes focused. Include tests when behavior changes.

For changes to optional resource selection, use the behavioral cases in [tests/evals/additional-resources.md](tests/evals/additional-resources.md), supplemented by a live-web trial. Record what was actually attempted and distinguish required verification rules from advisory count and website-variety preferences. See the [initial evaluation results](tests/evals/additional-resources-results.md) for scope and limitations. `npm test` does not execute these model evaluations or establish recommendation quality.
