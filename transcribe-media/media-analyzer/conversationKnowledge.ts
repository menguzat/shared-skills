import { join, dirname } from "node:path";
import type { AnalysisQualityCheck, AnalyzerOutput } from "./schemas.js";
import type { VerifiedTranscriptSource } from "./transcriptSource.js";
import { parseCanonicalTimecode } from "./transcriptQuality.js";

const requiredCollections = ["people", "projects", "entities", "relations", "claims", "decisions", "actions", "contradictions", "opportunities"] as const;
const highImpactCollections = ["relations", "claims", "decisions", "actions", "contradictions", "opportunities"] as const;
const assertionStates = new Set(["explicit", "inferred", "needs_review"]);
const reviewStates = new Set(["ready", "needs_review"]);
const modalities = new Set(["observation", "proposal", "decision", "commitment", "disagreement", "assumption", "analyst-recommendation"]);
const entityTypes = new Set(["person", "project", "organization", "brand", "product", "service", "place", "asset", "technology", "process", "document", "event", "concept", "topic", "regulation", "financial-item", "material", "plant", "other"]);
const relationTypes = new Set(["associated_with", "part_of", "belongs_to", "located_in", "supports", "depends_on", "uses", "produces", "provides", "owns", "funds", "collaborates_with", "conflicts_with", "replaces", "precedes", "follows", "mentions", "other"]);
const temporalKinds = new Set(["exact", "relative", "current", "past", "future", "ongoing", "unknown"]);

export function conversationKnowledgeCachePath(source: VerifiedTranscriptSource, promptHash: string): string {
  return join(dirname(source.sidecarPath), "analyses", "conversation-knowledge", "cache", `${source.quality.transcriptFingerprint}.${promptHash}.json`);
}

export function bindConversationKnowledgeProvenance(output: AnalyzerOutput, source: VerifiedTranscriptSource): void {
  const knowledge = conversationKnowledge(output);
  if (!knowledge) return;
  normalizeControlledValues(knowledge, output);
  normalizeEntityIds(knowledge);
  knowledge.provenance = {
    schemaVersion: "conversation-knowledge-provenance-v1",
    sourceTranscriptFingerprint: source.quality.transcriptFingerprint,
    promptHash: output.telemetry.promptHash,
    generatedAt: output.metadata.analysisProvenance?.generatedAt || new Date().toISOString()
  };
}

function normalizeControlledValues(knowledge: Record<string, unknown>, output: AnalyzerOutput): void {
  const warnings: string[] = [];
  for (const collection of ["people", "projects", "entities"] as const) {
    for (const item of list(knowledge[collection])) {
      const entity = record(item);
      if (!entity) continue;
      entity.entityType = collection === "people" ? "person" : collection === "projects" ? "project" : canonicalEntityType(entity.entityType, entity, warnings);
      entity.identityType = collection === "people" ? canonicalPersonIdentity(entity.identityType, entity, warnings) : "mentioned";
      normalizeEvidenceControls(entity, warnings);
    }
  }
  for (const collection of highImpactCollections) {
    for (const item of list(knowledge[collection])) {
      const value = record(item);
      if (!value) continue;
      normalizeEvidenceControls(value, warnings);
      if (["decisions", "actions", "contradictions", "opportunities"].includes(collection)) {
        value.modality = canonicalModality(value.modality, collection, value, warnings);
      }
      if (collection === "relations") {
        value.relationType = canonicalRelationType(value.relationType, value, warnings);
        const temporal = record(value.temporal) || {};
        temporal.kind = canonicalEnum(temporal.kind, temporalKinds, "unknown");
        value.temporal = temporal;
      }
    }
  }
  output.metadata.warnings = Array.from(new Set([...output.metadata.warnings, ...warnings]));
}

function normalizeEvidenceControls(value: Record<string, unknown>, warnings: string[]): void {
  const assertion = canonicalToken(value.assertionState);
  value.assertionState = assertionStates.has(assertion) ? assertion : assertionAliases[assertion] || "needs_review";
  const review = canonicalToken(value.reviewState);
  value.reviewState = reviewStates.has(review) ? review : reviewAliases[review] || "needs_review";
  const confidence = number(value.confidence);
  value.confidence = confidence === undefined ? 0 : Math.max(0, Math.min(1, confidence));
  if (value.assertionState === "needs_review" || value.reviewState === "needs_review") value.reviewState = "needs_review";
  if (!assertionStates.has(assertion) && !assertionAliases[assertion] && assertion) warnings.push(`Normalized unknown assertionState '${assertion}' to needs_review.`);
  if (!reviewStates.has(review) && !reviewAliases[review] && review) warnings.push(`Normalized unknown reviewState '${review}' to needs_review.`);
}

const assertionAliases: Record<string, string> = { stated: "explicit", direct: "explicit", "explicitly-stated": "explicit", implicit: "inferred", inference: "inferred", derived: "inferred", "needs-review": "needs_review", uncertain: "needs_review", pending: "needs_review", unverified: "needs_review" };
const reviewAliases: Record<string, string> = { confirmed: "ready", verified: "ready", accepted: "ready", "needs-review": "needs_review", review: "needs_review", pending: "needs_review", uncertain: "needs_review", unverified: "needs_review" };
const modalityAliases: Record<string, string> = { fact: "observation", factual: "observation", insight: "observation", plan: "proposal", planned: "proposal", intention: "proposal", agreed: "decision", approved: "decision", resolved: "decision", promise: "commitment", task: "commitment", conflict: "disagreement", contradiction: "disagreement", inferred: "assumption", inference: "assumption", recommendation: "analyst-recommendation", suggestion: "analyst-recommendation", opportunity: "analyst-recommendation" };
const entityTypeAliases: Record<string, string> = { org: "organization", company: "organization", institution: "organization", location: "place", site: "place", city: "place", country: "place", region: "place", tech: "technology", method: "process", workflow: "process", law: "regulation", policy: "regulation", finance: "financial-item", money: "financial-item" };
const relationTypeAliases: Record<string, string> = { associated: "associated_with", related_to: "associated_with", partof: "part_of", belongs: "belongs_to", location: "located_in", "located-at": "located_in", support: "supports", dependency: "depends_on", depends: "depends_on", use: "uses", produce: "produces", provide: "provides", ownership: "owns", owner_of: "owns", funding: "funds", collaboration: "collaborates_with", collaborates: "collaborates_with", conflict: "conflicts_with", replacement: "replaces", before: "precedes", after: "follows", mention: "mentions" };

function canonicalModality(raw: unknown, collection: string, value: Record<string, unknown>, warnings: string[]): string {
  const token = canonicalToken(raw);
  if (modalities.has(token)) return token;
  const mapped = modalityAliases[token] || (collection === "opportunities" ? "analyst-recommendation" : "assumption");
  preserveOriginal(value, "modality", raw);
  if (token) warnings.push(`Normalized modality '${token}' to '${mapped}'.`);
  value.reviewState = "needs_review";
  if (mapped === "assumption" || mapped === "analyst-recommendation") value.assertionState = "inferred";
  return mapped;
}

function canonicalEntityType(raw: unknown, value: Record<string, unknown>, warnings: string[]): string {
  const token = canonicalToken(raw);
  if (entityTypes.has(token) && !["person", "project"].includes(token)) return token;
  const mapped = entityTypeAliases[token] || "other";
  preserveOriginal(value, "entityType", raw);
  if (token) warnings.push(`Normalized entityType '${token}' to '${mapped}'.`);
  value.reviewState = "needs_review";
  return mapped;
}

function canonicalPersonIdentity(raw: unknown, value: Record<string, unknown>, warnings: string[]): string {
  const token = canonicalToken(raw);
  if (["speaker", "mentioned-person", "filename-name-hint"].includes(token)) return token;
  preserveOriginal(value, "identityType", raw);
  if (token) warnings.push(`Normalized person identityType '${token}' to 'mentioned-person'.`);
  value.reviewState = "needs_review";
  return "mentioned-person";
}

function canonicalRelationType(raw: unknown, value: Record<string, unknown>, warnings: string[]): string {
  const token = canonicalToken(raw).replace(/-/g, "_");
  if (relationTypes.has(token)) return token;
  const mapped = relationTypeAliases[token] || "other";
  preserveOriginal(value, "relationType", raw);
  if (token) warnings.push(`Normalized relationType '${token}' to '${mapped}'.`);
  value.reviewState = "needs_review";
  return mapped;
}

function canonicalEnum(raw: unknown, allowed: Set<string>, fallback: string): string {
  const token = canonicalToken(raw);
  return allowed.has(token) ? token : fallback;
}

function canonicalToken(value: unknown): string {
  return text(value).toLowerCase().replace(/[\s_]+/g, "-");
}

function preserveOriginal(value: Record<string, unknown>, field: string, original: unknown): void {
  const token = text(original);
  if (token) value[`${field}Original`] = token;
}

function normalizeEntityIds(knowledge: Record<string, unknown>): void {
  const replacements = new Map<string, string>();
  for (const collection of ["people", "projects", "entities"] as const) {
    for (const item of list(knowledge[collection])) {
      const entity = record(item);
      if (!entity) continue;
      const oldId = text(entity.id);
      const entityType = text(entity.entityType);
      const identityType = text(entity.identityType);
      const name = text(entity.name);
      if (!entityType || !identityType || !name) continue;
      const id = `${entityType}:${identityType}:${slug(name)}`;
      entity.id = id;
      if (oldId) replacements.set(oldId, id);
    }
  }
  for (const relation of list(knowledge.relations)) {
    const value = record(relation);
    if (!value) continue;
    for (const key of ["subjectId", "objectId"] as const) {
      const replacement = replacements.get(text(value[key]));
      if (replacement) value[key] = replacement;
    }
  }
}

export function conversationKnowledgeQualityCheck(output: AnalyzerOutput, source: VerifiedTranscriptSource): AnalysisQualityCheck {
  const issues: string[] = [];
  const knowledge = conversationKnowledge(output);
  if (!knowledge) {
    return failedCheck(["analysis.conversationKnowledge must be an object."]);
  }
  if (knowledge.schemaVersion !== "conversation-knowledge-v1") issues.push("conversationKnowledge.schemaVersion must be conversation-knowledge-v1");
  for (const collection of requiredCollections) {
    if (!Array.isArray(knowledge[collection])) issues.push(`conversationKnowledge.${collection} must be an array`);
  }
  const provenance = record(knowledge.provenance);
  if (!provenance || provenance.sourceTranscriptFingerprint !== source.quality.transcriptFingerprint || provenance.promptHash !== output.telemetry.promptHash) {
    issues.push("conversationKnowledge.provenance must bind the certified transcript fingerprint and prompt hash");
  }

  const entityIds = new Set<string>();
  for (const [collection, expectedType] of [["people", "person"], ["projects", "project"], ["entities", undefined]] as const) {
    const entities = list(knowledge[collection]);
    for (const [index, item] of entities.entries()) {
      const entity = record(item);
      const path = `${collection}[${index}]`;
      if (!entity) { issues.push(`${path} must be an object`); continue; }
      const name = text(entity.name);
      const entityType = text(entity.entityType);
      const identityType = text(entity.identityType);
      const id = text(entity.id);
      if (!name || !entityType || !identityType || !id) issues.push(`${path} requires id, name, entityType, and identityType`);
      if (expectedType && entityType !== expectedType) issues.push(`${path}.entityType must be ${expectedType}`);
      if (collection === "people" && !["speaker", "mentioned-person", "filename-name-hint"].includes(identityType)) {
        issues.push(`${path}.identityType must distinguish speaker, mentioned-person, or filename-name-hint`);
      }
      if (collection !== "people" && identityType !== "mentioned") issues.push(`${path}.identityType must be mentioned`);
      if (name && entityType && identityType && id !== `${entityType}:${identityType}:${slug(name)}`) issues.push(`${path}.id is not deterministic for its type, identity type, and name`);
      if (id && entityIds.has(id)) issues.push(`${path}.id duplicates another entity`);
      if (id) entityIds.add(id);
      validateEvidenceShape(entity, path, source, issues);
    }
  }

  for (const collection of highImpactCollections) {
    for (const [index, item] of list(knowledge[collection]).entries()) {
      const value = record(item);
      const path = `${collection}[${index}]`;
      if (!value) { issues.push(`${path} must be an object`); continue; }
      if (!text(value.id) || !text(value.description)) issues.push(`${path} requires id and description`);
      validateEvidenceShape(value, path, source, issues);
      if (collection === "relations") {
        if (!text(value.relationType) || !text(value.subjectId) || !text(value.objectId) || !record(value.temporal)) {
          issues.push(`${path} requires relationType, subjectId, objectId, and temporal`);
        }
        for (const entityId of [text(value.subjectId), text(value.objectId)]) {
          if (entityId && !entityIds.has(entityId)) issues.push(`${path} references unknown entity '${entityId}'`);
        }
      }
      if (["decisions", "actions", "contradictions", "opportunities"].includes(collection) && !modalities.has(text(value.modality))) {
        issues.push(`${path}.modality must be a supported modality`);
      }
    }
  }
  return issues.length ? failedCheck(issues) : {
    id: "conversation-knowledge-evidence",
    status: "passed",
    message: "Conversation knowledge is versioned, provenance-bound, and evidence-backed by the certified transcript.",
    metrics: { collections: requiredCollections.length, entityCount: entityIds.size }
  };
}

function validateEvidenceShape(value: Record<string, unknown>, path: string, source: VerifiedTranscriptSource, issues: string[]): void {
  const assertionState = text(value.assertionState);
  const reviewState = text(value.reviewState);
  const confidence = number(value.confidence);
  const timecodes = list(value.timecodes).map(text).filter(Boolean);
  if (!assertionStates.has(assertionState)) issues.push(`${path}.assertionState must be explicit, inferred, or needs_review`);
  if (!reviewStates.has(reviewState)) issues.push(`${path}.reviewState must be ready or needs_review`);
  if (confidence === undefined || confidence < 0 || confidence > 1) issues.push(`${path}.confidence must be between 0 and 1`);
  if (!timecodes.length) issues.push(`${path}.timecodes must cite the transcript`);
  for (const timecode of timecodes) if (!referenceExists(timecode, source)) issues.push(`${path}.timecodes has invalid transcript reference '${timecode}'`);
}

function conversationKnowledge(output: AnalyzerOutput): Record<string, unknown> | undefined {
  return record(output.analysis.conversationKnowledge);
}

function referenceExists(reference: string, source: VerifiedTranscriptSource): boolean {
  const match = reference.match(/\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?/);
  const seconds = parseCanonicalTimecode(match?.[0]);
  return seconds !== undefined && source.output.transcription.some((segment) => {
    const start = parseCanonicalTimecode(segment.timecode);
    const end = parseCanonicalTimecode(segment.endTimecode);
    return start !== undefined && end !== undefined && seconds >= start - 0.001 && seconds <= end + 0.001;
  });
}

function failedCheck(issues: string[]): AnalysisQualityCheck {
  return {
    id: "conversation-knowledge-evidence",
    status: "failed",
    message: "Conversation knowledge requires deterministic entities, provenance, evidence anchors, confidence, assertion state, and review state.",
    metrics: { issues }
  };
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function slug(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
