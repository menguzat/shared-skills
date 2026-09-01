# Subskill: AI Recommendation Lab

## Purpose

Experimentally measure how current AI products retrieve, mention, cite, characterize, and recommend a target entity/product across controlled user intents. Use results to:

1. diagnose recommendation-surface strengths/weaknesses,
2. distinguish missing retrieval from missing qualification/evidence,
3. generate **proposed** improvements to the parent skill,
4. maintain an empirical change log as engines/models evolve.

This subskill is not an automated “prompt spamming” system and must obey platform terms, rate limits, cost controls, and available APIs/tools.

---

## 1. Scientific rules

- Never infer a stable rule from one prompt/run.
- Preserve exact model/surface/date/search-enabled state.
- Separate live-search and parametric-only conditions where controllable.
- Use brand-neutral queries unless testing brand-specific behavior.
- Use paraphrase families.
- Randomize ordering when candidate order can matter.
- Repeat conditions.
- Include negative/control prompts.
- Record all raw outputs when allowed.
- Predefine outcome coding before looking at results.
- Distinguish retrieval, citation, mention, recommendation, and factual accuracy.
- Do not manufacture web pages/reviews/authority claims to manipulate production systems.
- Never test deceptive claims on public sites.

---

## 2. Experimental objects

### A. Recommendation Surface
A multidimensional mapping of circumstances in which an offering is recommended.

Dimensions may include:
- price,
- geography,
- material/feature,
- audience,
- size/compatibility,
- lead time,
- returns,
- availability,
- sustainability/certification,
- customization,
- use case,
- trust requirements.

### B. Category Ownership
Share of repeated brand mentions/recommendations within a defined query family. Treat as an experiment-specific metric, not universal market share.

### C. Displacement
How adding/changing one constraint shifts recommendation from competitor A to target B.

### D. Retrieval-to-Recommendation Loss
Where the target disappears:
- not retrieved,
- retrieved but not cited,
- cited but not mentioned,
- mentioned but not recommended,
- recommended but disqualified by missing/current data.

---

## 3. Mandatory protocol

### Step 1 — Freeze experiment manifest
Record:
- date/time/timezone,
- engines/surfaces,
- model identifiers if exposed,
- search/browse state,
- geography/account state if relevant and permitted,
- target brand/products,
- competitors,
- query family,
- repetition count,
- random seed for ordering,
- scoring rubric,
- stop rule.

### Step 2 — Build prompt matrix
For each intent create semantically equivalent paraphrases and controlled constraint variants.

Example lattice:

```text
base: recommend a premium natural-fiber overshirt
+ no synthetic lining
+ made to measurement
+ under €400
+ ships to Turkey
+ needed within 14 days
```

Change one meaningful dimension at a time when estimating a decision boundary.

### Step 3 — Execute
Use official APIs or permitted product interfaces where available. Respect rate limits and terms. Capture raw outputs and sources/citations.

### Step 4 — Code outcomes
Minimum fields:
- target retrieved?
- target cited?
- target mentioned?
- target recommended?
- recommendation rank/order?
- reasons stated?
- attributes used?
- source URLs?
- factual errors?
- competitors?
- refusal/no-brand answer?

### Step 5 — Analyze
Report counts/proportions with denominators, not only percentages.
If sample size permits, report confidence intervals and effect sizes.
For paired condition changes, compare paired outcomes.
Do not overfit small samples.

### Step 6 — Diagnose causal stage
Classify observed weakness:
`ACCESS / RETRIEVAL / CITATION / ENTITY / ATTRIBUTE / EVIDENCE / POSITION / FRESHNESS / TRANSACTION / MODEL-VARIANCE / UNKNOWN`.

### Step 7 — Propose website/business intervention
Every intervention must state:
- observed failure,
- evidence,
- hypothesized mechanism,
- expected stage,
- whether it changes reality, representation, or both,
- re-test design.

### Step 8 — Re-test
Use same frozen benchmark plus holdout prompts.
Do not compare non-equivalent model versions without noting the change.

---

## 4. Parent-skill improvement protocol

The lab may propose changes to the parent skill only in `skill-improvement-proposal.md`.

A proposal requires:
- current rule or gap,
- experiment IDs,
- raw observation summary,
- replication count,
- engines/models/surfaces,
- estimated effect,
- contradictions,
- official-doc compatibility,
- scope limits,
- proposed wording,
- classification: `EXPERIMENTAL` or `RESEARCH-SUPPORTED-CANDIDATE`.

Promotion to a normal deterministic rule requires either:
1. official platform documentation, or
2. repeated evidence across multiple prompt families and at least two materially independent engine/model families, plus a holdout re-test, with no contradiction from current official docs.

Even then, retain scope/version/date and do not call it a universal ranking factor.

---

## 5. Anti-overfitting constraints

Never optimize a website solely to the exact benchmark prompts.
Require holdout prompts not used to design the change.
Reject interventions that:
- reduce human clarity,
- add false/unverifiable claims,
- create doorway/thin pages,
- degrade accessibility/performance,
- contradict platform documentation,
- exploit a brittle prompt-order artifact without user value.

---

## 6. Deliverables

- `experiment-manifest.yml`
- `prompt-matrix.csv`
- `raw-results.jsonl`
- `coded-results.csv`
- `analysis.md`
- `recommendation-surface.md`
- `failure-diagnosis.md`
- `intervention-plan.md`
- `retest-report.md`
- optional `skill-improvement-proposal.md`

Use templates under this subskill.
