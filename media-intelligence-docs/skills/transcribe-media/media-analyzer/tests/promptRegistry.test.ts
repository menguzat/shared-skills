import test from "node:test";
import assert from "node:assert/strict";
import { listPrompts, loadPrompt } from "../promptRegistry.js";

test("lists prompt library files with metadata", async () => {
  const prompts = await listPrompts();
  const ids = prompts.map((prompt) => prompt.id);
  assert.deepEqual(ids.sort(), ["conversation-knowledge", "custom", "meeting-analysis", "oldskool-operational-analysis", "reconciliation-report", "transcript-only"].sort());
  const oldskool = await loadPrompt("oldskool-operational-analysis");
  assert.equal(oldskool.outputSchemaId, "oldskool-operational-analysis");
  assert.ok(oldskool.body.includes("planning evidence"));
  assert.doesNotMatch(oldskool.body, /Oldskool\s*\/\s*LYF\.?lab/i);
  assert.doesNotMatch(oldskool.body, /\bLYF\s*\.?\s*lab\b/i);
  assert.match(oldskool.body, /not explicitly mentioned in the transcript\/source text/i);
  assert.match(oldskool.hash, /^[a-f0-9]{16}$/);
});

test("meeting analysis preserves source language for analysis by default", async () => {
  const meeting = await loadPrompt("meeting-analysis");
  assert.match(meeting.body, /every user-visible string/i);
  assert.match(meeting.body, /detected source\/transcript language/i);
  assert.match(meeting.body, /metadata warnings/i);
  assert.match(meeting.body, /only people who actually speak/i);
});
