# Greenfield Agent-Native Application Design

Start from needs and outcomes, not pages.

## 1. Define jobs and outcome statements

Write the primary user jobs in natural task language.

Examples:

- “Find the best shipping option that still meets Friday delivery.”
- “Turn today’s inspection findings into a corrective-action plan.”
- “Compare three scenarios and show what drives margin risk.”

Avoid early screen language such as “dashboard,” “settings page,” or “wizard” unless the interaction need already proves it.

## 2. Derive the capability graph

For each job, identify atomic capabilities.

A capability can be:

- retrieve
- search
- calculate
- transform
- generate
- validate
- create
- update
- delete
- send/publish
- schedule
- monitor
- purchase/commit

Map dependencies between capabilities. Keep deterministic computation outside the LLM where appropriate.

## 3. Define domain objects and state transitions

For each important object:

- identity
- lifecycle states
- editable fields
- immutable fields
- permissions
- relationships
- versioning
- audit trail

Then define task/run state separately.

Example:

`draft -> awaiting_approval -> approved -> executing -> completed | failed | cancelled`

## 4. Set autonomy boundaries

For every capability answer:

- Can agent do this automatically?
- Can it prepare but not execute?
- Must it request approval?
- Can approval include edits?
- Can the action be undone?
- What evidence is needed before execution?

This is architecture, not merely prompt wording.

## 5. Decide what deserves stable UI

Create fixed UI for recurring interaction where learned structure is valuable.

Strong candidates:

- primary object browser
- professional work canvas
- persistent project/workspace
- timeline
- map
- high-frequency controls
- status center
- history/audit view

Agent-native does not mean “no app shell.” It means the shell is organized around durable work/state rather than forcing users through every operation manually.

## 6. Define generated surface grammar

Create a component catalog and semantic surface types.

Possible primitives:

- text/headings
- status/notice
- key-value summary
- list
- table
- card
- form field
- date/time
- slider/range
- selector
- checkbox
- buttons/actions
- chart
- map
- timeline
- media
- progress
- diff
- approval panel

Define constraints and accessibility behavior before model generation.

## 7. Define interaction patterns

At minimum specify:

### Ask → answer

Simple informational response.

### Ask → generated view

Agent returns a task-specific comparison/visualization/form.

### UI edit → agent continues

Direct manipulation updates shared state; agent observes and proceeds.

### Agent proposes → human edits/approves

Used for consequential mutations.

### Background run → attention request

Agent works asynchronously and surfaces UI only when intervention/result is important.

### Persistent artifact

Conversation creates an object that remains editable across turns/sessions.

## 8. Voice/multimodal architecture

If voice matters, decide:

- push-to-talk vs continuous
- interruptibility
- transcript visibility
- what state is shown while speaking
- how exact values are confirmed
- fallback to text/UI
- whether screen/camera context is available

Do not make voice a separate product state.

## 9. Protocol/runtime selection

Only now select technical standards.

Examples:

- Need portable declarative agent-generated UI rendered with host components → A2UI candidate.
- Need a tool/provider to ship specialized interactive UI with the MCP capability → MCP Apps candidate.
- Need standardized frontend↔agent event/state/tool/HITL runtime → AG-UI candidate.
- Need external tools/data → MCP candidate.
- Need remote agent collaboration → A2A candidate.

A product can use several.

## 10. Design the observability model

Instrument:

- task success/failure
- time to first useful output
- time to completion
- user turns
- UI interactions
- corrections
- approvals/rejections
- tool errors
- agent retries
- cancellation
- fallback to conventional navigation
- latency by stage

Do not rely only on chat satisfaction.

## 11. Design evals before implementation

Create test scenarios for:

- underspecified intent
- contradictory intent
- impossible capability
- permission denied
- stale state
- tool partial failure
- long-running task
- interruption
- user edit during execution
- destructive action
- modality switch
- accessibility path

Use `evals/scenarios.yaml` as a base.
