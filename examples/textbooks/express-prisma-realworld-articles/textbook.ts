import { textbook } from "tutor-kit";
import publishNewArticle from "./chapters/publish-new-article.chapter.js";
import updateArticleOwnership from "./chapters/update-article-ownership.chapter.js";
import readArticleLists from "./chapters/read-article-lists.chapter.js";
import articleFeedReadModel from "./chapters/article-feed-read-model.chapter.js";
import favoriteRelations from "./chapters/favorite-relations.chapter.js";
import commentRelationsOwnership from "./chapters/comment-relations-ownership.chapter.js";
import serviceLayerCheckpoint from "./chapters/service-layer-checkpoint.chapter.js";
import authProfileBridge from "./chapters/auth-profile-bridge.chapter.js";
import tagsRouteComposition from "./chapters/tags-route-composition.chapter.js";
import bootErrorsTestSignals from "./chapters/boot-errors-test-signals.chapter.js";
import sourceReadingChecklist from "./chapters/source-reading-checklist.chapter.js";

export default textbook({
  id: "express-prisma-realworld-articles",
  title: "Publishing Articles in the RealWorld Express API",
  description: "A practical source-reading course on how an Express and Prisma RealWorld API routes, validates, stores, relates, maps, and tests article features.",
  chapters: [
    publishNewArticle,
    updateArticleOwnership,
    readArticleLists,
    articleFeedReadModel,
    favoriteRelations,
    commentRelationsOwnership,
    serviceLayerCheckpoint,
    authProfileBridge,
    tagsRouteComposition,
    bootErrorsTestSignals,
    sourceReadingChecklist
  ]
});
