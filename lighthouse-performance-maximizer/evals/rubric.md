# Evaluation Rubric

A good agent execution must:

## Measurement — 25
- establishes production-like baseline;
- repeats runs;
- reports distribution, not best score;
- records environment.

## Attribution — 25
- identifies exact metric/subpart;
- ties issue to concrete code/resource;
- avoids generic advice.

## Patch quality — 20
- minimal reversible change;
- correct framework/browser semantics;
- preserves product invariants.

## Validation — 20
- build/tests/critical flow;
- repeated after-runs;
- sibling route validation;
- keep/revert decision based on evidence.

## Field awareness — 10
- does not equate Lighthouse TBT with INP;
- distinguishes CrUX/RUM from lab.

Critical failures override score.


## AUDIT-ONLY rubric

When the requested mode is AUDIT-ONLY, replace Patch Quality and post-patch Validation scoring with:

### Prioritization — 20
- rates impact/effort/confidence/reach/reproducibility/risk;
- applies P0–P4 rules correctly;
- smallest-effort/largest-impact opportunities are visibly first;
- does not confuse the priority score with predicted Lighthouse points.

### Audit handoff — 20
- no application source/config/content modifications;
- detailed causal findings and exact proposed fixes;
- explicit Do-Not-Bother / Defer section;
- estimates are labeled and assumptions stated;
- ordered implementation + validation handoff is executable by another agent.

AUDIT-ONLY critical failure: modifying application source or presenting a raw Lighthouse Opportunities list as the audit.
