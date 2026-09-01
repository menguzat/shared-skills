---
name: ai-discovery-marketability-skill
description: Analyze, redesign, implement, and validate a website for technical accessibility, SEO, retrieval optimization, citation readiness, and agentic marketability.
---

# Skill: AI Discovery, SEO, Recommendability & Agentic Marketability

## 0. Mission

Analyze, redesign, implement, and validate a website so that its public information is as technically accessible, semantically clear, retrievable, citable, recommendation-ready, commercially informative, and agent-actionable as evidence allows.

This skill covers six optimization layers:

1. **SEO** — crawlability, index eligibility, relevance, quality, and conventional search discoverability.
2. **Retrieval Optimization** — whether relevant pages/entities/products can plausibly enter an AI engine's candidate set.
3. **Evidence Optimization** — whether claims are explicit, specific, current, internally consistent, and supportable.
4. **Recommendation Optimization** — whether a system has defensible reasons to select the business/product for a user's constraints.
5. **Market Position Engineering** — whether the offering occupies meaningful, machine-visible dimensions where it can be a superior fit.
6. **Agentic Readiness** — whether agents can understand controls, data, policies, inventory, and transaction paths.

Do **not** reduce this work to keyword placement, schema injection, `llms.txt`, blog generation, or rewriting prose into tiny chunks.

---

## 1. Epistemic policy

Every non-trivial recommendation MUST be classified in working notes as one of:

- `PLATFORM-DOCUMENTED` — explicitly documented by the relevant platform or standards body.
- `RESEARCH-SUPPORTED` — supported by a named empirical study; scope and limitations must be preserved.
- `INFERENCE` — a reasoned design/marketing implication not established as a platform rule.
- `EXPERIMENTAL` — a hypothesis that must be tested before adoption.

Never convert correlation, a fixed-context RAG experiment, a vendor case study, or a single AI response into a universal ranking rule.

Never guarantee indexing, ranking, citation, mention, recommendation, referral, conversion, or agent completion.

When platform behavior is time-sensitive, verify current official documentation before implementation.

---

## 2. Core causal model

Treat visibility as a staged pipeline, not one score:

```text
BUSINESS REALITY
  ↓
PUBLIC REPRESENTATION
  ↓
ACCESS / CRAWL
  ↓
INDEX / ELIGIBILITY
  ↓
QUERY INTERPRETATION / SEARCH ACTIVATION
  ↓
CANDIDATE RETRIEVAL
  ↓
RERANK / CONTEXT ALLOCATION
  ↓
EVIDENCE EXTRACTION
  ↓
CITATION / FACT ABSORPTION
  ↓
ENTITY OR PRODUCT MENTION
  ↓
QUALIFICATION AGAINST USER CONSTRAINTS
  ↓
COMPARATIVE RECOMMENDATION
  ↓
CLICK / NAVIGATION / ACTION
  ↓
TRANSACTION OR OTHER BUSINESS OUTCOME
```

Diagnose the earliest failing stage first. Do not optimize downstream citation style while upstream access/index/retrieval is broken.

---

## 3. Mandatory operating sequence

The agent MUST execute these phases in order unless the user explicitly scopes the task to a later phase.

### Phase A — Business truth inventory

Create a fact base before changing the site.

Required outputs:
- organization/entity inventory,
- products/services inventory,
- target markets and geographies,
- commercial goals,
- customer segments,
- hard product/service attributes,
- policies: shipping, returns, support, warranty, repair, lead times,
- proof assets: certifications, tests, awards, research, provenance, customer evidence,
- differentiators that are factual versus merely aspirational.

Hard rule: **Do not invent differentiators.** If a commercially useful property is unknown, mark it `UNKNOWN`.

### Phase B — Decision-space and query graph

Model how humans and AI systems may seek, compare, qualify, trust, and buy the offering.

Build query families for:
- discovery,
- problem/need,
- category education,
- comparison,
- qualification,
- constraints,
- trust/legitimacy,
- brand-specific verification,
- transaction,
- post-purchase.

Represent user constraints explicitly: price, geography, material, compatibility, size, timing, availability, ethics/certifications, return policy, use case, audience, etc.

Do not create one thin page per query variation.

### Phase C — Baseline measurement

Before edits, capture:
- indexed/eligible pages where tools permit,
- organic search baseline,
- AI citations/mentions where measurable,
- referral sources,
- current entity representations,
- current product/offer data,
- selected cross-model recommendation prompts if model access exists.

A single model response is anecdotal. Use the Recommendation Lab subskill for controlled testing.

### Phase D — Technical access & search eligibility audit

Audit:
- robots.txt,
- relevant crawler user agents,
- `noindex`, `nofollow`, snippet controls,
- canonical tags,
- HTTP status behavior,
- redirects,
- sitemap quality/freshness,
- rendered content availability,
- internal links,
- orphan pages,
- pagination/faceting,
- duplicate URLs,
- hreflang when applicable,
- JavaScript rendering risks,
- performance and mobile usability,
- structured data validity,
- feed availability,
- IndexNow where relevant.

Explicitly distinguish crawler permissions by purpose. Training bot permission is not equivalent to live search visibility permission.

### Phase E — Information architecture & entity model

Produce:
- canonical organization entity,
- aliases/brand names,
- people/authors where relevant,
- products/product groups/variants,
- services,
- categories,
- locations,
- policies,
- identifiers,
- relationships among entities,
- source-of-truth URLs.

Ensure the public site describes the same entity consistently across header/footer/about/contact/product/schema/feed/profile data.

### Phase F — Proposition/evidence graph

For every commercially important proposition, record:

```text
PROPOSITION
→ exact claim
→ first-party evidence
→ structured data representation
→ independent corroboration
→ customer/reviewer evidence
→ visual/demo evidence
→ freshness date
→ contradictory evidence
→ confidence
```

Prefer propositions that are specific, factual, useful in decisions, and costly to imitate in reality.

Reject empty claims such as “premium,” “best,” “world-class,” “sustainable,” or “artisan” unless concretely defined and evidenced.

### Phase G — Content architecture

Design content to satisfy human decisions and machine retrieval without writing for bots.

Prioritize:
- original first-hand evidence,
- explicit facts,
- current dates where material,
- clear product/service attributes,
- comparisons that disclose tradeoffs,
- real methodology,
- source-backed claims,
- images/video when they add evidence,
- authorship and expertise where relevant,
- direct answers to important decisions,
- internal links connecting entities and evidence.

Do not mechanically “chunk” every paragraph, stuff synonyms, create exhaustive long-tail pages, or mass-produce generic AI content.

### Phase H — Recommendability analysis

For each important offering, create a **Reason-to-Recommend Matrix**.

Required columns:
- user circumstance/constraint,
- relevant attribute,
- current value,
- competitor comparison if verified,
- evidence source,
- machine-readable representation,
- freshness,
- status: `WIN / PARITY / LOSS / UNKNOWN`.

Then classify recommendation failures:

1. `REAL-DISADVANTAGE`
2. `MISSING-ATTRIBUTE`
3. `MISSING-EVIDENCE`
4. `MISSING-RETRIEVAL`
5. `ENTITY-CONFUSION`
6. `STALE-DATA`
7. `TRANSACTION-FRICTION`
8. `MODEL-VARIANCE/UNKNOWN`

Never disguise a real product disadvantage as an SEO problem.

### Phase I — Structured representations

Implement only applicable structures, such as:
- Organization / LocalBusiness,
- Product / ProductGroup / Offer,
- shipping/return policy data,
- Article / ProfilePage / BreadcrumbList,
- review/aggregate rating only when policy-compliant and genuinely supported,
- Merchant Center feeds,
- OpenAI merchant/product feeds when program access and business fit apply,
- IndexNow for participating engines,
- other official feeds/protocols.

Structured data must match visible page content and real business state.

### Phase J — Agentic readiness

Audit the rendered site from three perspectives:
- screenshot/visual hierarchy,
- DOM/semantic HTML,
- accessibility tree.

Require:
- semantic controls,
- accessible names,
- deterministic form labels,
- stable interaction states,
- meaningful URLs/history,
- current price/availability/policy data,
- clear variant selection,
- predictable cart/checkout transitions,
- no critical action available only through hover or visual inference,
- machine-readable errors and state changes where feasible.

For commerce, evaluate current official agentic commerce protocols only when applicable; do not implement speculative protocols without current docs and eligibility.

### Phase K — Implementation

Implement the highest-leverage earliest-stage fixes first:

`access → eligibility → IA/entity → facts/evidence → recommendability → structured feeds → agentic actions → experimental refinements`

Every change must map to:
- diagnosed failure,
- expected pipeline stage,
- evidence classification,
- validation method.

### Phase L — Validation

Run technical and semantic checks after implementation.

Minimum validation:
- crawl/index directives,
- canonical correctness,
- sitemap URLs,
- structured data syntax and semantic consistency,
- rendered critical content,
- metadata uniqueness,
- broken internal links,
- important entity consistency,
- product/offer attribute completeness,
- policy consistency,
- accessibility semantics,
- mobile behavior,
- performance regressions,
- feed freshness.

### Phase M — Experimental recommendation measurement

Invoke `subskills/ai-recommendation-lab/SKILL.md` when model/tool access exists and recommendation optimization matters.

Do not allow experiment results to silently rewrite the production skill. They create evidence-backed proposals only.

---

## 4. Deterministic decision gates

### Gate 1 — Can it be accessed?
If `NO`: stop downstream optimization and fix access.

### Gate 2 — Is it eligible/indexable?
If `NO`: fix directives, response behavior, canonical/index issues.

### Gate 3 — Is the relevant entity/page discoverable from the site's own IA?
If `NO`: repair internal linking/navigation/sitemaps/entity pages.

### Gate 4 — Does the page expose the decision-critical facts?
If `NO`: add verified facts before persuasive copy optimization.

### Gate 5 — Can important claims be evidenced?
If `NO`: weaken/remove claim or create/obtain real evidence.

### Gate 6 — Does the offering have a reason to win for at least one valuable user circumstance?
If `NO`: report a market-position/product problem; do not fabricate GEO tactics.

### Gate 7 — Are those winning attributes machine-visible and current?
If `NO`: expose them in content + applicable structured representations.

### Gate 8 — Can a user/agent complete the intended next action?
If `NO`: fix interaction/transaction friction.

### Gate 9 — Are remaining hypotheses measurable?
If `YES`: run controlled experiments; otherwise preserve as hypotheses.

---

## 5. Priority scoring

Score every issue 0–3 on:

- `PipelineCriticality` — earliest stage affected,
- `BusinessImpact`,
- `Coverage` — number of pages/products/intents,
- `EvidenceStrength`,
- `ImplementationConfidence`,
- `FreshnessRisk`.

Suggested priority:

```text
Priority = (PipelineCriticality*3 + BusinessImpact*3 + Coverage*2 + EvidenceStrength + ImplementationConfidence) - FreshnessRisk
```

Do not let easy cosmetic changes outrank access/index/product-data failures.

---

## 6. Content rules

### Prefer
- source-native evidence,
- precise nouns and attributes,
- explicit units,
- named locations/entities,
- dates where freshness matters,
- clear definitions,
- comparisons with stated dimensions,
- limitations/tradeoffs,
- methodology,
- primary evidence,
- real images/video/documentation.

### Avoid
- keyword stuffing,
- synthetic FAQ spam,
- doorway pages,
- templated “best X” content with no original value,
- fake authority/social proof,
- fake reviews,
- unsupported superlatives,
- hiding key facts in images only,
- publishing facts that differ between visible content/schema/feed.

---

## 7. Commercial recommendation principles

Treat recommendation as conditional fit.

For each product/service ask:

1. Which constraints can disqualify it?
2. Which attributes can positively distinguish it?
3. Which facts are `UNKNOWN` but commercially important?
4. Which properties are independently verifiable?
5. Which properties are current and volatile?
6. What user circumstances make this product non-dominated or unusually suitable?
7. Are those circumstances represented in retrievable content?
8. Can a system compare them against alternatives without guessing?

`UNKNOWN` can cause practical disqualification under strict constraints; prioritize eliminating avoidable unknowns.

---

## 8. Platform-specific rules

Use `references/platform-matrix.md` and verify official docs when current behavior matters.

Hard constraints:
- Do not equate OpenAI training crawler access with ChatGPT Search access.
- Do not claim `llms.txt` helps Google; current Google guidance says it is not used for Search/generative Search.
- Do not invent special “AI schema.”
- Do not assume one engine's crawler/feed/protocol applies to another.
- Do not assume all ChatGPT/Gemini/Claude responses use live search.
- Do not claim an experimental citation factor causes organic retrieval.

---

## 9. Required deliverables for a full-site engagement

1. `business-truth.md`
2. `decision-query-graph.md`
3. `baseline.md`
4. `technical-audit.md`
5. `entity-model.yml`
6. `proposition-evidence-graph.yml`
7. `content-map.md`
8. `recommendability-matrix.csv`
9. `structured-data-feed-plan.md`
10. `agent-readiness.md`
11. `implementation-plan.md`
12. implemented changes
13. `validation-report.md`
14. optional `recommendation-lab/` experiment report

Use the templates in `/templates`.

---

## 10. Stop conditions

Stop and report rather than fabricate when:
- business facts are unavailable,
- certification/testing cannot be verified,
- competitor data cannot be verified,
- platform eligibility is unknown,
- a requested claim is misleading,
- a recommendation advantage does not exist,
- the model experiment lacks enough repetitions or controls.

---

## 11. Self-improvement boundary

The production skill may be improved by the Recommendation Lab only through this pipeline:

```text
OBSERVATION
→ REPLICATED EXPERIMENT
→ EFFECT ESTIMATE + UNCERTAINTY
→ ENGINE/MODEL/SCOPE LIMITS
→ PROPOSED RULE
→ CONTRADICTION CHECK AGAINST OFFICIAL DOCS
→ HOLDOUT/REPLICATION
→ HUMAN-REVIEWABLE PATCH
→ VERSIONED ADOPTION
```

Never self-modify `SKILL.md` directly from one experiment.

Read `subskills/ai-recommendation-lab/SKILL.md` for the protocol.
