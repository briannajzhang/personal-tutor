import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSyntaxLanguage } from "../packages/tutor-kit/dist/ui/client/syntax-highlighting.js";

test("syntax language normalization maps common aliases", () => {
  assert.equal(normalizeSyntaxLanguage("ts"), "typescript");
  assert.equal(normalizeSyntaxLanguage("TS"), "typescript");
  assert.equal(normalizeSyntaxLanguage(" js "), "javascript");
  assert.equal(normalizeSyntaxLanguage("jsx"), "jsx");
  assert.equal(normalizeSyntaxLanguage("tsx"), "tsx");
  assert.equal(normalizeSyntaxLanguage("sh"), "shellscript");
  assert.equal(normalizeSyntaxLanguage("bash"), "shellscript");
  assert.equal(normalizeSyntaxLanguage("zsh"), "shellscript");
  assert.equal(normalizeSyntaxLanguage("md"), "markdown");
});

test("syntax language normalization preserves known canonical language ids", () => {
  assert.equal(normalizeSyntaxLanguage("json"), "json");
  assert.equal(normalizeSyntaxLanguage("prisma"), "prisma");
  assert.equal(normalizeSyntaxLanguage("python"), "python");
});

test("syntax language normalization uses null for plaintext and empty inputs", () => {
  assert.equal(normalizeSyntaxLanguage("text"), null);
  assert.equal(normalizeSyntaxLanguage("txt"), null);
  assert.equal(normalizeSyntaxLanguage("plain"), null);
  assert.equal(normalizeSyntaxLanguage("plaintext"), null);
  assert.equal(normalizeSyntaxLanguage(""), null);
  assert.equal(normalizeSyntaxLanguage(undefined), null);
});

test("syntax language normalization leaves unknown names for runtime fallback", () => {
  assert.equal(normalizeSyntaxLanguage("made-up-language"), "made-up-language");
});
