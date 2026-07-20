import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "read-article-lists",
  title: "Reading Article Lists With Prisma Filters",
  description: "Read the public article list path as a filtered, paginated Prisma query with optional viewer-specific response fields.",
  role: "instruction",
  sections: [
    section({
      id: "one-list-request",
      title: "One List Request",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can trace `GET /api/articles` from query params through Prisma filters, pagination, relation includes, and the final mapped response."
        }),
        p({
          id: "read-path-model",
          body: "A list endpoint is different from the create and update paths you just studied. There is no single article slug and no single row to mutate. The service has to answer a broader question: out of all articles, which ones should this viewer be allowed to see, which optional filters narrow that set, and which slice of the result should be returned now?"
        }),
        callout({
          id: "predict-query-shape",
          tone: "note",
          title: "Pause and predict",
          body: "For `GET /api/articles?tag=prisma&author=alice&limit=5`, do you expect the service to find articles that match any one of those conditions, or articles that match all of them? Keep that answer in mind."
        }),
        p({
          id: "request-intro",
          body: "Start with a concrete request. Inspect which information comes from the URL, which information comes from optional auth, and which information is not present at all."
        }),
        codeBlock({
          id: "list-request",
          language: "text",
          code: `GET /api/articles?tag=prisma&author=alice&limit=5&offset=10
Authorization: Token <optional jwt whose payload is { user: { id: 42 } }>`
        }),
        p({
          id: "request-readout",
          body: "The URL gives filter and pagination inputs. The optional token gives the current viewer id, if there is one. The request does not say which SQL joins to run or how to compute `favorited`; that is the service and mapper's job."
        }),
        p({
          id: "controller-intro",
          body: "The controller is again thin. It lets anonymous users through with `auth.optional`, then passes `req.query` and maybe a user id to the service."
        }),
        codeBlock({
          id: "get-route",
          language: "ts",
          code: `// src/app/routes/article/article.controller.ts
router.get('/articles', auth.optional, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getArticles(req.query, req.auth?.user?.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});`
        }),
        p({
          id: "controller-readout",
          body: "`auth.optional` is the key difference from create and update. The endpoint can return public-ish article lists without a token, but if a token is present the response can also mark which articles this viewer has favorited and whether the viewer follows each author."
        }),
        diagram({
          id: "list-read-flow",
          title: "Article List Read Flow",
          body: `sequenceDiagram
  participant Client
  participant Controller as article.controller
  participant Builder as buildFindAllQuery
  participant Prisma as Prisma Client
  participant Mapper as articleMapper

  Client->>Controller: GET /api/articles with query params and optional token
  Controller->>Builder: query plus optional viewer id
  Builder-->>Controller: AND filter array
  Controller->>Prisma: count where AND filters
  Controller->>Prisma: findMany where AND filters, order, skip, take, include
  Prisma-->>Mapper: articles plus tags, author, favoritedBy
  Mapper-->>Client: articles array plus articlesCount`
        })
      ],
      subsections: [
        subsection({
          id: "all-not-any",
          title: "All Conditions, Not Any",
          blocks: [
            p({
              id: "and-answer",
              body: "The prediction answer is all of them. The service builds an array of Prisma predicates and wraps them in `AND`. An article has to pass the visibility rule and every requested filter."
            }),
            codeBlock({
              id: "count-and-find",
              language: "ts",
              code: `const andQueries = buildFindAllQuery(query, id);

const articlesCount = await prisma.article.count({
  where: {
    AND: andQueries,
  },
});

const articles = await prisma.article.findMany({
  where: { AND: andQueries },
  orderBy: {
    createdAt: 'desc',
  },
  skip: Number(query.offset) || 0,
  take: Number(query.limit) || 10,
  include: { /* tags, author, favoritedBy, counts */ },
});`
            }),
            p({
              id: "count-find-readout",
              body: "The same `where` object is used twice. `count` answers, \"How many articles match before pagination?\" `findMany` answers, \"Which matching articles are on this page?\" That is why `articlesCount` can be larger than `articles.length`."
            })
          ]
        })
      ]
    }),
    section({
      id: "build-query",
      title: "Build the `where` Predicates",
      role: "instruction",
      blocks: [
        p({
          id: "builder-intro",
          body: "The query builder is the part to read slowly. It does not start with tag, author, or favorite filters. It starts with a visibility rule about authors."
        }),
        codeBlock({
          id: "base-visibility-code",
          language: "ts",
          code: `const buildFindAllQuery = (query: any, id: number | undefined) => {
  const queries: any = [];
  const orAuthorQuery = [];
  const andAuthorQuery = [];

  orAuthorQuery.push({
    demo: {
      equals: true,
    },
  });

  if (id) {
    orAuthorQuery.push({
      id: {
        equals: id,
      },
    });
  }

  if ('author' in query) {
    andAuthorQuery.push({
      username: {
        equals: query.author,
      },
    });
  }

  const authorQuery = {
    author: {
      OR: orAuthorQuery,
      AND: andAuthorQuery,
    },
  };

  queries.push(authorQuery);`
        }),
        p({
          id: "base-visibility-readout",
          body: "In plain English: the article's author must be a demo user, or the current authenticated user if there is one. If the URL also asks for `author=alice`, then the author's username must be `alice` too. That means anonymous users mostly see demo-authored articles; authenticated users additionally see their own articles."
        }),
        callout({
          id: "visibility-trap",
          tone: "caution",
          title: "The easy mistake",
          body: "Do not read the `author` query param as the whole author filter. It is nested inside a base author visibility rule. An article by `alice` will not match `author=alice` unless `alice` is also a demo user, or `alice` is the current authenticated user."
        }),
        p({
          id: "relation-filter-intro",
          body: "The tag and favorited filters are relation predicates. Read Prisma's `some` as: at least one related row must match this condition."
        }),
        codeBlock({
          id: "tag-favorited-code",
          language: "ts",
          code: `if ('tag' in query) {
  queries.push({
    tagList: {
      some: {
        name: query.tag,
      },
    },
  });
}

if ('favorited' in query) {
  queries.push({
    favoritedBy: {
      some: {
        username: {
          equals: query.favorited,
        },
      },
    },
  });
}

return queries;`
        }),
        p({
          id: "relation-filter-readout",
          body: "`tagList.some.name = prisma` means at least one tag attached to the article has that name. `favoritedBy.some.username = alice` means at least one user who favorited the article has username `alice`. These do not load the relations for the response; they decide which articles qualify."
        }),
        p({
          id: "worked-where-intro",
          body: "For our sample request, if the viewer id is `42`, the query builder produces a shape like this. Inspect how the outer `AND` combines the base author rule with tag filtering."
        }),
        codeBlock({
          id: "worked-where",
          language: "ts",
          code: `{
  AND: [
    {
      author: {
        OR: [
          { demo: { equals: true } },
          { id: { equals: 42 } }
        ],
        AND: [
          { username: { equals: "alice" } }
        ]
      }
    },
    {
      tagList: {
        some: {
          name: "prisma"
        }
      }
    }
  ]
}`
        }),
        p({
          id: "worked-where-readout",
          body: "An article passes this only if its author is visible to this viewer, its author username is `alice`, and one of its tags is `prisma`. The filters are not independent searches whose results are merged later; they are one combined predicate."
        })
      ]
    }),
    section({
      id: "page-and-shape",
      title: "Page the Rows and Shape the Response",
      role: "instruction",
      blocks: [
        p({
          id: "pagination-intro",
          body: "After filtering, the read path orders newest first and applies offset/limit pagination. Offset means how many matching rows to skip. Limit means how many rows to take."
        }),
        codeBlock({
          id: "pagination-code",
          language: "ts",
          code: `orderBy: {
  createdAt: 'desc',
},
skip: Number(query.offset) || 0,
take: Number(query.limit) || 10,`
        }),
        p({
          id: "pagination-readout",
          body: "`Number(query.offset) || 0` and `Number(query.limit) || 10` mean missing, invalid, or zero-ish values fall back to defaults. A query with `limit=5&offset=10` asks for the third page if the client is paging in groups of five."
        }),
        p({
          id: "include-intro",
          body: "The `include` block prepares data for the mapper. This is a read concern, not a filter and not a write."
        }),
        codeBlock({
          id: "include-code",
          language: "ts",
          code: `include: {
  tagList: {
    select: {
      name: true,
    },
  },
  author: {
    select: {
      username: true,
      bio: true,
      image: true,
      followedBy: true,
    },
  },
  favoritedBy: true,
  _count: {
    select: {
      favoritedBy: true,
    },
  },
},`
        }),
        p({
          id: "include-readout",
          body: "The mapper needs tag names, author profile fields, follower data for `following`, and favorite data for `favorited` and `favoritesCount`. The `_count` selection is present, but this mapper actually calculates `favoritesCount` from `favoritedBy.length`."
        }),
        codeBlock({
          id: "mapper-code",
          language: "ts",
          code: `const articleMapper = (article: any, id?: number) => ({
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
          body: "This is where the optional viewer id matters again. The same article can be returned with `favorited: true` for one viewer and `favorited: false` for another. The row did not change; the response is personalized."
        })
      ]
    }),
    section({
      id: "prediction-practice",
      title: "Predict the Query",
      role: "practice",
      blocks: [
        p({
          id: "practice-intro",
          body: "For each request, predict the key effect before checking the readout. Keep asking: visibility first, then optional narrowing filters, then pagination and mapping."
        }),
        codeBlock({
          id: "practice-cases",
          language: "text",
          code: `Case A
  Request: GET /api/articles?tag=prisma
  Viewer: anonymous

Case B
  Request: GET /api/articles?author=alice
  Viewer: authenticated as user id 42, username brian

Case C
  Request: GET /api/articles?favorited=alice&limit=2
  Viewer: authenticated as user id 42

Case D
  Request: GET /api/articles?limit=0&offset=banana
  Viewer: anonymous`
        }),
        list({
          id: "practice-prompts",
          items: [
            "Case A: which authors are visible before the tag filter applies?",
            "Case B: what extra condition must be true before Alice's articles appear?",
            "Case C: does `articlesCount` mean all matching favorites or only the two returned articles?",
            "Case D: what `take` and `skip` values does the service use?"
          ]
        }),
        p({
          id: "practice-readout",
          body: "A sees demo-authored articles tagged `prisma`. B sees Alice's articles only if Alice is a demo user or Alice is the current user; because the viewer is Brian, ordinary non-demo Alice articles are hidden. C counts all matching visible articles favorited by Alice, while `limit=2` restricts the returned page. D falls back to `take: 10` and `skip: 0` because `0` and `NaN` lose to the `||` defaults."
        }),
        callout({
          id: "debugging-key",
          tone: "key-idea",
          title: "Debug from the outside in",
          body: "If an expected article is missing, first test visibility through the author rule, then tag/favorite filters, then pagination. Do not start by blaming `articleMapper`; the mapper shapes articles Prisma already returned."
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
          body: "The list endpoint is a good Prisma reading exercise because one request turns into several distinct ideas: relation filters decide membership, pagination decides the slice, includes decide available response data, and mappers decide API shape."
        }),
        balancedQuiz({
          id: "list-review-quiz",
          title: "List Read Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "optional-auth-purpose",
              prompt: "Why does `GET /articles` use `auth.optional` instead of `auth.required`?",
              choices: [
                { id: "a", body: "Anonymous users can read a list, while authenticated users get viewer-specific fields and visibility." },
                { id: "b", body: "Prisma cannot run `findMany` when authentication is required." },
                { id: "c", body: "Optional auth disables all author filters." },
                { id: "d", body: "The route only uses auth for writes." }
              ],
              answer: "a",
              explanation: "The endpoint is readable without a token, but a token supplies `id`, which changes base visibility and lets the mapper compute personalized booleans.",
              tags: ["express-auth", "list-reads"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "and-or-shape",
              prompt: "A request has `tag=prisma` and `favorited=alice`. How are those optional filters combined with the base author rule?",
              choices: [
                { id: "a", body: "They are pushed into an array and wrapped in Prisma `AND`, so all must match." },
                { id: "b", body: "They are wrapped in top-level `OR`, so any one match is enough." },
                { id: "c", body: "The later filter replaces the earlier filter." },
                { id: "d", body: "They are applied only after `articleMapper` runs." }
              ],
              answer: "a",
              explanation: "`getArticles` calls `buildFindAllQuery`, then uses `where: { AND: andQueries }` for both count and findMany.",
              tags: ["prisma-where", "query-builder"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "relation-some",
              prompt: "What does `tagList: { some: { name: query.tag } }` mean?",
              choices: [
                { id: "a", body: "At least one related tag attached to the article has the requested name." },
                { id: "b", body: "Every tag in the database must have the requested name." },
                { id: "c", body: "Prisma should create the tag if it is missing." },
                { id: "d", body: "The response should include only one tag." }
              ],
              answer: "a",
              explanation: "`some` is a relation filter. It tests whether at least one related row satisfies the nested condition.",
              tags: ["prisma-relations", "filters"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "count-vs-page",
              prompt: "A query has 37 matching articles and `limit=10&offset=20`. What should `articlesCount` represent?",
              choices: [
                { id: "a", body: "37, the total number of matching articles before pagination." },
                { id: "b", body: "10, the maximum number requested for this page." },
                { id: "c", body: "20, the number skipped." },
                { id: "d", body: "The number of fields included per article." }
              ],
              answer: "a",
              explanation: "The count query uses the same filters but no `skip` or `take`, so it counts the full matching set. `findMany` returns the current page.",
              tags: ["pagination", "count"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "include-role",
              prompt: "Which statement best describes the `include` object in `findMany`?",
              choices: [
                { id: "a", body: "It asks Prisma to return related data needed by the mapper." },
                { id: "b", body: "It decides which articles pass the tag and author filters." },
                { id: "c", body: "It changes the database by connecting tags." },
                { id: "d", body: "It converts query params from strings to numbers." }
              ],
              answer: "a",
              explanation: "Filtering happens in `where`. Pagination happens in `skip` and `take`. `include` controls which relations come back with each returned article.",
              tags: ["prisma-include", "mapping"],
              difficulty: "medium"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Given a URL, write the rough Prisma `where` predicate before reading the code.",
            "Explain why `articlesCount` can be larger than `articles.length`.",
            "Name one field in the response that depends on the viewer id, not only on the article row."
          ]
        })
      ]
    })
  ]
});
