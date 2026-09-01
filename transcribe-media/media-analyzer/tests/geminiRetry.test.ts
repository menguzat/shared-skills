import test from "node:test";
import assert from "node:assert/strict";
import { generateGeminiTextStream, isTransientGeminiError, withGeminiTransportRetry } from "../geminiRetry.js";

test("classifies transport and service failures separately from content failures", () => {
  assert.equal(isTransientGeminiError(new Error("fetch failed")), true);
  assert.equal(isTransientGeminiError(new Error("503 service unavailable")), true);
  assert.equal(isTransientGeminiError(new Error("Transcript quality gate failed")), false);
});

test("retries transient Gemini transport errors without consuming content attempts", async () => {
  let calls = 0;
  const result = await withGeminiTransportRetry("test", async () => {
    calls += 1;
    if (calls === 1) throw new Error("fetch failed");
    return "ok";
  }, 2);
  assert.equal(result, "ok");
  assert.equal(calls, 2);
});

test("collects streamed Gemini JSON chunks into one response", async () => {
  const ai = {
    models: {
      generateContentStream: async () => (async function* () {
        yield { text: "{\"value\":" };
        yield { text: "1}", usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 2, thoughtsTokenCount: 3, cachedContentTokenCount: 4, totalTokenCount: 15 } };
      })()
    }
  };
  const result = await generateGeminiTextStream(ai, {}, "test stream");
  assert.equal(result.text, "{\"value\":1}");
  assert.deepEqual(result.usage, { promptTokenCount: 10, candidatesTokenCount: 2, thoughtsTokenCount: 3, cachedContentTokenCount: 4, totalTokenCount: 15 });
});
