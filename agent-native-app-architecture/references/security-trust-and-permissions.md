# Security, Trust, Permissions, and Sandboxing

Agent-native UX expands the action surface of software. A design that is elegant but cannot explain or constrain authority is incomplete.

## Capability security contract

Every mutable capability should define:

- authenticated actor
- authorization rule
- resource scope
- input schema
- server-side validation
- idempotency/replay behavior
- side effects
- audit event
- confirmation policy
- recovery/rollback behavior

Do not rely on the model or client UI to enforce permissions.

## Read/write separation

Prefer separate tools for:

- search/read
- prepare/draft
- execute/write

This makes intent and approval boundaries clearer.

Example:

- `calculate_refund()`
- `prepare_refund()`
- `issue_refund()`

rather than one ambiguous “manage refund” tool.

## Least authority

Expose only capabilities relevant to the current agent/task when practical.

Benefits:

- reduces accidental tool selection
- narrows prompt-injection blast radius
- simplifies audit
- reduces model confusion

## Generated UI security

### Declarative UI

Validate against:

- schema
- known component catalog
- allowed actions
- allowed state bindings
- safe URL/media policies
- content escaping rules

### Executable custom UI

Use isolation. MCP Apps is a current reference architecture for sandboxed embedded UI. A2UI documentation also discusses isolated handling of custom MCP Apps in A2UI surfaces.

Do not execute arbitrary LLM-generated HTML/JS in the trusted application origin.

## Prompt injection and external content

Treat retrieved content and tool output as untrusted input.

Do not let external content silently expand agent authority.

For high-impact actions, the approval surface should show the actual target and effect, not merely “Confirm?”

## Confirmation design

Bad:

`Proceed? [Yes] [No]`

Better:

`Send the edited reminder to 14 customers?`

Show relevant consequences:

- recipients/targets
- amount/cost
- date/time
- fields changing
- public/private scope
- irreversible effect

## Auditability

Record, where appropriate:

- who initiated the task
- model/agent/tool identity
- proposal
- approval/rejection/edit
- executed capability and parameters
- authoritative result
- timestamp
- failure/retry

Avoid storing hidden chain-of-thought as an audit strategy. Store observable decisions, tool calls, state transitions, and evidence.

## Permission visibility

Users should be able to understand:

- what data the agent can access
- what it can change
- what requires confirmation
- what was actually changed

Do not bury this only in settings/legal text when it is directly relevant to a consequential action.

## Fallback and degradation

For critical workflows, decide what happens when:

- model is unavailable
- tool is unavailable
- generated UI fails validation
- streaming fails
- authorization expires

Possible fallback:

- conventional fixed UI
- read-only result
- retry with safe reduced scope
- handoff to human operator

Design this before launch.
