# Mobile Adaptive UX Agent Skill

A workflow-driven coding skill for redesigning desktop-first websites into genuinely mobile-adaptive experiences.

## Core idea

This package deliberately rejects the common workflow:

`desktop page -> add media queries -> stack columns -> hide sidebar -> hamburger menu`

It uses:

`inspect product -> identify tasks -> redesign compact IA -> choose navigation -> model state/history -> transform components -> implement -> test -> verify desktop`

## Suggested installation

Copy the complete `mobile-adaptive-ux-skill` directory into the skills directory used by your coding agent, preserving the folder structure. The primary entry point is `SKILL.md`.

## What is included

- deterministic phase gates
- navigation decision tree
- route/task analysis framework
- desktop-to-mobile transformation taxonomy
- history/back-button model
- accessibility and touch requirements
- viewport, safe-area, pointer/hover, container-query guidance
- mobile forms and virtual-keyboard rules
- performance rules
- Playwright-oriented test strategy
- reusable code examples
- audit/plan/QA templates
- evaluation scenarios and scoring rubric
- warning-based static audit helper
- current source registry, checked 2026-08-14

## Evidence model

Recommendations are separated into:

- STANDARD
- PLATFORM
- RESEARCH
- HEURISTIC

This is intentional. A usability heuristic should not be represented as if it were a WCAG requirement, and a WCAG requirement should not be watered down into an optional stylistic suggestion.
