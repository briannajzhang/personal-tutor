import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "article-feed-read-model",
  title: "Comparing Article Lists and Your Feed",
  description: "Compare the general article list with the authenticated feed by tracing how followed-author relations shape each read model.",
  role: "instruction",
  sections: [
    section({
      id: "same-shape-different-question",
      title: "Same Shape, Different Question",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can compare `GET /api/articles` and `GET /api/articles/feed`, predict which articles each one can return, and explain the Prisma relation filter behind the feed."
        }),
        p({
          id: "same-response",
          body: "The two endpoints return the same kind of JSON: `{ articles, articlesCount }`. That sameness can hide the real design difference. They answer different product questions."
        }),
        codeBlock({
          id: "product-questions",
          language: "text",
          code: `/api/articles
  "Show me a browsable list of visible articles, optionally narrowed by tag, author, or who favorited it."

/api/articles/feed
  "Show me recent articles written by authors I follow."`
        }),
        p({
          id: "question-readout",
          body: "The first endpoint is a search/list read model. The second endpoint is a follow-graph read model. They share pagination, ordering, includes, and mapping, but their `where` clauses come from different ideas."
        }),
        callout({
          id: "predict",
          tone: "note",
          title: "Pause and predict",
          body: "If Alice follows Bob, and Bob publishes an article, should Alice see it in `/articles/feed` because `Bob.followedBy` contains Alice, or because `Alice.following` contains Bob? Keep both phrasings in mind before reading the Prisma filter."
        }),
        p({
          id: "routes-intro",
          body: "Start at the controller. The routes are neighbors, but they choose different auth requirements and different service functions."
        }),
        codeBlock({
          id: "routes-code",
          language: "ts",
          code: `// src/app/routes/article/article.controller.ts
router.get('/articles', auth.optional, async (req, res, next) => {
  try {
    const result = await getArticles(req.query, req.auth?.user?.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/articles/feed',
  auth.required,
  async (req, res, next) => {
    try {
      const result = await getFeed(
        Number(req.query.offset),
        Number(req.query.limit),
        req.auth?.user?.id,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);`
        }),
        p({
          id: "routes-readout",
          body: "`/articles` can run anonymously and accepts the whole query object. `/articles/feed` requires a user and passes only offset, limit, and user id. That means a URL like `/api/articles/feed?tag=prisma` still calls `getFeed(offset, limit, id)`; the service never receives `tag`."
        }),
        callout({
          id: "route-order",
          tone: "caution",
          title: "Route order matters",
          body: "`/articles/feed` is registered before `/articles/:slug`. If the slug route came first, Express could treat `feed` as a slug. This file avoids that by placing the more specific feed route first."
        }),
        diagram({
          id: "endpoint-split",
          title: "The Two Read Models Split at the Service",
          body: `flowchart TD
  A["Client asks for article collection"] --> B{Which endpoint?}
  B -->|"/api/articles"| C["auth.optional"]
  C --> D["getArticles(query, viewer id?)"]
  D --> E["base visibility + optional filters"]
  B -->|"/api/articles/feed"| F["auth.required"]
  F --> G["getFeed(offset, limit, viewer id)"]
  G --> H["authors followed by viewer"]
  E --> I["same order, pagination, include, mapper"]
  H --> I`
        })
      ],
      subsections: [
        subsection({
          id: "same-output-contract",
          title: "Shared Output Contract",
          blocks: [
            list({
              id: "shared-pieces",
              items: [
                "Both count matching articles before pagination.",
                "Both fetch newest first with `createdAt: 'desc'`.",
                "Both use `skip` and `take` for pagination.",
                "Both include tags, author, favorited users, and favorite counts.",
                "Both map articles through `articleMapper(article, id)`."
              ]
            })
          ]
        })
      ]
    }),
    section({
      id: "list-where-vs-feed-where",
      title: "Compare the `where` Clauses",
      role: "instruction",
      blocks: [
        p({
          id: "list-intro",
          body: "You already studied `getArticles`, but it is worth putting its `where` beside feed. The ordinary list builds a predicate array from a base author visibility rule plus optional filters."
        }),
        codeBlock({
          id: "list-where-code",
          language: "ts",
          code: `// getArticles
const andQueries = buildFindAllQuery(query, id);

const articlesCount = await prisma.article.count({
  where: {
    AND: andQueries,
  },
});

const articles = await prisma.article.findMany({
  where: { AND: andQueries },
  orderBy: { createdAt: 'desc' },
  skip: Number(query.offset) || 0,
  take: Number(query.limit) || 10,
  include: { /* same shape as feed */ },
});`
        }),
        p({
          id: "list-readout",
          body: "`getArticles` is broad but controlled. It starts from visible authors, then narrows with `author`, `tag`, and `favorited` if those query params exist."
        }),
        p({
          id: "feed-intro",
          body: "Feed does not call that query builder. Its entire membership test is one relation predicate: the article's author must be followed by the current user."
        }),
        codeBlock({
          id: "feed-where-code",
          language: "ts",
          code: `// getFeed
const articlesCount = await prisma.article.count({
  where: {
    author: {
      followedBy: { some: { id: id } },
    },
  },
});

const articles = await prisma.article.findMany({
  where: {
    author: {
      followedBy: { some: { id: id } },
    },
  },
  orderBy: { createdAt: 'desc' },
  skip: offset || 0,
  take: limit || 10,
  include: { /* same shape as getArticles */ },
});`
        }),
        p({
          id: "feed-readout",
          body: "This answers the prediction. If Alice is the viewer, Bob's article appears when Bob's `followedBy` relation contains Alice. Prisma reads the predicate from the article outward: article -> author -> users who follow that author -> some user has Alice's id."
        }),
        p({
          id: "schema-intro",
          body: "The self-relation in the schema makes the direction easy to mix up, so inspect it with names attached."
        }),
        codeBlock({
          id: "follow-schema",
          language: "prisma",
          code: `model User {
  id         Int    @id @default(autoincrement())
  username   String @unique
  articles   Article[] @relation("UserArticles")

  // Users who follow this user.
  followedBy User[] @relation("UserFollows")

  // Users this user follows.
  following  User[] @relation("UserFollows")
}`
        }),
        p({
          id: "schema-readout",
          body: "For an article, you are standing on the author. From that author's point of view, the current viewer must be in `followedBy`. If you were starting from the viewer row instead, you might talk about `viewer.following`, but the feed query starts from articles."
        }),
        callout({
          id: "feed-not-list-filter",
          tone: "key-idea",
          title: "Feed is not a tag-filtered list",
          body: "`/articles/feed` ignores `tag`, `author`, and `favorited` query params in this code. Its product rule is narrower and stronger: authenticated viewer plus followed authors."
        })
      ]
    }),
    section({
      id: "shared-shaping",
      title: "Same Fetch Shape After Filtering",
      role: "instruction",
      blocks: [
        p({
          id: "same-after-where",
          body: "Once each service decides which articles qualify, the rest is nearly identical. That is why the two endpoints feel consistent to a frontend even though their membership rules differ."
        }),
        codeBlock({
          id: "shared-include",
          language: "ts",
          code: `orderBy: {
  createdAt: 'desc',
},
skip: offsetOrQueryOffset || 0,
take: limitOrQueryLimit || 10,
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
}`
        }),
        p({
          id: "shared-include-readout",
          body: "The services fetch enough relation data for the same mapper. That means both endpoints can return `tagList`, `favoritesCount`, `favorited`, and author `following` in the same response shape."
        }),
        codeBlock({
          id: "shared-return",
          language: "ts",
          code: `return {
  articles: articles.map((article: any) => articleMapper(article, id)),
  articlesCount,
};`
        }),
        p({
          id: "mapper-subtlety",
          body: "In feed, `author.following` in the response will usually be true, because the feed only includes authors followed by the viewer. It still goes through the mapper rather than hard-coding true, which keeps the response shaping shared."
        }),
        callout({
          id: "count-note",
          tone: "note",
          title: "Same pagination idea",
          body: "Both endpoints count before pagination and return a page afterward. Empty feed with `articlesCount: 0` means no matching followed-author articles; empty `articles` with a positive count can simply mean the offset skipped past the available page."
        })
      ]
    }),
    section({
      id: "predict-endpoint",
      title: "Which Endpoint Explains It?",
      role: "practice",
      blocks: [
        p({
          id: "practice-intro",
          body: "For each case, identify which endpoint's rule explains the result. Do not start from the JSON shape; start from the product question."
        }),
        codeBlock({
          id: "practice-cases",
          language: "text",
          code: `World
  Viewer: Alice, id 1
  Bob: id 2, demo false, followedBy includes Alice
  Carol: id 3, demo true, followedBy does not include Alice
  Dan: id 4, demo false, followedBy does not include Alice

Articles
  Bob wrote "Post B" tagged ["prisma"].
  Carol wrote "Post C" tagged ["express"].
  Dan wrote "Post D" tagged ["prisma"].

Requests
  A. GET /api/articles?tag=prisma as Alice
  B. GET /api/articles/feed as Alice
  C. GET /api/articles/feed?tag=express as Alice
  D. GET /api/articles as anonymous`
        }),
        list({
          id: "case-prompts",
          items: [
            "A: Which posts can match, and which visibility rule hides one of the Prisma-tagged posts?",
            "B: Which posts can match the followed-author rule?",
            "C: Does `tag=express` change the feed result in this code?",
            "D: Which posts are visible without a token?"
          ]
        }),
        p({
          id: "case-readout",
          body: "A can return Bob's Prisma post because Bob is followed by Alice? Careful: `/articles` visibility is demo authors plus Alice's own articles, not followed authors. Bob is not demo and not Alice, so Bob is hidden; Dan is also hidden; no Prisma post appears from this world. B returns Bob's post because Bob's `followedBy` includes Alice. C still returns Bob's post and ignores `tag=express`. D returns Carol's post because anonymous `/articles` can see demo-authored articles."
        }),
        callout({
          id: "wrong-turn",
          tone: "caution",
          title: "A useful wrong turn",
          body: "It is tempting to reuse the feed idea when reading `/articles`, but this code does not. `/articles` does not mean 'authors I follow plus filters'; `/articles/feed` owns that follow-graph rule."
        })
      ]
    }),
    section({
      id: "debugging",
      title: "Debug Empty Results",
      role: "practice",
      blocks: [
        p({
          id: "debug-intro",
          body: "When a frontend says, \"The article list is empty,\" first ask which read model failed. The same empty array can come from very different causes."
        }),
        list({
          id: "debug-checklist",
          items: [
            "`GET /api/articles` empty: check demo/current-user visibility, optional filters, and offset.",
            "`GET /api/articles/feed` returns 401: check for a missing or invalid token.",
            "`GET /api/articles/feed` returns `{ articles: [], articlesCount: 0 }`: check whether the viewer follows any authors who have articles.",
            "`GET /api/articles/feed?tag=prisma` returns non-Prisma articles: remember this route ignores `tag`.",
            "`articlesCount` positive but `articles` empty: check whether `offset` skipped beyond the matching rows."
          ]
        }),
        p({
          id: "debug-readout",
          body: "The fastest debugging move is to write the endpoint's membership rule in one sentence before opening Prisma logs. For `/articles`, ask about base visibility plus filters. For `/feed`, ask about followed authors."
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
          body: "You now have two read models in your head. Keep them separate, and the service code becomes much easier to reconstruct."
        }),
        balancedQuiz({
          id: "feed-review-quiz",
          title: "Feed Read Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "feed-auth",
              prompt: "Why does `/articles/feed` use `auth.required`?",
              choices: [
                { id: "a", body: "The feed cannot be computed without knowing the current viewer's user id." },
                { id: "b", body: "Prisma requires auth for every `findMany` query." },
                { id: "c", body: "The feed endpoint creates articles as it reads them." },
                { id: "d", body: "The feed endpoint accepts private query params." }
              ],
              answer: "a",
              explanation: "Feed membership is defined by the current user's follow graph, so the service needs a verified user id.",
              tags: ["auth", "feed"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "feed-relation-direction",
              prompt: "In `getFeed`, what does `author: { followedBy: { some: { id } } }` mean?",
              choices: [
                { id: "a", body: "The article's author has at least one follower whose id is the current viewer id." },
                { id: "b", body: "The current viewer has favorited at least one article by this author." },
                { id: "c", body: "The article's author follows the current viewer." },
                { id: "d", body: "The article was written by the current viewer." }
              ],
              answer: "a",
              explanation: "The query starts at Article, steps to its author, then checks whether that author's `followedBy` relation includes the viewer.",
              tags: ["prisma-relations", "feed"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "feed-query-params",
              prompt: "What happens to `tag=prisma` on `GET /api/articles/feed?tag=prisma` in this code?",
              choices: [
                { id: "a", body: "It is ignored because the controller passes only offset, limit, and user id to `getFeed`." },
                { id: "b", body: "It is applied by `buildFindAllQuery` before the feed filter." },
                { id: "c", body: "It changes the include shape but not the where clause." },
                { id: "d", body: "It throws a 422 validation error." }
              ],
              answer: "a",
              explanation: "`getFeed` does not receive the query object and does not call `buildFindAllQuery`, so tag, author, and favorited filters do not affect feed.",
              tags: ["controller", "query-params"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "shared-response",
              prompt: "Which behavior is shared by `getArticles` and `getFeed`?",
              choices: [
                { id: "a", body: "Both return `{ articles, articlesCount }` after mapping articles through `articleMapper`." },
                { id: "b", body: "Both accept anonymous requests." },
                { id: "c", body: "Both use `buildFindAllQuery`." },
                { id: "d", body: "Both filter by demo authors before followed authors." }
              ],
              answer: "a",
              explanation: "The membership rules differ, but both services count, fetch a page, include relation data, map articles, and return the same output shape.",
              tags: ["mapping", "read-models"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "route-order",
              prompt: "Why is it useful that `/articles/feed` is registered before `/articles/:slug`?",
              choices: [
                { id: "a", body: "It prevents Express from treating `feed` as a slug for the parameterized route." },
                { id: "b", body: "It makes feed articles sort before ordinary articles." },
                { id: "c", body: "It lets Prisma infer the follow relation direction." },
                { id: "d", body: "It allows `auth.optional` to run before `auth.required`." }
              ],
              answer: "a",
              explanation: "Express matches routes in order. Specific routes should appear before broad parameter routes when their path could otherwise be captured as a param.",
              tags: ["express-routing"],
              difficulty: "medium"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Say the product question for each endpoint without looking.",
            "Trace the feed relation from Article to Author to `followedBy` to viewer id.",
            "Explain why two endpoints can share mapper code while having different `where` clauses."
          ]
        })
      ]
    })
  ]
});
