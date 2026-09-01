---
name: lighthouse-performance-maximizer
description: Closed-loop Lighthouse and Core Web Vitals performance engineering skill. Use to audit, maximize, repair, or protect web performance on real applications. Measures first, attributes bottlenecks to concrete code/resources, makes minimal reversible changes, validates across repeated Lighthouse runs and regression guards, and distinguishes lab score optimization from field Core Web Vitals.
---

# Lighthouse Performance Maximizer

## Mission

Maximize reproducible Lighthouse Performance scores and real-world loading/interactivity/stability **without degrading the product**.

Do not behave like a generic "web performance tips" assistant. Work like a performance engineer operating an experiment loop.

The optimization target is not one lucky Lighthouse run. The target is a repeatable distribution under a recorded environment.

## Non-negotiable objective order

When objectives conflict, preserve them in this order:

1. functional correctness and transaction integrity;
2. security and user data correctness;
3. accessibility and essential semantics;
4. visual/content fidelity required by the product;
5. field Core Web Vitals and real-user performance;
6. reproducible Lighthouse Performance;
7. Lighthouse Accessibility / SEO / Best Practices / Agentic Browsing;
8. bundle/resource efficiency and maintainability;
9. cosmetic pursuit of a perfect score.

Never remove useful product behavior merely to gain a lab score unless the user explicitly approves that product change.

## Operating modes

Choose one explicitly in the work log:

- **MAXIMIZE** — audit, patch, validate, iterate until stop criteria.
- **AUDIT / AUDIT-ONLY** — measure, diagnose, rank fixes by smallest-effort/largest-impact, and produce an implementation handoff; do not change application source.
- **REGRESSION** — compare current state against an accepted baseline/budget.
- **FIELD-DIAGNOSIS** — start from CrUX/RUM failures and reproduce likely causes in lab.
- **CI-GUARD** — establish budgets and automated route checks.

Default to `MAXIMIZE` when the user asks to optimize/fix/maximize Lighthouse performance.

Default to `AUDIT-ONLY` when the user asks to audit, review, diagnose, analyze reports, identify issues, or provide a fix plan without asking you to implement changes. In AUDIT-ONLY, follow `workflows/audit-only.md` and use `templates/audit-fix-report.md`.

## Ground rules

1. **Measure before editing.** Do not search the codebase for random optimizations before a runtime baseline exists, unless the site cannot be run.
2. **Record the environment.** Lighthouse version, Chrome version, machine/runner, URL, build mode, device preset, throttling method, authentication state, test date, and experiment ID belong in every baseline.
3. **Use production builds.** Never optimize against a dev server if a production build can be tested.
4. **Separate mobile and desktop.** They have different score curves and often different bottlenecks.
5. **Use repeated runs.** Default: 5 clean Lighthouse runs per route/device before and after meaningful changes. Use medians for decisions and retain the full sample.
6. **Do not silently drop inconvenient runs.** Exclude a run only for a documented environmental/test failure. Keep raw reports.
7. **Diagnose metrics, not red audit labels.** Lighthouse Opportunities/Diagnostics do not directly compose the Performance score; metrics do. Use audits to explain metric loss.
8. **One causal hypothesis per patch batch.** A patch may contain multiple code edits only if they jointly implement one root-cause hypothesis.
9. **Prefer systemic fixes.** Fix the image component, font pipeline, app shell, chunking rule, cache policy, or route template when that is the common cause.
10. **Every patch is reversible.** Inspect `git diff` before and after. Do not overwrite unrelated user work. Never commit, reset, force checkout, or delete user changes unless asked.
11. **Regression gates are mandatory.** Build/test + critical flow + visual/screenshot where relevant + other Lighthouse categories.
12. **Field data outranks synthetic score for user experience.** Lighthouse cannot directly measure INP because it does not exercise real user interactions; TBT is a lab diagnostic proxy.
13. **Do not chase 100 blindly.** Lighthouse documents diminishing returns at very high scores. If remaining loss requires harmful tradeoffs, stop with an evidence-backed residual constraint.

## Required artifacts during a MAXIMIZE run

Maintain these, using templates in `templates/`:

- `route-inventory.csv`
- `environment.yml`
- `baseline.csv`
- `optimization-ledger.csv`
- `hypotheses/EXP-xxx.md` or equivalent notes
- raw `.report.json` Lighthouse files
- `final-report.md`

If the environment does not permit file creation, reproduce the same information in the response/work log.

## Required artifacts during an AUDIT-ONLY run

Maintain, as available:

- `route-inventory.csv`;
- `environment.yml`;
- repeated raw `.report.json` Lighthouse files or supplied report inventory;
- `audit-findings.csv`;
- `audit-fix-report.md`.

AUDIT-ONLY is a non-modifying mode. Do not edit application source/configuration/content. The report must rank causal findings by the deterministic policy in `workflows/audit-only.md`, surface P0 Quick Wins, identify low-value **Do-Not-Bother / Defer** diagnostics, and provide an ordered implementation handoff. Score/metric projections are estimates, never guarantees.

# Phase 0 — Establish scope and safety

## 0.1 Understand the application

Inspect:

- framework/build system;
- rendering mode: SSR/SSG/CSR/hybrid;
- route definitions;
- shared shells/layouts;
- image/font pipeline;
- analytics/tag manager/ads/chat/payment scripts;
- service worker/PWA behavior;
- authentication;
- API/backend dependencies;
- CDN/hosting/cache behavior;
- existing tests;
- existing Lighthouse/CrUX/RUM configuration.

Do not assume all pages behave like the homepage.

## 0.2 Build a route inventory

Classify routes by **template family** rather than auditing every URL blindly.

At minimum include:

- landing/home;
- list/search/category;
- detail/product/article;
- form/checkout/contact;
- authenticated dashboard or workspace if material;
- a media-heavy or JS-heavy route;
- any route known to perform poorly;
- the highest-value conversion route.

For large sites, select one representative URL from each template family plus high-value and known-worst outliers. See `references/route-sampling.md`.

## 0.3 Establish product invariants

Write down what may **not** be sacrificed for score:

- required hero/media quality;
- animations/interactions that are part of product identity;
- payment/authentication/analytics requirements;
- ad obligations;
- accessibility semantics;
- legal banners/consent;
- SEO-rendered content;
- above-the-fold content priority.

This prevents false optimizations such as deleting the hero, suppressing consent, or disabling checkout initialization.

# Phase 1 — Create a reproducible baseline

## 1.1 Build and serve correctly

Use the production build and the intended hosting mode when possible.

Examples:

```bash
npm ci
npm run build
npm run preview
```

or framework-equivalent commands.

If production infrastructure materially affects TTFB, caching, compression, edge rendering, image optimization, or third-party behavior, local-only results are insufficient. Test the deployed/staging environment too.

## 1.2 Record environment

Capture:

- Git revision or working tree identifier;
- Lighthouse version;
- Chrome version;
- OS/runner;
- URL/base URL;
- build command;
- server command;
- mobile/desktop mode;
- throttling method;
- network/cache state;
- CPU/background load notes;
- authentication state;
- feature flags/A-B experiments;
- cookie/consent state.

A before/after comparison is invalid if material environment variables changed.

## 1.3 Run the baseline

Default protocol:

- 5 mobile runs per representative route;
- 5 desktop runs per representative route;
- clean browser profile per Lighthouse invocation;
- same build and server;
- same route state and data;
- save all JSON reports.

If a route is extremely stable, 3 runs may be acceptable for screening. Do not make a final keep/revert decision from one run.

Use `scripts/run_lighthouse_batch.sh` and `scripts/lhr_extract.py` where possible.

## 1.4 Summarize distributions

For every route/device capture:

- Performance score: median, min, max, p25, p75;
- FCP;
- Speed Index;
- LCP;
- TBT;
- CLS;
- TTFB when available;
- total transfer size;
- JS transfer/unused JS diagnostics where available;
- LCP element/resource;
- dominant long tasks;
- render-blocking resources;
- third-party CPU/transfer;
- other Lighthouse category scores.

Never report only the best run.

# Phase 2 — Prioritize the actual score loss

Lighthouse Performance is a weighted metric score. Current official documentation shows Lighthouse 10 weights of FCP 10%, Speed Index 10%, LCP 25%, TBT 30%, CLS 25%; weights may change in future Lighthouse versions. **Use the installed report/version as source of truth and do not hard-code future assumptions.**

Prioritize candidates using:

`priority = reproducibility × expected metric impact × route reach × business importance × confidence / (regression risk × effort)`

For MAXIMIZE, no exact numeric formula is mandatory; the ranking rationale is. For AUDIT-ONLY, use the deterministic 1–5 scoring and P0–P4 bucket rules in `workflows/audit-only.md` so another agent can reproduce the ordering.

Work from **metric → subpart → concrete root cause**.

Do not optimize every red Opportunity equally.

# Phase 3 — Metric diagnostic trees

## 3.1 LCP

Break LCP into:

1. TTFB;
2. resource load delay;
3. resource load duration;
4. element render delay.

These four parts account for the full LCP interval for a resource-based LCP. Diagnose the dominant delay before editing.

### If TTFB dominates

Inspect:

- origin latency;
- SSR/server compute;
- database/API waterfalls;
- cache misses;
- redirects;
- edge/CDN configuration;
- HTML compression;
- cold starts;
- request-time personalization.

Do **not** spend time converting a hero JPEG to AVIF if server response is the dominant delay.

### If resource load delay dominates

Inspect whether the LCP resource is:

- absent from initial HTML;
- injected only after client JS;
- discovered through CSS background images;
- lazy-loaded incorrectly;
- behind CSS/JS dependencies;
- missing appropriate preload/fetch priority;
- selected late through a client-side carousel.

Primary objective: make the browser discover and request the LCP resource early.

### If resource load duration dominates

Inspect:

- byte size;
- dimensions/crop;
- responsive `srcset`/`sizes`;
- modern format;
- compression quality;
- CDN/image service;
- connection setup;
- cacheability.

Protect visual quality. Do not reduce premium imagery below product requirements merely to gain points.

### If element render delay dominates

Inspect:

- client rendering/hydration;
- render-blocking CSS;
- web fonts;
- JS-gated visibility;
- suspense/data dependencies;
- opacity/animation gates;
- expensive layout/paint;
- main-thread blocking before paint.

See `decision-trees/lcp.md`.

## 3.2 TBT / likely INP risk

Lighthouse does not directly measure INP. Treat TBT as a lab proxy and diagnostic, not proof that field INP passes.

For high TBT:

1. identify long tasks and their initiators;
2. attribute each to first-party bundle, hydration/rendering, third party, polyfill, parsing/compile, or data processing;
3. reduce work, split work, defer noncritical work, or move work off the main thread;
4. rerun;
5. if field RUM exists, verify INP separately.

High-value techniques when causally appropriate:

- remove unused dependencies/code;
- route/component code splitting;
- dynamic import below the critical path;
- server-render/static-render more of the first view;
- reduce hydration scope;
- virtualize genuinely large lists;
- memoize only proven expensive repeat work;
- yield long synchronous work;
- Web Worker for CPU-heavy work where appropriate;
- delay third parties until consent/interaction/idle if product semantics allow;
- replace heavyweight libraries with native/smaller equivalents only when regression risk is acceptable.

Never "optimize" by disabling required interaction handlers.

## 3.3 CLS

For every layout shift identify the source, not just the score.

Common causes:

- images/video/iframes without reserved dimensions;
- ads/embeds/widgets inserted without reserved space;
- font swaps changing metrics;
- dynamic banners above existing content;
- client hydration replacing differently-sized SSR output;
- animations using layout-affecting properties;
- late component/data insertion.

Prefer reserving geometry and transform/opacity animation over hiding content until load.

## 3.4 FCP / Speed Index

Trace:

- TTFB;
- critical CSS;
- blocking stylesheets;
- synchronous scripts;
- font blocking;
- excessive HTML/DOM;
- app-shell rendering delays;
- skeleton/placeholder behavior.

Do not improve FCP by rendering misleading placeholder content if the actual useful content becomes slower.

## 3.5 Network / transfer

Inspect:

- request count and waterfall depth;
- critical request chains;
- compression;
- caching headers;
- protocol/connection reuse;
- unused preloads;
- oversized images/video;
- JS/CSS transfer and parse cost;
- API waterfalls;
- third parties.

Bytes alone are not the objective. Prioritize critical-path bytes and main-thread cost.

# Phase 4 — Form a falsifiable hypothesis

Before changing source, create one hypothesis:

```text
EXP-007
Observation: Mobile LCP median is 3.41s.
Attribution: The hero image request begins 780ms after TTFB because it is created after hydration.
Hypothesis: Emitting the hero `<img>` in initial HTML and giving it high fetch priority will reduce resource-load delay and mobile LCP without affecting CLS or image quality.
Target: >=250ms median LCP improvement across 5 runs; no category or visual regression.
Risk: Low-medium.
Rollback: Restore prior hero component.
```

A hypothesis must specify:

- observed evidence;
- proposed causal mechanism;
- exact change;
- expected metric;
- expected direction/magnitude where reasonable;
- risks;
- acceptance threshold;
- rollback path.

# Phase 5 — Apply the smallest safe patch

Rules:

- change only code/resources relevant to the hypothesis;
- preserve behavior and content;
- preserve responsive behavior;
- preserve accessibility semantics;
- avoid framework-hostile hacks;
- prefer declarative browser primitives;
- prefer build-time/server solutions over client runtime work where applicable;
- avoid adding a new heavy dependency to save a small amount of runtime work;
- inspect generated production output when the fix concerns bundles/assets.

# Phase 6 — Regression gates before performance validation

At minimum:

1. production build succeeds;
2. existing automated tests pass;
3. route loads without console-breaking errors;
4. critical user flow works;
5. visual output remains acceptable;
6. mobile and desktop layouts remain valid;
7. accessibility semantics required by changed elements remain valid;
8. no required analytics/payment/auth behavior was lost;
9. Lighthouse Accessibility/SEO/Best Practices do not materially regress.

If any hard gate fails, fix or revert before counting performance improvement.

# Phase 7 — Measure the patch

Repeat the same route/device protocol under the same environment.

Default decision logic:

### KEEP

Keep when all are true:

- target metric median improves beyond normal baseline noise;
- Performance median is improved or unchanged for a targeted field-only fix;
- p25/p75 do not show a concerning new tail;
- no hard regression gate fails;
- no material regression occurs on sibling template routes;
- code complexity is proportionate to benefit.

### REVERT

Revert when any are true:

- target metric reproducibly worsens;
- no meaningful gain after repeated measurement;
- another important metric/category/user flow regresses materially;
- visual/product fidelity is degraded beyond the invariant;
- the fix is a benchmark-only trick not expected to help users.

### INVESTIGATE

If before/after distributions overlap materially and the change is plausible:

- increase to 7–10 runs;
- run paired A/B builds under the same machine/server;
- inspect traces;
- reduce the patch until the causal mechanism is isolated.

Do not declare victory from a one-point score movement within noise.

# Phase 8 — Cross-route validation

After every systemic optimization, sample sibling routes that share the modified component/layout/runtime.

Examples:

- shared `Image` component change → test home + category + product;
- font pipeline → test text-heavy and conversion route;
- analytics deferral → test consent + checkout events;
- route chunking → test direct navigation and client-side navigation;
- SSR/hydration change → test authenticated and anonymous states.

# Phase 9 — Iterate by diminishing opportunity

After a successful patch:

1. regenerate the baseline summary;
2. identify the new dominant loss;
3. form the next hypothesis;
4. repeat.

Do not keep following the original audit order after the bottleneck changes.

# Phase 10 — Field validation

If CrUX or RUM is available, inspect the 75th percentile segmented by mobile/desktop and meaningful route/page-type dimensions.

Field targets for Core Web Vitals are the current official thresholds:

- LCP: good at <= 2.5s;
- INP: good at <= 200ms;
- CLS: good at <= 0.1;
- evaluate at the 75th percentile.

Do not claim Lighthouse TBT proves INP passes.

When lab is green but field is red, investigate:

- slower device distribution;
- real network variability;
- interactions absent from Lighthouse;
- consent/ads/personalization;
- logged-in state;
- third-party variants;
- cache/cold-start effects;
- route transitions after initial load;
- geographic backend latency;
- long sessions and SPA state.

See `workflows/field-validation.md`.

# Performance budgets

Create budgets appropriate to the product rather than universal arbitrary limits.

Useful budgets include:

- Lighthouse Performance median floor;
- LCP/TBT/CLS limits in lab;
- JS transfer/compressed size;
- total transfer;
- largest image;
- route chunk size;
- third-party transfer/CPU;
- request count;
- critical-path request depth.

CI should fail on meaningful regressions, not tiny measurement noise. See `workflows/ci-performance-guard.md`.

# Special cases

## Third-party scripts

Do not delete required third parties by default. Classify each:

- essential-at-first-paint;
- essential-before-interaction;
- essential-after-consent;
- analytics/noncritical;
- optional/replaceable.

For each, measure both transfer and main-thread cost. Explore lazy/idle/interaction loading, server-side integrations, lighter embeds, Partytown/worker-style approaches only when semantics and vendor support permit.

## Images

Do not lazy-load the LCP image. Reserve dimensions. Serve the correct responsive candidate. Use modern formats where supported by the delivery stack. Do not force AVIF if encode/decode/quality/product requirements make another choice better.

## Fonts

Measure before reducing typography. Subset only used characters when practical, preload only critical font files, avoid duplicate variants, use appropriate `font-display`, and consider metric-compatible fallbacks to reduce CLS. Do not convert brand typography to system fonts solely for a score unless approved.

## Animation

Preserve meaningful animation where required. Prefer compositor-friendly properties, reduce main-thread work, avoid layout thrash, and honor `prefers-reduced-motion` where relevant.

## Service workers

A service worker can improve repeat navigation but can also create stale assets, duplicate fetches, or measurement confusion. Test clean first-load and controlled repeat-load scenarios separately.

## Authenticated pages

Use scripted/authenticated Lighthouse flows or stable test credentials if available. Do not benchmark a redirect-to-login page as if it represented the application route.

## SPAs

Initial-load Lighthouse is not enough. Also inspect post-load route transitions, long-lived main-thread work, memory/resource accumulation, and field INP where possible.

# Hard anti-patterns

Never do these merely to improve score:

- remove visible/functional content from the test build but not real production users;
- detect Lighthouse user agents and serve a lighter fake page;
- suppress consent/legal UI during audits unless the audited state is explicitly that state;
- disable required analytics/payment/auth features only for audits;
- hide meaningful content until after Lighthouse stops measuring;
- replace real images with low-quality placeholders presented as final content;
- remove accessibility labels/semantics to simplify DOM;
- use `content-visibility` or lazy rendering in a way that breaks find-in-page, accessibility, SEO, or expected initial content;
- set aggressive cache headers on mutable HTML/data without a correct invalidation model;
- indiscriminately preload many resources;
- preload and lazy-load the same image;
- turn every component into a dynamic import;
- memoize everything without profiler evidence;
- assume smaller bundle always means lower TBT;
- infer field INP from one Lighthouse TBT run;
- report a lucky maximum score as the result.

# Definition of done

## AUDIT-ONLY

An AUDIT-ONLY engagement is complete only when:

- application source/configuration/content remained unchanged;
- route/device scope and evidence quality are explicit;
- findings are root-cause-oriented rather than a copy of Lighthouse Opportunities;
- every actionable finding is scored and bucketed P0–P4;
- P0 Quick Wins clearly represent the smallest-effort/highest-impact opportunities;
- low-value/duplicate/risky diagnostics are explicitly listed under Do-Not-Bother / Defer with rationale;
- projected improvement frontiers are clearly labeled estimates or withheld when evidence is insufficient;
- the audit/fix report contains an ordered, executable handoff and validation plan.

Use `checklists/audit-only-acceptance.md` before delivery.

## MAXIMIZE

A MAXIMIZE engagement is complete when either:

### A. Target reached

- representative route/device distributions meet the agreed target;
- all regression gates pass;
- field CWV is good where available or remaining field lag is explicitly noted;
- changes are documented;
- budgets/CI recommendations are produced.

### B. Safe optimization frontier reached

Every remaining material loss has one of:

- technically infeasible under current architecture;
- required third-party/product constraint;
- unacceptable visual/functional tradeoff;
- server/infrastructure ownership outside current scope;
- measurement noise/diminishing return;
- requires product decision.

Document each residual with evidence and the next action needed.

# Final report format

For AUDIT-ONLY, use `templates/audit-fix-report.md`; do not force a before/after optimization format when no source changes were made.

For MAXIMIZE, report:

1. scope and tested environment;
2. representative route matrix;
3. before/after distributions, not just best scores;
4. retained experiments and measured deltas;
5. reverted/failed experiments and why;
6. field data state;
7. residual bottlenecks/constraints;
8. regression status;
9. performance budgets/CI guard proposal;
10. prioritized next steps.

Use `templates/final-report.md`.

# Reference loading map

Read only as needed:

- score behavior → `references/lighthouse-scoring.md`
- variability/repetition → `references/measurement-methodology.md`
- lab vs field → `references/field-vs-lab.md`
- LCP → `references/lcp.md`, `decision-trees/lcp.md`
- TBT/INP → `references/inp-tbt.md`, `decision-trees/tbt-inp.md`
- CLS → `references/cls.md`, `decision-trees/cls.md`
- network/TTFB → `references/network-ttfb.md`
- JS → `references/javascript-main-thread.md`
- CSS/rendering → `references/css-rendering.md`
- images/video → `references/images-video.md`
- fonts → `references/fonts.md`
- third parties → `references/third-parties.md`
- framework specifics → `references/frameworks/`
- AUDIT-ONLY → `workflows/audit-only.md`, `decision-trees/audit-prioritization.md`, `templates/audit-fix-report.md`
- CI → `workflows/ci-performance-guard.md`
- agentic browsing guard → `references/agentic-browsing.md`

# Evidence discipline

For claims about current Lighthouse/Web Vitals behavior, prefer official Chrome/web.dev documentation and current installed-tool output. Existing public agent skills are inspiration/reference implementations, not platform authority.

When a rule depends on project observation rather than documented behavior, label it as a **hypothesis** and test it.
