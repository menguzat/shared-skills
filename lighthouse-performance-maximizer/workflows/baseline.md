# Workflow — Baseline

1. Build production artifact.
2. Start stable server/deployment.
3. Populate `templates/route-inventory.csv`.
4. Populate `templates/environment.yml`.
5. Run 5 mobile reports per representative route.
6. Run 5 desktop reports per representative route.
7. Save JSON under `artifacts/baseline/<route>/<device>/`.
8. Run `scripts/lhr_extract.py` over reports.
9. Save summary as `baseline.csv` or JSON.
10. Rank bottlenecks by metric impact, route reach, confidence, and business importance.

Do not change code during this workflow.
