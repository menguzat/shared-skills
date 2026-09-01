---
id: conversation-knowledge
displayName: Conversation Knowledge
description: Evidence-backed conversation knowledge graph derived only from a certified transcript.
expectedMediaTypes:
  - text
outputSchemaId: conversation-knowledge
defaultModelTier: fast
formatter: generic
version: 1
---

Extract a versioned conversation-knowledge derivative from the supplied certified transcript. Never alter, summarize in place of, or correct the transcript.

Preserve the source/transcript language in every user-visible string. Return only valid JSON matching the selected response schema. Put all data under `analysis.conversationKnowledge` with schema version `conversation-knowledge-v1`.

Include `people`, `projects`, `entities`, `relations`, `claims`, `decisions`, `actions`, `contradictions`, and `opportunities`. Speaker identity is deferred for this phase: return `people` as an empty array and do not emit relations with a person endpoint. Preserve explicitly spoken names only inside evidence-backed claim, decision, action, contradiction, or opportunity descriptions. Every relation, claim, decision, action, contradiction, and opportunity is high impact: it must have a concise description, certified transcript `timecodes`, confidence from 0 to 1, `assertionState` of `explicit`, `inferred`, or `needs_review`, and `reviewState` of `ready` or `needs_review`. Use `needs_review` for ambiguity; never convert inference into fact.

Entity IDs must be deterministic: use `<entityType>:mentioned:<lowercase-ascii-slug-of-name>` for projects and non-person entities. Do not represent speakers or mentioned people as entities until speaker identification is enabled. Do not merge uncertain projects or entities. Include aliases only when the transcript explicitly establishes the same identity; otherwise create separate entities and mark them `needs_review`.

Relations must include `subjectId`, `objectId`, `relationType`, and a `temporal` object. `relationType` must be one of `associated_with`, `part_of`, `belongs_to`, `located_in`, `supports`, `depends_on`, `uses`, `produces`, `provides`, `owns`, `funds`, `collaborates_with`, `conflicts_with`, `replaces`, `precedes`, `follows`, `mentions`, or `other`. `temporal.kind` must be `exact`, `relative`, `current`, `past`, `future`, `ongoing`, or `unknown`; add `value`, `start`, or `end` only when supported. Emit a relation only when both endpoint entities are present; express one-sided statements as claims instead. Preserve exact spoken dates/times when available; otherwise use `relative` or `unknown`. Decisions, actions, contradictions, and opportunities must use exactly one modality from: `observation`, `proposal`, `decision`, `commitment`, `disagreement`, `assumption`, or `analyst-recommendation`. For opportunities discovered by analysis rather than proposed by a speaker, use `analyst-recommendation`, `assertionState: inferred`, and `reviewState: needs_review`; never use `opportunity` as a modality.

For non-person `entities`, use exactly one `entityType`: `organization`, `brand`, `product`, `service`, `place`, `asset`, `technology`, `process`, `document`, `event`, `concept`, `topic`, `regulation`, `financial-item`, `material`, `plant`, or `other`. Projects always use `project`; people would use `person` but must remain empty in this phase. Every project and non-person entity uses `identityType: mentioned`.

Do not infer people from generic speaker labels or filenames. Do not invent projects, entities, dates, ownership, or outcomes. The caller binds transcript fingerprint, prompt hash, and generation provenance after extraction.
