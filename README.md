# Personal Tutor

Build a course around what you want to learn — and keep building on it over time.

Personal Tutor is a skill for coding agents that turns your goals and existing knowledge into a structured, interactive course. Chapters, exercises, and progress stay together locally, ready when you return.

## Why Personal Tutor?

AI can explain almost anything, but a chat thread is a difficult place to build lasting understanding. Explanations get buried, practice is disconnected, and each new session can feel like starting over.

Personal Tutor gives that learning a place to live.

## What makes it different

### A course, not a response

Courses are organized into structured chapters with clear explanations, concrete examples, and a progression shaped around your goals.

### Learn by doing

Lessons pair explanations with visuals, interactive simulations, quizzes, and runnable coding exercises with answer checking — not just more text to read.

### Progress that carries forward

Courses and learning history stay on your machine. Review builds on what you have already covered, and future lessons pick up where you left off.

## See it in action

Here are three courses generated from simple prompts.

![A local Personal Tutor library containing courses on ceramic glazes, concert ticketing, and an Express codebase](./assets/course-library.png)

*Technical and nontechnical courses live side by side in one local library, with progress saved for each.*

### Learn an unfamiliar codebase

> **Prompt:** Teach me how the Node Express Realworld Example App handles publishing a new article. I'm comfortable with TypeScript, but I'm new to Express and Prisma.

![A sequence diagram tracing an article publishing request through Express, authentication middleware, Prisma, and PostgreSQL](./assets/codebase-request-flow.png)

*Follow a real request through the codebase, connecting routes, middleware, application logic, and database calls.*

### Explore system design through simulation

> **Prompt:** Teach me how to design a concert ticketing system for a major on-sale. I understand APIs and databases, but I’m not sure how to handle the traffic spike, prevent seats from being double-booked, or manage the checkout flow.

![An interactive simulation for exploring traffic and inventory pressure during a major concert ticket sale](./assets/concert-pressure-lab.png)

*Adjust arrival rate, admission rate, and checkout time to see how design decisions affect queue growth and active seat holds.*

### Practice with visual examples

> **Prompt:** Teach me how ceramic glazes work. I’m a beginner potter using cone 6 clay in an electric kiln. I want to understand glaze ingredients, common defects, and how to start testing my own recipes safely.

![A visual ceramic glaze lesson with examples of common defects and an interactive matching exercise](./assets/ceramic-defects.png)

*Compare glaze defects, identify the visual clues behind them, and check your reasoning inside the lesson.*

## Quick start

Personal Tutor requires Node.js 20.19 or newer.

### 1. Install

Install for Codex, the default:

```bash
npx personal-tutor@latest
```

Install for Claude Code:

```bash
npx personal-tutor@latest --agent claude-code
```

Install for both:

```bash
npx personal-tutor@latest --agent all
```

Run `npx personal-tutor@latest --help` for other install options.

### 2. Ask your coding agent to build a course

Invoke the skill with `$personal-tutor` in Codex or `/personal-tutor` in Claude Code, then describe what you want to learn:

> Teach me 1D dynamic programming for technical interviews. I understand recursion, but I struggle to recognize when to use DP.

Personal Tutor may ask a few questions about your goals and current knowledge before creating the first chapter.

### 3. Open the course

```bash
npx personal-tutor@latest dev
```

Claude Code users can run `npx personal-tutor@latest dev --agent claude-code`.

Courses and learning history are stored in `~/.personal-tutor`.

> [!WARNING]
> Tutor Kit can run course code and browser components, so use it only with courses and workspaces you trust.

### 4. Continue later

Return to your coding agent and ask:

> Continue my dynamic programming course.

Personal Tutor will use your existing course and saved progress instead of starting over.

## Development

```bash
npm install
npm test
npm run build:skill:check
```

## License

Personal Tutor is licensed under the Apache License 2.0.
