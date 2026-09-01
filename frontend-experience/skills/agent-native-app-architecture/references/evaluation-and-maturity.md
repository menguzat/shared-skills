# Evaluation and Maturity Model

Agent-native products need task-level evaluation, not only model quality metrics.

## Maturity levels

### Level 0 — conventional app

- fixed navigation/screens
- no agent or only unrelated chatbot

### Level 1 — assistant overlay

- chat can answer/help
- little shared application state
- user still performs most navigation manually

### Level 2 — capability-aware copilot

- agent can call meaningful app capabilities
- context from current work is available
- read/write boundaries exist
- some confirmations/progress are visible

### Level 3 — stateful collaborative app

- agent and UI share state
- direct manipulation and conversation interoperate
- correction does not require restart
- long-running work has visible lifecycle
- persistent artifacts/workspaces exist where appropriate

### Level 4 — adaptive surface system

- bounded generative UI appears by task shape
- fixed UI remains for high-frequency/precision work
- surface grammar/design system is enforced
- robust HITL, interruption, recovery, and accessibility tests exist

### Level 5 — proactive/ambient agent system

- persistent goals/background work
- event/condition-driven attention requests
- multi-surface continuity
- strong authority governance and auditability
- proactive behavior is user-controlled and evaluated for interruption cost

Do not chase Level 5 when Level 2 solves the product need.

## Audit score dimensions

Score each 0–5:

1. Intent-first access
2. Capability clarity
3. Shared state
4. Surface selection quality
5. Direct manipulation parity
6. Human control / approvals
7. Recovery / undo
8. Progress / observability
9. Voice/multimodal continuity
10. Accessibility / consistency
11. Security / permissions
12. Evaluation / telemetry

Maximum raw score: 60.

Suggested bands:

- 0–14: conventional/chat-overlay
- 15–29: emerging copilot
- 30–44: stateful agentic application
- 45–54: strong agent-native architecture
- 55–60: advanced; verify that complexity is justified

These bands are an internal heuristic for this skill, not an industry standard.

## Core comparative metrics

Always compare against the best conventional UX baseline for representative tasks.

Measure:

- task completion rate
- time to completion
- time to first useful output
- number of navigation actions
- number of conversational turns
- user words/characters required
- number of corrections
- error rate
- approval mistakes
- undo/recovery success
- latency and cancellation
- fallback usage

## Generative UI evals

Test:

- valid component schema
- only allowed catalog components
- correct state bindings
- no impossible actions
- stable semantics across equivalent tasks
- keyboard navigation
- screen-reader semantics
- responsive behavior
- generated text length overflow
- localization expansion
- error-state rendering

## Agent capability hallucination

Test adversarial requests for actions the product does not support.

Expected behavior:

- state limitation clearly
- do not fabricate a UI action or success
- suggest supported alternative if available

## Human-control evals

For mutations test:

- approval is requested exactly when policy requires
- approval summary matches actual tool parameters
- edit-before-approve modifies execution parameters
- double-submit does not duplicate side effects
- cancelled task cannot execute later unexpectedly

## Indeterminism strategy

Do not attempt to mock every natural-language path manually. Instead define invariants.

Examples:

- destructive action cannot execute without authorization/approval
- generated UI cannot reference unknown actions
- domain state must be authoritative
- user edits must survive the next agent turn
- error must expose recovery path

Evaluate many varied prompts against the same invariants.

## Research signal

The research in `source-index.md` suggests generative interfaces can improve user preference on certain information-dense/exploratory tasks, but practitioner feedback highlights predictability, articulation burden, and trust problems. Therefore evaluate task classes separately rather than adopting one interaction style globally.
