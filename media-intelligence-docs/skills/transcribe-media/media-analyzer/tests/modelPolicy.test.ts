import test from "node:test";
import assert from "node:assert/strict";
import { allowedGeminiModels, assertAllowedGeminiModel, defaultModel } from "../geminiCore.js";

test("allows only current non-live Gemini 3 Pro and Flash models", () => {
  assert.deepEqual(allowedGeminiModels, ["gemini-3.1-pro-preview", "gemini-flash-latest"]);
  assert.equal(defaultModel("pro"), "gemini-3.1-pro-preview");
  assert.equal(defaultModel("fast"), "gemini-flash-latest");
  assert.throws(() => assertAllowedGeminiModel("gemini-pro-latest"), /not allowed/);
  assert.throws(() => assertAllowedGeminiModel("gemini-3.1-flash-live-preview"), /not allowed/);
});
