import { balancedQuiz, callout, chapter, codeBlock, diagram, list, p, section, subsection } from "tutor-kit";

export default chapter({
  id: "auth-profile-bridge",
  title: "Auth and Profiles: How User Identity Reaches Articles",
  description: "Connect JWT identity, required versus optional auth, profile following, and the article feed's followed-author logic.",
  role: "instruction",
  sections: [
    section({
      id: "identity-thread",
      title: "The Same User Id Travels Everywhere",
      role: "instruction",
      blocks: [
        p({
          id: "outcome",
          body: "After this lesson, you can trace how login creates the user id that later appears as `req.auth.user.id`, and explain how profile follow/unfollow changes the relation that article responses read as `following`."
        }),
        p({
          id: "identity-intro",
          body: "The article routes kept asking for the current user id. Create article needs it for `author.connect`. Favorite needs it for `favoritedBy.connect`. Feed needs it to find followed authors. That id does not come from Express by magic; this codebase puts it in a JWT, then `express-jwt` verifies the token and attaches the payload to the request."
        }),
        callout({
          id: "predict-token",
          tone: "note",
          title: "Pause and predict",
          body: "If the service only needs `req.auth.user.id`, how much user data do you expect the token payload to contain: the whole user record, or just enough to identify the user?"
        }),
        codeBlock({
          id: "token-code",
          language: "ts",
          code: `// src/app/routes/auth/token.utils.ts
const generateToken = (id: number): string =>
  jwt.sign({ user: { id } }, process.env.JWT_SECRET || 'superSecret', {
    expiresIn: '60d',
  });`
        }),
        p({
          id: "token-readout",
          body: "The prediction answer is: just enough. The token stores `{ user: { id } }`, not email, username, favorites, or follows. Every protected route receives the same small identity claim and uses Prisma when it needs fresh user data."
        }),
        diagram({
          id: "identity-flow",
          title: "Identity Flow",
          body: `sequenceDiagram
  participant Client
  participant Login as POST /api/users/login
  participant Token as generateToken
  participant Middleware as auth.required
  participant Article as article service

  Client->>Login: email + password
  Login->>Token: user.id
  Token-->>Client: JWT payload has user.id
  Client->>Middleware: Authorization: Token <jwt>
  Middleware-->>Article: req.auth.user.id
  Article->>Article: connect author, favorite relation, or feed filter`
        })
      ],
      subsections: [
        subsection({
          id: "request-type",
          title: "What the Request Type Says",
          blocks: [
            codeBlock({
              id: "request-type-code",
              language: "ts",
              code: `declare namespace Express {
  export interface Request {
    auth?: {
      user?: {
        id?: number;
      };
    };
  }
}`
            }),
            p({
              id: "request-type-readout",
              body: "The TypeScript declaration matches the token shape. The route code still uses optional chaining, but conceptually `auth.required` means the downstream service is allowed to rely on a verified current user id."
            })
          ]
        })
      ]
    }),
    section({
      id: "required-vs-optional",
      title: "Required and Optional Auth",
      role: "instruction",
      blocks: [
        p({
          id: "middleware-intro",
          body: "The two auth middlewares differ in one important setting. Both know how to pull a token from the header and verify it with the same secret. Optional auth simply allows the request to continue when no credentials are present."
        }),
        codeBlock({
          id: "auth-middleware-code",
          language: "ts",
          code: `const getTokenFromHeaders = (req: express.Request): string | null => {
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

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
          id: "required-readout",
          body: "Read `auth.required` as a gate: no valid token, no route handler. Read `auth.optional` as personalization: the route works anonymously, but if a valid token is present the service can compute viewer-specific fields."
        }),
        list({
          id: "route-classification",
          items: [
            "`POST /api/users` and `POST /api/users/login`: no auth, because these routes create or prove identity.",
            "`GET /api/user` and `PUT /api/user`: `auth.required`, because the route is about the current user.",
            "`GET /api/profiles/:username`: `auth.optional`, because anyone can see a profile, but `following` depends on the viewer.",
            "`POST` and `DELETE /api/profiles/:username/follow`: `auth.required`, because following is a relation owned by the current user."
          ]
        })
      ]
    }),
    section({
      id: "auth-services",
      title: "Register and Login Produce the Token",
      role: "instruction",
      blocks: [
        p({
          id: "register-intro",
          body: "Registration is the one place where the service creates identity from raw input. It trims required fields, rejects blanks, checks uniqueness, hashes the password, creates the user, and returns the public user shape with a token."
        }),
        codeBlock({
          id: "register-code",
          language: "ts",
          code: `export const createUser = async (input: RegisterInput): Promise<RegisteredUser> => {
  const email = input.email?.trim();
  const username = input.username?.trim();
  const password = input.password?.trim();

  if (!email) {
    throw new HttpException(422, { errors: { email: ["can't be blank"] } });
  }

  if (!username) {
    throw new HttpException(422, { errors: { username: ["can't be blank"] } });
  }

  if (!password) {
    throw new HttpException(422, { errors: { password: ["can't be blank"] } });
  }

  await checkUserUniqueness(email, username);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return {
    ...user,
    token: generateToken(user.id),
  };
};`
        }),
        p({
          id: "register-readout",
          body: "Notice the two different shapes. Prisma writes a row that includes a hashed `password`, but the selected return fields omit the password. The API response adds `token`, which is derived from the new user id."
        }),
        p({
          id: "login-intro",
          body: "Login is the mirror path. It does not create a user. It finds by email, compares the submitted password with the stored hash, and returns the same public shape with a new token if the comparison succeeds."
        }),
        codeBlock({
          id: "login-code",
          language: "ts",
          code: `const user = await prisma.user.findUnique({
  where: {
    email,
  },
  select: {
    id: true,
    email: true,
    username: true,
    password: true,
    bio: true,
    image: true,
  },
});

if (user) {
  const match = await bcrypt.compare(password, user.password);

  if (match) {
    return {
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
      token: generateToken(user.id),
    };
  }
}

throw new HttpException(403, {
  errors: {
    'email or password': ['is invalid'],
  },
});`
        }),
        callout({
          id: "password-boundary",
          tone: "key-idea",
          title: "Password crosses only one boundary",
          body: "The password hash is selected so the service can compare it. It is not returned. Once the service has proven identity, the rest of the app mostly passes around the user id, not password data."
        })
      ]
    }),
    section({
      id: "profile-self-relation",
      title: "Follow Is a Self-Relation",
      role: "instruction",
      blocks: [
        p({
          id: "self-relation-intro",
          body: "Now connect auth back to articles. The `following` flag on profiles and article authors comes from a User-to-User relation. In the schema, both sides are arrays because users can follow many users and be followed by many users."
        }),
        codeBlock({
          id: "self-relation-schema",
          language: "prisma",
          code: `model User {
  id         Int    @id @default(autoincrement())
  username   String @unique
  followedBy User[] @relation("UserFollows")
  following  User[] @relation("UserFollows")
}`
        }),
        callout({
          id: "direction-prediction",
          tone: "note",
          title: "Pause and predict",
          body: "User 42 follows Alice. The route is `POST /api/profiles/alice/follow`. Which user row does the service update: user 42's `following`, or Alice's `followedBy`?"
        }),
        codeBlock({
          id: "follow-code",
          language: "ts",
          code: `export const followUser = async (usernamePayload: string, id: number) => {
  const profile = await prisma.user.update({
    where: {
      username: usernamePayload,
    },
    data: {
      followedBy: {
        connect: {
          id,
        },
      },
    },
    include: {
      followedBy: true,
    },
  });

  return profileMapper(profile, id);
};`
        }),
        p({
          id: "follow-readout",
          body: "The service updates Alice, the target profile. It connects user 42 into Alice's `followedBy` list. Prisma understands the opposite side of the same relation, so user 42's `following` relation is the other view of that connection."
        }),
        codeBlock({
          id: "unfollow-code",
          language: "ts",
          code: `export const unfollowUser = async (usernamePayload: string, id: number) => {
  const profile = await prisma.user.update({
    where: {
      username: usernamePayload,
    },
    data: {
      followedBy: {
        disconnect: {
          id,
        },
      },
    },
    include: {
      followedBy: true,
    },
  });

  return profileMapper(profile, id);
};`
        }),
        p({
          id: "unfollow-readout",
          body: "Unfollow is the same relation update in reverse. The target user is still selected by username; the current user id is disconnected from the target's `followedBy` relation."
        })
      ]
    }),
    section({
      id: "mapper-and-articles",
      title: "Why Articles Care About Profiles",
      role: "instruction",
      blocks: [
        p({
          id: "mapper-intro",
          body: "The profile service returns a profile shape, not a raw user row. The crucial field is `following`: does the target user's `followedBy` relation contain the current viewer id?"
        }),
        codeBlock({
          id: "profile-mapper-code",
          language: "ts",
          code: `const profileMapper = (user: any, id: number | undefined): Profile => ({
  username: user.username,
  bio: user.bio,
  image: user.image,
  following: id
    ? user?.followedBy.some((followingUser: Partial<User>) => followingUser.id === id)
    : false,
});`
        }),
        p({
          id: "profile-readout",
          body: "This is why optional auth matters on `GET /profiles/:username`: without a viewer id, the profile can still be returned, but `following` must be false. With a viewer id, the mapper can answer the relationship question."
        }),
        p({
          id: "article-connection",
          body: "The same relation direction reappears in article features. Feed selects articles where the article author's `followedBy` contains the current user id. Article author mapping uses the same check to set `author.following`."
        }),
        codeBlock({
          id: "feed-where-code",
          language: "ts",
          code: `const articles = await prisma.article.findMany({
  where: {
    author: {
      followedBy: { some: { id: id } },
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
          id: "feed-readout",
          body: "Once you understand `followUser`, feed becomes easier to read. If user 42 followed Alice, Alice's `followedBy` includes user 42, so Alice's articles belong in user 42's feed."
        }),
        callout({
          id: "boundary-cases",
          tone: "caution",
          title: "Boundaries in this implementation",
          body: "`followUser` and `unfollowUser` rely on Prisma's `update` to fail when the target username does not exist; they do not shape their own `404`. They also do not explicitly prevent self-follow. Those are service policy choices you would decide on before hardening this route."
        })
      ]
    }),
    section({
      id: "practice",
      title: "Practice",
      role: "practice",
      blocks: [
        p({
          id: "practice-intro",
          body: "Work these from the relation direction, not from the field names alone. The target profile is the row being updated; the current user id is the record being connected or disconnected."
        }),
        codeBlock({
          id: "practice-case",
          language: "text",
          code: `Starting state
User 42: Brianna
User 7: Alice
Alice.followedBy = []

Request A
Brianna sends POST /api/profiles/alice/follow with Authorization: Token <jwt for user 42>

Request B
Brianna sends GET /api/articles/feed

Request C
Anonymous visitor sends GET /api/profiles/alice`
        }),
        list({
          id: "practice-prompts",
          items: [
            "Request A: which relation field changes, and which id is connected?",
            "Request B: why do Alice's articles now match the feed filter?",
            "Request C: what should `profile.following` be, and why?"
          ]
        }),
        p({
          id: "practice-answer",
          body: "A connects user 42 into Alice's `followedBy`. B matches because feed asks for authors whose `followedBy` has user 42. C returns `following: false` because there is no authenticated viewer id, even though Alice may have followers."
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
          body: "Use this review to check whether the auth/profile pieces now feel connected to the article routes rather than separate from them."
        }),
        balancedQuiz({
          id: "auth-profile-review-quiz",
          title: "Auth and Profile Review",
          mode: "review",
          questions: [
            {
              kind: "multiple-choice",
              id: "token-payload",
              prompt: "What user information does `generateToken` put into the JWT payload?",
              choices: [
                { id: "a", body: "Only `{ user: { id } }`." },
                { id: "b", body: "The full user row including password hash." },
                { id: "c", body: "Email, username, bio, image, and all favorites." },
                { id: "d", body: "Only the username string." }
              ],
              answer: "a",
              explanation: "The token carries the stable identity claim the rest of the app needs: the user id.",
              tags: ["jwt", "auth"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "optional-auth",
              prompt: "Why does `GET /profiles/:username` use `auth.optional`?",
              choices: [
                { id: "a", body: "The profile can be public, but a valid token lets the mapper compute viewer-specific `following`." },
                { id: "b", body: "The route cannot read params unless auth is optional." },
                { id: "c", body: "Following is stored as a JWT field." },
                { id: "d", body: "Prisma requires optional auth for every `findUnique`." }
              ],
              answer: "a",
              explanation: "Optional auth lets anonymous reads succeed while still using `req.auth.user.id` when it is present.",
              tags: ["auth", "profiles"],
              difficulty: "easy"
            },
            {
              kind: "multiple-choice",
              id: "follow-direction",
              prompt: "Brianna follows Alice through `POST /profiles/alice/follow`. Which Prisma update matches this implementation?",
              choices: [
                { id: "a", body: "Update Alice by username and `connect` Brianna's id into Alice's `followedBy`." },
                { id: "b", body: "Update Brianna by id and write Alice's username into a string array." },
                { id: "c", body: "Update every article by Alice and set `following: true`." },
                { id: "d", body: "Create a new JWT with Alice's id inside Brianna's token." }
              ],
              answer: "a",
              explanation: "The service updates the target profile row and changes its `followedBy` self-relation.",
              tags: ["profiles", "prisma-relations"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "feed-after-follow",
              prompt: "After user 42 follows Alice, why do Alice's articles appear in user 42's feed?",
              choices: [
                { id: "a", body: "Feed filters authors with `followedBy.some({ id: 42 })`." },
                { id: "b", body: "Follow copies Alice's articles into user 42's favorites." },
                { id: "c", body: "The token now contains Alice's username." },
                { id: "d", body: "Article tags are rewritten during follow." }
              ],
              answer: "a",
              explanation: "Following changes the user-to-user relation; feed reads that same relation from the author side.",
              tags: ["feed", "profiles"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "login-password",
              prompt: "Why does `login` select the `password` field from Prisma but not return it?",
              choices: [
                { id: "a", body: "The service needs the hash for `bcrypt.compare`, but the API response should expose only public user data plus a token." },
                { id: "b", body: "Prisma requires selecting every unique field." },
                { id: "c", body: "The password is returned inside the JWT." },
                { id: "d", body: "The controller removes the password after sending the response." }
              ],
              answer: "a",
              explanation: "Password data is used internally to prove identity. Once identity is proven, the response returns the public shape.",
              tags: ["auth", "service-boundary"],
              difficulty: "medium"
            },
            {
              kind: "multiple-choice",
              id: "missing-profile",
              prompt: "What happens if `getProfile` cannot find a user for the requested username?",
              choices: [
                { id: "a", body: "It throws `HttpException(404, {})` before calling `profileMapper`." },
                { id: "b", body: "It returns an empty profile with `following: false`." },
                { id: "c", body: "It creates a demo user with that username." },
                { id: "d", body: "It redirects to `/api/user`." }
              ],
              answer: "a",
              explanation: "`getProfile` explicitly checks `if (!profile)` and throws `404`.",
              tags: ["profiles", "errors"],
              difficulty: "easy"
            }
          ]
        }),
        list({
          id: "mastery-check",
          items: [
            "Trace login from password comparison to returned token.",
            "Explain the difference between `auth.required` and `auth.optional` in terms of route behavior.",
            "Explain why following Alice updates Alice's `followedBy` relation.",
            "Connect the profile follow relation to the article feed filter."
          ]
        })
      ]
    })
  ]
});
