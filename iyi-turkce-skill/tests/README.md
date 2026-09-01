# Smoke tests

Run:

```bash
python3 scripts/iyi_turkce_lint.py tests/lint-smoke.txt
```

Expected:
- candidate findings appear;
- process exits 0 by default;
- no source is modified.

The linter is intentionally conservative and incomplete. Agent review remains authoritative.
