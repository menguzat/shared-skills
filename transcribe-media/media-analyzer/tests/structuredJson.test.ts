import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonObject } from "../structuredJson.js";

test("parses fenced json and repairs trailing comma", () => {
  const parsed = parseJsonObject("```json\n{\"a\":1,}\n```", (value) => value as { a: number });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data?.a, 1);
  assert.equal(parsed.repairAttempts, 1);
});
