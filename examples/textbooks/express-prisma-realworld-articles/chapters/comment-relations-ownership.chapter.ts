import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "comment-relations-ownership",
  title: "Comments: Connecting Parents and Checking Ownership",
  description: "Trace comment creation, listing, and deletion through article/user relations, optional auth, and ownership-sensitive lookup.",
  role: "instruction",
  sections: [
    section({
      id: "comment-shape",
      title: "A Comment Has Two Parents",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can trace comment creation, listing, and deletion through the RealWorld Express API, and predict where Prisma connects a comment to an article and an author."
        }),
        p({
          id: "not-free-floating",
          body: "A comment looks small in the API: it is mostly a body string with an author profile. In the database, it is not free-floating text. It must belong to one article and one user."
        }),
        callout({
          id: "predict-parents",
          tone: "note",
          title: "Pause and predict",
          body: "For `POST /api/articles/hello-world/comments`, the slug names the article and the token names the user. Which one should Prisma connect through `article`, and which one through `author`?"
        }),
        p({
          id: "schema-intro",
          body: "The Prisma schema makes the two required parents visible. Inspect the scalar foreign keys and the relation fields together."
        }),
        codeBlock({
          id: "comment-schema",
          language: "prisma",
          code: `model Article {
  id       Int       @id @default(autoincrement())
  slug     String    @unique
  comments Comment[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())
  body      String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  articleId Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  Int
}

model User {
  id       Int       @id @default(autoincrement())
  comments Comment[]
}`
        }),
        p({
          id: "schema-readout",
          body: "`articleId` and `authorId` are required. So adding a comment must find an article and know the current user. Deleting a comment must be careful because removing a row is destructive and should be allowed only for that comment's author."
        }),
        diagram({
          id: "comment-relation-diagram",
          title: "Comment Relation Shape",
          body: `flowchart LR
  A["Article: hello-world"] --> C["Comment: Nice post"]
  U["User: viewer 42"] --> C
  C --> R["API response includes body + author profile"]`
        })
      ],
      subsections: [
        subsection({
          id: "route-evidence",
          title: "Where the Inputs Come From",
          blocks: [
            list({
              id: "input-sources",
              items: [
                "`req.params.slug` names the article.",
                "`req.body.comment.body` supplies the text.",
                "`req.auth.user.id` names the author when `auth.required` succeeds.",
                "`req.params.id` names the comment on delete."
              ]
            })
          ]
        })
      ]
    }),
    section({
      id: "routes",
      title: "Three Comment Routes",
      role: "instruction",
      blocks: [
        p({
          id: "routes-intro",
          body: "The controller splits comment behavior into three routes: list comments, add a comment, and delete a comment. Notice which ones require auth."
        }),
        codeBlock({
          id: "routes-code",
          language: "ts",
          code: `router.get(
  '/articles/:slug/comments',
  auth.optional,
  async (req, res, next) => {
    try {
      const comments = await getCommentsByArticle(req.params.slug, req.auth?.user?.id);
      res.json({ comments });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/articles/:slug/comments',
  auth.required,
  async (req, res, next) => {
    try {
      const comment = await addComment(req.body.comment.body, req.params.slug, req.auth?.user?.id);
      res.json({ comment });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  '/articles/:slug/comments/:id',
  auth.required,
  async (req, res, next) => {
    try {
      await deleteComment(Number(req.params.id), req.auth?.user?.id);
      res.status(200).json({});
    } catch (error) {
      next(error);
    }
  },
);`
        }),
        p({
          id: "routes-readout",
          body: "Listing can be anonymous, with optional personalization for `following`. Adding and deleting require a user because both actions are user-owned: the new comment needs an author, and deletion must prove the current user owns the comment."
        }),
        callout({
          id: "delete-slug-boundary",
          tone: "caution",
          title: "The slug is ignored on delete",
          body: "The delete route includes `:slug`, but the controller passes only `Number(req.params.id)` and the current user id to `deleteComment`. In this code, the slug does not constrain which comment is deleted."
        })
      ]
    }),
    section({
      id: "add-comment",
      title: "Add Comment Connects Article and Author",
      role: "instruction",
      blocks: [
        p({
          id: "add-intro",
          body: "Read `addComment` as a two-parent create. It first validates the text, then finds the target article id by slug, then creates a comment connected to both article and author."
        }),
        codeBlock({
          id: "add-code",
          language: "ts",
          code: `export const addComment = async (body: string, slug: string, id: number) => {
  if (!body) {
    throw new HttpException(422, { errors: { body: ["can't be blank"] } });
  }

  const article = await prisma.article.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  const comment = await prisma.comment.create({
    data: {
      body,
      article: {
        connect: {
          id: article?.id,
        },
      },
      author: {
        connect: {
          id: id,
        },
      },
    },
    include: {
      author: {
        select: {
          username: true,
          bio: true,
          image: true,
          followedBy: true,
        },
      },
    },
  });`
        }),
        p({
          id: "add-readout",
          body: "The prediction answer is: slug becomes `article.connect`, token user id becomes `author.connect`. Prisma creates the comment row and fills its required `articleId` and `authorId` through those relation connects."
        }),
        callout({
          id: "missing-article-boundary",
          tone: "caution",
          title: "Boundary in this implementation",
          body: "There is no explicit `if (!article) throw 404` before `comment.create`. If the slug is missing, `article?.id` is `undefined`, so the failure is deferred to Prisma rather than shaped as this service's own not-found response."
        }),
        p({
          id: "response-intro",
          body: "After the create, the service manually builds the API comment shape. The returned object does not expose `articleId` or `authorId`."
        }),
        codeBlock({
          id: "add-response-code",
          language: "ts",
          code: `return {
  id: comment.id,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  body: comment.body,
  author: {
    username: comment.author.username,
    bio: comment.author.bio,
    image: comment.author.image,
    following: comment.author.followedBy.some((follow: any) => follow.id === id),
  },
};`
        }),
        p({
          id: "response-readout",
          body: "The author profile is included because the client expects comments with author metadata. The `following` flag is computed from whether the comment author's `followedBy` contains the current user id."
        })
      ]
    }),
    section({
      id: "list-comments",
      title: "List Comments Filters by Author Visibility",
      role: "instruction",
      blocks: [
        p({
          id: "list-intro",
          body: "The list route is optional-auth, like article listing. It fetches the article by slug and includes comments, but it filters which comments are visible based on comment author."
        }),
        codeBlock({
          id: "list-code",
          language: "ts",
          code: `export const getCommentsByArticle = async (slug: string, id?: number) => {
  const queries = [];

  queries.push({
    author: {
      demo: true,
    },
  });

  if (id) {
    queries.push({
      author: {
        id,
      },
    });
  }

  const comments = await prisma.article.findUnique({
    where: {
      slug,
    },
    include: {
      comments: {
        where: {
          OR: queries,
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          body: true,
          author: {
            select: {
              username: true,
              bio: true,
              image: true,
              followedBy: true,
            },
          },
        },
      },
    },
  });`
        }),
        p({
          id: "list-readout",
          body: "Anonymous viewers see comments whose authors are demo users. Authenticated viewers also see their own comments. This mirrors the article-list visibility pattern, but here the predicate lives inside `include.comments.where`."
        }),
        p({
          id: "list-result-intro",
          body: "The result mapping again computes author `following` from the included author relation."
        }),
        codeBlock({
          id: "list-result-code",
          language: "ts",
          code: `const result = comments?.comments.map((comment: any) => ({
  ...comment,
  author: {
    username: comment.author.username,
    bio: comment.author.bio,
    image: comment.author.image,
    following: comment.author.followedBy.some((follow: any) => follow.id === id),
  },
}));

return result;`
        }),
        callout({
          id: "list-missing-article",
          tone: "note",
          title: "Another boundary",
          body: "If the article slug is not found, `comments` is `null`, so this function returns `undefined` rather than throwing the explicit `404` used by `getArticle`."
        })
      ]
    }),
    section({
      id: "delete-comment",
      title: "Delete Comment Checks Ownership in the Lookup",
      role: "instruction",
      blocks: [
        p({
          id: "delete-intro",
          body: "Deleting a comment is a destructive action, so the service must prove the current user owns the comment. This implementation puts the ownership check directly inside the lookup."
        }),
        codeBlock({
          id: "delete-code",
          language: "ts",
          code: `export const deleteComment = async (id: number, userId: number) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id,
      author: {
        id: userId,
      },
    },
    select: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!comment) {
    throw new HttpException(404, {});
  }

  if (comment.author.id !== userId) {
    throw new HttpException(403, {
      message: 'You are not authorized to delete this comment',
    });
  }

  await prisma.comment.delete({
    where: {
      id,
    },
  });
};`
        }),
        p({
          id: "delete-readout",
          body: "The `findFirst` says: find a comment with this id whose author has this user id. If the comment belongs to someone else, the query returns nothing and the service throws `404`. That makes the later `403` check practically redundant in the current code, because any returned comment already has `author.id === userId`."
        }),
        diagram({
          id: "delete-flow",
          title: "Delete Comment Decision",
          body: `flowchart TD
  A["DELETE /articles/:slug/comments/:id"] --> B["auth.required gives userId"]
  B --> C["deleteComment(comment id, userId)"]
  C --> D["findFirst where id AND author.id=userId"]
  D --> E{Found?}
  E -- "no: missing or not yours" --> F["throw 404"]
  E -- "yes: yours" --> G["delete by id"]
  G --> H["controller returns 200 {}"]`
        }),
        callout({
          id: "ownership-pattern",
          tone: "key-idea",
          title: "Two ownership styles",
          body: "Earlier, article update loaded by slug, then compared author id and could throw `403`. Here, comment delete folds ownership into the query, so wrong-owner and missing-comment cases collapse into `404`."
        })
      ]
    }),
    section({
      id: "practice",
      title: "Predict the Comment Path",
      role: "practice",
      blocks: [
        p({
          id: "practice-intro",
          body: "For each case, name the first layer or query that decides the outcome."
        }),
        codeBlock({
          id: "cases",
          language: "text",
          code: `World
  Article slug: hello-world, id 10
  User 42: Brianna
  User 7: Lee
  Comment 5: body "Nice", articleId 10, authorId 7

Case A
  Brianna sends POST /api/articles/hello-world/comments
  Body: { "comment": { "body": "Great post" } }

Case B
  Brianna sends POST /api/articles/hello-world/comments
  Body: { "comment": { "body": "" } }

Case C
  Brianna sends DELETE /api/articles/hello-world/comments/5

Case D
  Lee sends DELETE /api/articles/other-slug/comments/5`
        }),
        list({
          id: "case-prompts",
          items: [
            "Case A: which two records does the new comment connect to?",
            "Case B: which validation check stops the create?",
            "Case C: does the service throw `403` or `404` for Brianna?",
            "Case D: does the `other-slug` route param affect deletion in this implementation?"
          ]
        }),
        p({
          id: "case-readout",
          body: "A connects the new comment to Article 10 and User 42. B throws `422` before Prisma. C throws `404` because the lookup requires comment id 5 and author id 42, but comment 5 belongs to Lee. D can delete comment 5 because Lee owns it; the slug is not passed into `deleteComment`."
        }),
        callout({
          id: "debug-shortcut",
          tone: "key-idea",
          title: "Debugging shortcut",
          body: "For add failures, inspect body validation, article lookup, then relation connects. For delete failures, inspect whether the current user id is part of the `findFirst` ownership predicate."
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
          body: "A comment feature pulls together the patterns you have been building: Express route params, auth state, Prisma relation connects, nested includes, and ownership checks."
        }),
        balancedQuiz({
          id: "comment-review-quiz",
          title: "Comment Path Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "comment-parents",
              prompt: "When creating a comment, which two required parents does the service connect?",
              choices: [
                { id: "a", body: "The target article and the authenticated user." },
                { id: "b", body: "The target tag and the article author." },
                { id: "c", body: "The feed owner and the favorite relation." },
                { id: "d", body: "The article's previous comment and next comment." }
              ],
              answer: "a",
              explanation: "The slug is used to find the article id, and auth supplies the current user id. Prisma connects both through `article.connect` and `author.connect`.",
              tags: ["comments", "prisma-connect"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "blank-body",
              prompt: "What happens when `addComment` receives an empty body string?",
              choices: [
                { id: "a", body: "It throws a `422` body validation error before looking up the article." },
                { id: "b", body: "It creates an empty comment and lets the mapper hide it." },
                { id: "c", body: "It throws `404` because the article is missing." },
                { id: "d", body: "It silently replaces the body with the article title." }
              ],
              answer: "a",
              explanation: "The first guard in `addComment` checks `if (!body)` and throws `HttpException(422, ...)`.",
              tags: ["validation"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "delete-wrong-owner",
              prompt: "A comment exists, but it belongs to another user. What does this `deleteComment` implementation do for the current user?",
              choices: [
                { id: "a", body: "It throws `404` because `findFirst` includes both comment id and author id." },
                { id: "b", body: "It throws `403` from the later comparison." },
                { id: "c", body: "It deletes the comment because the route contains the article slug." },
                { id: "d", body: "It changes the comment's author to the current user." }
              ],
              answer: "a",
              explanation: "Wrong-owner comments do not satisfy the lookup predicate, so `comment` is null and the service throws `404` before the later `403` branch.",
              tags: ["ownership", "delete-comment"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "delete-slug",
              prompt: "What role does `:slug` play in `DELETE /articles/:slug/comments/:id` in the current controller/service pair?",
              choices: [
                { id: "a", body: "None in the service call; the controller passes only comment id and user id." },
                { id: "b", body: "It is used to verify the comment belongs to that article." },
                { id: "c", body: "It is used to find the comment author." },
                { id: "d", body: "It is used to choose between `404` and `403`." }
              ],
              answer: "a",
              explanation: "The route contains a slug, but `deleteComment(Number(req.params.id), req.auth?.user?.id)` does not pass that slug onward.",
              tags: ["express-routing", "service-boundary"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "list-comment-visibility",
              prompt: "For anonymous `GET /articles/:slug/comments`, which comments are selected by the current list query?",
              choices: [
                { id: "a", body: "Comments whose authors are demo users." },
                { id: "b", body: "All comments on the article." },
                { id: "c", body: "Only comments by users the anonymous viewer follows." },
                { id: "d", body: "Only comments with at least one favorite." }
              ],
              answer: "a",
              explanation: "The query always pushes `{ author: { demo: true } }`, and it adds the current user's own comments only when an id is present.",
              tags: ["comment-listing", "visibility"],
              difficulty: "medium"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Explain comment creation as a two-parent `connect` operation.",
            "Explain why wrong-owner comment deletion becomes `404` in this service.",
            "Name one place where the route shape suggests a stronger invariant than the service currently enforces."
          ]
        })
      ]
    })
  ]
});
