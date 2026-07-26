import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "publish-new-article",
  title: "Publishing an Article Through Express and Prisma",
  description: "Trace a new article from the Express POST route through validation, slug creation, Prisma relation writes, and response mapping.",
  role: "instruction",
  sections: [
    section({
      id: "request-enters-express",
      title: "The Request Enters Express",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can trace a new article publish request through this codebase: from `POST /api/articles`, through Express middleware, into `createArticle`, down into Prisma, and back out through the response mapper."
        }),
        p({
          id: "start-with-one-request",
          body: "Imagine the client sends one authenticated request. TypeScript already lets you read the shapes. The new idea is where Express gets each piece of state from. Express does not call a controller because the function has a special name; it walks a stack of middleware and route handlers until a path and method match."
        }),
        callout({
          id: "predict-first",
          tone: "note",
          title: "Pause and predict",
          body: "Before reading the code, predict which layer should know the authenticated user's id: the JSON body parser, the route handler, the service, or Prisma. Keep that answer in mind."
        }),
        p({
          id: "request-shape-intro",
          body: "Here is the request we will follow. Inspect the boundary between data the client supplies and data the server must infer."
        }),
        codeBlock({
          id: "publish-request",
          language: "text",
          code: `POST /api/articles
Authorization: Token <jwt whose payload is { user: { id: 42 } }>
Content-Type: application/json

{
  "article": {
    "title": "Prisma From the Route Handler",
    "description": "A guided tour",
    "body": "The article body...",
    "tagList": ["express", "prisma"]
  }
}`
        }),
        p({
          id: "request-readout",
          body: "The client supplies the article fields and the token. It does not supply `authorId`, `createdAt`, `updatedAt`, `favorited`, `favoritesCount`, or the author profile. Those are made or fetched on the server side."
        }),
        p({
          id: "express-setup-intro",
          body: "Now inspect the Express setup. There are two important moves: parse the body before routes run, then mount the app's router under `/api`."
        }),
        codeBlock({
          id: "express-setup",
          language: "ts",
          code: `// src/main.ts
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

// src/app/routes/routes.ts
const api = Router()
  .use(tagsController)
  .use(articlesController)
  .use(profileController)
  .use(authController);

export default Router().use('/api', api);`
        }),
        p({
          id: "express-setup-readout",
          body: "`bodyParser.json()` fills in `req.body` before the article route sees the request. `Router().use('/api', api)` means the route written as `/articles` inside the article controller is actually reached as `/api/articles` by the client."
        }),
        diagram({
          id: "publish-flow-diagram",
          title: "Publish Request Handoffs",
          body: `sequenceDiagram
  participant Client
  participant Express as Express app
  participant Auth as auth.required
  participant Controller as article.controller
  participant Service as createArticle
  participant Prisma as Prisma Client
  participant DB as PostgreSQL

  Client->>Express: POST /api/articles with JSON and token
  Express->>Express: bodyParser creates req.body
  Express->>Auth: route middleware checks Authorization
  Auth->>Controller: req.auth.user.id is available
  Controller->>Service: createArticle(req.body.article, user id)
  Service->>Prisma: findUnique slug, then article.create
  Prisma->>DB: insert Article and connect/create Tags
  DB-->>Prisma: row plus included relations
  Service-->>Controller: mapped article response
  Controller-->>Client: 201 { article }`
        })
      ],
      subsections: [
        subsection({
          id: "controller-handoff",
          title: "The Controller Is a Handoff",
          blocks: [
            p({
              id: "controller-intro",
              body: "The article controller is the place where Express concerns are visible: method, path, middleware, request, response, and `next(error)`. It is not where the database write is built."
            }),
            codeBlock({
              id: "post-route",
              language: "ts",
              code: `// src/app/routes/article/article.controller.ts
router.post('/articles', auth.required, async (req, res, next) => {
  try {
    const article = await createArticle(req.body.article, req.auth?.user?.id);
    res.status(201).json({ article });
  } catch (error) {
    next(error);
  }
});`
            }),
            p({
              id: "controller-readout",
              body: "This handler does four jobs. It declares `POST /articles`; requires authentication before the handler runs; passes the article payload and current user id into the service; and turns the service result into a `201` JSON response. If the service throws, `next(error)` hands the failure to Express error middleware in `main.ts`."
            })
          ]
        })
      ]
    }),
    section({
      id: "auth-makes-user-id",
      title: "Authentication Makes `req.auth`",
      role: "instruction",
      blocks: [
        p({
          id: "auth-intro",
          body: "The earlier prediction has an answer now: the route handler can read the user id because `auth.required` runs before it. The JSON body parser does not know users, and Prisma does not inspect HTTP headers. Middleware sits between those worlds."
        }),
        p({
          id: "auth-code-intro",
          body: "Inspect the token creation and token reading together. They match by shape: login signs `{ user: { id } }`, and Express JWT later decodes that payload onto `req.auth`."
        }),
        codeBlock({
          id: "auth-code",
          language: "ts",
          code: `// src/app/routes/auth/token.utils.ts
const generateToken = (id: number): string =>
  jwt.sign({ user: { id } }, process.env.JWT_SECRET || 'superSecret', {
    expiresIn: '60d',
  });

// src/app/routes/auth/auth.ts
const auth = {
  required: jwt({
    secret: process.env.JWT_SECRET || 'superSecret',
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
  optional: jwt({
    secret: process.env.JWT_SECRET || 'superSecret',
    credentialsRequired: false,
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
};`
        }),
        p({
          id: "auth-readout",
          body: "`required` rejects a request with no valid token, so the publish handler is supposed to run only for a known user. `optional` is used on public reads, where the app can still personalize `favorited` or `following` if a token happens to be present."
        }),
        callout({
          id: "auth-trap",
          tone: "caution",
          title: "A TypeScript wrinkle",
          body: "The service signature says `id: number`, but the controller passes `req.auth?.user?.id`, which TypeScript sees as possibly `undefined`. The route relies on `auth.required` to make the id present at runtime. That is common in Express code, but it is also a place where stronger request typing or an assertion helper would make the contract clearer."
        })
      ]
    }),
    section({
      id: "service-publishes",
      title: "The Service Publishes",
      role: "instruction",
      blocks: [
        p({
          id: "service-intro",
          body: "`createArticle` is where publishing becomes a database operation. Read it as a small transaction-shaped story, even though it is not wrapped in an explicit database transaction: validate required fields, compute a slug, check uniqueness, create the article while connecting relations, then map the result."
        }),
        p({
          id: "validation-intro",
          body: "Start with the guardrails. The client can omit fields, so the service throws `HttpException` before Prisma gets involved."
        }),
        codeBlock({
          id: "validation-code",
          language: "ts",
          code: `// src/app/routes/article/article.service.ts
export const createArticle = async (article: any, id: number) => {
  const { title, description, body, tagList } = article;
  const tags = Array.isArray(tagList) ? tagList : [];

  if (!title) {
    throw new HttpException(422, { errors: { title: ["can't be blank"] } });
  }

  if (!description) {
    throw new HttpException(422, { errors: { description: ["can't be blank"] } });
  }

  if (!body) {
    throw new HttpException(422, { errors: { body: ["can't be blank"] } });
  }`
        }),
        p({
          id: "validation-readout",
          body: "A missing title, description, or body becomes a `422` response because `main.ts` has error middleware that recognizes `HttpException.errorCode`. A missing or non-array `tagList` does not fail; it becomes an empty array."
        }),
        p({
          id: "slug-intro",
          body: "Next comes the slug. A slug is the URL-friendly article identifier. This app uses the title plus user id, then checks whether that exact slug already exists."
        }),
        codeBlock({
          id: "slug-code",
          language: "ts",
          code: `const slug = \`\${slugify(title)}-\${id}\`;

const existingTitle = await prisma.article.findUnique({
  where: { slug },
  select: { slug: true },
});

if (existingTitle) {
  throw new HttpException(422, { errors: { title: ['must be unique'] } });
}`
        }),
        p({
          id: "slug-readout",
          body: "The database schema also says `slug` is unique, but the service checks first so it can return the RealWorld-style validation error instead of leaking a raw Prisma unique-constraint error. The id suffix means two different users can publish the same title without producing the same slug."
        }),
        p({
          id: "schema-intro",
          body: "Before the create call, inspect the Prisma schema. This is the map Prisma uses to know which relations exist."
        }),
        codeBlock({
          id: "schema-code",
          language: "prisma",
          code: `model Article {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  title       String
  description String
  body        String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now())
  tagList     Tag[]
  author      User     @relation("UserArticles", fields: [authorId], onDelete: Cascade, references: [id])
  authorId    Int
  favoritedBy User[]   @relation("UserFavorites")
  comments    Comment[]
}

model Tag {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  articles Article[]
}`
        }),
        p({
          id: "schema-readout",
          body: "`Article.author` is a required relation backed by the scalar column `authorId`. `Article.tagList` is many-to-many, so Prisma can connect an article to existing tags or create new tags by name."
        }),
        p({
          id: "create-intro",
          body: "Now the create call is easier to read. Do not read `include` as stored data. Read `data` as the write, and `include` as what the service wants back after the write."
        }),
        codeBlock({
          id: "create-code",
          language: "ts",
          code: `const { authorId, id: articleId, ...createdArticle } =
  await prisma.article.create({
    data: {
      title,
      description,
      body,
      slug,
      tagList: {
        connectOrCreate: tags.map((tag: string) => ({
          create: { name: tag },
          where: { name: tag },
        })),
      },
      author: {
        connect: { id },
      },
    },
    include: {
      tagList: { select: { name: true } },
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
      favoritedBy: true,
      _count: { select: { favoritedBy: true } },
    },
  });`
        }),
        p({
          id: "create-readout",
          body: "`connectOrCreate` says: for each tag name, reuse the existing `Tag` row if it exists, otherwise insert it, then relate it to this article. `author.connect` says: do not create a user; attach this article to the already-authenticated user. Prisma returns the new article plus the included relations so the service has enough data to build the API response."
        }),
        callout({
          id: "relation-key-idea",
          tone: "key-idea",
          title: "The core Prisma move",
          body: "In this app, publishing an article is not just inserting an `Article` row. It is inserting the row, connecting one required `User`, and connecting or creating zero or more `Tag` rows."
        })
      ]
    }),
    section({
      id: "response-shape",
      title: "The Response Is Mapped",
      role: "instruction",
      blocks: [
        p({
          id: "mapper-intro",
          body: "The service deliberately strips internal ids before returning. That is why the destructuring pulled out `authorId` and `articleId`, and why the final line calls `articleMapper(createdArticle, id)`."
        }),
        codeBlock({
          id: "mapper-code",
          language: "ts",
          code: `// src/app/routes/article/article.mapper.ts
const articleMapper = (article: any, id?: number) => ({
  slug: article.slug,
  title: article.title,
  description: article.description,
  body: article.body,
  tagList: article.tagList.map((tag: any) => tag.name),
  createdAt: article.createdAt,
  updatedAt: article.updatedAt,
  favorited: article.favoritedBy.some((item: any) => item.id === id),
  favoritesCount: article.favoritedBy.length,
  author: authorMapper(article.author, id),
});`
        }),
        p({
          id: "mapper-readout",
          body: "The returned API object is not the raw Prisma row. `tagList` becomes an array of names, `favoritesCount` is calculated from the included `favoritedBy` relation, and `author` is shaped by `authorMapper`. On a freshly created article, `favorited` should be false because the author has not automatically favorited their own article."
        }),
        p({
          id: "worked-output-intro",
          body: "Putting the pieces together, the earlier request produces a response shaped like this. The timestamps come from the database defaults, and the profile fields come from the connected user."
        }),
        codeBlock({
          id: "worked-output",
          language: "json",
          code: `{
  "article": {
    "slug": "Prisma-From-the-Route-Handler-42",
    "title": "Prisma From the Route Handler",
    "description": "A guided tour",
    "body": "The article body...",
    "tagList": ["express", "prisma"],
    "createdAt": "2026-07-20T...",
    "updatedAt": "2026-07-20T...",
    "favorited": false,
    "favoritesCount": 0,
    "author": {
      "username": "the-authenticated-user",
      "bio": null,
      "image": "...",
      "following": false
    }
  }
}`
        }),
        callout({
          id: "slug-case-note",
          tone: "note",
          title: "Watch the exact slug",
          body: "`slugify(title)` preserves capitalization with the default options used here. If you expected lowercase slugs, that expectation comes from many RealWorld implementations, not from this code's current `slugify` call."
        })
      ]
    }),
    section({
      id: "debugging-practice",
      title: "Debug the Publish Path",
      role: "practice",
      blocks: [
        p({
          id: "practice-intro",
          body: "Use these checks to make the path active. Try answering each one before looking back at the source excerpts."
        }),
        list({
          id: "debug-prompts",
          items: [
            "A request reaches `POST /api/articles` with no `Authorization` header. Name the layer that stops it and the response status it should produce.",
            "A request includes a valid token and `{ \"article\": { \"title\": \"Only title\" } }`. Name the first service check that throws and the response status.",
            "A user publishes `Same Title` twice. Explain why the second request is rejected before `prisma.article.create` runs.",
            "A request sends `tagList: \"prisma\"` instead of an array. Predict whether publishing fails, and what tags will be connected.",
            "You add a field to `Article` in Prisma and want it returned by `POST /articles`. Name the two places you may need to inspect: the Prisma `include` or `select`, and the response mapper."
          ]
        }),
        callout({
          id: "debug-readout",
          tone: "key-idea",
          title: "How to triangulate failures",
          body: "When publishing breaks, classify the symptom by layer: route/auth failures happen before the controller's service call; validation and uniqueness failures happen inside `createArticle`; relation or constraint failures come from Prisma; response-shape surprises usually come from `include` data or `articleMapper`."
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
          body: "The mastery target is not memorizing line numbers. It is being able to reconstruct the publish path from first principles: HTTP request, middleware state, service rules, relational write, mapped response."
        }),
        balancedQuiz({
          id: "publish-review-quiz",
          title: "Publish Path Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "actual-client-route",
              prompt: "The article controller registers `router.post('/articles', ...)`. What route does the client actually call?",
              choices: [
                { id: "a", body: "`POST /api/articles`" },
                { id: "b", body: "`POST /articles`" },
                { id: "c", body: "`POST /api/article`" },
                { id: "d", body: "`POST /article/:slug`" }
              ],
              answer: "a",
              explanation: "`routes.ts` mounts the collected API router under `/api`, so the controller's `/articles` path is reached as `/api/articles`.",
              tags: ["express-routing"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "where-user-id-comes-from",
              prompt: "Where does `req.auth?.user?.id` come from during article publishing?",
              choices: [
                { id: "a", body: "The `express-jwt` middleware decodes the JWT payload before the route handler runs." },
                { id: "b", body: "The client sends `authorId` in `req.body.article`." },
                { id: "c", body: "Prisma fills it in after `article.create`." },
                { id: "d", body: "`bodyParser.json()` extracts it from the Authorization header." }
              ],
              answer: "a",
              explanation: "Login signs `{ user: { id } }` into the token. `auth.required` reads the Authorization header, verifies the token, and exposes the decoded payload on `req.auth`.",
              tags: ["express-middleware", "auth"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "connect-or-create-tags",
              prompt: "In the Prisma create call, what does `tagList.connectOrCreate` do?",
              choices: [
                { id: "a", body: "For each tag name, connect an existing `Tag` row or create it, then relate it to the article." },
                { id: "b", body: "Store tag names as a JSON array inside the `Article` row." },
                { id: "c", body: "Create duplicate tag rows every time an article is published." },
                { id: "d", body: "Load tags for the response without changing the database." }
              ],
              answer: "a",
              explanation: "`Tag.name` is unique in the Prisma schema. `connectOrCreate` uses that unique name as the lookup key, creates the tag only if needed, and connects the many-to-many relation.",
              tags: ["prisma-relations"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "include-vs-data",
              prompt: "Which statement best describes the `include` object passed to `prisma.article.create`?",
              choices: [
                { id: "a", body: "`include` controls which related data Prisma returns after the write." },
                { id: "b", body: "`include` decides which fields are inserted into the `Article` table." },
                { id: "c", body: "`include` validates the request body before writing." },
                { id: "d", body: "`include` creates the JWT payload for the author." }
              ],
              answer: "a",
              explanation: "`data` describes the write. `include` describes extra related records and counts the service wants in the returned object so the mapper can shape the API response.",
              tags: ["prisma-query-shape"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "duplicate-title-same-user",
              prompt: "A user with id `42` successfully publishes `Prisma From the Route Handler`, then sends the same title again. What should happen next?",
              choices: [
                { id: "a", body: "The service finds the existing slug and throws a `422` title uniqueness error." },
                { id: "b", body: "Prisma creates the article with a new auto-incremented slug." },
                { id: "c", body: "The controller catches it and silently changes the title." },
                { id: "d", body: "The mapper returns both articles in one response." }
              ],
              answer: "a",
              explanation: "The slug is derived from title plus user id. The second request computes the same slug, `findUnique` finds it, and the service throws before calling `article.create`.",
              tags: ["service-validation", "slug"],
              difficulty: "medium"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Without looking back, say the publish path aloud in seven nouns: client, parser, router, auth, controller, service, Prisma.",
            "Point to the exact layer that owns each concern: status code, user id, required-field validation, tag creation, response shape.",
            "Explain why this code needs both the database `@unique` constraint and the service's pre-check for an existing slug."
          ]
        })
      ]
    })
  ]
});
