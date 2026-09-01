import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { recordTelemetry } from "../telemetry.js";

test("telemetry failure never aborts the transcription workflow", () => {
  assert.doesNotThrow(() => recordTelemetry({
    sourceFile: "/tmp/source.aac",
    status: "error",
    error: "quality gate rejected transcript"
  }, join(tmpdir(), `media-analyzer-telemetry-${Date.now()}`, "telemetry.sqlite")));
});
