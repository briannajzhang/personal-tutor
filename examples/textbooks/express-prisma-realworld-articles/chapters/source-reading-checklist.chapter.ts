import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "source-reading-checklist",
  title: "Source-Reading Checklist",
  description: "Practice a reusable checklist for reading Express and Prisma routes by tracing inputs, service category, query shape, mapping, and tests.",
  role: "cumulative-checkpoint",
  sections: [
    section({
      id: "why-checklist",
      title: "A Route Is a Trail, Not a File",
      role: "review",
      blocks: [
        p({
          id: "outcome",
          body: "After this wrap-up, you can use a repeatable checklist to read a new Express + Prisma feature: find the HTTP entry, classify auth, trace service rules, translate Prisma shape, inspect response mapping, and judge test risk."
        }),
        p({
          id: "trail-intro",
          body: "When you first opened this codebase, publishing an article looked like a single feature. By now you have seen that a feature is a trail across files: app boot, route mounting, middleware, controller inputs, service decisions, Prisma operations, mappers, and tests."
        }),
        callout({
          id: "final-prediction",
          tone: "note",
          title: "Pause and predict",
          body: "If you had to understand a route you have never seen before, which file would you open first: the Prisma schema, the controller, the service, or the test?"
        }),
        p({
          id: "controller-first",
          body: "A good default is the controller. The controller tells you the public action: method, path, auth middleware, route params, body fields, query params, service function, status code, and response wrapper. The schema and service explain how that action works after you know what action you are tracing."
        }),
        diagram({
          id: "reading-trail",
          title: "Source-Reading Trail",
          body: `flowchart LR
  Route["Controller route"] --> Auth["Auth middleware"]
  Auth --> Inputs["Params, body, query, user id"]
  Inputs --> Service["Service function"]
  Service --> Prisma["Prisma where/data/include"]
  Prisma --> Mapper["Mapper or manual response"]
  Mapper --> Tests["Tests and gaps"]`
        })
      ],
      subsections: [
        subsection({
          id: "use-the-checklist",
          title: "How to Use It",
          blocks: [
            p({
              id: "checklist-use",
              body: "Do not read every line with equal attention. Make one pass to locate the trail, then a second pass to explain the mechanism, then a third pass to judge risk. The checklist below is built for those passes."
            })
          ]
        })
      ]
    }),
    section({
      id: "checklist",
      title: "The Checklist",
      role: "review",
      blocks: [
        p({
          id: "checklist-intro",
          body: "Use this checklist whenever you meet a new feature in this repository or a similar Express + Prisma app. Each question points to a kind of source evidence."
        }),
        codeBlock({
          id: "checklist-code",
          language: "text",
          code: `1. HTTP entry
   - Which controller registers the route?
   - Is the public path complete, or does another router add a prefix?
   - Which HTTP method and status code does the handler use?

2. Auth and viewer identity
   - Is auth absent, optional, or required?
   - Does the service receive req.auth.user.id?
   - Is the route public with personalization, or user-owned mutation?

3. Request inputs
   - Which values come from params, query, body, and JWT?
   - Are numbers converted explicitly?
   - Are missing or blank fields validated before Prisma?

4. Service rule
   - Is this create, read, update, delete, relation connect, or relation disconnect?
   - Is there an ownership check before a destructive or sensitive action?
   - Are not-found and wrong-owner cases intentionally distinct or merged?

5. Prisma shape
   - Which part is where filtering?
   - Which part is data mutation?
   - Which relations are connect, disconnect, connectOrCreate, some, include, or select?

6. Response shape
   - Is the response raw Prisma data, mapper output, or manually shaped?
   - Which API-only fields are computed from relations?
   - Are private fields such as password omitted?

7. Tests and risk
   - Is there a service test, mapper test, controller/e2e test, or only a TODO?
   - Does the test mock Prisma or use a real database?
   - What behavior could break without a test noticing?`
        }),
        p({
          id: "checklist-readout",
          body: "The checklist is not a ritual. It is a way to keep your attention on behavior. Each answer should name a source fact, not a guess."
        }),
        callout({
          id: "useful-shortcut",
          tone: "key-idea",
          title: "Most useful shortcut",
          body: "Classify the service verb early. A read path wants `where`, `include` or `select`, ordering, pagination, and mapping. A write path wants validation, ownership or identity, `data`, relation changes, and response shape."
        })
      ]
    }),
    section({
      id: "pattern-table",
      title: "Recover the Course in One Table",
      role: "review",
      blocks: [
        p({
          id: "table-intro",
          body: "Here is the compressed map of the patterns you learned. Read it left to right: route shape suggests service category; service category predicts Prisma shape."
        }),
        codeBlock({
          id: "course-patterns",
          language: "text",
          code: `Feature                    Service category             Prisma clue
POST /articles             create owned row              article.create + author.connect + tag connectOrCreate
PUT /articles/:slug        owned update                  find owner, maybe new slug, update scalars/tags
GET /articles              personalized list read         AND filters, relation some, count + findMany
GET /articles/feed         relationship-based list        author.followedBy.some({ id })
POST /favorite             relation toggle on             article.update + favoritedBy.connect
DELETE /favorite           relation toggle off            article.update + favoritedBy.disconnect
POST /comments             child-row create               comment.create + article.connect + author.connect
DELETE /comments/:id       owned delete                   findFirst by comment id + author id, then delete
POST /profiles/:u/follow   self-relation toggle on        user.update target + followedBy.connect viewer
GET /tags                  relation-filtered read         tag.findMany + articles.some.author.OR
POST /users/login          identity proof                 user.findUnique + bcrypt.compare + token`
        }),
        p({
          id: "table-readout",
          body: "The table is deliberately compact. If you forget a detail later, use the category to reconstruct it. For example, a relation toggle almost always needs the target row, the current user id, `connect` or `disconnect`, and relation data for response flags."
        })
      ]
    }),
    section({
      id: "capstone-drill",
      title: "Capstone Drill: Read a New Route",
      role: "practice",
      blocks: [
        p({
          id: "capstone-intro",
          body: "Now practice with a route from the course, but treat it as if you were seeing it fresh. Your job is to produce a short source-reading note, not to memorize the implementation."
        }),
        codeBlock({
          id: "capstone-route",
          language: "ts",
          code: `router.delete(
  '/articles/:slug/favorite',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await unfavoriteArticle(req.params.slug, req.auth?.user?.id);
      res.json({ article });
    } catch (error) {
      next(error);
    }
  },
);`
        }),
        list({
          id: "capstone-prompts",
          items: [
            "Classify the service category.",
            "Name every input and where it comes from.",
            "Predict the Prisma `where` and relation mutation before looking at the service.",
            "Predict why the response still needs article, author, tags, favorited state, and favorite count.",
            "Name one test that would give confidence and one behavior a service-only test would not prove."
          ]
        }),
        p({
          id: "capstone-answer",
          body: "A strong note would say: this is an authenticated relation-toggle-off route. `slug` comes from params and viewer id comes from JWT. The service should update the article found by slug and disconnect the viewer from `favoritedBy`. It still needs response relation data because the API returns an article object with computed `favorited`, `favoritesCount`, tag names, and author profile. A service test can mock `prisma.article.update` and check the mapped output; an HTTP-level test would be needed to prove route mounting, auth rejection, and response wrapping."
        }),
        callout({
          id: "debugging-transfer",
          tone: "note",
          title: "Transfer move",
          body: "When a future route feels unfamiliar, ask which row changes and which user the route trusts. That usually reveals the service shape before the details do."
        })
      ]
    }),
    section({
      id: "risk-review",
      title: "Risk Review",
      role: "practice",
      blocks: [
        p({
          id: "risk-intro",
          body: "A senior source reader does one more pass: what could be surprising, under-tested, or easy to break? Use these known examples from the RealWorld app as calibration."
        }),
        list({
          id: "risk-examples",
          items: [
            "`DELETE /articles/:slug/comments/:id` includes `:slug`, but the delete service receives only comment id and user id.",
            "`addComment` validates body but defers missing-article behavior to Prisma through `article?.id`.",
            "`updateArticle` conditionally updates scalar fields, but tag handling clears existing tags before connecting the new list.",
            "`getFeed` ignores tag/author/favorited query params even though `GET /articles` supports filters.",
            "`getTags` has only a TODO service test, so its nested relation query is less protected.",
            "The e2e root test expectation is stale relative to the current `main.ts` root response."
          ]
        }),
        p({
          id: "risk-readout",
          body: "These are not reasons to distrust the codebase. They are reasons to read it concretely. When source, route shape, tests, and expectations disagree, slow down and name the exact boundary where the disagreement appears."
        })
      ]
    }),
    section({
      id: "final-assessment",
      title: "Final Assessment",
      role: "assessment",
      blocks: [
        p({
          id: "assessment-intro",
          body: "Use this final practice test to check whether the checklist has become usable. The questions mix routing, auth, Prisma, mapping, errors, and tests."
        }),
        balancedQuiz({
          id: "source-reading-final-practice-test",
          title: "Source-Reading Final Practice Test",
          mode: "practice-test",
          questions: [
            {
              kind: "multiple-choice",
              id: "first-file",
              prompt: "You are assigned an unfamiliar endpoint in an Express + Prisma app. Which file is usually the best first stop?",
              choices: [
                { id: "a", body: "The controller that registers the route." },
                { id: "b", body: "The deepest Prisma migration." },
                { id: "c", body: "The package lockfile." },
                { id: "d", body: "The generated Prisma client." }
              ],
              answer: "a",
              explanation: "The controller gives you the method, path, auth middleware, inputs, service function, status code, and response wrapper.",
              tags: ["source-reading", "express-routing"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "auth-classification",
              prompt: "`GET /profiles/:username` can be called anonymously, but returns viewer-specific `following` when a token is present. Which auth classification fits?",
              choices: [
                { id: "a", body: "`auth.optional`." },
                { id: "b", body: "`auth.required`." },
                { id: "c", body: "No auth middleware and no viewer id." },
                { id: "d", body: "Password comparison in the controller." }
              ],
              answer: "a",
              explanation: "Optional auth allows public reads while still giving the service a current user id when a valid token is provided.",
              tags: ["auth", "profiles"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "write-category",
              prompt: "`DELETE /articles/:slug/favorite` updates an article by slug and removes the viewer from `favoritedBy`. What service category is this?",
              choices: [
                { id: "a", body: "Relation toggle off." },
                { id: "b", body: "Anonymous list read." },
                { id: "c", body: "Owned scalar update." },
                { id: "d", body: "Identity proof." }
              ],
              answer: "a",
              explanation: "The row is not deleted. The many-to-many relation between the article and current user is disconnected.",
              tags: ["favorites", "prisma-relations"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "where-vs-include",
              prompt: "In a Prisma service, what is the best distinction between `where` and `include`?",
              choices: [
                { id: "a", body: "`where` decides which rows qualify; `include` loads related data needed after the row is chosen." },
                { id: "b", body: "`include` decides which rows qualify; `where` formats the JSON response." },
                { id: "c", body: "They are aliases in Prisma." },
                { id: "d", body: "`where` is only for writes and `include` is only for deletes." }
              ],
              answer: "a",
              explanation: "This distinction appears throughout the course: filters live in `where`; response-supporting relations such as author, tags, favorites, and counts are loaded with `include` or `select`.",
              tags: ["prisma-querying", "mapping"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "child-create",
              prompt: "A new `POST /articles/:slug/comments`-style feature creates a child row under an article for the current user. What Prisma shape should you expect?",
              choices: [
                { id: "a", body: "A create with `article.connect` and user/author/reporter `connect`." },
                { id: "b", body: "A findMany with only `take: 10`." },
                { id: "c", body: "A JWT signed with the article body." },
                { id: "d", body: "A tag `disconnect` on every article." }
              ],
              answer: "a",
              explanation: "Child rows with required parents need relation connects for the parent article and the authenticated user.",
              tags: ["comments", "prisma-relations"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "feed-filter",
              prompt: "Which Prisma predicate is the key to the feed route?",
              choices: [
                { id: "a", body: "`author.followedBy.some({ id: viewerId })`." },
                { id: "b", body: "`tagList.some({ name: 'feed' })`." },
                { id: "c", body: "`favoritedBy.disconnect({ id: viewerId })`." },
                { id: "d", body: "`password: bcrypt.compare(...)`." }
              ],
              answer: "a",
              explanation: "Feed returns articles by authors the viewer follows, so it reads the same relation changed by profile follow/unfollow.",
              tags: ["feed", "profiles", "prisma-querying"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "mapper-computed-field",
              prompt: "An API response includes `favorited: true`, but the schema has no `favorited` boolean on `Article`. What should you inspect?",
              choices: [
                { id: "a", body: "The mapper or manual response shaping that computes API-only fields from relations." },
                { id: "b", body: "Only the route path string." },
                { id: "c", body: "Only the CORS middleware." },
                { id: "d", body: "Only `package.json` scripts." }
              ],
              answer: "a",
              explanation: "`favorited` is computed from whether the current user appears in `favoritedBy`; similar response-only fields include `following` and `favoritesCount`.",
              tags: ["mapping", "favorites"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "error-handler",
              prompt: "A service throws `HttpException(422, ...)`. Why can the service avoid calling `res.status(422)` itself?",
              choices: [
                { id: "a", body: "The controller forwards the error with `next(error)`, and app-level error middleware turns it into an HTTP response." },
                { id: "b", body: "Prisma automatically sends Express responses." },
                { id: "c", body: "JWT tokens store the status code." },
                { id: "d", body: "Body parser catches all validation errors before services run." }
              ],
              answer: "a",
              explanation: "Services express local failure; the Express app boundary formats that failure as HTTP.",
              tags: ["express-errors", "service-boundary"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "test-boundary",
              prompt: "A Jest test imports `favoriteArticle` directly and mocks `prisma.article.update`. What does it not prove?",
              choices: [
                { id: "a", body: "That `DELETE /api/articles/:slug/favorite` is mounted correctly and rejects missing auth at the HTTP layer." },
                { id: "b", body: "That the service can be called as a TypeScript function." },
                { id: "c", body: "That mocked Prisma can resolve a value." },
                { id: "d", body: "That the assertion can inspect the returned object." }
              ],
              answer: "a",
              explanation: "Direct service tests bypass route mounting, middleware, HTTP status codes, and response wrapping.",
              tags: ["testing", "express-routing"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "slug-boundary",
              prompt: "`DELETE /articles/:slug/comments/:id` includes a slug in the route, but the service receives only comment id and user id. What is the best reading?",
              choices: [
                { id: "a", body: "The current service does not use the slug to constrain deletion." },
                { id: "b", body: "Express secretly appends the slug to the Prisma query." },
                { id: "c", body: "The slug must be used inside the database schema." },
                { id: "d", body: "The delete route cannot run." }
              ],
              answer: "a",
              explanation: "Source-reading means following actual arguments across the boundary. If the slug is not passed into `deleteComment`, it cannot affect that service's lookup.",
              tags: ["comments", "service-boundary"],
              difficulty: "hard"
            },
            {
              kind: "multiple-choice",
              id: "tag-risk",
              prompt: "You are changing `getTags`. The only tag service test is `test.todo('should return a list of strings')`. What is the practical risk?",
              choices: [
                { id: "a", body: "The nested relation query, ordering, and string mapping could regress without a current test failing." },
                { id: "b", body: "Jest will automatically generate the missing test." },
                { id: "c", body: "The endpoint cannot compile because TODO tests are syntax errors." },
                { id: "d", body: "Prisma will refuse to run every tag query." }
              ],
              answer: "a",
              explanation: "TODO tests record intention but provide no executable protection.",
              tags: ["testing", "tags"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "route-prefix-transfer",
              prompt: "A controller registers `router.post('/reports', ...)`, and the outer router mounts that controller under `/api/admin`. What public path should you test?",
              choices: [
                { id: "a", body: "`POST /api/admin/reports`." },
                { id: "b", body: "`POST /reports/api/admin`." },
                { id: "c", body: "`POST /api/reports/admin/reports`." },
                { id: "d", body: "`POST /router.post/reports`." }
              ],
              answer: "a",
              explanation: "Express composes mount paths with controller paths in order.",
              tags: ["express-routing"],
              difficulty: "easy"
            }
          ]
        })
      ]
    })
  ]
});
