# Course: Publishing Articles in the RealWorld Express API

## Learner

Goal: understand how `Desktop/node-express-realworld-example-app` handles publishing a new article.
Background: comfortable with TypeScript; new to Express and Prisma.
Pace and practice: focused source walkthrough with small prediction checks and review questions.

## Outcome

After this course, the learner can trace article create, update, list, feed, favorite, comment, authentication, profile-follow, tag, route-composition, app boot, error-handling, and service-test paths through Express routing, JWT authentication, service rules, Prisma filters and relation writes, response mapping, and predict the service shape and risk profile for a similar new feature.

## Course map

- [x] Publishing an Article Through Express and Prisma.
- [x] Updating an article and why ownership checks belong in the service.
- [x] Reading article lists with Prisma filters, includes, and mappers.
- [x] Comparing `/articles` and `/articles/feed` as two read models.
- [x] Favoriting and unfavoriting articles as many-to-many relation updates.
- [x] Adding and deleting comments with article/user relations and ownership checks.
- [x] Cumulative checkpoint: predict the service layer for a new article feature.
- [x] Optional extension: trace authentication and profile service patterns outside articles.
- [x] Optional extension: trace tags and app-level route composition.
- [x] Optional extension: read the app boot path, error middleware, and service tests as maintainability signals.
- [x] Final wrap-up: build a source-reading checklist for future Express + Prisma codebases.

## Active publication

Published now: Chapter 11, "Source-Reading Checklist."
Outcome: use a reusable checklist to read new Express + Prisma routes by tracing HTTP entry, auth, request inputs, service category, Prisma shape, response mapping, tests, and risk.
Ideas worth developing: a route is a trail across files; classifying the service verb predicts most of the Prisma shape; tests must be read by the boundary they cross.
Possible worked examples: summarize all course patterns in one table; analyze `DELETE /articles/:slug/favorite` as a capstone route; identify known risk examples from comments, tags, feed, and stale e2e tests.
Likely learner difficulty: trying to memorize individual functions instead of classifying patterns, or treating mapper-computed API fields as database columns.
Practice and feedback opportunities: capstone source-reading note and final cumulative practice-test across routing, auth, Prisma relations, mapping, errors, and tests.
