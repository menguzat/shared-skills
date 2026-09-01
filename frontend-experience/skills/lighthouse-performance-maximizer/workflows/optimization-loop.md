# Workflow — Closed-Loop Optimization

For each experiment:

1. select dominant reproducible bottleneck;
2. attribute to concrete runtime source;
3. write hypothesis;
4. snapshot relevant metrics and `git diff`;
5. make smallest patch;
6. production build + tests;
7. critical flow + visual regression;
8. 5-run before/after-equivalent Lighthouse batch;
9. compare distributions;
10. sample sibling routes if shared code changed;
11. KEEP / REVERT / INVESTIGATE;
12. write result in ledger;
13. recompute dominant bottleneck.

Never stack unvalidated hypotheses because attribution becomes ambiguous.
