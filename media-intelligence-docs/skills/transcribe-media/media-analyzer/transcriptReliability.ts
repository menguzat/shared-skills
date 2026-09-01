import type { AnalyzerOutput, TranscriptAttemptSummary, TranscriptFidelityDiscrepancy } from "./schemas.js";
import { parseCanonicalTimecode } from "./transcriptQuality.js";

export const defaultTranscriptAttempts = 2;
export const maximumTranscriptAttempts = 2;

export function transcriptAttemptLimit(value: unknown): number {
  const parsed = Number(value ?? defaultTranscriptAttempts);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximumTranscriptAttempts) {
    throw new Error(`Transcript attempts must be an integer between 1 and ${maximumTranscriptAttempts}.`);
  }
  return parsed;
}

export function summarizeTranscriptAttempt(output: AnalyzerOutput, attempt: number): TranscriptAttemptSummary {
  const quality = output.metadata.transcriptQuality;
  if (!quality) throw new Error("Transcript quality report is required before recording an attempt.");
  return {
    attempt,
    generatedAt: output.metadata.generatedAt,
    model: output.metadata.model,
    transcriptFingerprint: quality.transcriptFingerprint,
    structuralStatus: quality.checks.some((check) => check.status === "failed") ? "failed" : "passed",
    structuralFailures: quality.checks.filter((check) => check.status === "failed").map((check) => check.id),
    fidelityStatus: quality.fidelity?.status || "not-run",
    fidelityDiscrepancies: quality.fidelity?.discrepancies.length || 0
  };
}

export function transcriptRetryInstruction(previous: AnalyzerOutput, nextAttempt: number): string {
  const quality = previous.metadata.transcriptQuality;
  if (!quality) return "Regenerate the complete transcript from the entire media.";
  const structural = quality.checks
    .filter((check) => check.status === "failed")
    .map((check) => `${check.id}: ${check.message} ${JSON.stringify(check.metrics)}`);
  const fidelity = quality.fidelity?.discrepancies.map((item) =>
    `${item.severity}/${item.type} ${item.startTimecode}-${item.endTimecode}: ${item.explanation}; expected correction: ${item.correction}`
  ) || [];
  return [
    `This is full-media transcript generation attempt ${nextAttempt}.`,
    "Regenerate the transcript from the attached media from absolute beginning to absolute end.",
    "Do not patch, copy, or analyze the previous transcript. The media remains the only content authority.",
    "Use the prior gate findings only as an audit checklist so the same omissions or timing defects are not repeated.",
    structural.length ? `Structural findings:\n${structural.join("\n")}` : "Structural checks passed previously.",
    fidelity.length ? `Fidelity findings:\n${fidelity.join("\n")}` : "No concrete fidelity findings were available.",
    "Return one complete replacement transcript in the required schema."
  ].join("\n\n");
}

export function applyConvergentFidelityCorrections(outputs: AnalyzerOutput[]): AnalyzerOutput | undefined {
  if (outputs.length < 2) return undefined;
  const previous = outputs.at(-2)?.metadata.transcriptQuality?.fidelity;
  const latestOutput = outputs.at(-1);
  const latest = latestOutput?.metadata.transcriptQuality?.fidelity;
  if (!previous || !latest || !latestOutput) return undefined;
  const previousBlocking = previous.discrepancies.filter(isBlocking);
  const latestBlocking = latest.discrepancies.filter(isBlocking);
  if (!latestBlocking.length) return undefined;

  const corrected = structuredClone(latestOutput);
  for (const discrepancy of latestBlocking) {
    if (discrepancy.type !== "incorrect" || discrepancy.confidence < 0.9 || discrepancyDuration(discrepancy) > 20) return undefined;
    const convergent = previousBlocking.some((item) =>
      item.type === discrepancy.type
      && rangesOverlap(item, discrepancy)
      && correctionSimilarity(item.correction, discrepancy.correction) >= 0.5
    );
    if (!convergent) return undefined;
    const segment = corrected.transcription.find((item) => item.content.includes(discrepancy.transcriptExcerpt));
    if (!segment || !discrepancy.transcriptExcerpt || !discrepancy.correction) return undefined;
    segment.content = segment.content.replace(discrepancy.transcriptExcerpt, discrepancy.correction);
    segment.notes = [
      segment.notes,
      "İki bağımsız fidelity bulgusunun birleştiği yerel düzeltme uygulandı; medya üzerinde yeniden doğrulanmalıdır."
    ].filter(Boolean).join(" ");
  }
  corrected.metadata.transcriptQuality = undefined;
  corrected.metadata.canonicalTranscript = undefined;
  return corrected;
}

function isBlocking(item: TranscriptFidelityDiscrepancy): boolean {
  if (item.type === "speaker") return false;
  return item.severity === "critical"
    || (item.severity === "major" && item.discussionImpact === "material");
}

function discrepancyDuration(item: TranscriptFidelityDiscrepancy): number {
  const start = parseCanonicalTimecode(item.startTimecode);
  const end = parseCanonicalTimecode(item.endTimecode);
  return start === undefined || end === undefined ? Number.POSITIVE_INFINITY : Math.max(0, end - start);
}

function rangesOverlap(left: TranscriptFidelityDiscrepancy, right: TranscriptFidelityDiscrepancy): boolean {
  const leftStart = parseCanonicalTimecode(left.startTimecode);
  const leftEnd = parseCanonicalTimecode(left.endTimecode);
  const rightStart = parseCanonicalTimecode(right.startTimecode);
  const rightEnd = parseCanonicalTimecode(right.endTimecode);
  if ([leftStart, leftEnd, rightStart, rightEnd].some((value) => value === undefined)) return false;
  return (leftStart as number) <= (rightEnd as number) + 2 && (rightStart as number) <= (leftEnd as number) + 2;
}

function correctionSimilarity(left: string, right: string): number {
  const tokenize = (value: string) => new Set(value.toLocaleLowerCase("tr-TR").match(/[\p{L}\p{N}]+/gu) || []);
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
  const union = new Set([...leftTokens, ...rightTokens]);
  if (!union.size) return 0;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return intersection / union.size;
}
