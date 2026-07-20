import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "boot-errors-test-signals",
  title: "Boot Path, Errors, and Test Signals",
  description: "Read middleware order, app-level error handling, and service tests as evidence about behavior and maintainability risk.",
  role: "instruction",
  sections: [
    section({
      id: "boot-path",
      title: "Read Startup as a Pipeline",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can trace how the Express app boots, predict which middleware sees a request first, explain where API errors are shaped, and use the service tests as evidence about confidence and gaps."
        }),
        p({
          id: "pipeline-intro",
          body: "So far you mostly entered the codebase through one controller at a time. The app entrypoint asks a different question: before any controller runs, what has already happened to the request?"
        }),
        callout({
          id: "predict-order",
          tone: "note",
          title: "Pause and predict",
          body: "For `POST /api/articles`, which runs first: JSON body parsing, the article router, static asset serving, or the error middleware?"
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

// Serves images
app.use(express.static(__dirname + '/assets'));

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ status: 'API is running on /api' });
});`
        }),
        p({
          id: "order-readout",
          body: "The prediction answer is JSON body parsing before the router. Express runs middleware in registration order. CORS runs first, body parsers populate `req.body`, API routes run next, static assets come after routes, and the root health-style route is registered after static serving."
        }),
        diagram({
          id: "boot-flow",
          title: "Request Pipeline",
          body: `flowchart TD
  R["Incoming request"] --> Cors["cors()"]
  Cors --> Json["bodyParser.json()"]
  Json --> Form["bodyParser.urlencoded()"]
  Form --> Routes["/api routers"]
  Routes --> Static["static assets"]
  Static --> Root["GET /"]
  Routes -. "next(error)" .-> Errors["error middleware"]`
        })
      ],
      subsections: [
        subsection({
          id: "why-body-parser-matters",
          title: "Why Body Parsing Belongs Before Routes",
          blocks: [
            p({
              id: "body-parser-readout",
              body: "Article creation uses `req.body.article`, login uses `req.body.user`, and comments use `req.body.comment.body`. Those handlers only make sense after the JSON parser has converted the request bytes into an object."
            }),
            list({
              id: "body-examples",
              items: [
                "`POST /api/articles` reads `req.body.article`.",
                "`POST /api/users/login` reads `req.body.user`.",
                "`POST /api/articles/:slug/comments` reads `req.body.comment.body`."
              ]
            })
          ]
        })
      ]
    }),
    section({
      id: "error-path",
      title: "Errors Rejoin at the End",
      role: "instruction",
      blocks: [
        p({
          id: "error-intro",
          body: "Every controller you studied has the same shape: `try`, call the service, send the response, and `catch (error) { next(error) }`. That `next(error)` call jumps out of the normal route pipeline and into the error handler registered after the routes."
        }),
        codeBlock({
          id: "controller-error-code",
          language: "ts",
          code: `router.post('/users/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await login(req.body.user);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});`
        }),
        p({
          id: "handler-intro",
          body: "The app-level handler sorts errors into three buckets. Auth middleware failures get `401`; custom `HttpException`s get their embedded status; everything else becomes `500`."
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
          id: "handler-readout",
          body: "This is why a service can throw `new HttpException(422, ...)` without knowing about `res.status(...)`. Services express failure as exceptions; the app boundary turns those exceptions into HTTP responses."
        }),
        callout({
          id: "error-boundary",
          tone: "caution",
          title: "Boundary to notice",
          body: "The handler checks `err.errorCode`, not the more common `err.status` or `err.statusCode`. When reading or adding errors in this codebase, match the local `HttpException` shape rather than assuming a generic Express convention."
        })
      ]
    }),
    section({
      id: "service-tests",
      title: "Service Tests Replace Prisma, Not Express",
      role: "instruction",
      blocks: [
        p({
          id: "test-intro",
          body: "Most tests in this repository exercise service functions directly. That gives fast feedback on validation, mapping, and Prisma call outcomes, but it does not prove route mounting, middleware order, or real database behavior."
        }),
        codeBlock({
          id: "prisma-mock-code",
          language: "ts",
          code: `// src/tests/prisma-mock.ts
jest.mock('../prisma/prisma-client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});`
        }),
        p({
          id: "mock-readout",
          body: "The test suite replaces the shared Prisma client with a deep mock. Each test controls what `prisma.user.findUnique`, `prisma.article.update`, or another Prisma method resolves to, then checks what the service returns or throws."
        }),
        codeBlock({
          id: "auth-test-code",
          language: "ts",
          code: `test('should throw an error when the email is empty', async () => {
  const user = {
    email: ' ',
    password: '1234',
  };

  const error = String({ errors: { email: ["can't be blank"] } });
  await expect(login(user)).rejects.toThrow(error);
});`
        }),
        p({
          id: "auth-test-readout",
          body: "This test is strong evidence for one local service rule: `login` trims email and rejects a blank value before a successful login can happen. It is not evidence that `POST /api/users/login` is mounted correctly or that the error middleware produces exactly the HTTP response a client sees."
        }),
        callout({
          id: "test-reading-rule",
          tone: "key-idea",
          title: "Read a test by its boundary",
          body: "Ask what boundary the test crosses. A direct service test crosses the service boundary. A controller or e2e test crosses more of Express. A real database test crosses Prisma's actual query behavior."
        })
      ]
    }),
    section({
      id: "coverage-gaps",
      title: "Gaps Are Also Signals",
      role: "practice",
      blocks: [
        p({
          id: "gap-intro",
          body: "A useful source reader does not treat tests as a binary covered/not-covered badge. Tests tell you where maintainers expected risk, and gaps tell you where to be more cautious when changing code."
        }),
        codeBlock({
          id: "article-test-code",
          language: "ts",
          code: `describe('ArticleService', () => {
  describe('deleteComment', () => {
    test('should throw an error ', () => {
      const id = 123;
      const idUser = 456;

      prismaMock.comment.findFirst.mockResolvedValue(null);

      expect(deleteComment(id, idUser)).rejects.toThrowError();
    });
  });
});`
        }),
        p({
          id: "article-test-readout",
          body: "This checks the not-found branch for comment deletion. It does not check that the article slug is ignored by the delete route, because this service function does not receive a slug. That gap matches the boundary you saw in the comments chapter."
        }),
        codeBlock({
          id: "tag-test-code",
          language: "ts",
          code: `describe('TagService', () => {
  describe('getTags', () => {
    // TODO : prismaMock.tag.groupBy.mockResolvedValue(mockedResponse) doesn't work
    test.todo('should return a list of strings');
  });
});`
        }),
        p({
          id: "tag-test-readout",
          body: "The tag service has only a TODO test. That does not mean the endpoint is broken; it means changes to the nested relation query, ordering, or string mapping have less automated protection than the auth/profile/article service paths."
        }),
        codeBlock({
          id: "e2e-mismatch",
          language: "ts",
          code: `// e2e/src/server/server.spec.ts
expect(res.data).toEqual({ message: 'Hello API' });

// src/main.ts
res.json({ status: 'API is running on /api' });`
        }),
        p({
          id: "e2e-readout",
          body: "This mismatch is a maintainability signal. The e2e test appears stale relative to the current root response. When an e2e test disagrees with source, do not blindly trust either one: run the test if needed, then decide whether behavior or test expectation is the thing that should change."
        })
      ]
    }),
    section({
      id: "maintenance-drill",
      title: "Maintenance Drill",
      role: "practice",
      blocks: [
        p({
          id: "drill-intro",
          body: "Suppose you are asked to change `getTags` so authenticated users see tags from demo articles, their own articles, and authors they follow. Before changing code, classify what needs protection."
        }),
        list({
          id: "drill-prompts",
          items: [
            "Which source file owns the route and response wrapper?",
            "Which source file owns the Prisma visibility rule?",
            "Which current test file gives you confidence about this behavior?",
            "What new test would you add before or with the change?",
            "Would a service test be enough, or would you also want an HTTP-level test?"
          ]
        }),
        p({
          id: "drill-answer",
          body: "The controller is `tag.controller.ts`; the Prisma visibility rule is `tag.service.ts`; the current tag service test gives almost no confidence because it is a TODO. A useful first test would mock `prisma.tag.findMany`, call `getTags(42)`, and assert both the returned string array and the nested `where` shape. An HTTP-level test would be useful if you are also changing route mounting, auth middleware choice, or response wrapping."
        }),
        callout({
          id: "change-rule",
          tone: "key-idea",
          title: "Change rule",
          body: "When you edit business logic, protect the service behavior. When you edit route composition, middleware, or response status, protect the HTTP path too."
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
          body: "These questions check whether you can use infrastructure and tests as source evidence rather than background noise."
        }),
        balancedQuiz({
          id: "boot-errors-test-signals-review",
          title: "Boot Path and Test Signals Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "middleware-order",
              prompt: "For `POST /api/articles`, which app-level middleware runs before the article router and makes `req.body.article` available?",
              choices: [
                { id: "a", body: "`bodyParser.json()`." },
                { id: "b", body: "`express.static(...)`." },
                { id: "c", body: "The root `app.get('/')` handler." },
                { id: "d", body: "The error middleware." }
              ],
              answer: "a",
              explanation: "The JSON body parser is registered before `app.use(routes)`, so route handlers can read parsed body objects.",
              tags: ["express-middleware", "boot-path"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "next-error",
              prompt: "A service throws `new HttpException(422, ...)`, and the controller catches it with `next(error)`. Which code chooses the HTTP status sent to the client?",
              choices: [
                { id: "a", body: "The app-level error middleware in `main.ts`." },
                { id: "b", body: "The Prisma schema." },
                { id: "c", body: "The TypeScript interface for `Request.auth`." },
                { id: "d", body: "The `cors()` middleware." }
              ],
              answer: "a",
              explanation: "The error middleware checks `err.errorCode` and sends `res.status(err.errorCode).json(err.message)`.",
              tags: ["express-errors", "http-boundary"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "unauthorized-error",
              prompt: "What kind of error does the app-level handler special-case as a `401`?",
              choices: [
                { id: "a", body: "An error whose `name` is `UnauthorizedError`." },
                { id: "b", body: "Any Prisma `findUnique` returning null." },
                { id: "c", body: "Any validation error with an empty string." },
                { id: "d", body: "Any test failure from Jest." }
              ],
              answer: "a",
              explanation: "That branch is meant for `express-jwt` auth failures before service code runs.",
              tags: ["auth", "express-errors"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "service-test-boundary",
              prompt: "A test imports `login` directly, mocks `prisma.user.findUnique`, and expects `login(user)` to reject. What boundary does this test mainly cover?",
              choices: [
                { id: "a", body: "The auth service's validation and Prisma-dependent branching." },
                { id: "b", body: "The full HTTP route mounting under `/api`." },
                { id: "c", body: "The real PostgreSQL query planner." },
                { id: "d", body: "Browser CORS behavior." }
              ],
              answer: "a",
              explanation: "Direct service tests bypass Express and the real database; they focus on service behavior with mocked Prisma results.",
              tags: ["testing", "service-boundary"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "tag-test-gap",
              prompt: "What should you infer from `test.todo('should return a list of strings')` in `tag.service.test.ts`?",
              choices: [
                { id: "a", body: "The tag query and mapping have little automated protection right now." },
                { id: "b", body: "The tag service cannot be imported." },
                { id: "c", body: "The `/api/tags` endpoint is guaranteed broken." },
                { id: "d", body: "Jest ignores every test in the repository." }
              ],
              answer: "a",
              explanation: "A TODO test records intent, but it does not assert current behavior.",
              tags: ["testing", "tags"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "stale-e2e",
              prompt: "The e2e root test expects `{ message: 'Hello API' }`, but `main.ts` returns `{ status: 'API is running on /api' }`. What is the best source-reading conclusion?",
              choices: [
                { id: "a", body: "There is a behavior/test mismatch that should be verified before relying on that e2e test." },
                { id: "b", body: "Express automatically sends both objects." },
                { id: "c", body: "The service tests prove the e2e test will pass." },
                { id: "d", body: "The root route is mounted under `/api`." }
              ],
              answer: "a",
              explanation: "A mismatch is evidence to investigate. Either the behavior changed and the test is stale, or the running app differs from the source being read.",
              tags: ["testing", "maintenance"],
              difficulty: "medium"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Trace a request through app middleware before it reaches a controller.",
            "Explain how `next(error)` reaches the app-level error handler.",
            "Classify whether a test covers service behavior, HTTP behavior, or real database behavior.",
            "Name one real test gap in this repository and the risk it creates."
          ]
        })
      ]
    })
  ]
});
