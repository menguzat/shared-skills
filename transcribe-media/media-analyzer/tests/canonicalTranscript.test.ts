import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AnalyzerOutput } from "../schemas.js";
import { writeCanonicalTranscript } from "../canonicalTranscript.js";
import { evaluateTranscriptQuality } from "../transcriptQuality.js";
import { applyTranscriptFidelityReport, normalizeTranscriptFidelityResponse } from "../transcriptVerifier.js";

test("writes immutable canonical versions and reuses identical fingerprints", async () => {
  const dir = await mkdtemp(join(tmpdir(), "canonical-transcript-"));
  const media = join(dir, "meeting.aac");
  await writeFile(media, "test media bytes", "utf8");
  const first = candidate("First certified content.");
  certify(first);
  const v1 = await writeCanonicalTranscript(media, first);
  assert.equal(v1.version, 1);
  assert.equal(v1.reused, false);
  await access(v1.acceptedJson);
  await access(join(dir, ".transcripts", "meeting", "snapshots", "latest.transcript.json"));
  await assert.rejects(access(join(dir, "meeting.transcript.accepted.json")));
  await assert.rejects(access(join(dir, "meeting.transcript.latest.json")));
  await rm(v1.acceptedJson);
  await rm(v1.acceptedMarkdown);
  const reused = await writeCanonicalTranscript(media, first);
  assert.equal(reused.version, 1);
  assert.equal(reused.reused, true);
  await access(reused.acceptedJson);
  await access(reused.acceptedMarkdown);

  const second = candidate("Corrected certified content.");
  certify(second);
  const v2 = await writeCanonicalTranscript(media, second, { correctionReason: "Human-confirmed wording" });
  assert.equal(v2.version, 2);
  assert.notEqual(v2.json, v1.json);
  const manifest = JSON.parse(await readFile(v2.manifest, "utf8"));
  assert.equal(manifest.versions.length, 2);
  assert.equal(manifest.versions[1].supersedesFingerprint, first.metadata.transcriptQuality?.transcriptFingerprint);
});

function candidate(content: string): AnalyzerOutput {
  return {
    metadata: { sourceFile: "/tmp/meeting.aac", generatedAt: "2026-07-23T00:00:00.000Z", model: "gemini-3.1-pro-preview", analysisStyle: "transcript-only", language: "tr", warnings: [] },
    analysis: { summary: "", qualityNotes: [] },
    transcription: [{ timecode: "00:00:00", endTimecode: "00:00:20", speaker: "Speaker 1", content }],
    evidence: [], openQuestions: [],
    telemetry: { durationMs: 1, promptId: "transcript-only", promptHash: "hash", schemaId: "transcript-only", parseAttempts: 1, repairAttempts: 0 }
  };
}

function certify(output: AnalyzerOutput): void {
  output.metadata.transcriptQuality = evaluateTranscriptQuality(output, { sourceDurationSeconds: 20, mimeType: "audio/aac" });
  applyTranscriptFidelityReport(output, normalizeTranscriptFidelityResponse({ reviewedEntireMedia: true, detectedLanguage: "tr", summary: "Passed", discrepancies: [] }, { model: "gemini-3.1-pro-preview", durationMs: 1 }));
}
