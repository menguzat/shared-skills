# State, Human Control, Interrupts, and Recovery

Agent-native UX becomes unreliable when “state” exists only in conversational memory.

## State layers

### Conversation state

Messages, current references, prior user instructions.

### Domain state

Actual business/application objects: order, document, customer, booking, configuration.

### Task/run state

Lifecycle of current agent work:

`idle -> planning/preparing -> executing -> waiting_for_user -> completed | failed | cancelled`

### Approval state

What mutation is proposed, what evidence supports it, who may approve, and whether edits are allowed.

### UI state

Selection, filters, viewport, open surface, temporary form values.

### Artifact state

Versioned content of long-lived editable outputs.

## Shared state requirement

Conversation and UI should not diverge.

If a user edits a field in the UI:

1. domain/task state updates,
2. agent receives the new state or delta,
3. subsequent natural-language references use that updated value.

If the agent changes a state value through a tool:

1. tool result verifies mutation,
2. frontend updates shared state,
3. visible UI reflects it,
4. history/audit trail records it when needed.

## Proposals are state, not prose

For consequential actions, represent the proposal structurally:

```json
{
  "proposal_id": "p_123",
  "action": "send_invoice_reminder",
  "target_ids": ["inv_8", "inv_9"],
  "parameters": {"channel": "email"},
  "status": "awaiting_approval"
}
```

The user should be able to inspect and, where safe, edit this object before execution.

## Approval ladder

### No approval

Read-only, low-risk computation, reversible local display changes.

### Soft confirmation

Moderate mutations where undo is easy and impact is limited.

### Explicit preview + approval

External communication, publishing, spending, scheduling on behalf of user, changing shared records.

### Strong confirmation / policy gate

Destructive, irreversible, high-cost, sensitive, or regulated actions.

The exact thresholds are product/domain decisions, not universal constants.

## Interruptibility

Long or autonomous runs should support, where technically possible:

- cancel
- pause
- redirect/steer
- request input
- approve/reject
- approve with edits
- retry a failed step

AG-UI’s interrupt and state concepts are useful reference patterns even when AG-UI is not used.

## Recovery design

When an agent is wrong:

Bad:

- “Start over.”
- erase the entire task
- force the user to restate all inputs

Better:

- edit the wrong field
- correct an assumption
- regenerate one section
- retry one tool
- roll back one mutation
- restore a prior artifact version

## Verification

Do not mark a mutation complete based on model intention.

Completion requires authoritative evidence from the system/tool.

Use statuses like:

- prepared
- awaiting approval
- submitted
- accepted by backend
- completed
- failed

Avoid collapsing these into “done.”

## Long-running work

Expose a concise progress model without raw chain-of-thought.

Useful user-visible stages:

- gathering data
- validating inputs
- preparing proposal
- waiting for approval
- executing
- verifying result

Prefer task status summaries and tool/run events over internal reasoning traces.
