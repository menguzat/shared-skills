# Helper Scripts

These scripts are deliberately dependency-light. They do not replace Lighthouse/DevTools.

## Batch runner

```bash
./scripts/run_lighthouse_batch.sh http://localhost:4173 mobile artifacts/home-mobile 5
./scripts/run_lighthouse_batch.sh http://localhost:4173 desktop artifacts/home-desktop 5
```

Requires a pinned Lighthouse CLI in the project, a globally installed Lighthouse binary, or `LIGHTHOUSE_BIN=/path/to/lighthouse`, plus Chrome/Chromium. The runner deliberately does not auto-install `latest`, because version drift invalidates before/after comparisons.

## Summarize

```bash
python scripts/lhr_extract.py artifacts/home-mobile
python scripts/lhr_extract.py artifacts/home-mobile --rows --format csv
```

## Compare

```bash
python scripts/compare_batches.py artifacts/before artifacts/after
```

## Budget

```bash
python scripts/performance_budget_check.py templates/performance-budget.json artifacts/after --route home
```

## Static scan

```bash
python scripts/static_perf_scan.py src/
```

Static scan findings are hypotheses only. Runtime measurement decides priority.

## audit_rank_findings.py

Ranks AUDIT-ONLY findings from `templates/audit-findings.csv` using the deterministic P0–P4 policy in `workflows/audit-only.md`.

```bash
python scripts/audit_rank_findings.py audit-findings.csv --output audit-findings-ranked.csv
```

The priority score orders engineering opportunities; it is **not** a predicted Lighthouse score delta.
