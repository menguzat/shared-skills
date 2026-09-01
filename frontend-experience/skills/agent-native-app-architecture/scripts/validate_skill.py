#!/usr/bin/env python3
"""Lightweight self-contained validator for this skill package."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "SKILL.md"

REQUIRED = [
    SKILL,
    ROOT / "agents" / "openai.yaml",
    ROOT / "references" / "source-index.md",
    ROOT / "references" / "existing-app-transformation.md",
    ROOT / "references" / "greenfield-design.md",
    ROOT / "references" / "surface-selection.md",
    ROOT / "references" / "protocol-stack.md",
    ROOT / "references" / "evaluation-and-maturity.md",
    ROOT / "schemas" / "ui-intent.schema.json",
    ROOT / "evals" / "scenarios.yaml",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    raise SystemExit(1)


def check_frontmatter(text: str) -> None:
    if not text.startswith("---\n"):
        fail("SKILL.md must begin with YAML frontmatter")
    end = text.find("\n---\n", 4)
    if end < 0:
        fail("SKILL.md frontmatter is not closed")
    frontmatter = text[4:end]
    keys = []
    for line in frontmatter.splitlines():
        if ":" in line and not line.startswith((" ", "\t")):
            keys.append(line.split(":", 1)[0].strip())
    if keys != ["name", "description"]:
        fail(f"frontmatter must contain only name and description; found {keys}")
    name_match = re.search(r"^name:\s*(.+)$", frontmatter, re.M)
    if not name_match:
        fail("name missing")
    name = name_match.group(1).strip().strip('"\'')
    if name != ROOT.name:
        fail(f"skill name {name!r} must match folder name {ROOT.name!r}")
    if not re.fullmatch(r"[a-z0-9-]+", name):
        fail("skill name must be kebab-case")


def check_internal_paths(text: str) -> None:
    refs = set(re.findall(r"`((?:references|scripts|templates|code|schemas|evals|assets)/[^`]+)`", text))
    missing = [ref for ref in sorted(refs) if not (ROOT / ref).exists()]
    if missing:
        fail("missing paths referenced by SKILL.md: " + ", ".join(missing))


def main() -> int:
    for path in REQUIRED:
        if not path.exists():
            fail(f"required file missing: {path.relative_to(ROOT)}")

    text = SKILL.read_text(encoding="utf-8")
    check_frontmatter(text)
    check_internal_paths(text)

    with (ROOT / "schemas" / "ui-intent.schema.json").open(encoding="utf-8") as f:
        json.load(f)

    score = json.loads((ROOT / "templates" / "audit-score.json").read_text(encoding="utf-8"))
    if len(score) != 12:
        fail("audit-score.json must contain 12 dimensions")

    if "A2UI v0.9.1" not in text:
        fail("SKILL.md should contain current research-snapshot A2UI version note")

    print("PASS: skill package structure and core files are valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
