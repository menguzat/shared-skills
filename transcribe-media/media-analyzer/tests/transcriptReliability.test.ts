import test from "node:test";
import assert from "node:assert/strict";
import type { AnalyzerOutput } from "../schemas.js";
import { applyConvergentFidelityCorrections, transcriptAttemptLimit, transcriptRetryInstruction } from "../transcriptReliability.js";

test("bounds controlled transcript regeneration attempts", () => {
  assert.equal(transcriptAttemptLimit(undefined), 2);
  assert.equal(transcriptAttemptLimit("2"), 2);
  assert.throws(() => transcriptAttemptLimit("3"), /between 1 and 2/);
});

test("retry feedback requires full-media regeneration instead of patching", () => {
  const output = {
    metadata: {
      transcriptQuality: {
        checks: [{ id: "duplicate-content", status: "failed", message: "Repeated", metrics: { duplicateSegments: 2 } }],
        fidelity: { discrepancies: [] }
      }
    }
  } as unknown as AnalyzerOutput;
  const instruction = transcriptRetryInstruction(output, 2);
  assert.match(instruction, /Regenerate the transcript.*beginning.*end/is);
  assert.match(instruction, /Do not patch/i);
  assert.match(instruction, /duplicate-content/);
});

test("applies only short high-confidence corrections repeated by two fidelity reports", () => {
  const first = correctionCandidate(
    "benim Eda'dan okuduğum kadarıyla bir 15 lira",
    "benim Eda'dan okuduğum kadarıyla bir 15 bin lira"
  );
  const second = correctionCandidate(
    "benim AI'da okuduğum kadarıyla bir 15 lira",
    "benim AI'da okuduğum kadarıyla bir 15 bin lira"
  );
  const corrected = applyConvergentFidelityCorrections([first, second]);

  assert.ok(corrected);
  assert.match(corrected.transcription[0].content, /15 bin lira/);
  assert.equal(corrected.metadata.transcriptQuality, undefined);
});

function correctionCandidate(transcriptExcerpt: string, correction: string): AnalyzerOutput {
  return {
    metadata: {
      sourceFile: "/tmp/chunk.mp3",
      generatedAt: "2026-07-24T00:00:00.000Z",
      model: "gemini-3.1-pro-preview",
      analysisStyle: "transcript-only",
      warnings: [],
      transcriptQuality: {
        version: "transcript-quality-v1",
        status: "failed",
        checkedAt: "2026-07-24T00:00:00.000Z",
        sourceDurationSeconds: 480,
        transcriptStartSeconds: 0,
        transcriptEndSeconds: 480,
        timelineCoverageRatio: 1,
        segmentCount: 1,
        transcriptFingerprint: "fingerprint",
        failedChecks: ["fidelity-verification"],
        checks: [],
        fidelity: {
          version: "transcript-fidelity-v1",
          status: "failed",
          checkedAt: "2026-07-24T00:00:00.000Z",
          model: "gemini-3.1-pro-preview",
          durationMs: 1,
          reviewedEntireMedia: true,
          detectedLanguage: "tr",
          summary: "Material amount error.",
          qualityScore: 85,
          blockingDiscrepancies: 1,
          discrepancies: [{
            startTimecode: "00:05:54",
            endTimecode: "00:05:59",
            type: "incorrect",
            severity: "major",
            discussionImpact: "material",
            transcriptExcerpt,
            correction,
            explanation: "Amount differs.",
            confidence: 0.95
          }]
        }
      }
    },
    analysis: { summary: "", qualityNotes: [] },
    transcription: [{
      timecode: "00:05:43",
      endTimecode: "00:05:59",
      speaker: "Speaker 2",
      content: `Başlangıç, ${transcriptExcerpt}, devam.`
    }],
    evidence: [],
    openQuestions: [],
    telemetry: { durationMs: 1, promptId: "transcript-only", promptHash: "hash", schemaId: "transcript-only", parseAttempts: 1, repairAttempts: 0 }
  };
}
