import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "update-article-ownership",
  title: "Updating Articles and Checking Ownership",
  description: "Follow an article update through slug lookup, ownership checks, conditional field changes, tag replacement, and mapped output.",
  role: "instruction",
  sections: [
    section({
      id: "what-changes-after-create",
      title: "What Changes After Create",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can trace `PUT /api/articles/:slug` and explain why the service checks article ownership before it builds the Prisma update."
        }),
        p({
          id: "from-create-to-update",
          body: "Publishing was a straight path: the authenticated user created a new article, so the service could attach that user as the author. Updating is different. The article already exists. The slug in the URL tells us which article the client wants to edit, but it does not prove the current user owns that article."
        }),
        callout({
          id: "predict-ownership",
          tone: "note",
          title: "Pause and predict",
          body: "Suppose user `42` sends a valid token and calls `PUT /api/articles/someone-elses-post-7`. Which fact is still missing after authentication succeeds? Keep that answer in mind."
        }),
        p({
          id: "request-intro",
          body: "Here is the update request we will follow. Inspect the two identifiers: one comes from the URL, the other from the token."
        }),
        codeBlock({
          id: "update-request",
          language: "text",
          code: `PUT /api/articles/Prisma-From-the-Route-Handler-42
Authorization: Token <jwt whose payload is { user: { id: 42 } }>
Content-Type: application/json

{
  "article": {
    "title": "Prisma From the Service Layer",
    "description": "The same article, renamed",
    "tagList": ["express", "authorization"]
  }
}`
        }),
        p({
          id: "request-readout",
          body: "`req.params.slug` selects the existing article. `req.auth.user.id` identifies the current user. The service's central job is to prove those two facts are compatible before it writes anything."
        }),
        p({
          id: "route-intro",
          body: "The controller is still a handoff layer. It does not ask Prisma who owns the article; it passes both pieces of evidence into the service."
        }),
        codeBlock({
          id: "put-route",
          language: "ts",
          code: `// src/app/routes/article/article.controller.ts
router.put(
  '/articles/:slug',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await updateArticle(req.body.article, req.params.slug, req.auth?.user?.id);
      res.json({ article });
    } catch (error) {
      next(error);
    }
  },
);`
        }),
        p({
          id: "route-readout",
          body: "`auth.required` answers only one question: is this request from a user with a valid token? It does not answer: is this user the author of the article named by the slug? That second question needs a database lookup."
        }),
        diagram({
          id: "update-decision-flow",
          title: "Update Decision Flow",
          body: `flowchart TD
  A["PUT /api/articles/:slug"] --> B["auth.required verifies token"]
  B --> C["Controller passes body, slug, user id"]
  C --> D["Service loads article author by slug"]
  D --> E{Article exists?}
  E -- "no" --> F["404"]
  E -- "yes" --> G{Author id equals user id?}
  G -- "no" --> H["403"]
  G -- "yes" --> I{Title changes slug?}
  I -- "duplicate slug" --> J["422"]
  I -- "ok or no title" --> K["Disconnect old tags"]
  K --> L["Prisma article.update"]
  L --> M["Mapped article response"]`
        })
      ],
      subsections: [
        subsection({
          id: "authentication-vs-authorization",
          title: "Authentication Is Not Ownership",
          blocks: [
            p({
              id: "distinction",
              body: "The missing fact in the prediction is ownership. Authentication says, \"I know which user made this request.\" Authorization says, \"This user is allowed to perform this action on this object.\" The service has to authorize the update because only the database can connect the slug to the article's author."
            }),
            list({
              id: "distinction-checks",
              items: [
                "If the token is missing, the request should fail before `updateArticle` runs.",
                "If the token is valid but the slug belongs to another author, `updateArticle` should throw `403`.",
                "If the slug does not match any article, `updateArticle` should throw `404` before checking ownership."
              ]
            })
          ]
        })
      ]
    }),
    section({
      id: "service-guards",
      title: "The Service Guards the Write",
      role: "instruction",
      blocks: [
        p({
          id: "guard-intro",
          body: "Read the first half of `updateArticle` as a sequence of exits. Each exit prevents the later Prisma write from running under the wrong conditions."
        }),
        codeBlock({
          id: "ownership-code",
          language: "ts",
          code: `// src/app/routes/article/article.service.ts
export const updateArticle = async (article: any, slug: string, id: number) => {
  let newSlug = null;

  const existingArticle = await await prisma.article.findFirst({
    where: { slug },
    select: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!existingArticle) {
    throw new HttpException(404, {});
  }

  if (existingArticle.author.id !== id) {
    throw new HttpException(403, {
      message: 'You are not authorized to update this article',
    });
  }`
        }),
        p({
          id: "guard-readout",
          body: "The query selects only the author information needed for the decision. If there is no article for that slug, the user gets `404`. If the article exists but belongs to a different user, the user gets `403`. Only the owner reaches the code that computes the update."
        }),
        callout({
          id: "why-service",
          tone: "key-idea",
          title: "Why this belongs in the service",
          body: "The controller sees the current user id and the slug string, but the service owns the business rule: only the article's author may update it. Keeping that rule near the Prisma lookup makes it reusable and keeps the HTTP handler from becoming a pile of database decisions."
        }),
        p({
          id: "slug-intro",
          body: "If the owner changes the title, the public identifier may change too. The service computes the possible new slug and checks whether it would collide with an existing article."
        }),
        codeBlock({
          id: "slug-update-code",
          language: "ts",
          code: `if (article.title) {
  newSlug = \`\${slugify(article.title)}-\${id}\`;

  if (newSlug !== slug) {
    const existingTitle = await prisma.article.findFirst({
      where: { slug: newSlug },
      select: { slug: true },
    });

    if (existingTitle) {
      throw new HttpException(422, { errors: { title: ['must be unique'] } });
    }
  }
}`
        }),
        p({
          id: "slug-readout",
          body: "There are two small protections here. If the title is omitted, the slug stays untouched. If the computed slug is the same as the current slug, the service does not reject the update merely because it found itself."
        })
      ]
    }),
    section({
      id: "partial-update",
      title: "Partial Updates and Tags",
      role: "instruction",
      blocks: [
        p({
          id: "partial-intro",
          body: "The Prisma update is built from conditional object spreads. This is a TypeScript pattern you probably know already, but here it has API meaning: omitted fields are left alone."
        }),
        codeBlock({
          id: "partial-update-code",
          language: "ts",
          code: `const updatedArticle = await prisma.article.update({
  where: { slug },
  data: {
    ...(article.title ? { title: article.title } : {}),
    ...(article.body ? { body: article.body } : {}),
    ...(article.description ? { description: article.description } : {}),
    ...(newSlug ? { slug: newSlug } : {}),
    updatedAt: new Date(),
    tagList: {
      connectOrCreate: tagList,
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
          id: "partial-readout",
          body: "If the request sends only `description`, the service does not set `title` or `body` to `undefined`; it simply omits those keys from `data`. `updatedAt` always changes. `include` has the same role it had in publishing: ask Prisma to return enough related data for `articleMapper`."
        }),
        p({
          id: "tag-intro",
          body: "Tags are the surprising part. The code does not append new tags to the old set. It first removes every current tag connection, then connects or creates the submitted list."
        }),
        codeBlock({
          id: "tag-replacement-code",
          language: "ts",
          code: `const disconnectArticlesTags = async (slug: string) => {
  await prisma.article.update({
    where: { slug },
    data: {
      tagList: {
        set: [],
      },
    },
  });
};

const tagList =
  Array.isArray(article.tagList) && article.tagList?.length
    ? article.tagList.map((tag: string) => ({
        create: { name: tag },
        where: { name: tag },
      }))
    : [];

await disconnectArticlesTags(slug);`
        }),
        p({
          id: "tag-readout",
          body: "`set: []` clears the many-to-many connections for this article. Then `connectOrCreate` builds the new set. If `tagList` is omitted, not an array, or an empty array, the prepared `tagList` is `[]`, so the article ends with no tags after the disconnect."
        }),
        callout({
          id: "tag-trap",
          tone: "caution",
          title: "Boundary to notice",
          body: "The field behavior is not uniform. Omitting `description` leaves the old description alone, but omitting `tagList` clears the old tags because `disconnectArticlesTags(slug)` always runs. That may match the intended API, but it is exactly the kind of detail you should verify when reading service code."
        })
      ]
    }),
    section({
      id: "worked-cases",
      title: "Four Cases to Predict",
      role: "practice",
      blocks: [
        p({
          id: "cases-intro",
          body: "Use the decision flow to predict each result. The point is to locate the first layer that has enough information to decide."
        }),
        codeBlock({
          id: "case-table",
          language: "text",
          code: `Case A
  Token: none
  Request: PUT /api/articles/Prisma-From-the-Route-Handler-42
  Body: { "article": { "description": "Renamed" } }

Case B
  Token user id: 99
  Existing article slug: Prisma-From-the-Route-Handler-42
  Existing article author id: 42
  Body: { "article": { "description": "Renamed" } }

Case C
  Token user id: 42
  Existing article slug: Prisma-From-the-Route-Handler-42
  Existing article author id: 42
  Body: { "article": { "description": "Renamed" } }

Case D
  Token user id: 42
  Existing article slug: Prisma-From-the-Route-Handler-42
  Existing article author id: 42
  Body: { "article": { "title": "A Title That Already Exists" } }
  Computed slug already exists: A-Title-That-Already-Exists-42`
        }),
        list({
          id: "case-prompts",
          items: [
            "Case A: name the middleware that stops the request before `updateArticle`.",
            "Case B: name the service guard that throws and the HTTP status.",
            "Case C: list which fields change and which stay the same.",
            "Case D: explain why the service rejects the update before `prisma.article.update`."
          ]
        }),
        p({
          id: "case-readout",
          body: "A is an authentication failure. B is an authorization failure. C succeeds: `description` changes, `updatedAt` changes, old tags are cleared unless a new `tagList` is supplied, and title/body/slug stay the same. D fails with a title uniqueness `422` because the title would create a duplicate slug."
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
          body: "A good mental model of this route is not \"PUT updates a row.\" It is: authenticate the caller, load the row's owner, authorize the action, compute the allowed patch, replace tag connections, update the row, then map the response."
        }),
        balancedQuiz({
          id: "update-review-quiz",
          title: "Update Path Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "auth-vs-owner",
              prompt: "A valid token reaches `PUT /api/articles/:slug`. What does the service still need to verify before updating?",
              choices: [
                { id: "a", body: "That the article selected by the slug was authored by the current user." },
                { id: "b", body: "That the request body contains every article field." },
                { id: "c", body: "That the JWT was signed with Prisma's secret." },
                { id: "d", body: "That the slug contains the user's id as text." }
              ],
              answer: "a",
              explanation: "Authentication identifies the caller. Authorization for this action requires a database fact: the article's author id must match the caller's id.",
              tags: ["authorization", "service-guards"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "why-select-author",
              prompt: "Why does the first Prisma query in `updateArticle` select `author.id`?",
              choices: [
                { id: "a", body: "The service needs just enough data to compare ownership before writing." },
                { id: "b", body: "Prisma requires author usernames for every update." },
                { id: "c", body: "The controller forgot to pass the current user id." },
                { id: "d", body: "The mapper cannot run unless the pre-check loads the full article." }
              ],
              answer: "a",
              explanation: "The first query is a guard query. It does not need the full article; it needs to know whether the article exists and who owns it.",
              tags: ["prisma-select", "authorization"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "omitted-description",
              prompt: "An owner sends `{ article: { body: 'New body' } }`. What happens to the old description?",
              choices: [
                { id: "a", body: "It stays unchanged because the spread for `description` is omitted." },
                { id: "b", body: "It becomes `null` because `description` was absent." },
                { id: "c", body: "It becomes an empty string because update routes clear missing fields." },
                { id: "d", body: "The request fails because every field is required on update." }
              ],
              answer: "a",
              explanation: "The update data object includes `description` only when `article.description` is truthy. Omitted scalar fields are not written.",
              tags: ["partial-update"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "omitted-tags",
              prompt: "An owner updates only the body and omits `tagList`. Based on this service code, what happens to existing tag connections?",
              choices: [
                { id: "a", body: "They are cleared because `disconnectArticlesTags(slug)` always runs and the prepared tag list is empty." },
                { id: "b", body: "They stay unchanged for the same reason omitted scalar fields stay unchanged." },
                { id: "c", body: "They are duplicated because `connectOrCreate` appends the old list again." },
                { id: "d", body: "The update fails because Prisma requires a non-empty many-to-many relation." }
              ],
              answer: "a",
              explanation: "Tags are handled differently from scalar fields. The helper first sets the relation to an empty list, then the update reconnects only submitted tags.",
              tags: ["prisma-relations", "tag-replacement"],
              difficulty: "hard"
            },
            {
              kind: "multiple-choice",
              id: "same-title-slug",
              prompt: "Why does the service check `if (newSlug !== slug)` before looking for an existing title slug?",
              choices: [
                { id: "a", body: "So an article can keep its current title without detecting itself as a duplicate." },
                { id: "b", body: "So Prisma will lowercase the slug automatically." },
                { id: "c", body: "So non-owners can update titles but not descriptions." },
                { id: "d", body: "So the route can skip `auth.required` when the title is unchanged." }
              ],
              answer: "a",
              explanation: "If the computed slug equals the current slug, the article is not trying to claim a new public identifier. A duplicate lookup would risk confusing the existing article with a real collision.",
              tags: ["slug", "service-validation"],
              difficulty: "medium"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Trace the four exits in order: auth middleware, missing article, wrong owner, duplicate new slug.",
            "Explain why `auth.required` is necessary but insufficient for update.",
            "Point to one update behavior that is scalar-field-like and one that is relation-like."
          ]
        })
      ]
    })
  ]
});
