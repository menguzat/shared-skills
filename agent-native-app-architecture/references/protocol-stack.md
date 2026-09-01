# Protocol Stack: MCP, A2A, AG-UI, A2UI, MCP Apps

Do not treat similarly named protocols as substitutes. They solve different boundaries.

## Conceptual stack

```text
Human
  ↕
User-facing application / copilot shell
  ↕  AG-UI or equivalent runtime connection
Agent runtime / orchestrator
  ↕  MCP                         ↔ A2A
Tools, data, capabilities          Other agents

Agent/UI payload options:
  - fixed app components
  - A2UI declarative UI
  - MCP Apps interactive resources
  - host-specific UI schemas
```

## MCP — Model Context Protocol

Purpose: connect models/agents to tools, resources, and external context/capabilities.

Use when:

- external data or action surface must be exposed in a standard way
- multiple agent hosts should access the same capability server

MCP alone does not define your entire frontend collaboration model.

## A2A — Agent-to-Agent

Purpose: coordination between distributed/specialized agents.

Use when:

- a main orchestrator delegates to remote agents
- agent identity/capability discovery and inter-agent work matter

Do not introduce multi-agent architecture merely for modular code organization.

## AG-UI — Agent-User Interaction protocol

Purpose: event-driven, bidirectional connection between user-facing applications and agent runtimes.

Useful features/concepts include:

- streamed message/tool events
- frontend tool calls
- shared state snapshots/deltas
- run lifecycle
- interrupts/human-in-the-loop
- multimodal capabilities
- custom events

Use when the frontend and backend need a standardized collaborative runtime rather than a one-shot API response.

## A2UI — Agent-to-User Interface declarative UI

Purpose: let agents send a structured UI description that the client renders using trusted components.

Use when:

- UI structure varies by task
- client should preserve brand/accessibility/security control
- arbitrary executable code is undesirable
- cross-platform rendering matters

Current snapshot on 2026-08-08:

- v0.9.1 current production release
- v1.0 release candidate

Check live docs before implementation.

## MCP Apps

Purpose: allow an MCP capability to provide an interactive UI resource, rendered by a compatible host in an isolated environment with bidirectional communication.

Use when:

- a tool/capability needs richer interaction than structured data/text
- specialized UI should travel with the capability
- the host supports MCP Apps

Examples: chart explorer, 3D viewer, complex form, specialized workflow, media interface.

## A2UI versus MCP Apps

A useful design distinction:

### A2UI

- declarative
- host component catalog
- agent expresses UI intent/data
- strong host control
- excellent for composable forms/cards/dashboards using known primitives

### MCP Apps

- app resource can include custom HTML/JS UI
- sandbox/isolation becomes central
- better for specialized rich custom interaction

They can coexist. A system may default to A2UI-like composition and escalate to MCP Apps for interactions beyond the catalog.

## AG-UI versus A2UI

- AG-UI = runtime interaction channel/state/events
- A2UI = UI description/schema

One can carry or coordinate the other.

## Protocol selection checklist

Ask:

1. Which trust boundary are we crossing?
2. Is the problem data/tool access, agent collaboration, frontend runtime, or UI description?
3. Does the host already constrain the protocol choice?
4. Is portability required?
5. Is custom executable UI required?
6. Is shared state/interruptibility required?
7. What is the maturity/version status?

## Avoid protocol maximalism

A small app may need none of these standards. A local React app with a well-designed agent API, typed tools, shared state, and constrained components may be sufficient.

Use protocols when interoperability, ecosystem tooling, or trust boundaries justify them.
