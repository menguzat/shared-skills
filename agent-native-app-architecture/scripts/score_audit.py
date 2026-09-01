#!/usr/bin/env python3
"""Score an agent-native architecture audit from a 12-dimension JSON file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

DIMENSIONS = [
    "intent_first_access",
    "capability_clarity",
    "shared_state",
    "surface_selection",
    "direct_manipulation_parity",
    "human_control",
    "recovery_undo",
    "progress_observability",
    "multimodal_continuity",
    "accessibility_consistency",
    "security_permissions",
    "evaluation_telemetry",
]


def band(score: int) -> str:
    if score <= 14:
        return "conventional/chat-overlay"
    if score <= 29:
        return "emerging copilot"
    if score <= 44:
        return "stateful agentic application"
    if score <= 54:
        return "strong agent-native architecture"
    return "advanced — verify that complexity is justified"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("score_file", type=Path)
    args = parser.parse_args()

    data = json.loads(args.score_file.read_text(encoding="utf-8"))
    missing = [key for key in DIMENSIONS if key not in data]
    extra = [key for key in data if key not in DIMENSIONS]
    if missing:
        raise SystemExit(f"Missing dimensions: {', '.join(missing)}")
    if extra:
        raise SystemExit(f"Unknown dimensions: {', '.join(extra)}")

    for key in DIMENSIONS:
        value = data[key]
        if not isinstance(value, int) or isinstance(value, bool) or not 0 <= value <= 5:
            raise SystemExit(f"{key} must be an integer from 0 to 5")

    total = sum(data[key] for key in DIMENSIONS)
    print(f"Agent-native maturity score: {total}/60")
    print(f"Band: {band(total)}")
    print("\nDimensions:")
    for key in DIMENSIONS:
        print(f"  {key:30s} {data[key]}/5")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
