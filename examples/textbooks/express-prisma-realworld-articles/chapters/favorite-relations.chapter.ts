import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "favorite-relations",
  title: "Favoriting Articles With Relation Updates",
  description: "Explain favorite and unfavorite as many-to-many relation updates using Prisma connect and disconnect.",
  role: "instruction",
  sections: [
    section({
      id: "favorite-as-relation",
      title: "Favorite Is a Relation",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can trace `POST /api/articles/:slug/favorite` and `DELETE /api/articles/:slug/favorite`, and explain how Prisma `connect` and `disconnect` change a many-to-many relation."
        }),
        p({
          id: "not-a-boolean-column",
          body: "It is natural to imagine an article has a `favorited: true` column. This codebase does not store favorites that way. A favorite is membership in a relationship: this user is connected to this article as one of the users who favorited it."
        }),
        callout({
          id: "predict",
          tone: "note",
          title: "Pause and predict",
          body: "If user `42` favorites article `hello-world`, which record should change: the `Article` row, the `User` row, or the relation between them? Keep that answer in mind."
        }),
        p({
          id: "schema-intro",
          body: "The schema gives the clue. Inspect the two sides of the same many-to-many relation."
        }),
        codeBlock({
          id: "schema-code",
          language: "prisma",
          code: `model Article {
  id          Int    @id @default(autoincrement())
  slug        String @unique
  title       String
  favoritedBy User[] @relation("UserFavorites")
}

model User {
  id        Int       @id @default(autoincrement())
  username  String    @unique
  favorites Article[] @relation("UserFavorites")
}`
        }),
        p({
          id: "schema-readout",
          body: "The answer to the prediction is the relation between them. From the article side, the relation is called `favoritedBy`: users who have favorited this article. From the user side, the same relation is called `favorites`: articles this user has favorited."
        }),
        diagram({
          id: "favorite-relation-diagram",
          title: "Favorite Relation State",
          body: `flowchart LR
  U["User 42"] -- "connect on favorite" --> A["Article hello-world"]
  U -. "disconnect on unfavorite" .-> A
  A --> B["favoritedBy includes User 42?"]
  U --> C["favorites includes Article?"]`
        })
      ],
      subsections: [
        subsection({
          id: "response-vs-storage",
          title: "Stored Relation, Computed Response",
          blocks: [
            p({
              id: "computed-response",
              body: "The API response still has `favorited` and `favoritesCount`, but those are computed from relation data returned by Prisma. The relation is stored; the boolean and count are response conveniences."
            }),
            list({
              id: "three-views",
              items: [
                "Database idea: a user/article favorite relation exists or does not exist.",
                "Prisma idea: `favoritedBy.connect` adds that relation, `favoritedBy.disconnect` removes it.",
                "API idea: `favorited` and `favoritesCount` summarize that relation for the current viewer."
              ]
            })
          ]
        })
      ]
    }),
    section({
      id: "routes",
      title: "Two Routes, One Toggle",
      role: "instruction",
      blocks: [
        p({
          id: "routes-intro",
          body: "The controller uses the same URL shape for both actions. The HTTP method tells you whether the relation should be added or removed."
        }),
        codeBlock({
          id: "routes-code",
          language: "ts",
          code: `// src/app/routes/article/article.controller.ts
router.post(
  '/articles/:slug/favorite',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await favoriteArticle(req.params.slug, req.auth?.user?.id);
      res.json({ article });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
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
        p({
          id: "routes-readout",
          body: "`auth.required` matters because the service needs a current user id to add or remove from `favoritedBy`. The slug identifies the article; the token identifies the user; Prisma changes the relation."
        }),
        callout({
          id: "same-path",
          tone: "key-idea",
          title: "Same path, opposite relation update",
          body: "`POST /favorite` and `DELETE /favorite` are not two unrelated endpoints. They are two directions of the same relation membership toggle."
        })
      ]
    }),
    section({
      id: "connect",
      title: "Favorite Uses `connect`",
      role: "instruction",
      blocks: [
        p({
          id: "connect-intro",
          body: "Read `favoriteArticle` in two halves. First, Prisma updates the article relation. Second, the service reshapes the updated article into the API response."
        }),
        codeBlock({
          id: "connect-code",
          language: "ts",
          code: `export const favoriteArticle = async (slugPayload: string, id: number) => {
  const { _count, ...article } = await prisma.article.update({
    where: {
      slug: slugPayload,
    },
    data: {
      favoritedBy: {
        connect: {
          id: id,
        },
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
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });`
        }),
        p({
          id: "connect-readout",
          body: "`where.slug` chooses the article. `favoritedBy.connect.id` says: add the current user to this article's favorited-by users. Prisma handles the many-to-many join details; the service describes the relation change in object form."
        }),
        p({
          id: "include-intro",
          body: "The include block is not decoration. The service needs the updated favorite relation and count immediately after the write."
        }),
        codeBlock({
          id: "favorite-result-code",
          language: "ts",
          code: `const result = {
  ...article,
  author: profileMapper(article.author, id),
  tagList: article?.tagList.map((tag: Tag) => tag.name),
  favorited: article.favoritedBy.some((favorited: any) => favorited.id === id),
  favoritesCount: _count?.favoritedBy,
};

return result;`
        }),
        p({
          id: "favorite-result-readout",
          body: "After a successful favorite, the returned `favoritedBy` list should include the current user, so `favorited` becomes true. The count comes from Prisma's `_count.favoritedBy`, not from a separate manual count query."
        })
      ]
    }),
    section({
      id: "disconnect",
      title: "Unfavorite Uses `disconnect`",
      role: "instruction",
      blocks: [
        p({
          id: "disconnect-intro",
          body: "Unfavorite is the mirror image. It does not delete the user. It does not delete the article. It removes the relation between them."
        }),
        codeBlock({
          id: "disconnect-code",
          language: "ts",
          code: `export const unfavoriteArticle = async (slugPayload: string, id: number) => {
  const { _count, ...article } = await prisma.article.update({
    where: {
      slug: slugPayload,
    },
    data: {
      favoritedBy: {
        disconnect: {
          id: id,
        },
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
      _count: {
        select: {
          favoritedBy: true,
        },
      },
    },
  });`
        }),
        p({
          id: "disconnect-readout",
          body: "`disconnect` means the article should no longer list this user in `favoritedBy`. The returned mapper logic can stay almost identical: inspect the updated relation and compute `favorited` and `favoritesCount` from it."
        }),
        codeBlock({
          id: "state-table",
          language: "text",
          code: `Starting state
  Article hello-world favoritedBy: [User 7, User 42]

POST /api/articles/hello-world/favorite as User 42
  Relation operation: connect User 42
  Expected response: favorited true, favoritesCount still 2 if the relation already existed

DELETE /api/articles/hello-world/favorite as User 42
  Relation operation: disconnect User 42
  New state: Article hello-world favoritedBy: [User 7]
  Expected response: favorited false, favoritesCount 1`
        }),
        callout({
          id: "idempotence-boundary",
          tone: "caution",
          title: "Check idempotence instead of assuming it",
          body: "The code describes relation operations and lets Prisma enforce the details. If you need repeated favorite/unfavorite clicks to be harmless in production, verify Prisma's behavior for duplicate connect or missing disconnect with this schema and database."
        })
      ]
    }),
    section({
      id: "diagnose",
      title: "Predict the Relation State",
      role: "practice",
      blocks: [
        p({
          id: "practice-intro",
          body: "Use relation state, not API labels, to predict each case. Draw the connection between the user and article before and after the request."
        }),
        codeBlock({
          id: "practice-cases",
          language: "text",
          code: `World
  User 42: Brianna
  User 7: Lee
  Article A slug: prisma-tour
  Article A favoritedBy: [Lee]

Case A
  Brianna sends POST /api/articles/prisma-tour/favorite

Case B
  Brianna sends DELETE /api/articles/prisma-tour/favorite after Case A

Case C
  Anonymous client sends POST /api/articles/prisma-tour/favorite

Case D
  Brianna sends POST /api/articles/missing-slug/favorite`
        }),
        list({
          id: "case-prompts",
          items: [
            "Case A: what relation is added, and what should `favorited` be for Brianna?",
            "Case B: what relation is removed, and what should `favoritesCount` do?",
            "Case C: which layer should stop the request before Prisma sees it?",
            "Case D: which Prisma operation cannot find its target?"
          ]
        }),
        p({
          id: "case-readout",
          body: "A connects Brianna to Article A, so `favorited` is true for her and the count increases from Lee-only to Lee-plus-Brianna. B disconnects Brianna, so the count drops and `favorited` becomes false. C fails at `auth.required`. D reaches the service but `prisma.article.update({ where: { slug } })` has no article row to update."
        }),
        callout({
          id: "debug-key",
          tone: "key-idea",
          title: "Debugging shortcut",
          body: "If `favorited` and `favoritesCount` look wrong, inspect whether the write changed `favoritedBy`, whether `favoritedBy` was included in the returned article, and whether the mapper received the current viewer id."
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
          body: "At this point, you can read a surprising amount of Prisma service code by asking one question: is this changing scalar fields, or changing relation membership?"
        }),
        balancedQuiz({
          id: "favorite-review-quiz",
          title: "Favorite Relation Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "stored-shape",
              prompt: "In this schema, what is a favorite?",
              choices: [
                { id: "a", body: "A many-to-many relation between `User` and `Article` through `UserFavorites`." },
                { id: "b", body: "A boolean column stored directly on `Article`." },
                { id: "c", body: "A tag named `favorite` connected to the article." },
                { id: "d", body: "A comment created by the current user." }
              ],
              answer: "a",
              explanation: "`Article.favoritedBy` and `User.favorites` are two sides of the same named many-to-many relation.",
              tags: ["prisma-relations"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "connect-meaning",
              prompt: "What does `favoritedBy: { connect: { id } }` do in `favoriteArticle`?",
              choices: [
                { id: "a", body: "It connects the current user to the article's `favoritedBy` relation." },
                { id: "b", body: "It changes the article author's id to the current user." },
                { id: "c", body: "It creates a new article with the same slug." },
                { id: "d", body: "It loads favorited users without changing anything." }
              ],
              answer: "a",
              explanation: "`connect` changes relation membership. The target article is selected by slug, and the related user is selected by id.",
              tags: ["connect", "favorite"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "disconnect-meaning",
              prompt: "What should `disconnect` remove during unfavorite?",
              choices: [
                { id: "a", body: "Only the relation between this user and this article." },
                { id: "b", body: "The `User` row." },
                { id: "c", body: "The `Article` row." },
                { id: "d", body: "Every user's favorite relation to this article." }
              ],
              answer: "a",
              explanation: "`disconnect` removes a relationship edge. It does not delete either record at the ends of that edge.",
              tags: ["disconnect", "favorite"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "favorites-count",
              prompt: "Where does this service get `favoritesCount` after favorite/unfavorite?",
              choices: [
                { id: "a", body: "From `_count.favoritedBy` returned by Prisma's include." },
                { id: "b", body: "From `article.favoritedBy.length`, through `articleMapper`." },
                { id: "c", body: "From a separate `prisma.article.count` query." },
                { id: "d", body: "From the request body." }
              ],
              answer: "a",
              explanation: "Unlike `articleMapper`, these two service functions manually build `result` and use `_count?.favoritedBy` for `favoritesCount`.",
              tags: ["response-mapping"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "auth-required",
              prompt: "Why do both favorite routes require auth?",
              choices: [
                { id: "a", body: "The relation update needs a current user id to connect or disconnect." },
                { id: "b", body: "The route needs the current user to be the article author." },
                { id: "c", body: "Prisma relation updates cannot run on public routes." },
                { id: "d", body: "The favorite slug is stored in the token." }
              ],
              answer: "a",
              explanation: "Favoriting is a viewer action, not an author-only action. The service needs to know which user is adding or removing their favorite relation.",
              tags: ["auth", "relations"],
              difficulty: "easy"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Explain the favorite path without saying \"boolean column.\"",
            "Trace the two endpoints as opposite relation operations: `connect` and `disconnect`.",
            "Name the returned relation data needed to compute `favorited` and `favoritesCount`."
          ]
        })
      ]
    })
  ]
});
