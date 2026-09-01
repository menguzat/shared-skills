import test from "node:test";
import assert from "node:assert/strict";
import { fileApiActiveTimeoutMs, inlineThresholdBytes } from "../mediaHandler.js";

test("Gemini File API ACTIVE wait timeout supports large files", () => {
  assert.equal(fileApiActiveTimeoutMs, 360_000);
});

test("large media threshold uses Gemini File API path", () => {
  assert.equal(inlineThresholdBytes, 20 * 1024 * 1024);
});
