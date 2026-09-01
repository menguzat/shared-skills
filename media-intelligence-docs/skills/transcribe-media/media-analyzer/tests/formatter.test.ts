import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderMarkdown, outputPaths, rejectedOutputPaths, writePublishedAnalysis } from "../formatter.js";
import type { AnalyzerOutput } from "../schemas.js";

test("renders structured analysis and transcript markdown", () => {
  const output: AnalyzerOutput = {
    metadata: {
      sourceFile: "/tmp/meeting.mp3",
      generatedAt: "2026-07-15T00:00:00.000Z",
      model: "gemini-test",
      analysisStyle: "meeting-analysis",
      warnings: ["Budget numbers are conversation claims."]
    },
    analysis: {
      meetingTitle: "Test Meeting",
      summary: "A short summary.",
      decisions: ["Use meters."]
    },
    transcription: [{ timecode: "00:00:00", speaker: "Cem", speakerConfidence: 0.9, content: "Let's add meters." }],
    evidence: [{ claim: "Meter decision discussed", timecodes: ["00:00:00"], confidence: 0.9 }],
    openQuestions: ["Who buys the meters?"],
    telemetry: { durationMs: 12, promptId: "meeting-analysis", promptHash: "abc", schemaId: "meeting-analysis", parseAttempts: 1, repairAttempts: 0 }
  };
  const markdown = renderMarkdown(output);
  assert.match(markdown, /# Test Meeting/);
  assert.match(markdown, /## Interpretation Rules And Warnings/);
  assert.match(markdown, /## Transcript/);
  assert.match(markdown, /00:00:00 Cem/);
  assert.equal(outputPaths("/tmp/meeting.mp3").markdown, "/tmp/meeting.analysis.md");
  assert.equal(outputPaths("/tmp/meeting.json", "meeting-analysis").markdown, "/tmp/meeting.meeting-analysis.analysis.md");
  assert.equal(rejectedOutputPaths("/tmp/meeting.mp3").json, "/tmp/.transcripts/meeting/rejected/meeting.analysis.rejected.json");
});

test("publishes analysis and full transcript beside the source media", async () => {
  const directory = await mkdtemp(join(tmpdir(), "media-analysis-"));
  const sourceMedia = join(directory, "meeting.mp3");
  const analysis: AnalyzerOutput = {
    metadata: {
      sourceFile: "/tmp/v0001.transcript.json",
      generatedAt: "2026-07-24T00:00:00.000Z",
      model: "gemini-test",
      analysisStyle: "meeting-analysis",
      warnings: []
    },
    analysis: { meetingTitle: "Test Analysis", executiveSummary: "Summary." },
    transcription: [],
    evidence: [],
    openQuestions: [],
    telemetry: { durationMs: 1, promptId: "meeting-analysis", promptHash: "hash", schemaId: "meeting-analysis", parseAttempts: 1, repairAttempts: 0 }
  };
  const transcript: AnalyzerOutput = {
    ...analysis,
    metadata: {
      ...analysis.metadata,
      sourceFile: sourceMedia,
      analysisStyle: "transcript-only"
    },
    analysis: {},
    transcription: [{ timecode: "00:00:00", endTimecode: "00:00:05", speaker: "Speaker 1", content: "Complete transcript." }]
  };

  const paths = await writePublishedAnalysis(sourceMedia, analysis, transcript);
  assert.equal(paths.markdown, join(directory, "meeting-analiz.md"));
  assert.equal(paths.json, join(directory, ".transcripts", "meeting", "published", "meeting-analiz.json"));
  const markdown = await readFile(paths.markdown, "utf8");
  const json = JSON.parse(await readFile(paths.json, "utf8")) as AnalyzerOutput;
  await assert.rejects(readFile(join(directory, "meeting-analiz.json"), "utf8"));
  assert.match(markdown, /Complete transcript\./);
  assert.doesNotMatch(markdown, /Raw JSON/);
  assert.equal(json.metadata.sourceFile, sourceMedia);
  assert.equal(json.transcription.length, 1);
});

test("renders action items without meaningless money fields", () => {
  const output: AnalyzerOutput = {
    metadata: {
      sourceFile: "/tmp/meeting.md",
      generatedAt: "2026-07-15T00:00:00.000Z",
      model: "gemini-test",
      analysisStyle: "meeting-analysis",
      warnings: []
    },
    analysis: {
      meetingTitle: "Tasks",
      actionItems: [{
        title: "Finalize rooms",
        description: "Calculate final room allocation.",
        owner: "Cem",
        status: "open",
        amount: 0,
        currency: "TRY",
        timecodes: ["00:28:59"],
        confidence: 0.9
      }],
      moneyMentions: [{
        title: "Storage rent",
        description: "Monthly storage room rent.",
        owner: "Cem",
        status: "negotiated",
        amount: 15000,
        currency: "TRY",
        timecodes: ["00:28:59"],
        confidence: 0.9
      }]
    },
    transcription: [],
    evidence: [],
    openQuestions: [],
    telemetry: { durationMs: 12, promptId: "meeting-analysis", promptHash: "abc", schemaId: "meeting-analysis", parseAttempts: 1, repairAttempts: 0 }
  };
  const markdown = renderMarkdown(output);
  assert.match(markdown, /\*\*Finalize rooms\*\* - Calculate final room allocation\./);
  assert.doesNotMatch(markdown, /amount: 0 TRY/);
  assert.match(markdown, /amount: 15000 TRY/);
});

test("renders transcript quality failures and fidelity results", () => {
  const output: AnalyzerOutput = {
    metadata: {
      sourceFile: "/tmp/meeting.aac",
      generatedAt: "2026-07-22T00:00:00.000Z",
      model: "gemini-test",
      analysisStyle: "transcript-only",
      warnings: [],
      transcriptQuality: {
        version: "transcript-quality-v1",
        status: "failed",
        checkedAt: "2026-07-22T00:00:01.000Z",
        sourceDurationSeconds: 120,
        transcriptStartSeconds: 0,
        transcriptEndSeconds: 60,
        timelineCoverageRatio: 0.5,
        segmentCount: 1,
        transcriptFingerprint: "abc",
        failedChecks: ["end-boundary", "fidelity-verification"],
        checks: [{ id: "end-boundary", status: "failed", message: "Missing tail.", metrics: { missingTailSeconds: 60 } }],
        fidelity: {
          version: "transcript-fidelity-v1",
          status: "failed",
          checkedAt: "2026-07-22T00:00:02.000Z",
          model: "gemini-3.1-pro-preview",
          durationMs: 100,
          reviewedEntireMedia: true,
          detectedLanguage: "tr",
          summary: "A section is missing.",
          qualityScore: 0,
          blockingDiscrepancies: 1,
          discrepancies: []
        }
      }
    },
    analysis: {},
    transcription: [{ timecode: "00:00:00", endTimecode: "00:01:00", speaker: "Speaker 1", content: "Partial." }],
    evidence: [],
    openQuestions: [],
    telemetry: { durationMs: 1, promptId: "transcript-only", promptHash: "hash", schemaId: "transcript-only", parseAttempts: 1, repairAttempts: 0 }
  };
  const markdown = renderMarkdown(output);
  assert.match(markdown, /Transcript Quality Gate/);
  assert.match(markdown, /end-boundary/);
  assert.match(markdown, /Fidelity Verification/);
});
