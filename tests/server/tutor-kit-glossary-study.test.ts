import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { clearWorkspaceCaches } from "../../packages/tutor-kit/dist/compile/discover.js";
import { initWorkspace } from "../../packages/tutor-kit/dist/cli/workspace.js";
import { startDevServer } from "../../packages/tutor-kit/dist/server/server.js";
import { linkTutorKit } from "../helpers/tutor-kit.ts";

test.afterEach(() => clearWorkspaceCaches());

test("glossary study stars and ratings persist", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const saved = await fetchJson(`${server.url}/api/glossary-study/state`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        starredTermIds: ["welcome:intro:semantic-block", "welcome:intro:runtime-history"],
        lastStudySet: "starred",
        currentCardIndex: 1
      })
    });
    assert.deepEqual(saved.starredTermIds, ["welcome:intro:semantic-block", "welcome:intro:runtime-history"]);
    assert.equal(saved.lastStudySet, "starred");
    assert.equal(saved.currentCardIndex, 1);
    assert.match(saved.statePath, /tutor-data\/glossary-study-state\/getting-started\.json/);

    const ratedAgain = await fetchJson(`${server.url}/api/glossary-study/rating`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        termId: "welcome:intro:semantic-block",
        rating: "again"
      })
    });
    assert.equal(ratedAgain.ratings["welcome:intro:semantic-block"].rating, "again");
    assert.equal(ratedAgain.ratings["welcome:intro:semantic-block"].reviewCount, 1);
    assert.equal(ratedAgain.ratings["welcome:intro:semantic-block"].againCount, 1);
    assert.equal(ratedAgain.ratings["welcome:intro:semantic-block"].knewItCount, 0);

    const ratedKnown = await fetchJson(`${server.url}/api/glossary-study/rating`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        termId: "welcome:intro:semantic-block",
        rating: "knew-it"
      })
    });
    assert.equal(ratedKnown.ratings["welcome:intro:semantic-block"].rating, "knew-it");
    assert.equal(ratedKnown.ratings["welcome:intro:semantic-block"].reviewCount, 2);
    assert.equal(ratedKnown.ratings["welcome:intro:semantic-block"].againCount, 1);
    assert.equal(ratedKnown.ratings["welcome:intro:semantic-block"].knewItCount, 1);

    const loaded = await fetchJson(`${server.url}/api/glossary-study/state?textbookId=getting-started`);
    assert.deepEqual(loaded.starredTermIds, ["welcome:intro:semantic-block", "welcome:intro:runtime-history"]);
    assert.equal(loaded.ratings["welcome:intro:semantic-block"].reviewCount, 2);

    const events = readFileSync(join(dir, "tutor-data", "events.jsonl"), "utf8");
    assert.match(events, /glossary_stars_updated/);
    assert.match(events, /glossary_card_rated/);
  } finally {
    await server.close();
  }
});

test("glossary study rejects invalid rating requests", async () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-"));
  initWorkspace(dir, { starter: true });
  linkTutorKit(dir);
  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const response = await fetch(`${server.url}/api/glossary-study/rating`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        textbookId: "getting-started",
        termId: "welcome:intro:semantic-block",
        rating: "maybe"
      })
    });
    assert.equal(response.ok, false);
    assert.match(await response.text(), /rating must be again or knew-it/);
  } finally {
    await server.close();
  }
});

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}
