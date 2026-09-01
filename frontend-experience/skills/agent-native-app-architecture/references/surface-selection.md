# Surface and Modality Selection

The correct question is not “Can the model generate a UI?” but “Which interaction form minimizes effort and error for this state transition?”

## Decision dimensions

Score or reason about:

- **ambiguity** — how unclear is the user’s intent?
- **precision** — are exact values/positions required?
- **density** — how much information must be perceived at once?
- **comparison** — how many alternatives/attributes?
- **spatiality** — does location/geometry matter?
- **persistence** — must the result remain visible/editable?
- **frequency** — is this a repeated learned workflow?
- **risk** — consequence of a wrong action
- **latency** — is work long-running?
- **mobility** — hands/eyes available?

## Practical matrix

| Task shape | Preferred surface | Why |
|---|---|---|
| Ambiguous request | conversation | natural language resolves intent |
| Short answer | text | lowest overhead |
| 1–2 obvious actions | inline card/chips | fast decision |
| Missing structured fields | compact generated form | lower articulation burden |
| Many comparable options | table/grid + filters | scan/compare |
| Location-oriented | map + list | spatial cognition |
| Time planning | calendar/timeline | temporal relationships |
| Parameter sensitivity | sliders/inputs + live chart | direct manipulation |
| Approval | preview + diff + approve/edit/reject | consequence visibility |
| Long editable output | workspace/artifact | persistence and iteration |
| Rich domain manipulation | specialized app/canvas | UI carries domain affordances |
| Hands-busy | voice + visual confirmation | modality fit |
| Background monitoring | notification/status surface | avoid requiring active chat |

## Inline versus expanded

### Inline

Use for:

- glanceable summary
- one compact choice
- quick confirmation
- small form
- status/progress

Keep action count low and avoid internal deep navigation.

### Expanded side-by-side

Use for:

- dense tables
- iterative editing
- multi-step configurations
- complex comparisons
- maps with detail
- document/canvas work

Keep conversation available so intent and manipulation can alternate.

## Fixed versus generated composition

### Fixed UI is stronger when

- workflow repeats often
- professional users build muscle memory
- consistency is more valuable than adaptation
- accessibility/testing burden is high
- exact placement is part of the skill

### Generated composition is stronger when

- field set depends on the request
- result representation varies materially
- long-tail workflows would explode the number of fixed screens
- a bounded catalog can express the variability

### Generated code is justified when

- the interaction is not expressible by the catalog
- value materially exceeds the security/testing cost
- code can execute in isolation
- failure can be contained

## Articulation-cost test

Before replacing a control with chat, compare:

- words required
- ambiguity introduced
- number of turns
- correction cost
- visual memory required

Example:

Bad agentification:

User must repeatedly type “set opacity to 43%, move the item 12px left, reduce radius to 6.”

Better:

Agent establishes the desired direction; user tunes exact values with controls; agent can still respond to “make it subtler.”

## Comparison-density test

If users need to compare more than roughly a few entities/attributes, default toward a structured visual surface rather than prose. Exact threshold depends on domain and device; validate in user testing.

## Surface schema

A generated surface should carry semantic metadata such as:

- purpose
- surface type
- related task/run ID
- bound state paths
- allowed actions
- approval semantics
- persistence level
- accessibility labels

See `schemas/ui-intent.schema.json`.
