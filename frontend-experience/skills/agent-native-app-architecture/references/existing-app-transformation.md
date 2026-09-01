# Existing Application Transformation Playbook

The objective is not to graft a chatbot onto a legacy app. Extract the app’s real capabilities, preserve strong direct-manipulation surfaces, and remove navigation burden where intent-based orchestration is better.

## Phase 0 — establish scope

Collect or inspect:

- primary users/roles
- top tasks by frequency and business value
- current routes/screens
- APIs/services and mutations
- authentication/authorization
- background jobs
- notifications
- failure/support data if available
- analytics on abandoned or high-friction flows if available

If a repository is available, inspect code before asking the user questions that the repo can answer.

## Phase 1 — decompose the legacy UI

For each major screen, identify:

1. **Information** — what data is exposed?
2. **Capability** — what actions can be performed?
3. **State** — what object/task state is shown or edited?
4. **Interaction advantage** — why is this UI better than text?
5. **Navigation tax** — what knowledge of the app hierarchy is required?

Create a decomposition table:

| Current screen | Underlying job | Capabilities | Why GUI helps | Navigation tax | Candidate future form |
|---|---|---|---|---|---|

Do not treat pages as capabilities. “Open Orders page” is navigation. “Find delayed orders” is an intent. “Reschedule shipment” is a capability.

## Phase 2 — capability extraction

Turn implicit app actions into stable callable contracts.

Examples:

Legacy UI actions:

- open customer
- click invoice tab
- filter overdue
- choose invoices
- send reminder

Agent-native capability candidates:

- `find_overdue_invoices(customer?, age_days?, amount_min?)`
- `draft_payment_reminder(invoice_ids, tone?)`
- `send_payment_reminder(invoice_ids, approved_content)`

Keep read and write capabilities separate when approval/risk differs.

## Phase 3 — classify each existing surface

Use these categories.

### KEEP FIXED

Use when the surface is high-frequency, spatial, precise, learned, and faster than natural language.

Examples: timeline editor, dense spreadsheet, CAD viewport, professional image editor toolbar.

### CONTEXT-ENABLE

Keep the UI but expose current selection/state to the agent, and let the agent manipulate or explain it.

Example: user selects rows; asks “why are these outliers?”; agent annotates the existing chart.

### CAPABILITY-EXTRACT

Expose actions/data via tools so the user can invoke them by intent without navigation.

### GENERATED/COMPOSED SURFACE

Replace variable forms/report layouts with a dynamic combination of trusted components.

### PERSISTENT WORKSPACE

Move substantial iterative output into a side-by-side editable surface.

### REMOVE

Remove navigation-only or duplicative screens made unnecessary by capability access and generated surfaces.

## Phase 4 — identify “chat makes this worse” flows

Explicitly find tasks where conversation increases effort.

Signals:

- frequent repeated use
- exact parameter tuning
- many selections
- scanning/triage
- spatial arrangement
- long lists
- rapid toggling
- keyboard-heavy professional workflows

Preserve or improve direct UI for these.

## Phase 5 — build shared state

Legacy apps often have state distributed across URL, component state, backend records, and chat context.

Define a shared task/domain state object so that:

- conversation can refer to what the user sees
- direct manipulation changes what the agent sees
- agent tool calls update the same object
- approval state is explicit
- background progress is visible

Avoid copying UI state into prompt text as the only synchronization mechanism.

## Phase 6 — conversational entry points

Choose where intent can enter:

- global command/chat
- contextual chat attached to current workspace
- voice
- inline “ask about this” affordances
- selected-object actions
- proactive/background notification

Do not require a single giant assistant window for every task.

## Phase 7 — redesign representative journeys

For at least five high-value tasks, document:

### Before

`navigation -> filters -> form -> review -> submit -> toast`

### After

`intent -> agent/tool work -> generated surface -> direct refinement -> approval -> verified result`

Measure:

- navigation steps removed
- user text required
- number of turns
- decision time
- error/recovery behavior
- ability to inspect and undo

## Phase 8 — migration sequencing

Prefer incremental migration:

### Stage 1: capability layer

Expose and normalize APIs/actions. Improve authorization, idempotency, and audit logs.

### Stage 2: shared context/state

Allow agent and existing UI to share selection/task state.

### Stage 3: intent surface

Add conversation/voice for high-value long-tail workflows.

### Stage 4: generated composition

Introduce dynamic forms, comparisons, and cards where variability is high.

### Stage 5: persistent workspaces / background agents

Support longer-running and editable workflows.

### Stage 6: remove obsolete navigation/surfaces

Only after evidence shows they are redundant.

## Migration risk checklist

- Are hidden legacy side effects now callable by the agent?
- Is authorization enforced server-side, not just in UI?
- Are write tools idempotent or protected against repeated execution?
- Is there a clear read/write distinction?
- Can the user inspect pending changes?
- Does direct UI remain usable if the agent fails?
- Can users complete critical workflows without a model where resilience requires it?
- Are generated surfaces constrained to an accessible component grammar?
- Are analytics capable of comparing old vs new task success?

## Output

Use `templates/audit-output.md` and `templates/architecture-output.md` for formal transformation work.
