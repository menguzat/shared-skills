import test from "node:test";
import assert from "node:assert/strict";
import { normalizeOutput, responseSchemaForStyle } from "../schemas.js";

test("builds style-specific response schemas", () => {
  const schema = responseSchemaForStyle("oldskool-operational-analysis");
  const properties = schema.properties as Record<string, unknown>;
  const analysis = properties.analysis as { required: string[] };
  assert.ok(analysis.required.includes("revenueModels"));
  assert.ok(analysis.required.includes("proofCalendar"));
});

test("requires end timecodes for transcript-only responses", () => {
  const schema = responseSchemaForStyle("transcript-only");
  const properties = schema.properties as Record<string, any>;
  assert.ok(properties.transcription.items.required.includes("endTimecode"));
});

test("builds the conversation-knowledge response schema", () => {
  const schema = responseSchemaForStyle("conversation-knowledge");
  const analysis = (schema.properties as Record<string, any>).analysis;
  assert.ok(analysis.required.includes("conversationKnowledge"));
  const knowledge = analysis.properties.conversationKnowledge as { properties: Record<string, { items?: { properties?: Record<string, { enum?: string[] }> } }> };
  assert.deepEqual(knowledge.properties.opportunities.items?.properties?.modality.enum, ["observation", "proposal", "decision", "commitment", "disagreement", "assumption", "analyst-recommendation"]);
  assert.equal((knowledge.properties.opportunities.items?.properties?.modality as { format?: string }).format, "enum");
  assert.deepEqual(knowledge.properties.relations.items?.properties?.relationType.enum, ["associated_with", "part_of", "belongs_to", "located_in", "supports", "depends_on", "uses", "produces", "provides", "owns", "funds", "collaborates_with", "conflicts_with", "replaces", "precedes", "follows", "mentions", "other"]);
});

test("normalization reports missing style fields", () => {
  const output = normalizeOutput({
    metadata: { warnings: [] },
    analysis: { summary: "Only a summary." },
    transcription: [],
    evidence: [],
    openQuestions: [],
    telemetry: {}
  }, {
    sourceFile: "/tmp/source.mp3",
    model: "gemini-test",
    analysisStyle: "meeting-analysis",
    promptId: "meeting-analysis",
    promptHash: "hash",
    schemaId: "meeting-analysis",
    durationMs: 10,
    parseAttempts: 1,
    repairAttempts: 0
  });
  assert.match(output.metadata.warnings.join("\n"), /expected analysis fields/);
});

test("oldskool normalization flags LYF.lab owners without transcript or evidence support", () => {
  const output = normalizeOutput({
    metadata: { warnings: [] },
    analysis: {
      meetingTitle: "Oldskool call",
      executiveSummary: "Rent was discussed.",
      interpretationRules: [],
      revenueModels: [{ title: "Rent", owner: "LYF.lab", description: "Monthly rent", timecodes: ["00:01:00"] }],
      infrastructureGates: [],
      legalComplianceIssues: [],
      budgetAssumptions: [],
      founderEconomics: [],
      entityBoundaries: [],
      roadmap: [],
      proofCalendar: [],
      decisions: [],
      actionItems: [],
      risks: [],
      openQuestions: [],
      sourceGaps: []
    },
    transcription: [{ timecode: "00:01:00", speaker: "Speaker 1", content: "Kira konuşuldu." }],
    evidence: [{ claim: "Rent was discussed.", timecodes: ["00:01:00"], confidence: 0.8 }],
    openQuestions: [],
    telemetry: {}
  }, {
    sourceFile: "/tmp/source.md",
    model: "gemini-test",
    analysisStyle: "oldskool-operational-analysis",
    promptId: "oldskool-operational-analysis",
    promptHash: "hash",
    schemaId: "oldskool-operational-analysis",
    durationMs: 10,
    parseAttempts: 1,
    repairAttempts: 0
  });
  assert.match(output.metadata.warnings.join("\n"), /owner review required/i);
});

test("oldskool normalization allows LYF.lab owners when returned evidence mentions it", () => {
  const output = normalizeOutput({
    metadata: { warnings: [] },
    analysis: {
      meetingTitle: "Oldskool call",
      executiveSummary: "Rent was discussed.",
      interpretationRules: [],
      revenueModels: [{ title: "Rent", owner: "LYF.lab", description: "Monthly rent", timecodes: ["00:01:00"] }],
      infrastructureGates: [],
      legalComplianceIssues: [],
      budgetAssumptions: [],
      founderEconomics: [],
      entityBoundaries: [],
      roadmap: [],
      proofCalendar: [],
      decisions: [],
      actionItems: [],
      risks: [],
      openQuestions: [],
      sourceGaps: []
    },
    transcription: [{ timecode: "00:01:00", speaker: "Speaker 1", content: "LYF.lab bu kirayı üstlenir." }],
    evidence: [{ claim: "LYF.lab is mentioned as responsible for rent.", timecodes: ["00:01:00"], confidence: 0.8 }],
    openQuestions: [],
    telemetry: {}
  }, {
    sourceFile: "/tmp/source.md",
    model: "gemini-test",
    analysisStyle: "oldskool-operational-analysis",
    promptId: "oldskool-operational-analysis",
    promptHash: "hash",
    schemaId: "oldskool-operational-analysis",
    durationMs: 10,
    parseAttempts: 1,
    repairAttempts: 0
  });
  assert.doesNotMatch(output.metadata.warnings.join("\n"), /owner review required/i);
});

test("normalization removes legacy zero-value money fields", () => {
  const output = normalizeOutput({
    metadata: { warnings: [] },
    analysis: {
      actionItems: [{ title: "Barter", amount: 0, currency: "TRY" }],
      moneyMentions: [{ title: "Payment", amount: 1500, currency: "TRY" }]
    },
    transcription: [],
    evidence: [],
    openQuestions: [],
    telemetry: {}
  }, {
    sourceFile: "/tmp/source.md",
    model: "gemini-test",
    analysisStyle: "custom",
    promptId: "custom",
    promptHash: "hash",
    schemaId: "custom",
    durationMs: 10,
    parseAttempts: 1,
    repairAttempts: 0
  });
  const action = (output.analysis.actionItems as Array<Record<string, unknown>>)[0];
  const payment = (output.analysis.moneyMentions as Array<Record<string, unknown>>)[0];
  assert.equal(action.amount, undefined);
  assert.equal(action.currency, undefined);
  assert.equal(payment.amount, 1500);
  assert.equal(payment.currency, "TRY");
});
