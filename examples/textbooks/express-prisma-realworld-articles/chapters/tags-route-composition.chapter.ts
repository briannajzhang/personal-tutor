import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "tags-route-composition",
  title: "Tags and Route Composition",
  description: "Trace GET /api/tags through route mounting and a Prisma tag query filtered through related article authors.",
  role: "instruction",
  sections: [
    section({
      id: "route-prefix",
      title: "A Controller Does Not Own the Whole URL",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can trace `GET /api/tags` from the app entrypoint through Express router composition into the tag service, and explain how the Prisma query returns popular tag names visible to the current viewer."
        }),
        p({
          id: "prefix-intro",
          body: "When you open `tag.controller.ts`, the route says only `'/tags'`. The public API route is still `/api/tags`. Express builds that full path by mounting routers on other routers."
        }),
        callout({
          id: "predict-prefix",
          tone: "note",
          title: "Pause and predict",
          body: "If `main.ts` calls `app.use(routes)`, and `routes.ts` exports `Router().use('/api', api)`, what URL reaches a controller route registered as `router.get('/tags', ...)`?"
        }),
        codeBlock({
          id: "main-code",
          language: "ts",
          code: `// src/main.ts
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ status: 'API is running on /api' });
});`
        }),
        codeBlock({
          id: "routes-code",
          language: "ts",
          code: `// src/app/routes/routes.ts
const api = Router()
  .use(tagsController)
  .use(articlesController)
  .use(profileController)
  .use(authController);

export default Router().use('/api', api);`
        }),
        p({
          id: "prefix-readout",
          body: "The prediction answer is `/api/tags`. The controller contributes `/tags`; the outer router contributes `/api`; `main.ts` attaches that combined router to the app."
        }),
        diagram({
          id: "route-composition-diagram",
          title: "Route Composition",
          body: `flowchart LR
  Client["GET /api/tags"] --> App["main.ts app.use(routes)"]
  App --> ApiRouter["routes.ts Router().use('/api', api)"]
  ApiRouter --> TagsController["tag.controller router.get('/tags')"]
  TagsController --> Service["getTags(viewer id?)"]
  Service --> Prisma["prisma.tag.findMany"]`
        })
      ],
      subsections: [
        subsection({
          id: "controller-order",
          title: "What `.use(...)` Order Means Here",
          blocks: [
            p({
              id: "order-readout",
              body: "The route combiner mounts tags, articles, profiles, and auth as sibling routers under `/api`. That order matters when two routers could match the same path. Here, `/tags`, `/articles`, `/profiles`, and `/users` are distinct top-level paths, so the order is mostly a reading map."
            }),
            list({
              id: "mounted-paths",
              items: [
                "`tagsController` contributes `/tags`.",
                "`articlesController` contributes `/articles`, `/articles/feed`, `/articles/:slug`, and nested article paths.",
                "`profileController` contributes `/profiles/:username` and `/profiles/:username/follow`.",
                "`authController` contributes `/users`, `/users/login`, and `/user`."
              ]
            })
          ]
        })
      ]
    }),
    section({
      id: "thin-tag-controller",
      title: "The Tag Controller Is Thin",
      role: "instruction",
      blocks: [
        p({
          id: "controller-intro",
          body: "The tag controller follows the same controller style you have seen in article routes: choose auth middleware, call one service, wrap the service result under the API response key, and pass errors to `next`."
        }),
        codeBlock({
          id: "tag-controller-code",
          language: "ts",
          code: `// src/app/routes/tag/tag.controller.ts
router.get('/tags', auth.optional, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await getTags(req.auth?.user?.id);
    res.json({ tags });
  } catch (error) {
    next(error);
  }
});`
        }),
        p({
          id: "optional-readout",
          body: "`auth.optional` has the same meaning here as it did for article lists and profile reads. Anonymous users can ask for tags, but a signed-in user may see tags from their own articles in addition to demo-authored articles."
        }),
        callout({
          id: "thin-controller",
          tone: "key-idea",
          title: "Controller job",
          body: "The controller does not decide which tags are popular or visible. It only passes the possible viewer id into `getTags` and sends `{ tags }` back."
        })
      ]
    }),
    section({
      id: "tag-query",
      title: "The Service Filters Through Articles",
      role: "instruction",
      blocks: [
        p({
          id: "query-intro",
          body: "A tag is visible only if it belongs to at least one article whose author is visible to this request. That is why the Prisma query starts from `tag.findMany`, then looks through the tag's related `articles`."
        }),
        codeBlock({
          id: "query-builder-code",
          language: "ts",
          code: `const getTags = async (id?: number): Promise<string[]> => {
  const queries = [];
  queries.push({ demo: true });

  if (id) {
    queries.push({
      id: {
        equals: id,
      },
    });
  }

  const tags = await prisma.tag.findMany({
    where: {
      articles: {
        some: {
          author: {
            OR: queries,
          },
        },
      },
    },
    select: {
      name: true,
    },
    orderBy: {
      articles: {
        _count: 'desc',
      },
    },
    take: 10,
  });

  return tags.map((tag: Tag) => tag.name);
};`
        }),
        p({
          id: "some-readout",
          body: "Read `articles.some.author.OR` in plain language: include this tag if at least one article using the tag has an author who is a demo user, or, when authenticated, has an author id equal to the viewer id."
        }),
        p({
          id: "order-readout",
          body: "After the visibility filter, the query selects only `name`, orders tags by how many articles are attached, and takes the top ten. The service maps `{ name: string }` objects into a plain `string[]` because the API response is `{ tags: [...] }`."
        }),
        callout({
          id: "count-boundary",
          tone: "caution",
          title: "Subtle boundary",
          body: "The ordering uses the tag's total related article count. The `where` decides which tags qualify for the request, but the `_count` ordering is not written as a separate visible-article-only count."
        })
      ]
    }),
    section({
      id: "worked-case",
      title: "Work a Concrete Request",
      role: "practice",
      blocks: [
        p({
          id: "case-intro",
          body: "Use a tiny dataset to test your mental model. The goal is to decide which tags qualify before worrying about the final popularity order."
        }),
        codeBlock({
          id: "dataset",
          language: "text",
          code: `Viewer: anonymous

Article A: author.demo = true,  tags = ["prisma", "api"]
Article B: author.id = 42,      tags = ["private"]
Article C: author.demo = false, tags = ["draft"]

Request 1: GET /api/tags with no token
Request 2: GET /api/tags with a token for user 42`
        }),
        list({
          id: "case-prompts",
          items: [
            "Request 1: which tags qualify through `articles.some.author.OR`?",
            "Request 2: which additional tag can qualify?",
            "Why is the answer about related article authors rather than tag rows alone?"
          ]
        }),
        p({
          id: "case-answer",
          body: "Request 1 can qualify `prisma` and `api`, because their article is demo-authored. Request 2 can also qualify `private`, because authenticated user 42 is allowed through the author OR condition. `draft` still does not qualify unless its author is demo or user 42."
        })
      ]
    }),
    section({
      id: "error-boundary",
      title: "Errors Are Handled After the Routers",
      role: "instruction",
      blocks: [
        p({
          id: "error-intro",
          body: "The tag route itself has no custom error cases, but the same app-level error handler catches errors from all mounted routers. That is why controllers call `next(error)` instead of formatting every failure themselves."
        }),
        codeBlock({
          id: "error-handler-code",
          language: "ts",
          code: `app.use(
  (
    err: Error | HttpException,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err && err.name === 'UnauthorizedError') {
      return res.status(401).json({
        status: 'error',
        message: 'missing authorization credentials',
      });
    } else if (err && err.errorCode) {
      res.status(err.errorCode).json(err.message);
    } else if (err) {
      res.status(500).json(err.message);
    }
  },
);`
        }),
        p({
          id: "error-readout",
          body: "This completes the Express picture: request body parsing and routers run first; handlers either send responses or call `next(error)`; the error middleware shapes auth failures, `HttpException`s, and unexpected errors."
        }),
        callout({
          id: "test-note",
          tone: "note",
          title: "Test evidence",
          body: "The repository has only a TODO test for `getTags`. That means this endpoint is source-readable but less protected by automated tests than the auth, profile, and article services you studied earlier."
        })
      ]
    }),
    section({
      id: "review",
      title: "Review",
      role: "review",
      blocks: [
        p({
          id: "review-intro",
          body: "Use these questions to check whether you can recover both halves of the chapter: how the request reaches the controller, and how the tag query reaches through article relations."
        }),
        balancedQuiz({
          id: "tags-route-composition-review",
          title: "Tags and Route Composition Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "full-tags-url",
              prompt: "The tag controller registers `router.get('/tags', ...)`, and `routes.ts` exports `Router().use('/api', api)`. What public URL reaches this handler?",
              choices: [
                { id: "a", body: "`GET /api/tags`." },
                { id: "b", body: "`GET /tags/api`." },
                { id: "c", body: "`GET /api/api/tags`." },
                { id: "d", body: "`GET /tag.controller/tags`." }
              ],
              answer: "a",
              explanation: "Express composes the outer `/api` mount path with the controller's `/tags` route.",
              tags: ["express-routing"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "tags-auth",
              prompt: "Why does `GET /api/tags` use `auth.optional`?",
              choices: [
                { id: "a", body: "Anonymous users can read tags, while authenticated users can also include tags from their own articles." },
                { id: "b", body: "The route must reject anonymous users before reaching Prisma." },
                { id: "c", body: "Tags are stored inside JWTs." },
                { id: "d", body: "Optional auth is required for every route without params." }
              ],
              answer: "a",
              explanation: "The optional id becomes part of the author visibility OR condition in `getTags`.",
              tags: ["auth", "tags"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "tag-some",
              prompt: "In `getTags`, what does `articles: { some: { author: { OR: queries } } }` mean?",
              choices: [
                { id: "a", body: "A tag qualifies if at least one related article has a visible author." },
                { id: "b", body: "Every article in the database must have this tag." },
                { id: "c", body: "The tag's name must equal the author's username." },
                { id: "d", body: "Prisma should create an article for each tag." }
              ],
              answer: "a",
              explanation: "`some` is an existence check over related articles; the nested author predicate decides visibility.",
              tags: ["prisma-querying", "tags"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "tag-result-shape",
              prompt: "Why does `getTags` return `tags.map((tag) => tag.name)`?",
              choices: [
                { id: "a", body: "The Prisma query selects objects with `name`, but the API response wants an array of strings." },
                { id: "b", body: "Prisma cannot return string fields." },
                { id: "c", body: "The mapper hashes tag names before sending them." },
                { id: "d", body: "Express routers only accept string arrays." }
              ],
              answer: "a",
              explanation: "`select: { name: true }` returns objects shaped like `{ name }`; the service converts them to the RealWorld `tags` array shape.",
              tags: ["mapping", "tags"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "tag-order",
              prompt: "How are tags ordered in this service?",
              choices: [
                { id: "a", body: "By descending related article count, then limited to ten." },
                { id: "b", body: "Alphabetically by tag name." },
                { id: "c", body: "By the current user's favorite count." },
                { id: "d", body: "By the most recent article's `updatedAt`." }
              ],
              answer: "a",
              explanation: "The query uses `orderBy: { articles: { _count: 'desc' } }` and `take: 10`.",
              tags: ["prisma-querying", "ordering"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "next-error",
              prompt: "A controller catches an exception and calls `next(error)`. What handles it later in `main.ts`?",
              choices: [
                { id: "a", body: "The app-level error middleware registered after the routes." },
                { id: "b", body: "The Prisma schema generator." },
                { id: "c", body: "The static asset middleware." },
                { id: "d", body: "The route combiner in `routes.ts` before any controller runs." }
              ],
              answer: "a",
              explanation: "Express error middleware has the four-argument signature and is registered after normal middleware and routes.",
              tags: ["express-errors"],
              difficulty: "medium"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Trace `/api/tags` through `main.ts`, `routes.ts`, and `tag.controller.ts`.",
            "Explain why the controller path is `/tags` even though the public route is `/api/tags`.",
            "Translate the tag service's nested Prisma `where` into plain English.",
            "Explain why this endpoint maps selected tag objects into strings."
          ]
        })
      ]
    })
  ]
});
