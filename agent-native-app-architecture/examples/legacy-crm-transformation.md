# Worked Example: Legacy CRM → Agent-Native CRM

This is a design example, not a claim about any specific CRM product.

## Legacy interaction

Goal: sales manager wants to understand late-stage deals at risk and send follow-ups.

Typical fixed-app sequence:

1. open Opportunities
2. apply stage filters
3. apply close-date filter
4. sort by amount
5. open each opportunity
6. inspect recent activity
7. return to list
8. open contact
9. compose follow-up
10. repeat

## Intent model

Primary intent:

> Identify high-value late-stage deals likely to slip this month, explain the signal, and prepare follow-ups for my review.

Sub-intents:

- find candidate deals
- explain why each is at risk
- inspect evidence
- draft follow-up
- edit/approve
- send

## Capability extraction

Read capabilities:

- `search_opportunities(filters)`
- `get_opportunity_activity(opportunity_id)`
- `get_contact(contact_id)`
- `score_slip_risk(opportunity_id)` — deterministic/ML/agent implementation is a product choice

Preparation capability:

- `draft_followup(opportunity_id, context, tone)`

Mutation capability:

- `send_followup(opportunity_id, approved_message)`

Do not let `send_followup` share the same implicit authorization boundary as `draft_followup`.

## Proposed flow

User:

> Which large deals are likely to slip this month? Prepare follow-ups, but don't send anything.

Agent:

1. invokes read capabilities
2. creates a risk-comparison surface
3. shows evidence and confidence/uncertainty where supported
4. prepares draft messages

Generated/structured surface:

| Deal | Amount | Risk signal | Last activity | Proposed next step |
|---|---:|---|---|---|
| Northwind | ... | no meeting in 18d | ... | send decision-date check-in |
| Acme | ... | legal review stalled | ... | ask for legal blocker |

User can:

- sort/filter
- deselect a deal
- open evidence
- edit each draft
- say “make all of these less salesy”

Shared state changes rather than creating disconnected message copies.

Approval panel:

`5 messages prepared — 0 sent`

Actions:

- Approve selected and send
- Edit
- Cancel

## What remains fixed UI

- master opportunity browser
- account workspace
- timeline/history
- dense pipeline visualization

These are high-frequency surfaces where persistence and scanning matter.

## What becomes intent-driven

- complex cross-filtering
- long-tail questions
- multi-object analysis
- drafting
- orchestration across opportunity/activity/contact systems

## Eval cases

- user says “send these” after editing only 4 of 5 drafts
- one contact lacks an email address
- permission allows drafting but not sending
- activity service times out for one deal
- user manually removes a deal from the table; agent must respect the updated selection
- user says “undo the last send” where the underlying email system cannot recall messages; system must not falsely offer undo
