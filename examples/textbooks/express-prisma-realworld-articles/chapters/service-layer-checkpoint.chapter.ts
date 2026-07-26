import { balancedQuiz, callout, chapter, codeBlock, list, p, section } from "tutor-kit";

export default chapter({
  id: "service-layer-checkpoint",
  title: "Predict the Service Layer",
  description: "Use the article feature patterns you have learned to predict the route, service, Prisma, and response shape for a new feature.",
  role: "cumulative-checkpoint",
  sections: [
    section({
      id: "checkpoint-frame",
      title: "Checkpoint: Reconstruct Before Reading",
      role: "practice",
      blocks: [
        p({
          id: "outcome",
          body: "This checkpoint asks you to predict a new article feature from the patterns you have already studied. By the end, you should be able to sketch the Express route, service inputs, Prisma operations, and response shape before reading an implementation."
        }),
        p({
          id: "no-new-mechanism",
          body: "There is no new central mechanism here. The point is to recognize which existing pattern applies: authenticated mutation, optional-auth read, ownership check, relation `connect`, relation `disconnect`, filtered list, or mapper-shaped response."
        }),
        callout({
          id: "prediction-rule",
          tone: "key-idea",
          title: "Prediction rule",
          body: "When you see a new endpoint, first classify the request. Is it reading rows, creating a row, updating ownership-sensitive data, or toggling a relation? The classification usually tells you what the controller and Prisma call should look like."
        }),
        codeBlock({
          id: "pattern-table",
          language: "text",
          code: `Request shape                         Pattern in this codebase
POST /articles                         auth.required -> validate -> create row -> connect author/tags -> mapper
PUT /articles/:slug                    auth.required -> find owner -> reject wrong owner -> update -> mapper
GET /articles                          auth.optional -> build AND filters -> count + findMany -> mapper
GET /articles/feed                     auth.required -> followed authors filter -> count + findMany -> mapper
POST /articles/:slug/favorite          auth.required -> update relation with connect -> compute response flags
DELETE /articles/:slug/favorite        auth.required -> update relation with disconnect -> compute response flags
POST /articles/:slug/comments          auth.required -> validate body -> connect article + author -> response object
DELETE /articles/:slug/comments/:id    auth.required -> lookup by id + owner -> delete`
        }),
        p({
          id: "readout",
          body: "The controller usually stays thin: it extracts route params, body fields, query params, and the authenticated user id, then delegates. The service decides validation, ownership, Prisma `where` and `data` shapes, includes, and mapping."
        })
      ]
    }),
    section({
      id: "feature-drill",
      title: "Design Drill: Report an Article",
      role: "practice",
      blocks: [
        p({
          id: "scenario",
          body: "Imagine the product adds an authenticated feature: a signed-in user can report an article with a short reason. The API should accept `POST /api/articles/:slug/report` with `{ \"report\": { \"reason\": \"spam\" } }`."
        }),
        p({
          id: "schema-assumption",
          body: "Assume the schema gets a new `Report` model with required relations to `Article` and `User`. Do not worry about migrations here; focus on how the existing codebase would shape the route and service."
        }),
        codeBlock({
          id: "report-schema",
          language: "prisma",
          code: `model Report {
  id         Int      @id @default(autoincrement())
  createdAt  DateTime @default(now())
  reason     String
  article    Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId  Int
  reporter   User     @relation(fields: [reporterId], references: [id], onDelete: Cascade)
  reporterId Int
}`
        }),
        list({
          id: "worksheet",
          items: [
            "Route: should it use `auth.required` or `auth.optional`?",
            "Controller inputs: which values come from `req.params`, `req.body`, and `req.auth`?",
            "Validation: which missing field should be rejected before Prisma?",
            "Article lookup: should the service find the article by `slug`, or create a report using the slug directly?",
            "Prisma write: which two parents should the new report `connect`?",
            "Response: should the API return raw foreign keys, or a shaped object like the comment response?"
          ]
        }),
        callout({
          id: "pause-before-answer",
          tone: "note",
          title: "Pause and sketch",
          body: "Before you read the answer, write the service signature and the `prisma.report.create` data object. You should be able to borrow the shape from `addComment` almost directly."
        })
      ]
    }),
    section({
      id: "worked-solution",
      title: "Worked Prediction",
      role: "practice",
      blocks: [
        p({
          id: "route-answer",
          body: "The route should require authentication because a report belongs to the current user. The slug identifies the article; the token identifies the reporter; the request body supplies the reason."
        }),
        codeBlock({
          id: "report-route",
          language: "ts",
          code: `router.post(
  '/articles/:slug/report',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await reportArticle(
        req.body.report.reason,
        req.params.slug,
        req.auth?.user?.id,
      );
      res.status(201).json({ report });
    } catch (error) {
      next(error);
    }
  },
);`
        }),
        p({
          id: "service-answer",
          body: "The service resembles `addComment`: validate body data, find the article id from the slug, then create a child record connected to the article and current user."
        }),
        codeBlock({
          id: "report-service",
          language: "ts",
          code: `export const reportArticle = async (reason: string, slug: string, id: number) => {
  if (!reason) {
    throw new HttpException(422, { errors: { reason: ["can't be blank"] } });
  }

  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!article) {
    throw new HttpException(404, { errors: { article: ["not found"] } });
  }

  const report = await prisma.report.create({
    data: {
      reason,
      article: {
        connect: { id: article.id },
      },
      reporter: {
        connect: { id },
      },
    },
  });

  return {
    id: report.id,
    reason: report.reason,
    createdAt: report.createdAt,
  };
};`
        }),
        p({
          id: "difference-from-comment",
          body: "This prediction intentionally adds an explicit missing-article `404`. That is a small service-quality improvement over the current `addComment` boundary, where `article?.id` can defer the missing slug failure to Prisma."
        }),
        callout({
          id: "classifier",
          tone: "key-idea",
          title: "How to classify it",
          body: "`reportArticle` is not a list path, not a many-to-many toggle, and not an ownership-sensitive update. It is a child-row create with two required parents, so `addComment` is the closest source pattern."
        })
      ]
    }),
    section({
      id: "source-pattern-retrospective",
      title: "Source Pattern Retrospective",
      role: "review",
      blocks: [
        p({
          id: "retrospective-intro",
          body: "Use this checklist when you meet another Express + Prisma service in this repository. It keeps you from trying to understand every line at once."
        }),
        list({
          id: "retrospective-checklist",
          items: [
            "Find the controller route first, then name the request inputs.",
            "Classify auth as required, optional, or absent.",
            "Separate Prisma filters in `where` from response data in `include` or `select`.",
            "For writes, identify whether the service creates a row, changes scalar fields, or changes a relation.",
            "For destructive actions, look for an ownership predicate before the delete or update.",
            "After Prisma returns, inspect whether a mapper computes API-only fields like `favorited`, `favoritesCount`, or `following`."
          ]
        }),
        codeBlock({
          id: "mental-model",
          language: "text",
          code: `Express route       answers: how does this HTTP request enter the app?
Auth middleware      answers: is there a trusted current user id?
Service function     answers: what business rule is enforced before Prisma?
Prisma where/data    answers: which rows qualify, and what relation/scalar change happens?
Include/select       answers: what extra data is needed for the response?
Mapper/manual shape  answers: what API contract does the client receive?`
        })
      ]
    }),
    section({
      id: "cumulative-assessment",
      title: "Cumulative Assessment",
      role: "assessment",
      blocks: [
        p({
          id: "assessment-intro",
          body: "Answer these without looking back first. The goal is not memorizing snippets; it is recognizing the service pattern from the route and Prisma shape."
        }),
        balancedQuiz({
          id: "service-layer-practice-test",
          title: "Article Service Layer Practice Test",
          mode: "practice-test",
          questions: [
            {
              kind: "multiple-choice",
              id: "report-auth",
              prompt: "A new `POST /articles/:slug/report` endpoint creates a report owned by the current user. Which auth middleware best matches the existing article route patterns?",
              choices: [
                { id: "a", body: "`auth.required`, because the service needs a trusted user id for the reporter relation." },
                { id: "b", body: "`auth.optional`, because the route has a slug." },
                { id: "c", body: "No auth, because Prisma can infer the user from the article." },
                { id: "d", body: "`auth.optional`, then create the report only for demo users." }
              ],
              answer: "a",
              explanation: "Creating user-owned rows follows the create article, favorite, and comment-create pattern: the service needs `req.auth.user.id`.",
              tags: ["routing-auth", "service-design"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "child-row-connects",
              prompt: "For a child record like a comment or report, what should Prisma usually connect during creation?",
              choices: [
                { id: "a", body: "The target article from the slug and the current user from auth." },
                { id: "b", body: "The tag list and every follower of the article author." },
                { id: "c", body: "Only the slug string, because relations are optional." },
                { id: "d", body: "Only the current user, because Prisma automatically finds the article." }
              ],
              answer: "a",
              explanation: "The comment path shows the pattern: find the article id by slug, then connect both `article` and `author` or reporter.",
              tags: ["prisma-relations", "comments"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "wrong-owner-delete",
              prompt: "In the current `deleteComment` implementation, a comment exists but belongs to another user. What happens for the current user?",
              choices: [
                { id: "a", body: "The lookup returns null and the service throws `404`." },
                { id: "b", body: "The later comparison throws `403`." },
                { id: "c", body: "The comment is deleted if the article slug matches." },
                { id: "d", body: "The service updates the comment's author before deleting it." }
              ],
              answer: "a",
              explanation: "`findFirst` searches by both comment id and `author.id`, so wrong-owner comments are not found.",
              tags: ["ownership", "comments"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "feed-tag-filter",
              prompt: "A client calls `GET /articles/feed?tag=prisma`. Based on the current feed service, what does the `tag` query do?",
              choices: [
                { id: "a", body: "Nothing; the feed service only uses followed authors plus offset and limit." },
                { id: "b", body: "It filters feed articles by tag with `tagList.some.name`." },
                { id: "c", body: "It changes the route to `GET /articles`." },
                { id: "d", body: "It filters the viewer's following list by tag." }
              ],
              answer: "a",
              explanation: "`getFeed` receives offset, limit, and user id, then filters articles whose authors are followed by the user. It does not call the list query builder.",
              tags: ["feed", "listing"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "count-before-pagination",
              prompt: "Why can `articlesCount` be larger than the number of articles returned in `GET /articles`?",
              choices: [
                { id: "a", body: "`count` uses the filters before pagination, while `findMany` also applies `skip` and `take`." },
                { id: "b", body: "`count` counts tags, not articles." },
                { id: "c", body: "`articlesCount` is copied from `favoritesCount`." },
                { id: "d", body: "`findMany` intentionally drops every non-demo article after mapping." }
              ],
              answer: "a",
              explanation: "The list path uses the same `where` for count and findMany, but only findMany applies pagination.",
              tags: ["listing", "pagination"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "update-taglist",
              prompt: "In `updateArticle`, what happens to existing tags when the request omits `tagList` or passes an empty array?",
              choices: [
                { id: "a", body: "Existing tags are disconnected because the service clears tags before applying the new list." },
                { id: "b", body: "Existing tags stay unchanged because omitted fields are ignored." },
                { id: "c", body: "The service deletes every tag row from the database." },
                { id: "d", body: "Prisma rejects the request because `tagList` is required." }
              ],
              answer: "a",
              explanation: "The scalar fields are conditionally spread, but the service calls `disconnectArticlesTags(slug)` and then connects the provided tag list, which is empty if absent.",
              tags: ["article-update", "prisma-relations"],
              difficulty: "hard"
            },
            {
              kind: "multiple-choice",
              id: "favorite-storage",
              prompt: "Where is an article favorite stored in this Prisma model?",
              choices: [
                { id: "a", body: "As membership in the many-to-many relation between `User` and `Article`." },
                { id: "b", body: "As a boolean column named `favorited` on `Article`." },
                { id: "c", body: "As a count column named `favoritesCount` on `User`." },
                { id: "d", body: "As a string inside `tagList`." }
              ],
              answer: "a",
              explanation: "The API returns `favorited`, but the database stores the relation through `favoritedBy` and `favorites`.",
              tags: ["favorites", "prisma-relations"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "following-computation",
              prompt: "How does the article/comment response compute whether the current viewer follows an author?",
              choices: [
                { id: "a", body: "It checks whether the author's `followedBy` relation contains the current viewer id." },
                { id: "b", body: "It checks whether the article has the viewer's username as a tag." },
                { id: "c", body: "It reads a `following` boolean stored on the article row." },
                { id: "d", body: "It checks whether the viewer has favorited the article." }
              ],
              answer: "a",
              explanation: "The profile-style response is computed from relation data, not from a stored response boolean.",
              tags: ["mapping", "profiles"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "slug-create",
              prompt: "When creating a new article, what does the service use to build the slug?",
              choices: [
                { id: "a", body: "A slugified title plus the author id." },
                { id: "b", body: "Only the article description." },
                { id: "c", body: "A random UUID generated by Prisma." },
                { id: "d", body: "The first tag plus the current date." }
              ],
              answer: "a",
              explanation: "`createArticle` computes a slug from the title and user id, then checks whether that slug already exists.",
              tags: ["article-create", "validation"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "comment-body-validation",
              prompt: "What happens when `addComment` receives a blank body?",
              choices: [
                { id: "a", body: "It throws a `422` validation error before the article lookup." },
                { id: "b", body: "It creates the comment with an empty string." },
                { id: "c", body: "It deletes the article's previous comments." },
                { id: "d", body: "It treats the body as the slug." }
              ],
              answer: "a",
              explanation: "The first guard in `addComment` checks `if (!body)` and throws a body validation error.",
              tags: ["validation", "comments"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "route-order",
              prompt: "Why must a specific route like `/articles/feed` be registered before a generic route like `/articles/:slug`?",
              choices: [
                { id: "a", body: "Otherwise Express can treat `feed` as the `:slug` value." },
                { id: "b", body: "Otherwise Prisma cannot import the schema." },
                { id: "c", body: "Otherwise JWT tokens stop parsing." },
                { id: "d", body: "Otherwise query parameters are ignored on every route." }
              ],
              answer: "a",
              explanation: "Express matches routes in order. More specific routes should come before parameter routes that could also match the same path segment.",
              tags: ["express-routing"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "include-purpose",
              prompt: "In these services, what is the main purpose of Prisma `include` blocks after `create`, `update`, or `findMany`?",
              choices: [
                { id: "a", body: "To load related data needed for the API response mapper." },
                { id: "b", body: "To decide which route Express should run." },
                { id: "c", body: "To encrypt the JWT token." },
                { id: "d", body: "To replace every `where` filter." }
              ],
              answer: "a",
              explanation: "`where` decides which rows qualify. `include` loads relations such as tags, author, favorited users, and counts so the service can shape the response.",
              tags: ["prisma-querying", "mapping"],
              difficulty: "easy"
            }
          ]
        })
      ]
    })
  ]
});
