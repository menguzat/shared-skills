import test from "node:test";
import assert from "node:assert/strict";
import type { AnalyzerOutput, TranscriptSegment } from "../schemas.js";
import {
  applyTranscriptQualityReport,
  evaluateTranscriptQuality,
  formatDuration,
  parseCanonicalTimecode
} from "../transcriptQuality.js";

test("passes a complete chronological transcript", () => {
  const report = evaluateTranscriptQuality(output([
    segment("00:00:00", "00:00:55", "First complete turn."),
    segment("00:00:55", "00:02:00", "Second complete turn.")
  ]), { sourceDurationSeconds: 120, mimeType: "audio/aac" });

  assert.equal(report.status, "passed");
  assert.equal(report.timelineCoverageRatio, 1);
  assert.equal(report.transcriptFingerprint.length, 64);
  assert.deepEqual(report.failedChecks, []);
});

test("rejects a transcript with a missing tail", () => {
  const report = evaluateTranscriptQuality(output([
    segment("00:00:00", "00:01:00", "Only the beginning is present.")
  ]), { sourceDurationSeconds: 600, mimeType: "audio/mpeg" });

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("end-boundary"));
  assert.equal(metric(report, "end-boundary", "missingTailSeconds"), 540);
});

test("rejects missing or non-canonical end timecodes", () => {
  const report = evaluateTranscriptQuality(output([
    { timecode: "00:00", speaker: "Speaker 1", content: "Bad start format." },
    { timecode: "00:00:10", speaker: "Speaker 1", content: "Missing end." }
  ]), { sourceDurationSeconds: 20, mimeType: "audio/wav" });

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("canonical-timecodes"));
});

test("rejects large internal gaps and timeline overlaps", () => {
  const report = evaluateTranscriptQuality(output([
    segment("00:00:00", "00:00:30", "Opening."),
    segment("00:02:00", "00:03:00", "A large gap precedes this."),
    segment("00:02:40", "00:05:00", "This overlaps the previous segment too much."),
    segment("00:05:00", "00:10:00", "Closing.")
  ]), { sourceDurationSeconds: 600, mimeType: "video/mp4" });

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("internal-gaps"));
  assert.ok(report.failedChecks.includes("overlaps"));
});

test("rejects repeated long transcript blocks", () => {
  const repeated = "This is a deliberately long transcript block that must not appear in multiple timeline segments because repetition corrupts downstream analysis.";
  const report = evaluateTranscriptQuality(output([
    segment("00:00:00", "00:00:30", repeated),
    segment("00:00:30", "00:01:00", repeated)
  ]), { sourceDurationSeconds: 60, mimeType: "audio/aac" });

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("duplicate-content"));
});

test("rejects timecodes outside the source duration", () => {
  const report = evaluateTranscriptQuality(output([
    segment("00:00:00", "00:01:00", "Opening."),
    segment("00:08:50", "01:00:00", "Malformed source alignment.")
  ]), { sourceDurationSeconds: 64, mimeType: "video/mp4" });

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("valid-ranges"));
});

test("rejects oversized or implausibly dense segments", () => {
  const dense = Array.from({ length: 1000 }, () => "word").join(" ");
  const report = evaluateTranscriptQuality(output([
    segment("00:00:00", "00:00:20", dense)
  ]), { sourceDurationSeconds: 20, mimeType: "audio/aac" });

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("segment-shape"));
});

test("rejects summaries and simulated placeholders as transcript content", () => {
  const report = evaluateTranscriptQuality(output([
    { ...segment("00:00:00", "00:10:00", "[Kalan uzun konuşmanın özeti]"), notes: "Eksik transkripsiyon - simüle edilmiş çıktı." }
  ]), { sourceDurationSeconds: 600, mimeType: "audio/mpeg" });

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("placeholder-content"));
  assert.ok(report.failedChecks.includes("segment-granularity"));
});

test("applies authoritative duration and rejection warning", () => {
  const candidate = output([segment("00:00:00", "00:00:10", "Partial.")]);
  const report = evaluateTranscriptQuality(candidate, { sourceDurationSeconds: 120.125, mimeType: "audio/aac" });
  applyTranscriptQualityReport(candidate, report);

  assert.equal(candidate.metadata.duration, "00:02:00.125");
  assert.equal(candidate.metadata.transcriptQuality?.status, "failed");
  assert.match(candidate.metadata.warnings.join("\n"), /must not be analyzed/);
});

test("parses canonical timecodes and formats durations", () => {
  assert.equal(parseCanonicalTimecode("01:02:03.250"), 3723.25);
  assert.equal(parseCanonicalTimecode("01:62:03"), undefined);
  assert.equal(parseCanonicalTimecode("02:03"), undefined);
  assert.equal(formatDuration(3723.25), "01:02:03.250");
});

function output(transcription: TranscriptSegment[]): AnalyzerOutput {
  return {
    metadata: {
      sourceFile: "/tmp/source.aac",
      generatedAt: "2026-07-22T00:00:00.000Z",
      model: "gemini-test",
      analysisStyle: "transcript-only",
      warnings: []
    },
    analysis: { summary: "", qualityNotes: [] },
    transcription,
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

function segment(timecode: string, endTimecode: string, content: string): TranscriptSegment {
  return { timecode, endTimecode, speaker: "Speaker 1", content };
}

function metric(report: ReturnType<typeof evaluateTranscriptQuality>, checkId: string, name: string): unknown {
  return report.checks.find((check) => check.id === checkId)?.metrics[name];
}
