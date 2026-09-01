import type {
  AnalysisProvenance,
  AnalysisQualityCheck,
  AnalysisQualityReport,
  AnalyzerOutput,
  ClaimModality
} from "./schemas.js";
import type { VerifiedTranscriptSource } from "./transcriptSource.js";
import { parseCanonicalTimecode } from "./transcriptQuality.js";

export const analysisQualityVersion = "analysis-quality-v1" as const;

const modalities: ClaimModality[] = [
  "observation",
  "proposal",
  "decision",
  "commitment",
  "disagreement",
  "assumption",
  "analyst-recommendation"
];

export function applyAnalysisProvenance(output: AnalyzerOutput, source: VerifiedTranscriptSource, options: {
  purpose: string;
  targetApp?: string;
}): AnalysisProvenance {
  const provenance: AnalysisProvenance = {
    schemaVersion: "analysis-provenance-v1",
    sourceTranscriptFingerprint: source.quality.transcriptFingerprint,
    sourceTranscriptSidecar: source.sidecarPath,
    sourceMediaFile: source.sourceMediaFile,
    analysisPurpose: options.purpose,
    promptId: output.telemetry.promptId,
    promptHash: output.telemetry.promptHash,
    targetApp: options.targetApp,
    generatedAt: new Date().toISOString()
  };
  output.metadata.analysisProvenance = provenance;
  return provenance;
}

export function evaluateAnalysisQuality(output: AnalyzerOutput, source: VerifiedTranscriptSource, options: {
  targetApp?: string;
} = {}): AnalysisQualityReport {
  const checks: AnalysisQualityCheck[] = [];
  const fingerprint = source.quality.transcriptFingerprint;
  const provenance = output.metadata.analysisProvenance;
  addCheck(
    checks,
    "transcript-provenance",
    provenance?.sourceTranscriptFingerprint === fingerprint,
    "Analysis must identify the exact certified transcript fingerprint.",
    { expected: fingerprint, actual: provenance?.sourceTranscriptFingerprint }
  );

  const sourceLanguage = source.output.metadata.language || source.quality.fidelity?.detectedLanguage || "";
  const outputLanguage = output.metadata.language || "";
  addCheck(
    checks,
    "source-language",
    !sourceLanguage || !outputLanguage || normalizeLanguage(sourceLanguage) === normalizeLanguage(outputLanguage),
    "Analysis language must match the certified transcript language unless an explicit translation workflow is used.",
    { sourceLanguage, outputLanguage }
  );

  const analysisStrings = collectAnalysisStrings(output.analysis);
  const oversizedFields = analysisStrings
    .filter((item) => item.value.length > 4_000)
    .map((item) => ({ path: item.path, characters: item.value.length }));
  const repeatedPassages = analysisStrings
    .map((item) => ({ path: item.path, repeats: repeatedSentences(item.value) }))
    .filter((item) => item.repeats.length > 0);
  addCheck(
    checks,
    "analysis-shape",
    oversizedFields.length === 0 && repeatedPassages.length === 0,
    "Analysis fields must remain concise and must not repeat the same passage.",
    { oversizedFields, repeatedPassages }
  );

  const evidenceReferences = output.evidence.flatMap((item, index) =>
    item.timecodes.map((timecode) => ({ path: `evidence[${index}]`, timecode }))
  );
  const evidenceWithoutReferences = output.evidence
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.timecodes.length === 0)
    .map(({ index }) => `evidence[${index}]`);
  const invalidEvidenceReferences = evidenceReferences.filter((item) => !referenceExists(item.timecode, source)).map((item) => `${item.path}:${item.timecode}`);
  addCheck(
    checks,
    "evidence-references",
    evidenceWithoutReferences.length === 0 && invalidEvidenceReferences.length === 0,
    "Every evidence claim must reference a segment in the certified transcript.",
    { missing: evidenceWithoutReferences, invalid: invalidEvidenceReferences }
  );

  const important = collectImportantClaims(output.analysis);
  const missingTimecodes = important.filter((item) => item.timecodes.length === 0).map((item) => item.path);
  const invalidClaimReferences = important.flatMap((item) =>
    item.timecodes.filter((timecode) => !referenceExists(timecode, source)).map((timecode) => `${item.path}:${timecode}`)
  );
  const missingOrInvalidModalities = important
    .filter((item) => !modalities.includes(item.modality as ClaimModality))
    .map((item) => item.path);
  addCheck(
    checks,
    "important-claim-evidence",
    missingTimecodes.length === 0 && invalidClaimReferences.length === 0,
    "Decisions, tasks, amounts, dates, owners, and legal or financial claims require certified transcript references.",
    { claimCount: important.length, missingTimecodes, invalidReferences: invalidClaimReferences }
  );
  const ungroundedMonetaryClaims = important
    .filter((item) => item.amount !== undefined)
    .filter((item) => !monetaryClaimIsGrounded(item, source))
    .map((item) => ({ path: item.path, amount: item.amount, currency: item.currency, timecodes: item.timecodes }));
  addCheck(
    checks,
    "monetary-claim-evidence",
    ungroundedMonetaryClaims.length === 0,
    "Every amount and currency must occur in the referenced certified transcript segment.",
    { ungrounded: ungroundedMonetaryClaims }
  );
  addCheck(
    checks,
    "claim-modality",
    missingOrInvalidModalities.length === 0,
    "Important claims must distinguish observations, proposals, decisions, commitments, disagreements, assumptions, and analyst recommendations.",
    { invalid: missingOrInvalidModalities, allowed: modalities }
  );

  const appIssues = options.targetApp ? validateResourceCandidates(output.analysis.resourceCandidates, options.targetApp, source) : [];
  addCheck(
    checks,
    "app-draft-readiness",
    !options.targetApp || appIssues.length === 0,
    "Target-app candidates must be reviewable drafts with valid transcript evidence and no direct-write operation.",
    { targetApp: options.targetApp, issues: appIssues }
  );

  const failedChecks = checks.filter((check) => check.status === "failed").map((check) => check.id);
  const appReadiness = options.targetApp
    ? (appIssues.length ? "failed" : "passed")
    : "not-requested";
  return {
    version: analysisQualityVersion,
    status: failedChecks.length ? "failed" : "passed",
    appReadiness,
    checkedAt: new Date().toISOString(),
    sourceTranscriptFingerprint: fingerprint,
    targetApp: options.targetApp,
    failedChecks,
    checks
  };
}

export function applyAnalysisQualityReport(output: AnalyzerOutput, report: AnalysisQualityReport): AnalyzerOutput {
  output.metadata.analysisQuality = report;
  
  output.metadata.warnings = output.metadata.warnings?.filter((warning) => 
    !warning.startsWith("Analysis quality warnings:")
    && !warning.startsWith("Analysis quality gate failed:")
  ) || [];

  if (report.status === "failed") {
    output.metadata.warnings = Array.from(new Set([
      ...output.metadata.warnings,
      `Analysis quality gate failed: ${report.failedChecks.join(", ")}. This analysis is rejected and cannot create app drafts.`
    ]));
  }

  return output;
}

interface ImportantClaim {
  path: string;
  timecodes: string[];
  modality: string;
  amount?: number;
  currency?: string;
}

function collectAnalysisStrings(value: unknown, path = "analysis"): Array<{ path: string; value: string }> {
  if (typeof value === "string") return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => collectAnalysisStrings(item, `${path}[${index}]`));
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => collectAnalysisStrings(item, `${path}.${key}`));
}

function repeatedSentences(value: string): string[] {
  const counts = new Map<string, number>();
  for (const sentence of value.split(/(?<=[.!?])\s+|;\s+/)) {
    const normalized = sentence.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
    if (normalized.length < 80) continue;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([sentence, count]) => `${count}x ${sentence.slice(0, 160)}`);
}

function collectImportantClaims(analysis: Record<string, unknown>): ImportantClaim[] {
  const claims: ImportantClaim[] = [];
  for (const [section, value] of Object.entries(analysis)) {
    if (section === "resourceCandidates") continue;
    if (!Array.isArray(value)) continue;
    value.forEach((item, index) => {
      const path = `${section}[${index}]`;
      if (typeof item === "string") {
        if (isHighImpactSection(section)) claims.push({ path, timecodes: [], modality: "" });
        return;
      }
      if (!item || typeof item !== "object") return;
      const record = item as Record<string, unknown>;
      if (!isHighImpactSection(section) && !hasHighImpactFields(record)) return;
      claims.push({
        path,
        timecodes: stringList(record.timecodes),
        modality: stringValue(record.modality),
        amount: finiteNumber(record.amount),
        currency: stringValue(record.currency) || undefined
      });
    });
  }
  return claims;
}

function monetaryClaimIsGrounded(claim: ImportantClaim, source: VerifiedTranscriptSource): boolean {
  if (claim.amount === undefined) return true;
  const evidenceText = claim.timecodes.flatMap((reference) => segmentsForReference(reference, source))
    .map((segment) => segment.content)
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  if (!amountAppears(claim.amount, evidenceText)) return false;
  if (!claim.currency) return true;
  const currencyPatterns: Record<string, RegExp> = {
    TRY: /\b(?:tl|try|lira|lirası|lirasını|türk lirası)\b/i,
    USD: /\b(?:usd|dolar|doları)\b/i,
    EUR: /\b(?:eur|euro|avro)\b/i,
    GBP: /\b(?:gbp|sterlin|pound)\b/i
  };
  const pattern = currencyPatterns[claim.currency.toUpperCase()];
  return pattern ? pattern.test(evidenceText) : evidenceText.includes(claim.currency.toLocaleLowerCase("tr-TR"));
}

function segmentsForReference(reference: string, source: VerifiedTranscriptSource): AnalyzerOutput["transcription"] {
  const matches = [...reference.matchAll(/\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?/g)]
    .map((match) => parseCanonicalTimecode(match[0]))
    .filter((value): value is number => value !== undefined);
  if (!matches.length) return [];
  const rangeStart = matches[0];
  const rangeEnd = matches[1] ?? matches[0];
  return source.output.transcription.filter((segment) => {
    const start = parseCanonicalTimecode(segment.timecode);
    const end = parseCanonicalTimecode(segment.endTimecode);
    return start !== undefined && end !== undefined && end >= rangeStart - 0.001 && start <= rangeEnd + 0.001;
  });
}

function amountAppears(amount: number, text: string): boolean {
  const candidates = new Set<string>([
    String(amount),
    amount.toLocaleString("tr-TR"),
    amount.toLocaleString("en-US")
  ]);
  if (amount >= 1_000_000) {
    const millions = Math.floor(amount / 1_000_000);
    const remainder = amount % 1_000_000;
    candidates.add(`${String(amount / 1_000_000).replace(".", ",")} milyon`);
    if (remainder && remainder % 1_000 === 0) candidates.add(`${millions} milyon ${remainder / 1_000} bin`);
  } else if (amount >= 1_000 && amount % 1_000 === 0) {
    candidates.add(`${amount / 1_000} bin`);
  } else if (amount >= 1_000) {
    candidates.add(`${Math.floor(amount / 1_000)} bin ${amount % 1_000}`);
  }
  return [...candidates].some((candidate) => text.includes(candidate.toLocaleLowerCase("tr-TR")));
}

function finiteNumber(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function validateResourceCandidates(value: unknown, targetApp: string, source: VerifiedTranscriptSource): string[] {
  if (!Array.isArray(value)) return ["resourceCandidates must be an array when --target-app is used"];
  const issues: string[] = [];
  value.forEach((item, index) => {
    const path = `resourceCandidates[${index}]`;
    if (!item || typeof item !== "object") {
      issues.push(`${path} is not an object`);
      return;
    }
    const candidate = item as Record<string, unknown>;
    if (stringValue(candidate.targetApp).toLowerCase() !== targetApp.toLowerCase()) issues.push(`${path} targetApp mismatch`);
    if (stringValue(candidate.reviewState).toLowerCase() !== "draft") issues.push(`${path} reviewState must be draft`);
    if (stringValue(candidate.operation).toLowerCase() !== "propose") issues.push(`${path} operation must be propose`);
    if (!modalities.includes(stringValue(candidate.modality) as ClaimModality)) issues.push(`${path} modality is invalid`);
    const timecodes = stringList(candidate.timecodes);
    if (!timecodes.length) issues.push(`${path} has no transcript evidence`);
    timecodes.filter((timecode) => !referenceExists(timecode, source)).forEach((timecode) => issues.push(`${path} invalid reference ${timecode}`));
  });
  return issues;
}

function referenceExists(reference: string, source: VerifiedTranscriptSource): boolean {
  const match = reference.match(/\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?/);
  const seconds = parseCanonicalTimecode(match?.[0]);
  if (seconds === undefined) return false;
  return source.output.transcription.some((segment) => {
    const start = parseCanonicalTimecode(segment.timecode);
    const end = parseCanonicalTimecode(segment.endTimecode);
    return start !== undefined && end !== undefined && seconds >= start - 0.001 && seconds <= end + 0.001;
  });
}

function isHighImpactSection(section: string): boolean {
  return /decision|action|task|money|revenue|budget|finance|founder|legal|compliance|roadmap|calendar|risk/i.test(section);
}

function hasHighImpactFields(item: Record<string, unknown>): boolean {
  return ["owner", "amount", "currency", "date", "timeframe"].some((key) => item[key] !== undefined && item[key] !== "");
}

function normalizeLanguage(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (/^(tr|tur|turkish|türkçe)/.test(normalized)) return "tr";
  if (/^(en|eng|english)/.test(normalized)) return "en";
  return normalized.split(/[-_ ]/)[0];
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(stringValue).filter(Boolean) : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function addCheck(checks: AnalysisQualityCheck[], id: string, passed: boolean, message: string, metrics: Record<string, unknown>): void {
  checks.push({ id, status: passed ? "passed" : "failed", message, metrics });
}
