import test from "node:test";
import assert from "node:assert/strict";
import { bindConversationKnowledgeProvenance, conversationKnowledgeCachePath, conversationKnowledgeQualityCheck } from "../conversationKnowledge.js";
import type { AnalyzerOutput } from "../schemas.js";
import type { VerifiedTranscriptSource } from "../transcriptSource.js";

const source = {
  sidecarPath: "/tmp/.transcripts/call/v0001.transcript.json",
  sourceMediaFile: "/tmp/call.wav",
  quality: { transcriptFingerprint: "certified-fingerprint" },
  output: {
    transcription: [{ timecode: "00:00:00", endTimecode: "00:00:20", speaker: "Ada", content: "Ada will lead Atlas." }]
  }
} as unknown as VerifiedTranscriptSource;

function output(): AnalyzerOutput {
  const evidence = { assertionState: "explicit", reviewState: "ready", timecodes: ["00:00:05"], confidence: 0.9 };
  return {
    metadata: { sourceFile: "/tmp/call.wav", generatedAt: "2026-01-01T00:00:00.000Z", model: "gemini-test", analysisStyle: "conversation-knowledge", warnings: [] },
    analysis: {
      conversationKnowledge: {
        schemaVersion: "conversation-knowledge-v1",
        people: [{ id: "person:speaker:ada", name: "Ada", entityType: "person", identityType: "speaker", aliases: [], ...evidence }],
        projects: [{ id: "project:mentioned:atlas", name: "Atlas", entityType: "project", identityType: "mentioned", aliases: [], ...evidence }],
        entities: [],
        relations: [{ id: "relation:1", description: "Ada leads Atlas.", relationType: "leads", subjectId: "person:speaker:ada", objectId: "project:mentioned:atlas", temporal: { kind: "current" }, ...evidence }],
        claims: [{ id: "claim:1", description: "Ada will lead Atlas.", ...evidence }],
        decisions: [{ id: "decision:1", description: "Ada leads Atlas.", modality: "decision", ...evidence }],
        actions: [],
        contradictions: [],
        opportunities: []
      }
    },
    transcription: [],
    evidence: [],
    openQuestions: [],
    telemetry: { durationMs: 1, promptId: "conversation-knowledge", promptHash: "prompt-hash", schemaId: "conversation-knowledge", parseAttempts: 1, repairAttempts: 0 }
  };
}

test("binds a deterministic conversation-knowledge cache key and provenance", () => {
  const result = output();
  bindConversationKnowledgeProvenance(result, source);
  const check = conversationKnowledgeQualityCheck(result, source);
  assert.equal(check.status, "passed");
  assert.match(conversationKnowledgeCachePath(source, "prompt-hash"), /certified-fingerprint\.prompt-hash\.json$/);
});

test("rejects unsupported high-impact knowledge", () => {
  const result = output();
  bindConversationKnowledgeProvenance(result, source);
  const relation = (result.analysis.conversationKnowledge as Record<string, unknown>).relations as Array<Record<string, unknown>>;
  relation[0].timecodes = [];
  const check = conversationKnowledgeQualityCheck(result, source);
  assert.equal(check.status, "failed");
  assert.match(JSON.stringify(check.metrics), /must cite the transcript/);
});

test("normalizes model-supplied entity ids and relation references", () => {
  const result = output();
  const knowledge = result.analysis.conversationKnowledge as Record<string, unknown>;
  const projects = knowledge.projects as Array<Record<string, unknown>>;
  const relations = knowledge.relations as Array<Record<string, unknown>>;
  projects[0].id = "project:mentioned:shortened";
  projects[0].name = "Atlas Standardı";
  relations[0].objectId = "project:mentioned:shortened";
  bindConversationKnowledgeProvenance(result, source);
  assert.equal(projects[0].id, "project:mentioned:atlas-standard");
  assert.equal(relations[0].objectId, projects[0].id);
  assert.equal(conversationKnowledgeQualityCheck(result, source).status, "passed");
});

test("normalizes controlled conversation-knowledge classifications conservatively", () => {
  const result = output();
  const knowledge = result.analysis.conversationKnowledge as Record<string, unknown>;
  const opportunities = knowledge.opportunities as Array<Record<string, unknown>>;
  opportunities.push({ id: "opportunity:1", description: "Atlas could expand.", modality: "opportunity", assertionState: "implicit", reviewState: "pending", timecodes: ["00:00:05"], confidence: 4 });
  opportunities.push({ id: "opportunity:2", description: "Atlas expansion needs review.", modality: "proposal", assertionState: "needs_review", reviewState: "needs_review", timecodes: ["00:00:05"], confidence: 0.5 });
  const entities = knowledge.entities as Array<Record<string, unknown>>;
  entities.push({ id: "location:mentioned:izmir", name: "İzmir", entityType: "location", identityType: "reference", aliases: [], assertionState: "stated", reviewState: "confirmed", timecodes: ["00:00:05"], confidence: 0.8 });
  const relations = knowledge.relations as Array<Record<string, unknown>>;
  relations[0].relationType = "related_to";
  relations[0].temporal = {};

  bindConversationKnowledgeProvenance(result, source);

  assert.equal(opportunities[0].modality, "analyst-recommendation");
  assert.equal(opportunities[0].assertionState, "inferred");
  assert.equal(opportunities[0].reviewState, "needs_review");
  assert.equal(opportunities[0].confidence, 1);
  assert.doesNotMatch(result.metadata.warnings.join("\n"), /unknown (?:assertionState|reviewState) 'needs-review'/);
  assert.equal(entities[0].entityType, "place");
  assert.equal(entities[0].identityType, "mentioned");
  assert.equal(relations[0].relationType, "associated_with");
  assert.equal((relations[0].temporal as Record<string, unknown>).kind, "unknown");
  assert.equal(conversationKnowledgeQualityCheck(result, source).status, "passed");
});
