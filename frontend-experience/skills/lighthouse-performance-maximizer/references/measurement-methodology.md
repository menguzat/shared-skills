# Measurement Methodology

**Evidence: OFFICIAL + ESTABLISHED**

Lighthouse itself warns that performance results fluctuate because of machine load, browser environment, routing, extensions, ads/A-B tests, and other runtime conditions. Treat site performance as a distribution.

## Default experiment protocol

- production build;
- stable server and dataset;
- clean Lighthouse invocation;
- 5 runs before, 5 runs after;
- same route/device/throttling/auth/consent state;
- store raw JSON;
- use median as primary decision statistic;
- retain p25/p75/min/max for spread;
- never use the maximum as the reported result.

## When five runs are insufficient

Increase to 7–10 if:

- before/after medians are close;
- ranges overlap heavily;
- third parties are noisy;
- server response is unstable;
- score moves but the target metric does not;
- a change is high-risk/high-cost.

## Paired testing

For subtle changes, alternate A/B builds rather than running all A then all B. This reduces slow environmental drift.

## Invalid comparison examples

- local baseline vs production after-state;
- mobile baseline vs desktop after-state;
- cold uncached baseline vs warmed application after-state;
- different Chrome/Lighthouse versions;
- authenticated baseline vs anonymous after-state;
- different consent/ad state;
- different API fixtures.
