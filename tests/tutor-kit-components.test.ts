import assert from "node:assert/strict";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { component, componentModule, validateTextbook } from "../packages/tutor-kit/dist/index.js";
import { compileWorkspace } from "../packages/tutor-kit/dist/compile/compile.js";
import { clearWorkspaceCaches } from "../packages/tutor-kit/dist/compile/discover.js";
import { startDevServer } from "../packages/tutor-kit/dist/server/server.js";
import { coreBlockDefinitions } from "../packages/tutor-kit/dist/blocks/core/index.js";
import { createComponentWorkspace } from "./helpers/component-workspace.ts";

test.afterEach(() => clearWorkspaceCaches());

test("component builders preserve generic JSON props and validate module references", () => {
  assert.equal(coreBlockDefinitions.component.create, component);
  const dir = mkdtempSync(join(tmpdir(), "tutor-kit-component-builder-"));
  const sourcePath = join(dir, "entry.ts");
  writeFileSync(sourcePath, "export default {};\n");
  const module = componentModule<{ count: number; labels: string[] }>(pathToFileURL(join(dir, "chapter.ts")).href, "./entry.ts");
  const block = component({ id: "counter", title: "Counter", module, props: { count: 2, labels: ["a", "b"] } });
  assert.equal(block.kind, "component");
  assert.equal(block.props.module.sourcePath, sourcePath);
  assert.deepEqual(block.props.props, { count: 2, labels: ["a", "b"] });
  assert.throws(() => component({ id: "bad", module, props: { value: Number.NaN } as never }), /JSON/);
  assert.throws(() => component({ id: "bad", module, props: { value: new Date() } as never }), /JSON/);
  assert.throws(() => componentModule(pathToFileURL(join(dir, "chapter.ts")).href, "./missing.ts"), /does not exist/);
});

test("component validation rejects malformed references and props", () => {
  const issues = validateTextbook({
    id: "course",
    title: "Course",
    chapters: [{
      id: "chapter",
      title: "Chapter",
      sections: [{
        id: "section",
        title: "Section",
        subsections: [],
        blocks: [{ kind: "component", id: "broken", props: { module: {}, props: { bad: undefined } } }]
      }]
    }]
  });
  assert.match(issues.map((issue) => issue.message).join("\n"), /componentModule/);
  assert.match(issues.map((issue) => issue.message).join("\n"), /JSON/);
});

test("compile checks component TypeScript and the complete Vite import graph", async () => {
  const dir = createComponentWorkspace();
  const fullResult = await compileWorkspace(dir);
  assert.equal(fullResult.ok, true, fullResult.output);
  assert.equal(existsSync(join(dir, "dist")), false);

  const result = await compileWorkspace(dir, { textbookId: "getting-started" });
  assert.equal(result.ok, true, result.output);

  writeFileSync(join(dir, "textbooks", "getting-started", "components", "value.ts"), "export const step: number = 'bad';\n");
  clearWorkspaceCaches();
  const typeFailure = await compileWorkspace(dir, { textbookId: "getting-started" });
  assert.equal(typeFailure.ok, false);
  assert.match(typeFailure.output, /components\/value\.ts/);
  assert.match(typeFailure.output, /threshold-explorer/);

  writeFileSync(join(dir, "textbooks", "getting-started", "components", "value.ts"), "export { missing } from './not-there.js';\n");
  clearWorkspaceCaches();
  const importFailure = await compileWorkspace(dir, { textbookId: "getting-started" });
  assert.equal(importFailure.ok, false);
  assert.match(importFailure.output, /not-there/);
});

test("server returns opaque component URLs without iframes", async () => {
  const dir = createComponentWorkspace();
  const server = await startDevServer({ cwd: dir, port: 0 });
  try {
    const chapterResponse = await fetch(`${server.url}/api/textbooks/getting-started/chapters/welcome`);
    assert.equal(chapterResponse.ok, true);
    const chapterText = await chapterResponse.text();
    assert.doesNotMatch(chapterText, new RegExp(dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    const chapter = JSON.parse(chapterText);
    const block = chapter.sections[0].blocks[1];
    assert.equal(block.kind, "component");
    assert.match(block.props.moduleUrl, /^\/__tutor-components\/[a-f0-9]{20}\.js$/);
    assert.equal(block.props.module, undefined);
    assert.deepEqual(block.props.props, { initialValue: 5 });

    const textbookText = await (await fetch(`${server.url}/api/textbooks/getting-started`)).text();
    assert.doesNotMatch(textbookText, new RegExp(dir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    const page = await (await fetch(server.url)).text();
    assert.match(page, /\/@vite\/client/);
    assert.doesNotMatch(page, /<iframe\b/i);
  } finally {
    await server.close();
  }
});
