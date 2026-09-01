import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AnalyzerOutput } from "../schemas.js";
import { evaluateTranscriptQuality } from "../transcriptQuality.js";
import { loadVerifiedTranscriptSource } from "../transcriptSource.js";
import { applyTranscriptFidelityReport, normalizeTranscriptFidelityResponse } from "../transcriptVerifier.js";

test("loads transcript text from a passed JSON sidecar instead of Markdown", async () => {
  const dir = await mkdtemp(join(tmpdir(), "transcript-source-"));
  const markdown = join(dir, "meeting.analysis.md");
  const json = join(dir, "meeting.analysis.json");
  const output = candidate();
  certify(output);
  await writeFile(markdown, "This Markdown was edited and must not be trusted.", "utf8");
  await writeFile(json, JSON.stringify(output), "utf8");

  const source = await loadVerifiedTranscriptSource(markdown);
  assert.match(source.text, /Speaker 1: Verified content/);
  assert.doesNotMatch(source.text, /edited/);
});

test("rejects failed or missing transcript certificates", async () => {
  const dir = await mkdtemp(join(tmpdir(), "transcript-source-"));
  const json = join(dir, "meeting.analysis.json");
  const output = candidate();
  output.metadata.transcriptQuality = evaluateTranscriptQuality(output, { sourceDurationSeconds: 200, mimeType: "audio/aac" });
  await writeFile(json, JSON.stringify(output), "utf8");

  await assert.rejects(loadVerifiedTranscriptSource(json), /quality gate has not passed/);
});

test("rejects transcript content changed after certification", async () => {
  const dir = await mkdtemp(join(tmpdir(), "transcript-source-"));
  const json = join(dir, "meeting.analysis.json");
  const output = candidate();
  certify(output);
  output.transcription[0].content = "Changed after certification.";
  await writeFile(json, JSON.stringify(output), "utf8");

  await assert.rejects(loadVerifiedTranscriptSource(json), /no longer matches/);
});

test("rejects a contradictory fidelity certificate even when its stored status passed", async () => {
  const dir = await mkdtemp(join(tmpdir(), "transcript-source-"));
  const json = join(dir, "meeting.analysis.json");
  const output = candidate();
  certify(output);
  output.metadata.transcriptQuality!.fidelity!.summary = "No media file was provided to verify the transcript against.";
  await writeFile(json, JSON.stringify(output), "utf8");

  await assert.rejects(loadVerifiedTranscriptSource(json), /semantically invalid/);
});

function candidate(): AnalyzerOutput {
  return {
    metadata: {
      sourceFile: "/tmp/meeting.aac",
      generatedAt: "2026-07-22T00:00:00.000Z",
      model: "gemini-test",
      analysisStyle: "transcript-only",
      warnings: []
    },
    analysis: { summary: "", qualityNotes: [] },
    transcription: [{
      timecode: "00:00:00",
      endTimecode: "00:00:20",
      speaker: "Speaker 1",
      content: "Verified content."
    }],
    evidence: [],
    openQuestions: [],
    telemetry: {
      durationMs: 1,
      promptId: "transcript-only",
      promptHash: "hash",
      schemaId: "transcript-only",
      parseAttempts: 1,
      repairAttempts: 0
    }
  };
}

function certify(output: AnalyzerOutput): void {
  output.metadata.transcriptQuality = evaluateTranscriptQuality(output, { sourceDurationSeconds: 20, mimeType: "audio/aac" });
  applyTranscriptFidelityReport(output, normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "en",
    summary: "Verified.",
    discrepancies: []
  }, { model: "gemini-3.1-pro-preview", durationMs: 1 }));
  output.metadata.canonicalTranscript = {
    schemaVersion: "canonical-transcript-v1",
    version: 1,
    certifiedAt: "2026-07-22T00:00:00.000Z",
    sourceMediaSha256: "media-hash",
    sourceSizeBytes: 1,
    sourceMtimeMs: 1,
    transcriptFingerprint: output.metadata.transcriptQuality.transcriptFingerprint,
    manifestPath: "/tmp/manifest.json"
  };
}
