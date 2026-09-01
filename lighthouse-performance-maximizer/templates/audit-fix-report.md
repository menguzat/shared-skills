# Lighthouse Performance Audit / Fix Report

> **Mode:** AUDIT-ONLY — no application source/configuration/content modifications were made.

## 1. Executive summary

- Overall state:
- Mobile state:
- Desktop state:
- Field CWV state, if available:
- Dominant bottleneck(s):
- Highest-value quick win:
- Main structural constraint:
- Evidence confidence:

## 2. Scope and environment

| Item | Value |
|---|---|
| Lighthouse version | |
| Chrome version | |
| Build/deploy | |
| Test environment | |
| Throttling | |
| Run count | |
| Auth/consent state | |
| Audit date | |

### Evidence limitations

State stale reports, single-run evidence, inaccessible routes, missing field data, unstable backends, or anything else that reduces confidence.

## 3. Route/device baseline

Report medians and spread rather than the best score.

| Route/template | Device | Performance | FCP | SI | LCP | TBT | CLS | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---|

## 4. Dominant bottleneck map

Rank the actual causal bottlenecks, not Lighthouse audit titles.

| Rank | Bottleneck | Metric(s) | Evidence | Route reach | Severity |
|---:|---|---|---|---|---|

## 5. P0 — Quick Wins

Only include findings meeting the P0 rule in `workflows/audit-only.md`.

| Order | Finding | Impact | Effort | Confidence | Risk | Affected routes | Why first |
|---:|---|---|---|---|---|---|---|

## 6. Full prioritized fix matrix

| Order | ID | Priority | Finding | Metric | Impact | Effort | Confidence | Reach | Risk | Priority score |
|---:|---|---|---|---|---:|---:|---:|---:|---:|---:|

Priority score is an ordering aid, **not** an estimated Lighthouse-point gain.

## 7. Detailed findings

### PERF-___ — Finding title

**Priority:** P0 / P1 / P2 / P3 / P4  
**Affected routes/devices:**  
**Affected metrics:**  
**Observed evidence:**  
**Root cause:** VERIFIED / PARTIALLY VERIFIED / NOT YET VERIFIED  
**Causal explanation:**  
**Recommended fix:**  
**Verified/likely files, components, resources:**  
**Expected Lighthouse effect:** qualitative or clearly labeled estimate  
**Expected real-user effect:**  
**Impact:** 1–5  
**Effort:** 1–5  
**Confidence:** 1–5  
**Reach:** 1–5  
**Business importance:** 1–5  
**Reproducibility:** 1–5  
**Regression risk:** 1–5  
**Validation after implementation:**  
**Dependencies / ordering constraints:**

Repeat for every actionable finding.

## 8. Do-not-bother / defer

| Diagnostic/finding | Why it is not worth acting on now | Revisit when |
|---|---|---|

Explicitly surface tempting Lighthouse warnings that are low-value, duplicate, risky, or unsupported.

## 9. Estimated improvement frontier

These are estimates, not guarantees.

| Frontier | Plausible result | Assumptions | Confidence |
|---|---|---|---|
| Current | | | |
| After P0 Quick Wins | | | |
| After P0 + P1 | | | |
| Safe optimization frontier | | | |

If evidence does not justify an estimate, state: **Cannot estimate reliably from current evidence.**

## 10. Ordered implementation handoff

### 1 — PERF-___ / Short fix name

- Fix intent:
- Verified/likely implementation location:
- Constraints:
- Expected metric:
- Regression risks:
- Validate with:
- Depends on:

Continue in recommended execution order.

> Re-baseline after material P0/P1 changes. Do not blindly execute later items if the dominant bottleneck changes.

## 11. Validation plan

Specify:

- build/test commands;
- Lighthouse route/device/run matrix;
- minimum meaningful metric changes;
- visual/functional/a11y/SEO guards;
- sibling-route checks;
- field/RUM validation when available.

## 12. Evidence appendix

- raw Lighthouse reports:
- traces:
- CrUX/RUM:
- bundle reports:
- screenshots:
- source/code references:
