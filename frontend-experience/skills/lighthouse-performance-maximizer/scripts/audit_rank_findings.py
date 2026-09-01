#!/usr/bin/env python3
"""Rank AUDIT-ONLY performance findings using the skill's deterministic policy.

Input: CSV compatible with templates/audit-findings.csv.
Output: ranked CSV to stdout or --output.

The numeric priority score is an ordering aid, not a Lighthouse-point prediction.
"""

from __future__ import annotations

import argparse
import csv
import math
import sys
from pathlib import Path

RATING_FIELDS = [
    "impact",
    "effort",
    "confidence",
    "reach",
    "business_importance",
    "reproducibility",
    "regression_risk",
]

BUCKET_ORDER = {
    "P0 QUICK WIN": 0,
    "P1 HIGH VALUE": 1,
    "P2 STRUCTURAL": 2,
    "P3 OPPORTUNISTIC": 3,
    "P4 LOW PRIORITY": 4,
}


def rating(row: dict[str, str], field: str) -> int:
    raw = (row.get(field) or "").strip()
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{field} must be an integer 1..5, got {raw!r}") from exc
    if value < 1 or value > 5:
        raise ValueError(f"{field} must be 1..5, got {value}")
    return value


def classify(vals: dict[str, int]) -> str:
    impact = vals["impact"]
    effort = vals["effort"]
    confidence = vals["confidence"]
    reproducibility = vals["reproducibility"]
    risk = vals["regression_risk"]

    if impact >= 4 and effort <= 2 and confidence >= 4 and reproducibility >= 4 and risk <= 2:
        return "P0 QUICK WIN"
    if impact >= 4 and effort <= 3 and confidence >= 3 and risk <= 3:
        return "P1 HIGH VALUE"
    if impact >= 4 and (effort >= 4 or risk >= 4):
        return "P2 STRUCTURAL"
    if impact == 3 and effort <= 2 and confidence >= 3:
        return "P3 OPPORTUNISTIC"
    return "P4 LOW PRIORITY"


def score(vals: dict[str, int]) -> float:
    numerator = (
        vals["impact"]
        * vals["reach"]
        * vals["business_importance"]
        * vals["confidence"]
        * vals["reproducibility"]
    )
    denominator = vals["effort"] * vals["regression_risk"]
    return numerator / denominator


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    with args.input.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise SystemExit("Input has no CSV header")
        missing = [name for name in RATING_FIELDS if name not in reader.fieldnames]
        if missing:
            raise SystemExit(f"Missing required columns: {', '.join(missing)}")
        rows = list(reader)
        fieldnames = list(reader.fieldnames)

    for required in ("priority_bucket", "priority_score"):
        if required not in fieldnames:
            fieldnames.append(required)

    ranked = []
    errors = []
    for index, row in enumerate(rows, start=2):
        if not any((v or "").strip() for v in row.values()):
            continue
        try:
            vals = {name: rating(row, name) for name in RATING_FIELDS}
        except ValueError as exc:
            errors.append(f"line {index}: {exc}")
            continue
        bucket = classify(vals)
        priority = score(vals)
        row["priority_bucket"] = bucket
        row["priority_score"] = f"{priority:.2f}"
        ranked.append((row, vals, bucket, priority))

    if errors:
        raise SystemExit("Invalid findings:\n" + "\n".join(errors))

    ranked.sort(
        key=lambda item: (
            BUCKET_ORDER[item[2]],
            -item[3],
            item[1]["effort"],
            -item[1]["impact"],
            -item[1]["confidence"],
            -item[1]["reach"],
            item[1]["regression_risk"],
            item[0].get("issue_id", ""),
        )
    )

    out = args.output.open("w", newline="", encoding="utf-8") if args.output else sys.stdout
    try:
        writer = csv.DictWriter(out, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for row, _, _, _ in ranked:
            writer.writerow(row)
    finally:
        if args.output:
            out.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
