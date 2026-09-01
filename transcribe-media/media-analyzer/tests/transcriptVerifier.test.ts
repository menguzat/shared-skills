import test from "node:test";
import assert from "node:assert/strict";
import type { AnalyzerOutput } from "../schemas.js";
import { evaluateTranscriptQuality } from "../transcriptQuality.js";
import {
  aggregateChunkFidelityReports,
  applyTranscriptFidelityReport,
  normalizeTranscriptFidelityResponse
} from "../transcriptVerifier.js";

test("passes an entire-media review with only minor discrepancies", () => {
  const report = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "Complete comparison performed.",
    discrepancies: [{
      startTimecode: "00:00:02",
      endTimecode: "00:00:03",
      type: "incorrect",
      severity: "minor",
      transcriptExcerpt: "ee",
      correction: "eee",
      explanation: "Filler only.",
      confidence: 0.8
    }]
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });

  assert.equal(report.status, "passed");
  assert.equal(report.qualityScore, 99.5);
});

test("speaker attribution errors lower score but never reject", () => {
  const report = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "The words are complete but speaker labels need work.",
    discrepancies: [{
      startTimecode: "00:10:00",
      endTimecode: "00:12:00",
      type: "speaker",
      severity: "critical",
      discussionImpact: "material",
      transcriptExcerpt: "Speaker 1",
      correction: "Speaker 2",
      explanation: "Wrong stable label.",
      confidence: 0.99
    }]
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });

  assert.equal(report.status, "passed");
  assert.equal(report.blockingDiscrepancies, 0);
  assert.ok(report.qualityScore < 100);
});

test("passes local major substitutions but rejects materially meaning-changing ones", () => {
  const local = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "One local wording issue.",
    discrepancies: [{
      startTimecode: "00:00:00",
      endTimecode: "00:00:04",
      type: "incorrect",
      severity: "major",
      discussionImpact: "local",
      transcriptExcerpt: "A",
      correction: "B",
      explanation: "Opening phrase differs without changing the meeting.",
      confidence: 0.9
    }]
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });
  const material = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "A commitment was reversed.",
    discrepancies: [{
      startTimecode: "00:20:00",
      endTimecode: "00:20:03",
      type: "incorrect",
      severity: "major",
      discussionImpact: "material",
      transcriptExcerpt: "kabul ettik",
      correction: "kabul etmedik",
      explanation: "Negation changes the decision.",
      confidence: 0.99
    }]
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });

  assert.equal(local.status, "passed");
  assert.equal(material.status, "failed");
});

test("fails when the verifier did not review the entire media", () => {
  const report = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: false,
    detectedLanguage: "tr",
    summary: "Partial review.",
    discrepancies: []
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });

  assert.equal(report.status, "failed");
});

test("fails when verifier claims completion but says media was not provided", () => {
  const report = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "No media file was provided to verify the transcript against.",
    discrepancies: []
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });

  assert.equal(report.status, "failed");
});

test("fails when inaccessible-media wording contains modifiers", () => {
  const report = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "No significant media was provided to compare, so no discrepancies were found.",
    discrepancies: []
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });

  assert.equal(report.status, "failed");
});

test("fails on major or critical fidelity discrepancies regardless of model summary", () => {
  const report = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "Looks mostly correct.",
    discrepancies: [{
      startTimecode: "00:01:00",
      endTimecode: "00:03:00",
      type: "missing",
      severity: "critical",
      discussionImpact: "material",
      transcriptExcerpt: "",
      correction: "Two minutes of speech are missing.",
      explanation: "Audible section absent.",
      confidence: 0.99
    }]
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });

  assert.equal(report.status, "failed");
});

test("propagates fidelity failure to the structural quality certificate", () => {
  const output = candidate();
  output.metadata.transcriptQuality = evaluateTranscriptQuality(output, { sourceDurationSeconds: 20, mimeType: "audio/aac" });
  const fidelity = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "Meaning-changing number error.",
    discrepancies: [{
      startTimecode: "00:00:05",
      endTimecode: "00:00:06",
      type: "incorrect",
      severity: "major",
      discussionImpact: "material",
      transcriptExcerpt: "15",
      correction: "50",
      explanation: "Amount changed.",
      confidence: 0.95
    }]
  }, { model: "gemini-3.1-pro-preview", durationMs: 10 });
  applyTranscriptFidelityReport(output, fidelity);

  assert.equal(output.metadata.transcriptQuality.status, "failed");
  assert.ok(output.metadata.transcriptQuality.failedChecks.includes("fidelity-verification"));
});

test("aggregates excerpt fidelity reports on the absolute timeline", () => {
  const first = normalizeTranscriptFidelityResponse({ reviewedEntireMedia: true, detectedLanguage: "tr", summary: "Verified.", discrepancies: [] }, { model: "gemini-3.1-pro-preview", durationMs: 10 });
  const second = normalizeTranscriptFidelityResponse({
    reviewedEntireMedia: true,
    detectedLanguage: "tr",
    summary: "Verified with one local filler difference.",
    discrepancies: [{
      startTimecode: "00:00:05",
      endTimecode: "00:00:06",
      type: "incorrect",
      severity: "minor",
      transcriptExcerpt: "a",
      correction: "e",
      explanation: "Filler only.",
      confidence: 0.8
    }]
  }, { model: "gemini-3.1-pro-preview", durationMs: 20 });

  const aggregate = aggregateChunkFidelityReports([
    { report: first, offsetSeconds: 0 },
    { report: second, offsetSeconds: 120 }
  ], "gemini-3.1-pro-preview");

  assert.equal(aggregate.status, "passed");
  assert.equal(aggregate.durationMs, 30);
  assert.equal(aggregate.discrepancies[0].startTimecode, "00:02:05");
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
    transcription: [{ timecode: "00:00:00", endTimecode: "00:00:20", speaker: "Speaker 1", content: "Test." }],
    evidence: [],
    openQuestions: [],
    telemetry: { durationMs: 1, promptId: "transcript-only", promptHash: "hash", schemaId: "transcript-only", parseAttempts: 1, repairAttempts: 0 }
  };
}
