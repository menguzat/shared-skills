export type AnalysisStyle =
  | "transcript-only"
  | "meeting-analysis"
  | "oldskool-operational-analysis"
  | "reconciliation-report"
  | "conversation-knowledge"
  | "custom";

export interface TranscriptSegment {
  timecode: string;
  endTimecode?: string;
  speaker: string;
  speakerConfidence?: number;
  content: string;
  notes?: string;
}

export interface EvidenceClaim {
  claim: string;
  timecodes: string[];
  confidence: number;
}

export interface AnalyzerMetadata {
  sourceFile: string;
  generatedAt: string;
  model: string;
  analysisStyle: AnalysisStyle;
  language?: string;
  duration?: string;
  warnings: string[];
  localizedHeadings?: Record<string, string>;
  transcriptQuality?: TranscriptQualityReport;
  transcriptAttempts?: TranscriptAttemptSummary[];
  canonicalTranscript?: CanonicalTranscriptCertificate;
  analysisProvenance?: AnalysisProvenance;
  analysisQuality?: AnalysisQualityReport;
}

export interface TranscriptAttemptSummary {
  attempt: number;
  generatedAt: string;
  model: string;
  transcriptFingerprint: string;
  structuralStatus: "passed" | "failed";
  structuralFailures: string[];
  fidelityStatus: "passed" | "failed" | "not-run";
  fidelityDiscrepancies: number;
}

export interface CanonicalTranscriptCertificate {
  schemaVersion: "canonical-transcript-v1";
  version: number;
  certifiedAt: string;
  sourceMediaSha256: string;
  sourceSizeBytes: number;
  sourceMtimeMs: number;
  transcriptFingerprint: string;
  supersedesFingerprint?: string;
  correctionReason?: string;
  manifestPath: string;
}

export type ClaimModality = "observation" | "proposal" | "decision" | "commitment" | "disagreement" | "assumption" | "analyst-recommendation";

export interface AnalysisProvenance {
  schemaVersion: "analysis-provenance-v1";
  sourceTranscriptFingerprint: string;
  sourceTranscriptSidecar: string;
  sourceMediaFile: string;
  analysisPurpose: string;
  promptId: string;
  promptHash: string;
  targetApp?: string;
  generatedAt: string;
}

export interface AnalysisQualityCheck {
  id: string;
  status: "passed" | "failed";
  message: string;
  metrics: Record<string, unknown>;
}

export interface AnalysisQualityReport {
  version: "analysis-quality-v1";
  status: "passed" | "failed";
  appReadiness: "not-requested" | "passed" | "failed";
  checkedAt: string;
  sourceTranscriptFingerprint: string;
  targetApp?: string;
  failedChecks: string[];
  checks: AnalysisQualityCheck[];
}

export interface TranscriptQualityCheck {
  id: string;
  status: "passed" | "failed";
  message: string;
  metrics: Record<string, unknown>;
}

export interface TranscriptQualityReport {
  version: string;
  status: "passed" | "failed";
  checkedAt: string;
  sourceDurationSeconds: number;
  transcriptStartSeconds?: number;
  transcriptEndSeconds?: number;
  timelineCoverageRatio: number;
  segmentCount: number;
  transcriptFingerprint: string;
  fidelity?: TranscriptFidelityReport;
  failedChecks: string[];
  checks: TranscriptQualityCheck[];
}

export interface TranscriptFidelityDiscrepancy {
  startTimecode: string;
  endTimecode: string;
  type: "missing" | "incorrect" | "invented" | "speaker" | "language" | "other";
  severity: "minor" | "major" | "critical";
  discussionImpact: "none" | "local" | "material";
  transcriptExcerpt: string;
  correction: string;
  explanation: string;
  confidence: number;
}

export interface TranscriptFidelityReport {
  version: "transcript-fidelity-v1";
  status: "passed" | "failed";
  checkedAt: string;
  model: string;
  durationMs: number;
  reviewedEntireMedia: boolean;
  detectedLanguage: string;
  summary: string;
  qualityScore: number;
  blockingDiscrepancies: number;
  discrepancies: TranscriptFidelityDiscrepancy[];
  usage?: GeminiUsageMetadata;
}

export interface GeminiUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  thoughtsTokenCount: number;
  cachedContentTokenCount: number;
  totalTokenCount: number;
}

export interface GeminiUsageAttempt extends GeminiUsageMetadata {
  stage: string;
  model: string;
  attempt: number;
}

export interface AnalyzerTelemetry {
  tokensIn?: number;
  tokensOut?: number;
  usage?: GeminiUsageMetadata;
  usageAttempts?: GeminiUsageAttempt[];
  durationMs: number;
  promptId: string;
  promptHash: string;
  schemaId: string;
  parseAttempts: number;
  repairAttempts: number;
}

export interface AnalyzerOutput {
  metadata: AnalyzerMetadata;
  analysis: Record<string, unknown>;
  transcription: TranscriptSegment[];
  evidence: EvidenceClaim[];
  openQuestions: string[];
  telemetry: AnalyzerTelemetry;
}

const stringSchema = { type: "STRING" };
const numberSchema = { type: "NUMBER" };
const stringArraySchema = { type: "ARRAY", items: stringSchema };
const baseStructuredProperties = {
  title: stringSchema,
  description: stringSchema,
  owner: stringSchema,
  status: stringSchema,
  modality: stringSchema,
  timecodes: stringArraySchema,
  confidence: numberSchema
};
const actionItemSchema = {
  type: "OBJECT",
  properties: baseStructuredProperties,
  required: ["title", "description", "modality", "timecodes", "confidence"]
};
const moneyItemSchema = {
  type: "OBJECT",
  properties: {
    ...baseStructuredProperties,
    amount: numberSchema,
    currency: stringSchema
  },
  required: ["title", "description", "modality", "timecodes", "confidence"]
};
const timelineItemSchema = {
  type: "OBJECT",
  properties: {
    ...baseStructuredProperties,
    date: stringSchema,
    timeframe: stringSchema
  },
  required: ["title", "description", "modality", "timecodes", "confidence"]
};
const entityItemSchema = {
  type: "OBJECT",
  properties: {
    title: stringSchema,
    description: stringSchema,
    owner: stringSchema,
    status: stringSchema,
    modality: stringSchema,
    timecodes: stringArraySchema,
    confidence: numberSchema
  },
  required: ["title", "description", "modality", "timecodes", "confidence"]
};
const evidenceItemSchema = {
  type: "OBJECT",
  properties: {
    ...baseStructuredProperties
  },
  required: ["title", "description", "modality", "timecodes", "confidence"]
};
const decisionItemSchema = {
  type: "OBJECT",
  properties: {
    title: stringSchema,
    description: stringSchema,
    owner: stringSchema,
    status: stringSchema,
    modality: stringSchema,
    timecodes: stringArraySchema,
    confidence: numberSchema
  },
  required: ["title", "description", "modality", "timecodes", "confidence"]
};
const resourceCandidateSchema = {
  type: "OBJECT",
  properties: {
    targetApp: stringSchema,
    resourceType: stringSchema,
    operation: stringSchema,
    title: stringSchema,
    description: stringSchema,
    owner: stringSchema,
    modality: stringSchema,
    reviewState: stringSchema,
    timecodes: stringArraySchema,
    confidence: numberSchema
  },
  required: ["targetApp", "resourceType", "operation", "title", "description", "modality", "reviewState", "timecodes", "confidence"]
};
const actionArraySchema = { type: "ARRAY", items: actionItemSchema };
const moneyArraySchema = { type: "ARRAY", items: moneyItemSchema };
const timelineArraySchema = { type: "ARRAY", items: timelineItemSchema };
const entityArraySchema = { type: "ARRAY", items: entityItemSchema };
const evidenceArraySchema = { type: "ARRAY", items: evidenceItemSchema };
const decisionArraySchema = { type: "ARRAY", items: decisionItemSchema };
const resourceCandidateArraySchema = { type: "ARRAY", items: resourceCandidateSchema };
const conversationEntitySchema = {
  type: "OBJECT",
  properties: {
    id: stringSchema,
    name: stringSchema,
    entityType: { type: "STRING", format: "enum", enum: ["person", "project", "organization", "brand", "product", "service", "place", "asset", "technology", "process", "document", "event", "concept", "topic", "regulation", "financial-item", "material", "plant", "other"] },
    identityType: { type: "STRING", format: "enum", enum: ["speaker", "mentioned-person", "filename-name-hint", "mentioned"] },
    aliases: stringArraySchema,
    assertionState: { type: "STRING", format: "enum", enum: ["explicit", "inferred", "needs_review"] },
    reviewState: { type: "STRING", format: "enum", enum: ["ready", "needs_review"] },
    timecodes: stringArraySchema,
    confidence: numberSchema
  },
  required: ["id", "name", "entityType", "identityType", "aliases", "assertionState", "reviewState", "timecodes", "confidence"]
};
const conversationEvidenceSchema = {
  type: "OBJECT",
  properties: {
    id: stringSchema,
    description: stringSchema,
    relationType: { type: "STRING", format: "enum", enum: ["associated_with", "part_of", "belongs_to", "located_in", "supports", "depends_on", "uses", "produces", "provides", "owns", "funds", "collaborates_with", "conflicts_with", "replaces", "precedes", "follows", "mentions", "other"] },
    subjectId: stringSchema,
    objectId: stringSchema,
    temporal: {
      type: "OBJECT",
      properties: {
        kind: { type: "STRING", format: "enum", enum: ["exact", "relative", "current", "past", "future", "ongoing", "unknown"] },
        value: stringSchema,
        start: stringSchema,
        end: stringSchema
      },
      required: ["kind"]
    },
    assertionState: { type: "STRING", format: "enum", enum: ["explicit", "inferred", "needs_review"] },
    reviewState: { type: "STRING", format: "enum", enum: ["ready", "needs_review"] },
    modality: { type: "STRING", format: "enum", enum: ["observation", "proposal", "decision", "commitment", "disagreement", "assumption", "analyst-recommendation"] },
    timecodes: stringArraySchema,
    confidence: numberSchema
  },
  required: ["id", "description", "assertionState", "reviewState", "timecodes", "confidence"]
};
const conversationRelationSchema = {
  ...conversationEvidenceSchema,
  required: [...conversationEvidenceSchema.required, "relationType", "subjectId", "objectId", "temporal"]
};
const conversationKnowledgeSchema = {
  type: "OBJECT",
  properties: {
    schemaVersion: { type: "STRING", format: "enum", enum: ["conversation-knowledge-v1"] },
    people: { type: "ARRAY", items: conversationEntitySchema },
    projects: { type: "ARRAY", items: conversationEntitySchema },
    entities: { type: "ARRAY", items: conversationEntitySchema },
    relations: { type: "ARRAY", items: conversationRelationSchema },
    claims: { type: "ARRAY", items: conversationEvidenceSchema },
    decisions: { type: "ARRAY", items: conversationEvidenceSchema },
    actions: { type: "ARRAY", items: conversationEvidenceSchema },
    contradictions: { type: "ARRAY", items: conversationEvidenceSchema },
    opportunities: { type: "ARRAY", items: conversationEvidenceSchema }
  },
  required: ["schemaVersion", "people", "projects", "entities", "relations", "claims", "decisions", "actions", "contradictions", "opportunities"]
};

export type GeminiResponseSchema = Record<string, unknown>;

export const sharedResponseSchema = {
  type: "OBJECT",
  properties: {
    metadata: {
      type: "OBJECT",
      properties: {
        sourceFile: stringSchema,
        generatedAt: stringSchema,
        model: stringSchema,
        analysisStyle: stringSchema,
        language: stringSchema,
        duration: stringSchema,
        warnings: stringArraySchema,
        localizedHeadings: { type: "OBJECT" }
      },
      required: ["sourceFile", "generatedAt", "model", "analysisStyle", "warnings"]
    },
    analysis: {
      type: "OBJECT",
      properties: {}
    },
    transcription: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          timecode: stringSchema,
          endTimecode: stringSchema,
          speaker: stringSchema,
          speakerConfidence: numberSchema,
          content: stringSchema,
          notes: stringSchema
        },
        required: ["timecode", "speaker", "content"]
      }
    },
    evidence: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          claim: stringSchema,
          timecodes: stringArraySchema,
          confidence: numberSchema
        },
        required: ["claim", "timecodes", "confidence"]
      }
    },
    openQuestions: stringArraySchema,
    telemetry: {
      type: "OBJECT",
      properties: {
        tokensIn: numberSchema,
        tokensOut: numberSchema,
        durationMs: numberSchema,
        promptId: stringSchema,
        promptHash: stringSchema,
        schemaId: stringSchema,
        parseAttempts: numberSchema,
        repairAttempts: numberSchema
      },
      required: ["durationMs", "promptId", "promptHash", "schemaId", "parseAttempts", "repairAttempts"]
    }
  },
  required: ["metadata", "analysis", "transcription", "evidence", "openQuestions", "telemetry"]
} as const;

export const styleSchemaHints: Record<AnalysisStyle, string[]> = {
  "transcript-only": ["summary", "qualityNotes"],
  "meeting-analysis": ["meetingTitle", "summary", "participants", "themes", "decisions", "actionItems", "risks", "openQuestions", "moneyMentions", "referencedEntities"],
  "oldskool-operational-analysis": ["meetingTitle", "executiveSummary", "interpretationRules", "revenueModels", "infrastructureGates", "legalComplianceIssues", "budgetAssumptions", "founderEconomics", "entityBoundaries", "roadmap", "proofCalendar", "decisions", "actionItems", "risks", "openQuestions", "sourceGaps"],
  "reconciliation-report": ["reportTitle", "sourceFiles", "interpretationRules", "executiveSummary", "sourceSummaries", "alignmentAndGaps", "conflicts", "correctedAssumptions", "recommendedPlan", "risks", "openQuestions"],
  "conversation-knowledge": ["conversationKnowledge"],
  custom: ["customAnalysis"]
};

const styleAnalysisSchemas: Record<Exclude<AnalysisStyle, "custom">, GeminiResponseSchema> = {
  "transcript-only": {
    type: "OBJECT",
    properties: {
      summary: stringSchema,
      qualityNotes: stringArraySchema
    },
    required: ["summary", "qualityNotes"]
  },
  "meeting-analysis": {
    type: "OBJECT",
    properties: {
      meetingTitle: stringSchema,
      summary: stringSchema,
      participants: stringArraySchema,
      themes: stringArraySchema,
      decisions: decisionArraySchema,
      actionItems: actionArraySchema,
      risks: evidenceArraySchema,
      openQuestions: stringArraySchema,
      moneyMentions: moneyArraySchema,
      referencedEntities: stringArraySchema,
      resourceCandidates: resourceCandidateArraySchema
    },
    required: ["meetingTitle", "summary", "participants", "themes", "decisions", "actionItems", "risks", "openQuestions", "moneyMentions", "referencedEntities"]
  },
  "oldskool-operational-analysis": {
    type: "OBJECT",
    properties: {
      meetingTitle: stringSchema,
      executiveSummary: stringSchema,
      interpretationRules: stringArraySchema,
      revenueModels: moneyArraySchema,
      infrastructureGates: moneyArraySchema,
      legalComplianceIssues: evidenceArraySchema,
      budgetAssumptions: moneyArraySchema,
      founderEconomics: moneyArraySchema,
      entityBoundaries: entityArraySchema,
      roadmap: timelineArraySchema,
      proofCalendar: timelineArraySchema,
      decisions: decisionArraySchema,
      actionItems: actionArraySchema,
      risks: evidenceArraySchema,
      openQuestions: stringArraySchema,
      sourceGaps: stringArraySchema,
      resourceCandidates: resourceCandidateArraySchema
    },
    required: ["meetingTitle", "executiveSummary", "interpretationRules", "revenueModels", "infrastructureGates", "legalComplianceIssues", "budgetAssumptions", "founderEconomics", "entityBoundaries", "roadmap", "proofCalendar", "decisions", "actionItems", "risks", "openQuestions", "sourceGaps"]
  },
  "reconciliation-report": {
    type: "OBJECT",
    properties: {
      reportTitle: stringSchema,
      sourceFiles: stringArraySchema,
      interpretationRules: stringArraySchema,
      executiveSummary: stringSchema,
      sourceSummaries: evidenceArraySchema,
      alignmentAndGaps: evidenceArraySchema,
      conflicts: evidenceArraySchema,
      correctedAssumptions: evidenceArraySchema,
      recommendedPlan: actionArraySchema,
      risks: stringArraySchema,
      openQuestions: stringArraySchema
    },
    required: ["reportTitle", "sourceFiles", "interpretationRules", "executiveSummary", "sourceSummaries", "alignmentAndGaps", "conflicts", "correctedAssumptions", "recommendedPlan", "risks", "openQuestions"]
  },
  "conversation-knowledge": {
    type: "OBJECT",
    properties: { conversationKnowledge: conversationKnowledgeSchema },
    required: ["conversationKnowledge"]
  }
};

export function responseSchemaForStyle(style: AnalysisStyle): GeminiResponseSchema {
  const base = cloneSchema(sharedResponseSchema as GeminiResponseSchema);
  const properties = base.properties as Record<string, unknown>;
  if (style !== "custom") properties.analysis = styleAnalysisSchemas[style];
  if (style === "transcript-only") {
    const transcription = properties.transcription as { items?: { required?: string[] } };
    if (transcription.items) {
      transcription.items.required = ["timecode", "endTimecode", "speaker", "content"];
    }
  }
  return base;
}

export function validateAnalyzerOutput(output: AnalyzerOutput): string[] {
  const warnings: string[] = [];
  const missingTopLevel: string[] = [];
  if (!output.metadata.sourceFile) missingTopLevel.push("metadata.sourceFile");
  if (!output.metadata.generatedAt) missingTopLevel.push("metadata.generatedAt");
  if (!output.metadata.model) missingTopLevel.push("metadata.model");
  if (!output.metadata.analysisStyle) missingTopLevel.push("metadata.analysisStyle");
  if (!Array.isArray(output.transcription)) missingTopLevel.push("transcription");
  if (!Array.isArray(output.evidence)) missingTopLevel.push("evidence");
  if (!Array.isArray(output.openQuestions)) missingTopLevel.push("openQuestions");
  if (missingTopLevel.length) warnings.push(`Schema normalization filled or repaired missing top-level fields: ${missingTopLevel.join(", ")}.`);

  const expectedKeys = styleSchemaHints[output.metadata.analysisStyle] || [];
  const missingStyleKeys = expectedKeys.filter((key) => !(key in output.analysis));
  if (missingStyleKeys.length) {
    warnings.push(`Selected style '${output.metadata.analysisStyle}' did not return expected analysis fields: ${missingStyleKeys.join(", ")}.`);
  }
  if (output.metadata.analysisStyle === "oldskool-operational-analysis") {
    warnings.push(...validateOldskoolOwners(output));
  }
  return warnings;
}

export function normalizeOutput(value: unknown, fallback: {
  sourceFile: string;
  model: string;
  analysisStyle: AnalysisStyle;
  promptId: string;
  promptHash: string;
  schemaId: string;
  durationMs: number;
  parseAttempts: number;
  repairAttempts: number;
}): AnalyzerOutput {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata as Record<string, unknown> : {};
  const output: AnalyzerOutput = {
    metadata: {
      sourceFile: fallback.sourceFile,
      generatedAt: new Date().toISOString(),
      model: fallback.model,
      analysisStyle: fallback.analysisStyle,
      language: optionalString(metadata.language),
      duration: optionalString(metadata.duration),
      warnings: stringList(metadata.warnings),
      localizedHeadings: metadata.localizedHeadings && typeof metadata.localizedHeadings === "object" ? metadata.localizedHeadings as Record<string, string> : undefined
    },
    analysis: raw.analysis && typeof raw.analysis === "object"
      ? removeMeaninglessMoneyFields(raw.analysis) as Record<string, unknown>
      : {},
    transcription: normalizeTranscription(raw.transcription),
    evidence: normalizeEvidence(raw.evidence),
    openQuestions: stringList(raw.openQuestions),
    telemetry: {
      durationMs: fallback.durationMs,
      promptId: fallback.promptId,
      promptHash: fallback.promptHash,
      schemaId: fallback.schemaId,
      parseAttempts: fallback.parseAttempts,
      repairAttempts: fallback.repairAttempts
    }
  };
  const validationWarnings = validateAnalyzerOutput(output);
  output.metadata.warnings = Array.from(new Set([...output.metadata.warnings, ...validationWarnings]));
  return output;
}

function removeMeaninglessMoneyFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeMeaninglessMoneyFields);
  if (!value || typeof value !== "object") return value;
  const normalized = Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, removeMeaninglessMoneyFields(item)])
  );
  const amount = typeof normalized.amount === "number" ? normalized.amount : Number(normalized.amount);
  if (!Number.isFinite(amount) || amount === 0) {
    delete normalized.amount;
    delete normalized.currency;
  }
  return normalized;
}

function normalizeTranscription(value: unknown): TranscriptSegment[] {
  if (!Array.isArray(value)) return [];
  const segments: TranscriptSegment[] = [];
  value.forEach((item, index) => {
      const raw = item && typeof item === "object" ? item as Record<string, unknown> : {};
      const content = stringValue(raw.content || raw.text || raw.transcript);
      if (!content) return;
      const segment: TranscriptSegment = {
        timecode: stringValue(raw.timecode || raw.startTime || raw.start, "00:00:00"),
        speaker: stringValue(raw.speaker, `Speaker ${index + 1}`),
        content
      };
      const endTimecode = optionalString(raw.endTimecode || raw.endTime);
      const speakerConfidence = optionalNumber(raw.speakerConfidence);
      const notes = optionalString(raw.notes);
      if (endTimecode) segment.endTimecode = endTimecode;
      if (speakerConfidence !== undefined) segment.speakerConfidence = speakerConfidence;
      if (notes) segment.notes = notes;
      segments.push(segment);
    });
  return segments;
}

function normalizeEvidence(value: unknown): EvidenceClaim[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item && typeof item === "object" ? item as Record<string, unknown> : {};
      const claim = stringValue(raw.claim);
      if (!claim) return null;
      return {
        claim,
        timecodes: stringList(raw.timecodes),
        confidence: numberValue(raw.confidence, 0.5, 0, 1)
      };
    })
    .filter((item): item is EvidenceClaim => Boolean(item));
}

function validateOldskoolOwners(output: AnalyzerOutput): string[] {
  const warnings: string[] = [];
  const lyfOwnedItems: string[] = [];
  for (const [section, value] of Object.entries(output.analysis)) {
    if (!Array.isArray(value)) continue;
    value.forEach((item, index) => {
      const raw = item && typeof item === "object" ? item as Record<string, unknown> : {};
      const owner = optionalString(raw.owner);
      if (!owner || !mentionsLyfLab(owner)) return;
      const title = optionalString(raw.title) || `${section}[${index}]`;
      lyfOwnedItems.push(`${section}: ${title}`);
    });
  }
  if (!lyfOwnedItems.length) return warnings;

  const evidenceCorpus = [
    ...output.transcription.flatMap((segment) => [segment.content, segment.notes || ""]),
    ...output.evidence.flatMap((item) => [item.claim, ...item.timecodes])
  ].join("\n");

  if (!mentionsLyfLab(evidenceCorpus)) {
    warnings.push(`Oldskool owner review required: ${lyfOwnedItems.join("; ")} assign LYF.lab ownership, but returned transcript/evidence does not explicitly mention LYF.lab.`);
  }
  return warnings;
}

function mentionsLyfLab(value: string): boolean {
  return /\b(?:lyf\s*\.?\s*lab|lyflab|lyf\s*lab)\b/i.test(value);
}

export function normalizeStyle(value: unknown, fallback: AnalysisStyle = "meeting-analysis"): AnalysisStyle {
  const raw = String(value || "").trim();
  const styles: AnalysisStyle[] = ["transcript-only", "meeting-analysis", "oldskool-operational-analysis", "reconciliation-report", "conversation-knowledge", "custom"];
  return styles.includes(raw as AnalysisStyle) ? raw as AnalysisStyle : fallback;
}

export function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalString(value: unknown): string | undefined {
  const text = stringValue(value);
  return text || undefined;
}

function optionalNumber(value: unknown): number | undefined {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function numberValue(value: unknown, fallback: number, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function cloneSchema<T>(schema: T): T {
  return JSON.parse(JSON.stringify(schema)) as T;
}
