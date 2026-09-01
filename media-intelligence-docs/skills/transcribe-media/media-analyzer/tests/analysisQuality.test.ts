import test from "node:test";
import assert from "node:assert/strict";
import type { AnalyzerOutput } from "../schemas.js";
import type { VerifiedTranscriptSource } from "../transcriptSource.js";
import { applyAnalysisProvenance, evaluateAnalysisQuality } from "../analysisQuality.js";

test("passes evidence-grounded analysis and reviewable app drafts", () => {
  const source = verifiedSource();
  const output = analysisOutput();
  applyAnalysisProvenance(output, source, { purpose: "operations", targetApp: "oldskool" });
  const report = evaluateAnalysisQuality(output, source, { targetApp: "oldskool" });
  assert.equal(report.status, "passed");
  assert.equal(report.appReadiness, "passed");
});

test("rejects unsupported decisions and direct-write app candidates", () => {
  const source = verifiedSource();
  const output = analysisOutput();
  output.analysis.decisions = ["Unsupported unstructured decision"];
  (output.analysis.resourceCandidates as Array<Record<string, unknown>>)[0].operation = "create";
  applyAnalysisProvenance(output, source, { purpose: "operations", targetApp: "oldskool" });
  const report = evaluateAnalysisQuality(output, source, { targetApp: "oldskool" });
  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("important-claim-evidence"));
  assert.ok(report.failedChecks.includes("app-draft-readiness"));
});

test("rejects oversized and repeated analysis passages", () => {
  const source = verifiedSource();
  const output = analysisOutput();
  const sentence = "Bu operasyonel açıklama aynı içeriği hiçbir yeni kanıt veya anlam eklemeden tekrar ediyor ve raporu kullanılamaz hale getiriyor.";
  output.analysis.timeframe = Array.from({ length: 40 }, () => sentence).join(" ");
  applyAnalysisProvenance(output, source, { purpose: "operations" });

  const report = evaluateAnalysisQuality(output, source);

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("analysis-shape"));
});

test("rejects amounts or currencies whose referenced segment does not contain them", () => {
  const source = verifiedSource();
  const output = analysisOutput();
  output.analysis.moneyMentions = [{
    title: "Yanlış bağlı bütçe",
    amount: 90000,
    currency: "USD",
    modality: "observation",
    timecodes: ["00:00:05"]
  }];
  applyAnalysisProvenance(output, source, { purpose: "operations" });

  const report = evaluateAnalysisQuality(output, source);

  assert.equal(report.status, "failed");
  assert.ok(report.failedChecks.includes("monetary-claim-evidence"));
});

test("accepts Turkish amount forms when amount and currency share the evidence range", () => {
  const source = verifiedSource();
  source.output.transcription[0].content = "Bütçe 3 milyon 300 bin dolar.";
  const output = analysisOutput();
  output.analysis.moneyMentions = [{
    title: "Bütçe",
    amount: 3300000,
    currency: "USD",
    modality: "observation",
    timecodes: ["00:00:00-00:00:20"]
  }];
  applyAnalysisProvenance(output, source, { purpose: "operations" });

  const report = evaluateAnalysisQuality(output, source);

  assert.equal(report.status, "passed");
});

function verifiedSource(): VerifiedTranscriptSource {
  const output = {
    metadata: { sourceFile: "/tmp/source.mp3", language: "tr" },
    transcription: [{ timecode: "00:00:00", endTimecode: "00:00:20", speaker: "Speaker 1", content: "Kapıyı yarın Cem onaracak." }]
  } as AnalyzerOutput;
  return {
    text: "[00:00:00-00:00:20] Speaker 1: Kapıyı yarın Cem onaracak.",
    sidecarPath: "/tmp/v0001.transcript.json",
    sourceMediaFile: "/tmp/source.mp3",
    quality: { transcriptFingerprint: "fingerprint" } as VerifiedTranscriptSource["quality"],
    output
  };
}

function analysisOutput(): AnalyzerOutput {
  return {
    metadata: { sourceFile: "/tmp/v0001.transcript.json", generatedAt: "2026-07-23T00:00:00.000Z", model: "gemini-3.1-pro-preview", analysisStyle: "meeting-analysis", language: "tr", warnings: [] },
    analysis: {
      decisions: [{ title: "Kapı onarımı", description: "Cem kapıyı onaracak.", owner: "Cem", modality: "commitment", timecodes: ["00:00:05"], confidence: 0.9 }],
      resourceCandidates: [{ targetApp: "oldskool", resourceType: "task", operation: "propose", title: "Kapıyı onar", description: "Kapı onarımı", owner: "Cem", modality: "commitment", reviewState: "draft", timecodes: ["00:00:05"], confidence: 0.9 }]
    },
    transcription: [],
    evidence: [{ claim: "Cem kapıyı onarmayı üstlendi.", timecodes: ["00:00:05"], confidence: 0.9 }],
    openQuestions: [],
    telemetry: { durationMs: 1, promptId: "meeting-analysis", promptHash: "hash", schemaId: "meeting-analysis", parseAttempts: 1, repairAttempts: 0 }
  };
}
