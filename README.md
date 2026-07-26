# Personal Tutor

Pick something you want to learn. The Personal Tutor skill builds a course
around your goals and what you already know. It saves your progress, so the next
lesson can pick up where you left off.

What you get:

- Lessons include clear explanations and concrete examples.
- You can explore ideas through visuals and interactive simulations.
- Quizzes and review build on your past work.
- You can run coding exercises and check your answers.
- Your courses and progress stay on your local machine.

## Requirements

Personal Tutor requires Node.js 20.19 or newer.

## Install

Install the skill:

```bash
npx personal-tutor@latest
```

Personal Tutor stores textbooks and learning history in `~/.personal-tutor`.
Tutor Kit can run lesson code and browser components, so use it only with
textbooks and workspaces you trust.

Run `npx personal-tutor@latest --help` for other install options.

## Development

```bash
npm install
npm test
npm run build:skill:check
```

## License

Personal Tutor is licensed under the Apache License 2.0.
