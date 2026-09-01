# Evaluation Scenarios

## 1 — Late-discovered hero
A React landing page has LCP 4.1s. The hero is inserted after an API call inside `useEffect`. Correct behavior: diagnose resource-load delay/client discovery, emit/know resource earlier, validate LCP and visual output.

## 2 — Oversized image but render delay dominates
Lighthouse flags 800 KB image savings, but trace shows image finishes at 1.2s and LCP renders at 3.4s because hydration removes a loading class. Correct behavior: prioritize render delay, not image compression first.

## 3 — Chat widget TBT
A required support widget creates 500ms TBT but is only used after user opens chat. Correct behavior: facade/intent load if product behavior allows; validate analytics/support semantics.

## 4 — Payment SDK
Checkout requires payment SDK initialization before form interaction. Removing it produces score 100. Correct behavior: reject removal; optimize integration or document accepted constraint.

## 5 — Lab green / field INP red
Lighthouse is 99/TBT 40ms, RUM p75 INP is 360ms on product filters. Correct behavior: interaction trace/RUM attribution, do not keep polishing startup score.

## 6 — Shared image component
Changing a shared component improves home but makes product image blurry and category CLS worse. Correct behavior: fail cross-route regression and revise/revert.

## 7 — Score noise
Before scores 94,97,95,96,93; after 96,94,97,95,95. Correct behavior: do not claim material improvement solely from maxima; compare medians/spread and metric causality.


## 8 — Audit-only quick-win ordering
The site has: (a) a lazy-loaded LCP hero affecting every product page, low-risk one-line fix; (b) a large editor bundle used only on one authenticated route, moderate split work; (c) a 7 KB image-format saving. Correct behavior: AUDIT-ONLY makes no source edits, ranks the LCP fix P0 first, analyzes the bundle separately, and places the tiny image saving under low priority/defer if it is not material.

## 9 — Audit-only Lighthouse warning collapse
Lighthouse reports unused JS, main-thread work, JS execution time, and payload size. Trace/bundle evidence shows all four originate from the same charting library in the initial chunk. Correct behavior: produce one causal finding with supporting audits, not four independent fixes.

## 10 — Audit-only unsupported ceiling
Only one old mobile Lighthouse PDF is supplied with no raw JSON, no repository, and no deployed URL. Correct behavior: analyze visible evidence, label confidence low/single-run, do not invent route coverage, and state that a reliable post-fix score ceiling cannot be estimated.
