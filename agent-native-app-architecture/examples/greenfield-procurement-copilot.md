# Worked Example: Greenfield Procurement Copilot

## Need

A buyer needs to source materials under changing constraints: specification, deadline, budget, supplier status, region, certifications, and logistics.

## Why not start with a dashboard

The input shape changes by purchase. A rigid mega-form either exposes too many irrelevant fields or requires many specialized screens.

## Intent examples

- “Find two backup suppliers for 5 tons of material X delivered before 18 September.”
- “Compare the current quote with last quarter and tell me what changed.”
- “Ask shortlisted suppliers for a revised lead time, but let me approve the message first.”

## Capability graph

Read:

- supplier search
- supplier qualification lookup
- historical quote lookup
- logistics estimate
- currency normalization

Prepare:

- request-for-quote draft
- comparison model
- negotiation message draft

Mutate:

- send RFQ
- update shortlist
- create purchase request

## Surface grammar

The agent can select from trusted components:

- constraint chips
- supplier cards
- comparison table
- certification badges
- map
- lead-time timeline
- budget slider
- approval/diff panel

The layout changes by task, but component semantics stay stable.

## Example interaction

User:

> I need 5 tons by 18 September. EU suppliers preferred but not required. Keep landed cost under €32k.

Agent creates a compact missing-input form only for material grade and destination if not already known.

After retrieval, it creates:

- top-line feasibility summary
- comparison table
- map if geography affects logistics
- risk flags

User changes max budget from €32k to €29k with a slider.

Shared state updates:

```json
{
  "constraints": {
    "quantity_tons": 5,
    "delivery_by": "2026-09-18",
    "landed_cost_max_eur": 29000
  }
}
```

Agent re-ranks suppliers based on the edited state.

## Persistent artifact

A shortlisted procurement package becomes a persistent object containing:

- selected suppliers
- assumptions
- quote evidence
- draft RFQ
- approval history
- final purchase request

Conversation remains available next to it.

## Human control

Searching/analysis: autonomous.

Drafting RFQ: autonomous preparation.

Sending RFQ: explicit approval.

Purchase commitment: stronger approval, role authorization, and exact amount/terms visible.
