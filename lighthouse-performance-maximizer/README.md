# Lighthouse Performance Maximizer

A deterministic Agent Skill for auditing and maximizing reproducible Lighthouse Performance while protecting real user experience, Core Web Vitals, functionality, visual fidelity, accessibility, SEO, best practices, and maintainability.

This is not a list of generic performance tips. It is a closed-loop engineering system:

1. inventory routes and runtime conditions;
2. establish a reproducible multi-run baseline;
3. identify the score/metric/subpart bottleneck;
4. trace that bottleneck to concrete code/resources;
5. make the smallest high-confidence patch;
6. build and regression-test;
7. rerun Lighthouse multiple times under the same conditions;
8. keep, revert, or investigate based on measured evidence;
9. repeat until the target is reached or remaining losses have explicit accepted constraints.

## Operating modes

- **MAXIMIZE** — closed-loop measure/fix/validate optimization.
- **AUDIT-ONLY** — collect or ingest Lighthouse/performance evidence, identify root causes, rank fixes by smallest effort/largest impact, flag low-value diagnostics, estimate the safe improvement frontier, and deliver an ordered fix handoff without modifying application source.
- **REGRESSION**, **FIELD-DIAGNOSIS**, and **CI-GUARD** for specialized workflows.

AUDIT-ONLY has its own deterministic P0–P4 prioritization policy and `templates/audit-fix-report.md`.

## Primary objective

Maximize the **median reproducible Lighthouse Performance score** across representative mobile and desktop routes. A score of 100 is desirable only when it can be reached without unacceptable regressions.

## Secondary objectives

- Pass Core Web Vitals in field data where field data is available.
- Preserve or improve Accessibility, SEO, Best Practices, and Agentic Browsing checks.
- Preserve product behavior and visual quality.
- Prefer systemic fixes that improve a route family over page-specific hacks.
- Maintain an auditable optimization ledger.

## Entry point

Read `SKILL.md` first. Load reference files only when the workflow reaches the relevant diagnostic branch.

## Included utilities

- repeatable Lighthouse batch runner;
- LHR extraction and summarization;
- before/after batch comparator;
- performance budget checker;
- static source anti-pattern scanner;
- AUDIT-ONLY finding ranker and audit/fix report template;
- route inventory and optimization ledger templates;
- regression and acceptance gates;
- framework-specific remediation notes and examples.

## Evidence policy

Rules in this package distinguish official platform facts, established engineering guidance, heuristic guidance, and project-specific hypotheses. See `references/source-policy.md`.
