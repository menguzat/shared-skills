# Platform Implementation Notes

Choose interaction architecture before choosing a framework. These notes map common implementation targets to the patterns in this skill.

## Existing web app (React/Vue/Svelte/etc.) without an interoperability requirement

A standards-heavy stack is optional.

Minimum architecture can be:

- typed capability API
- server-side auth/authorization
- shared task/domain state
- streaming agent endpoint
- deterministic surface selector
- trusted component catalog
- approval policy
- persistent artifact storage where needed
- eval/invariant harness

Use A2UI or AG-UI when portability, multi-agent interoperability, or ecosystem compatibility justifies it.

## A2UI-oriented host

Strong fit when:

- the agent needs to compose UI from a trusted catalog
- host controls styling/accessibility
- UI should be portable across compatible clients/renderers
- no arbitrary generated code should run in the main app

Implementation sequence:

1. define component catalog
2. define semantic surface policy
3. define state bindings/actions
4. validate payload
5. render with current supported renderer
6. instrument invalid generations and fallback

Do not ask the model to invent raw component names outside the catalog.

## MCP Apps capability provider

Strong fit when a tool/capability should bring a specialized interactive view into compatible hosts.

Current official pattern:

- register tool
- register UI resource
- link tool to UI resource via metadata
- host fetches/renders UI in supported isolation model
- View communicates with host/server through the MCP Apps bridge

Start from official examples rather than building the transport/sandbox from memory:

https://github.com/modelcontextprotocol/ext-apps/tree/main/examples

## AG-UI frontend/runtime

Strong fit when frontend and agent need:

- streaming event lifecycle
- shared state
- tool-call rendering/execution
- interrupts/HITL
- custom events
- framework-independent runtime semantics

Design state and run events around user-visible task stages. Do not surface private chain-of-thought merely because the runtime has reasoning-related events.

## ChatGPT Apps / OpenAI Apps SDK

Use the current OpenAI docs and curated OpenAI skill as the source of truth:

https://github.com/openai/skills/blob/main/skills/.curated/chatgpt-apps/SKILL.md

The current Apps SDK is MCP-based and supports app logic plus interactive UI inside ChatGPT. Exact bridge APIs, metadata, CSP/domain rules, and submission requirements are version-sensitive; fetch live docs before code generation.

## Microsoft 365 Copilot MCP apps

Use Microsoft’s current UX rules when targeting Copilot:

https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps-ui-guidelines

Key target-specific rules include concise inline surfaces, side-by-side expansion for complex work, Fluent-aligned behavior, no deep mini-app navigation, and visible widget states.

## Voice-enabled web/mobile app

Use one canonical task state. The speech layer should emit intents/operations against that state rather than maintaining a separate conversational copy.

Typical components:

- realtime audio/session service
- speech transcript/intent view
- shared state store
- visual surface renderer
- interruption/cancel control
- approval UI

For OpenAI-specific realtime APIs, fetch current developers.openai.com Realtime documentation before implementation.

## Persistent artifacts/workspaces

Use when output is substantial and iterative.

Implementation requirements:

- stable artifact identity
- versioning or revision history
- access control
- state synchronization with conversation
- source/provenance metadata where relevant
- ability to edit directly without asking the agent for every small change

## Background/proactive agents

Add only when the product has a meaningful future dependency or recurring goal.

Requirements:

- explicit user-owned goal
- trigger/cadence/condition
- notification/attention policy
- ability to disable/cancel
- clear authority boundaries for autonomous actions
- state/history that lets the user see what happened

Proactivity without attention governance creates interruption cost and trust problems.
