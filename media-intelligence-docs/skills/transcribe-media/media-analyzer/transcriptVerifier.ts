import { GoogleGenAI, createPartFromUri, createUserContent } from "@google/genai";
import type { PreparedMedia } from "./mediaHandler.js";
import type {
  AnalyzerOutput,
  TranscriptFidelityDiscrepancy,
  TranscriptFidelityReport
} from "./schemas.js";
import { parseJsonObject } from "./structuredJson.js";
import { generateGeminiTextStream } from "./geminiRetry.js";
import { assertAllowedGeminiModel } from "./geminiCore.js";
import { offsetTimecode } from "./mediaChunker.js";

export const transcriptFidelityVersion = "transcript-fidelity-v1" as const;

const fidelityResponseSchema = {
  type: "OBJECT",
  properties: {
    reviewedEntireMedia: { type: "BOOLEAN" },
    detectedLanguage: { type: "STRING" },
    summary: { type: "STRING" },
    discrepancies: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          startTimecode: { type: "STRING" },
          endTimecode: { type: "STRING" },
          type: { type: "STRING" },
          severity: { type: "STRING" },
          discussionImpact: { type: "STRING" },
          transcriptExcerpt: { type: "STRING" },
          correction: { type: "STRING" },
          explanation: { type: "STRING" },
          confidence: { type: "NUMBER" }
        },
        required: ["startTimecode", "endTimecode", "type", "severity", "discussionImpact", "transcriptExcerpt", "correction", "explanation", "confidence"]
      }
    }
  },
  required: ["reviewedEntireMedia", "detectedLanguage", "summary", "discrepancies"]
} as const;

export async function verifyTranscriptFidelity(options: {
  media: PreparedMedia;
  transcript: AnalyzerOutput;
  model: string;
}): Promise<TranscriptFidelityReport> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for transcript fidelity verification.");
  const started = Date.now();
  const model = assertAllowedGeminiModel(options.model);
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 0 } });
  const mediaPart = options.media.mode === "inline"
    ? { inlineData: options.media.inlineData }
    : createPartFromUri(options.media.uploadedFile?.uri || "", options.media.uploadedFile?.mimeType || options.media.mimeType);
  const transcript = options.transcript.transcription.map((segment) => {
    const notes = segment.notes ? `\nNote: ${segment.notes}` : "";
    return `[${segment.timecode}-${segment.endTimecode}] ${segment.speaker}: ${segment.content}${notes}`;
  }).join("\n\n");
  const prompt = [
    "You are the independent fidelity verifier for a media transcription pipeline.",
    "Review the attached media from its absolute beginning to its absolute end without chunking or sampling.",
    "Compare every transcript segment against the media. Do not summarize the conversation and do not create tasks or analysis.",
    "Report only concrete fidelity discrepancies:",
    "- missing: audible speech or meaningful non-speech is absent from the transcript",
    "- incorrect: wording changes names, numbers, dates, negation, commitment, intent, or substantive meaning",
    "- invented: transcript content is not present in the media",
    "- speaker: a turn is attributed to the wrong stable speaker label",
    "- language: source language or language switching is represented incorrectly.",
    "Use critical severity only for missing sections, clearly hallucinated passages, or errors that make the overall discussion materially false. Use major for substantive local errors and minor for harmless local substitutions.",
    "Set discussionImpact to material only when the discrepancy changes a decision, commitment, intent, negation, important name/number/date, or the overall meaning of the discussion. Otherwise use local or none.",
    "Speaker attribution discrepancies never have material discussion impact. They affect the quality score but never block certification.",
    "Important Exception for Background Media: Descriptive placeholders for non-participant background media (e.g. `[Video sesi duyulur...]`, `[Music playing]`) are completely acceptable. Do NOT flag them as 'missing' audio or as a discrepancy. They are valid summaries of non-meeting speech.",
    "Ignore punctuation, casing, and harmless filler differences.",
    "Set reviewedEntireMedia true only after comparing the complete timeline. Return strictly valid JSON matching the schema.",
    "Transcript to verify:",
    transcript
  ].join("\n\n");
  const generation = await generateGeminiTextStream(ai, {
    model,
    contents: createUserContent([mediaPart as any, { text: prompt }] as any),
    config: {
      responseMimeType: "application/json",
      responseSchema: fidelityResponseSchema as any,
      maxOutputTokens: 16_384,
      thinkingConfig: { thinkingLevel: "LOW", includeThoughts: false },
      httpOptions: { timeout: 0 }
    } as any
  }, "Transcript fidelity verification");
  const parsed = parseJsonObject(generation.text, (value) => normalizeTranscriptFidelityResponse(value, {
    model,
    durationMs: Date.now() - started,
    usage: generation.usage
  }));
  if (!parsed.ok || !parsed.data) {
    throw new Error(`Transcript fidelity response was not valid JSON: ${parsed.error || "unknown parse error"}`);
  }
  return parsed.data;
}

export function normalizeTranscriptFidelityResponse(value: unknown, fallback: { model: string; durationMs: number; usage?: TranscriptFidelityReport["usage"] }): TranscriptFidelityReport {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const discrepancies = Array.isArray(raw.discrepancies)
    ? raw.discrepancies.map(normalizeDiscrepancy).filter((item): item is TranscriptFidelityDiscrepancy => Boolean(item))
    : [];
  const reviewedEntireMedia = raw.reviewedEntireMedia === true;
  const summary = stringValue(raw.summary);
  const inaccessibleMedia = indicatesInaccessibleMedia(summary);
  const blockingDiscrepancies = discrepancies.filter(isBlockingDiscrepancy).length;
  return {
    version: transcriptFidelityVersion,
    status: reviewedEntireMedia && !inaccessibleMedia && blockingDiscrepancies === 0 ? "passed" : "failed",
    checkedAt: new Date().toISOString(),
    model: fallback.model,
    durationMs: fallback.durationMs,
    reviewedEntireMedia,
    detectedLanguage: stringValue(raw.detectedLanguage),
    summary,
    qualityScore: fidelityQualityScore(discrepancies),
    blockingDiscrepancies,
    discrepancies,
    usage: fallback.usage
  };
}

export function isTranscriptFidelityReportAcceptable(report: TranscriptFidelityReport): boolean {
  return report.reviewedEntireMedia
    && !indicatesInaccessibleMedia(report.summary)
    && !report.discrepancies.some(isBlockingDiscrepancy);
}

export function aggregateChunkFidelityReports(parts: Array<{ report: TranscriptFidelityReport; offsetSeconds: number }>, model: string): TranscriptFidelityReport {
  const discrepancies = parts.flatMap(({ report, offsetSeconds }) => report.discrepancies.map((item) => ({
    ...item,
    startTimecode: offsetTimecode(item.startTimecode, offsetSeconds),
    endTimecode: offsetTimecode(item.endTimecode, offsetSeconds)
  })));
  const accepted = parts.length > 0 && parts.every(({ report }) => isTranscriptFidelityReportAcceptable(report));
  const blockingDiscrepancies = discrepancies.filter(isBlockingDiscrepancy).length;
  return {
    version: transcriptFidelityVersion,
    status: accepted ? "passed" : "failed",
    checkedAt: new Date().toISOString(),
    model,
    durationMs: parts.reduce((total, { report }) => total + report.durationMs, 0),
    reviewedEntireMedia: parts.length > 0 && parts.every(({ report }) => report.reviewedEntireMedia),
    detectedLanguage: Array.from(new Set(parts.map(({ report }) => report.detectedLanguage).filter(Boolean))).join(", "),
    summary: accepted
      ? `Verified all ${parts.length} sequential media excerpts independently.`
      : `One or more of ${parts.length} sequential media excerpt verifications failed.`,
    qualityScore: fidelityQualityScore(discrepancies),
    blockingDiscrepancies,
    discrepancies
    ,usage: sumFidelityUsage(parts)
  };
}

function sumFidelityUsage(parts: Array<{ report: TranscriptFidelityReport }>): TranscriptFidelityReport["usage"] {
  return parts.reduce<NonNullable<TranscriptFidelityReport["usage"]>>((total, { report }) => ({
    promptTokenCount: total.promptTokenCount + (report.usage?.promptTokenCount || 0),
    candidatesTokenCount: total.candidatesTokenCount + (report.usage?.candidatesTokenCount || 0),
    thoughtsTokenCount: total.thoughtsTokenCount + (report.usage?.thoughtsTokenCount || 0),
    cachedContentTokenCount: total.cachedContentTokenCount + (report.usage?.cachedContentTokenCount || 0),
    totalTokenCount: total.totalTokenCount + (report.usage?.totalTokenCount || 0)
  }), { promptTokenCount: 0, candidatesTokenCount: 0, thoughtsTokenCount: 0, cachedContentTokenCount: 0, totalTokenCount: 0 });
}

function indicatesInaccessibleMedia(summary: string): boolean {
  const normalized = summary.toLocaleLowerCase("en-US");
  return [
    /no (?:media|audio|video)(?: file)? (?:was )?(?:provided|attached|available)/,
    /no\b[^.]{0,40}\b(?:media|audio|video)(?: file)?\b[^.]{0,20}\b(?:provided|attached|available)\b/,
    /(?:media|audio|video)(?: file)? (?:was )?not (?:provided|attached|available|accessible)/,
    /cannot (?:access|review|verify|evaluate) (?:the )?(?:media|audio|video)/,
    /medya (?:dosyası )?(?:sağlanmadı|eklenmedi|yok|erişilemiyor)/,
    /ses (?:dosyası )?(?:sağlanmadı|eklenmedi|yok|erişilemiyor)/
  ].some((pattern) => pattern.test(normalized));
}

export function applyTranscriptFidelityReport(output: AnalyzerOutput, fidelity: TranscriptFidelityReport): AnalyzerOutput {
  const quality = output.metadata.transcriptQuality;
  if (!quality) throw new Error("Structural transcript quality report is required before fidelity verification.");
  quality.fidelity = fidelity;
  if (fidelity.status === "failed") {
    quality.status = "failed";
    quality.failedChecks = Array.from(new Set([...quality.failedChecks, "fidelity-verification"]));
    output.metadata.warnings = Array.from(new Set([
      ...output.metadata.warnings,
      "Transcript fidelity verification failed. This output is rejected and must not be analyzed."
    ]));
  }
  return output;
}

function normalizeDiscrepancy(value: unknown): TranscriptFidelityDiscrepancy | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const types: TranscriptFidelityDiscrepancy["type"][] = ["missing", "incorrect", "invented", "speaker", "language", "other"];
  const severities: TranscriptFidelityDiscrepancy["severity"][] = ["minor", "major", "critical"];
  const type = types.includes(raw.type as TranscriptFidelityDiscrepancy["type"])
    ? raw.type as TranscriptFidelityDiscrepancy["type"]
    : "other";
  const severity = severities.includes(raw.severity as TranscriptFidelityDiscrepancy["severity"])
    ? raw.severity as TranscriptFidelityDiscrepancy["severity"]
    : "major";
  const impacts: TranscriptFidelityDiscrepancy["discussionImpact"][] = ["none", "local", "material"];
  const discussionImpact = impacts.includes(raw.discussionImpact as TranscriptFidelityDiscrepancy["discussionImpact"])
    ? raw.discussionImpact as TranscriptFidelityDiscrepancy["discussionImpact"]
    : type === "speaker" || severity === "minor" ? "local" : "material";
  return {
    startTimecode: stringValue(raw.startTimecode),
    endTimecode: stringValue(raw.endTimecode),
    type,
    severity,
    discussionImpact,
    transcriptExcerpt: stringValue(raw.transcriptExcerpt),
    correction: stringValue(raw.correction),
    explanation: stringValue(raw.explanation),
    confidence: numberValue(raw.confidence, 0.5)
  };
}

function isBlockingDiscrepancy(item: TranscriptFidelityDiscrepancy): boolean {
  if (item.type === "speaker") return false;
  return item.severity === "critical" || (item.severity === "major" && item.discussionImpact === "material");
}

function fidelityQualityScore(discrepancies: TranscriptFidelityDiscrepancy[]): number {
  const deduction = discrepancies.reduce((total, item) => {
    if (item.type === "speaker") {
      return total + (item.severity === "critical" ? 3 : item.severity === "major" ? 1.5 : 0.25);
    }
    if (item.severity === "critical") return total + 30;
    if (item.severity === "major") return total + (item.discussionImpact === "material" ? 15 : 3);
    return total + 0.5;
  }, 0);
  return Math.max(0, Math.round((100 - deduction) * 10) / 10);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown, fallback: number): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : fallback;
}
