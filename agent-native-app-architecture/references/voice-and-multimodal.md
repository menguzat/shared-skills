# Voice and Multimodal Interaction

Voice should share the same intent, task, and domain state as text and GUI.

## Voice strengths

Use voice for:

- hands-busy work
- rapid command/refinement
- exploratory conversation
- accessibility where appropriate
- field/physical environments
- interruption-friendly assistance

## Voice weaknesses

Avoid forcing voice for:

- large option lists
- exact IDs/numbers without visual confirmation
- dense comparisons
- long-form review
- spatial manipulation
- consequential confirmations with complex effects

## Multimodal loop

A strong pattern:

1. user speaks an intent
2. agent performs retrieval/planning
3. screen shows structured result
4. user manipulates UI or speaks refinement
5. shared state updates
6. agent continues

Example:

User: “Show only suppliers that can deliver by Friday and keep us under 20k.”

UI: comparison table + constraint chips.

User drags maximum budget to 18k.

Agent sees the new state and explains the trade-off.

## Persistent transcript

For task-critical voice interactions, consider showing a transcript or concise interpreted intent so the user can catch recognition errors.

## Confirmation

High-consequence voice commands should usually receive a visual or explicit structured confirmation when a screen is available.

If audio-only, repeat the critical effect concisely and require an unambiguous confirmation appropriate to the domain.

## Interruption

A voice agent should support user interruption where the runtime allows it. Long monologues are a UX failure in interactive voice.

## Screen/camera context

When the agent can observe a screen/camera:

- distinguish observed state from inferred state
- identify what selection/object the instruction refers to
- preserve privacy boundaries
- avoid taking action based on ambiguous visual reference without clarification when consequence is high

## Modality continuity requirement

Do not create separate “voice task” and “text task” records for the same work. Switching modality should preserve:

- task ID
- domain object
- current constraints
- pending approvals
- generated surfaces
- artifact versions
