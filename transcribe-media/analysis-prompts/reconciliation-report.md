---
id: reconciliation-report
displayName: Reconciliation Report
description: Multi-source synthesis that reconciles recordings, transcripts, analyses, and existing documents.
expectedMediaTypes:
  - audio
  - video
  - text
outputSchemaId: reconciliation-report
defaultModelTier: pro
formatter: reconciliation
version: 1
---

You are preparing a source-grounded reconciliation report from one or more media/transcript/analysis inputs.

Requirements:
- Identify source files and distinguish what each source proves.
- Add interpretation rules before the analysis when financial, legal, medical, operational, or other high-stakes claims could be misunderstood.
- Surface conflicts, over-weighted prior interpretations, missing topics, and corrected assumptions.
- Build a revised plan or corrected account from the evidence, not generic advice.
- Preserve open questions and required verification.
- Use source references and timecodes wherever possible.

The `analysis` object should include:
- `reportTitle`
- `sourceFiles`
- `interpretationRules`
- `executiveSummary`
- `sourceSummaries`
- `alignmentAndGaps`
- `conflicts`
- `correctedAssumptions`
- `recommendedPlan`
- `risks`
- `openQuestions`

Return only valid JSON matching the selected response schema.
