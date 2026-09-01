# AUDIT-ONLY Workflow

Use this workflow when the user asks for an audit, diagnosis, performance review, fix plan, or Lighthouse analysis **without source modification**.

## Contract

AUDIT-ONLY may:

- inspect the repository, build output, deployed/staging site, Lighthouse reports, traces, CrUX/RUM exports, bundle reports, network waterfalls, and relevant configuration;
- build and serve the application when necessary for measurement;
- create test/audit artifacts and reports;
- run Lighthouse, PageSpeed Insights where available, browser traces, bundle analyzers, and non-mutating diagnostics.

AUDIT-ONLY must not:

- edit application source, styles, assets, manifests, dependencies, build configuration, server configuration, infrastructure configuration, or product content;
- commit, reset, checkout, delete, or otherwise mutate user work;
- apply a proposed optimization to "see what happens" unless the user explicitly changes the mode to MAXIMIZE.

If a diagnostic tool itself requires temporary files, place them outside tracked application source where practical and record them.

## Inputs

Prefer, in order:

1. repository + runnable production build + representative URLs;
2. deployed/staging URL + repository;
3. deployed/staging URL only;
4. existing Lighthouse/LHCI/PageSpeed/CrUX/RUM reports only.

When reports are supplied, record their Lighthouse version, collection date, URL, form factor, throttling, and whether the report is reproducible. Do not pretend stale or single-run reports are a stable baseline.

## Step A — Establish representative scope

Build the same route/template inventory used by the main skill. Do not audit only the homepage unless the site truly has one material template.

Minimum target set where applicable:

- home/landing;
- list/category/search;
- detail/product/article;
- form/checkout/contact;
- authenticated/workspace route;
- media- or JavaScript-heavy route;
- highest-value conversion route;
- known slow route.

Separate mobile and desktop.

## Step B — Establish or validate measurement baseline

If no adequate reports exist, run the normal baseline protocol:

- production build;
- 5 mobile runs per representative route by default;
- 5 desktop runs per representative route by default;
- identical environment/state for repeats;
- save raw JSON reports.

Three runs may be used for screening when measurement cost is high, but label confidence accordingly. A single report may be analyzed, but label conclusions as single-run observations.

Capture metric distributions and the evidence needed to attribute causes: LCP resource/element and subparts where available, long tasks, render-blocking resources, transfer, JS, third parties, layout shifts, TTFB, caching, image/font diagnostics, and category scores.

## Step C — Convert diagnostics into root-cause findings

Do not copy the Lighthouse Opportunities list into the report.

Collapse related warnings into causal findings. Example:

- `Reduce unused JavaScript`
- `Minimize main-thread work`
- `Reduce JavaScript execution time`
- `Avoid enormous network payloads`

may all point to one root cause: a 420 KB editor package included in the initial route chunk.

A finding must contain:

- issue ID and title;
- evidence and affected route/device;
- affected metric(s);
- concrete root cause or `ROOT CAUSE NOT YET VERIFIED`;
- why it affects the metric;
- proposed fix;
- expected real-user effect;
- expected Lighthouse effect;
- effort;
- regression risk;
- confidence;
- route reach;
- business importance;
- reproducibility;
- validation method.

Never invent a file/component name when auditing only a deployed URL. If repository access exists, point to the concrete file/component/configuration when verified.

## Step D — Score and classify findings

Use 1–5 ordinal ratings:

### Impact

- **5 Very high** — dominant contributor to a heavily weighted failing metric or major field CWV failure; likely affects a high-value/shared path.
- **4 High** — substantial contributor to a material metric loss.
- **3 Medium** — measurable but not dominant.
- **2 Low** — small likely score/user effect.
- **1 Negligible** — cosmetic diagnostic or unlikely to materially change the result.

### Effort

- **1 XS** — localized/config-only fix; usually minutes-class.
- **2 S** — small isolated code/resource change; usually under about an hour-class.
- **3 M** — multi-file or moderate implementation/testing work; hours-class.
- **4 L** — structural/shared-system work; half-day to multi-day class.
- **5 XL** — architecture/infrastructure/product-level change.

Effort is an estimate, not a promise. If repository complexity is unknown, lower confidence rather than pretending precision.

### Confidence

- **5** causality directly demonstrated by trace/resource/code evidence;
- **4** strong evidence with one minor unresolved link;
- **3** plausible and supported, but needs implementation experiment;
- **2** weak/incomplete evidence;
- **1** speculative.

### Reach

- **5** nearly all material routes/users;
- **4** shared template or major route family;
- **3** several routes;
- **2** one important route;
- **1** rare route/state.

### Business importance

- **5** core conversion/revenue/activation path;
- **4** high-value discovery or repeated workflow;
- **3** normal route;
- **2** secondary route;
- **1** low-value/rare route.

### Reproducibility

- **5** present in nearly all repeated runs/field data;
- **4** stable majority signal;
- **3** mixed but credible;
- **2** intermittent;
- **1** one-off/noisy.

### Regression risk

- **1** very low;
- **2** low;
- **3** moderate;
- **4** high;
- **5** very high/product-sensitive.

Compute the ranking score:

`priority_score = (impact × reach × business_importance × confidence × reproducibility) / (effort × regression_risk)`

The numeric score is only a deterministic ordering aid; it is not a prediction of Lighthouse points.

Tie-break in this order:

1. lower effort;
2. higher impact;
3. higher confidence;
4. higher reach;
5. lower regression risk.

### Priority buckets

Apply these rules before sorting within each bucket:

- **P0 QUICK WIN** — impact >= 4, effort <= 2, confidence >= 4, reproducibility >= 4, risk <= 2.
- **P1 HIGH VALUE** — impact >= 4, effort <= 3, confidence >= 3, risk <= 3, unless P0.
- **P2 STRUCTURAL** — impact >= 4 and (effort >= 4 or risk >= 4), or a root architecture/infrastructure bottleneck that must be planned deliberately.
- **P3 OPPORTUNISTIC** — impact = 3 and effort <= 2 and confidence >= 3.
- **P4 LOW PRIORITY** — all other actionable findings.

Do not promote a low-impact item merely because it is trivial to fix.

Use `scripts/audit_rank_findings.py` and `templates/audit-findings.csv` when practical.

## Step E — Build a DO-NOT-BOTHER / DEFER list

Explicitly identify diagnostics that should not consume current optimization effort. Include an item when one or more are true:

- it is not materially connected to current Performance/CWV loss;
- projected effect is negligible compared with dominant bottlenecks;
- it duplicates another root cause already being fixed;
- effort/risk is disproportionate to likely benefit;
- it requires degrading required visual/product behavior;
- Lighthouse flags it, but it does not affect the current score directly and no field/user issue supports prioritization;
- evidence is too weak to justify implementation now.

State **why** it is deferred. Do not silently omit diagnostics that a developer is likely to notice in Lighthouse.

## Step F — Estimate improvement frontier

Provide three clearly labeled estimate bands only when evidence supports them:

- **Quick-win frontier** — plausible state after P0 fixes;
- **High-value frontier** — plausible state after P0 + P1;
- **Safe optimization frontier** — plausible state after all justified fixes while preserving product invariants.

Rules:

- label all projected score/metric values as estimates;
- provide assumptions;
- use ranges rather than false precision;
- do not guarantee a score;
- if available evidence is insufficient, say `Cannot estimate reliably from current evidence`.

## Step G — Produce the Audit/Fix Report

Use `templates/audit-fix-report.md`.

Required sections:

1. Audit mode and non-modification statement.
2. Executive summary.
3. Environment and evidence quality.
4. Route/device baseline matrix.
5. Dominant bottleneck map.
6. P0 Quick Wins.
7. Full prioritized fix matrix.
8. Detailed finding cards.
9. Do-not-bother/defer list.
10. Estimated improvement frontier.
11. Ordered implementation handoff.
12. Validation plan for the implementing agent/developer.
13. Evidence appendix/raw report locations.

## Implementation handoff requirements

The handoff must be executable by another coding agent without redoing the diagnosis.

For every ordered action include:

- exact problem;
- exact fix intent;
- likely/verified files/components/resources;
- implementation constraints;
- expected metric(s);
- regression risks;
- exact validation steps;
- dependencies on earlier actions.

When implementation order matters, state it explicitly. Re-evaluate after each P0/P1 fix because the dominant bottleneck can change; the handoff order is a starting plan, not permission to blindly apply every item.

## Definition of done — AUDIT-ONLY

An AUDIT-ONLY engagement is complete when:

- representative scope and evidence quality are explicit;
- findings are causal/root-cause-oriented rather than a Lighthouse warning dump;
- every actionable finding is ranked and bucketed;
- P0 quick wins are obvious;
- low-value diagnostics are explicitly deferred with rationale;
- no source modifications were made;
- score projections, if any, are labeled estimates;
- the implementation handoff contains enough detail to execute and validate the fixes.
