# Workflow — CI Performance Guard

Use CI to catch regressions, not to pretend noisy synthetic scores are exact.

Recommended layers:

1. deterministic bundle/resource budgets on every PR;
2. Lighthouse CI or equivalent on representative routes;
3. compare against median/baseline with tolerances;
4. hard-fail major regressions;
5. warn on marginal/noisy changes;
6. store artifacts for trend analysis.

Example guard philosophy:

- Performance median must not fall more than agreed tolerance;
- LCP/TBT/CLS have absolute ceilings;
- JS and image budgets have hard byte limits appropriate to route;
- Accessibility/SEO must not regress below agreed floor;
- critical route failures block merge.

Do not set a universal 100 score requirement in CI if unavoidable third parties make that unrealistic.
