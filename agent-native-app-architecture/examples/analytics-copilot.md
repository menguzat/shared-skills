# Worked Example: Analytics Copilot

## User job

“Why did conversion fall this week?”

## Poor chat-only response

A long paragraph enumerating many percentages and caveats forces the user to remember comparisons.

## Agent-native response

1. agent resolves date range and metric definition from context
2. retrieves relevant data
3. identifies likely dimensions worth comparing
4. generates a task-specific analytical surface

Surface might include:

- trend chart
- annotated change points
- channel/region comparison table
- filter chips
- evidence/source links

Conversation says only what is not obvious from the surface:

- concise interpretation
- major caveat
- suggested next question/action

## Direct manipulation parity

User can click “Paid Search” or say:

> Just show paid search and split it by device.

Both actions update the same analysis state.

## Stable versus generated

Stable:

- chart conventions
- metric colors/tokens from host design system
- filter behavior
- source/evidence affordance

Generated:

- which dimensions are shown
- layout emphasis
- annotations
- comparison set

## Failure case

If a data source is stale, surface the freshness state explicitly. Do not present the analysis as authoritative without that caveat.
