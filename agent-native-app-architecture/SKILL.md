---
name: agent-native-app-architecture
description: Transform existing applications or design new applications around agent-native, copilot-style interaction: conversation/voice as intent and orchestration, dynamic or generative UI as just-in-time perception/manipulation surfaces, shared application state, tools/capabilities, human-in-the-loop control, and protocol-aware architecture. Use when auditing or redesigning an app for conversational/voice interaction, generative UI, copilots, agentic UX, A2UI, MCP Apps, AG-UI, ChatGPT Apps SDK, Microsoft Copilot extensions, multimodal assistants, persistent artifacts/workspaces, or when deciding what should remain fixed GUI versus become agent-driven.
---

# Agent-Native App Architecture

Design the interaction system, not a pile of screens.

Core model:

- Conversation/voice expresses intent, ambiguity, goals, and refinement.
- UI provides perception, comparison, exact manipulation, state visibility, and confirmation.
- Agents plan and execute through explicit capabilities/tools.
- Shared state connects conversation, UI, tools, artifacts, and background work.
- UI appears at the right level of complexity for the current task instead of reproducing the whole application inside chat.

Default doctrine: **intent-first, capability-driven, state-centered, UI-on-demand**.

Do not assume that “agent-native” means “chat-only.” Prefer a hybrid interaction loop:

`say/ask -> show -> manipulate -> approve/refine -> continue`

## Mandatory Freshness Check

This domain changes quickly. Before making protocol-specific implementation claims or generating production code for A2UI, MCP Apps, AG-UI, OpenAI Apps SDK, Microsoft Copilot, or related frameworks:

1. Read `references/source-index.md`.
2. Check the current official documentation linked there.
3. Record the date and protocol/version used in the implementation notes.
4. Prefer current official docs over examples or blog posts when they disagree.
5. Treat research papers and community feedback as evidence for design choices, not normative protocol specifications.

As of the research snapshot in this skill (2026-08-08), A2UI v0.9.1 is the current production release and v1.0 is a release candidate. Re-check before coding.

## Classify the Request

Choose one primary path before doing design work.

### Existing app transformation

Use this when an application, repository, product, or workflow already exists.

Read `references/existing-app-transformation.md`.

Inspect, when available:

- routes/pages/screens and navigation depth
- repeated forms and configuration flows
- APIs, services, mutations, jobs, webhooks, and tool-like actions
- auth, roles, permissions, approvals, and destructive actions
- server/client state and persistence
- dashboards, editors, tables, maps, timelines, canvases, media surfaces
- current chatbot/copilot sidebars and duplicated flows
- user support burden and recurring long-tail requests

Do not begin by “adding chat.” First extract the application’s **capability model** and **task state model**.

### Greenfield app design

Use this when designing from a need, job-to-be-done, product brief, or user workflow.

Read `references/greenfield-design.md`.

Do not begin with sitemap or screen list. Start with:

1. user outcomes and recurring intents
2. capabilities needed to achieve them
3. data/context required for each capability
4. risk/permission boundaries
5. state transitions and long-running work
6. interaction modality selection
7. just-in-time surface selection
8. persistence and artifact strategy
9. protocol/runtime selection only after the interaction architecture is clear

## Required Architecture Layers

For substantive work, produce or reason through these layers. Use `templates/architecture-output.md` when a formal deliverable is requested.

### 1. Intent model

Describe what users are trying to accomplish in outcome language rather than navigation language.

Bad: “User goes to Reports > Sales > Region.”

Good: “Compare this quarter’s regional performance and explain the largest deviation.”

Group intents into:

- retrieve/understand
- compare/explore
- create/transform
- decide/approve
- operate/execute
- monitor/wait
- collaborate/share
- recover/correct

### 2. Capability model

Represent what the system can actually do as explicit callable capabilities. A capability should have:

- stable name
- input contract
- output contract
- read versus mutation classification
- side effects
- permission requirements
- latency expectations
- reversibility/undo behavior
- whether human approval is required
- candidate UI representation

Use `templates/capability-inventory.md`.

Prefer capability extraction over reproducing the application’s page tree.

### 3. Context model

Separate:

- conversation context
- user/account context
- organization/project context
- current selection/screen context
- connected-data context
- retrieved evidence
- transient task context
- durable memory

Never hide important context assumptions from the user when they affect the action or result.

### 4. State model

Model visible state explicitly. Distinguish:

- conversation state
- task/run state
- domain/application state
- UI/surface state
- artifact/document state
- approval state
- background job state

Use shared state so chat/voice and direct manipulation modify the same underlying task or domain object.

Read `references/state-and-human-control.md`.

### 5. Agent orchestration

Decide what should be:

- deterministic application code
- a normal API/tool call
- a model decision
- a multi-step agent workflow
- a background/recurring agent
- a human decision

Do not use an agent for deterministic work merely because an LLM is available.

### 6. Interaction modality

Select the lowest-friction modality per task step:

- text conversation
- voice
- fixed UI
- composed/declarative generative UI
- sandboxed custom interactive app
- persistent workspace/artifact
- notification/background result

Read `references/surface-selection.md` and `references/voice-and-multimodal.md`.

### 7. Surface contract

Every UI surface created or selected by an agent must answer:

- Why is UI better than prose here?
- What user decision/manipulation does it enable?
- What state does it expose?
- What can the user change directly?
- What happens on success, loading, partial completion, error, and cancellation?
- What is the escape route back to conversation or a larger workspace?

Do not generate UI merely to decorate an answer.

### 8. Trust, permissions, and recovery

Classify actions by consequence:

- observational/read-only
- reversible local mutation
- external write
- costly/financial
- destructive/irreversible
- sensitive/high-stakes

Increase review and confirmation as consequence increases.

Prefer:

`prepare -> preview -> explain relevant effect -> approve/edit -> execute -> show result -> undo/recover when possible`

Read `references/security-trust-and-permissions.md`.

## Surface Selection Rules

Use these heuristics before choosing a UI type.

### Prefer conversation when

- intent is ambiguous or exploratory
- user needs explanation or synthesis
- workflow is rare/long-tail
- user does not know the system’s vocabulary
- natural language can collapse many navigation steps

### Prefer direct UI when

- exact values matter
- many alternatives must be scanned or compared
- spatial relationships matter
- selection is faster than description
- state must remain continuously visible
- repeated operations benefit from muscle memory

### Prefer composed/declarative generative UI when

- the task structure varies by request
- a bounded component catalog can express the needed interaction
- the host should retain design-system, accessibility, and security control
- the UI can be described as structured intent rather than arbitrary code

Default to bounded composition before arbitrary generated code.

### Prefer a sandboxed custom app when

- the task requires rich domain interaction not expressible by the trusted catalog
- examples include complex 3D, CAD-like manipulation, specialized editors, media tools, or intricate multi-step workflows
- the host can isolate third-party/custom code with explicit capability and security boundaries

### Prefer a persistent workspace/artifact when

- the output will be edited repeatedly
- it is larger than a glanceable inline result
- the user will refer back to it later
- conversation should remain available while the object is manipulated

## Progressive Complexity

Use the smallest surface that accomplishes the task.

Typical ladder:

1. prose/text result
2. single action/chip
3. concise inline card
4. structured form or comparison surface
5. expanded side-by-side workspace
6. persistent artifact/document/canvas
7. sandboxed specialized application

Do not embed a full conventional application inside a chat widget. Extract the task-relevant capability and expose only what is needed now.

## Generative UI Policy

Treat the design system as the grammar of generative UI.

Prefer:

`agent -> semantic UI intent -> validated component catalog -> native renderer`

over:

`agent -> arbitrary HTML/JS -> execute directly`

Use three levels deliberately:

1. **Fixed component**: known recurring task, high predictability.
2. **Generated composition**: dynamic arrangement of trusted components; preferred default for variable tasks.
3. **Generated/custom code**: use only when composition cannot express the required interaction and isolation is available.

Generated variation should be task-adaptive, not random personalization. Preserve conventions, labels, control behavior, accessibility semantics, and predictable placement where possible.

## Conversation/UI Coordination Rules

- Do not duplicate the same information in model prose and a widget.
- Let chat/voice and GUI operate on the same state.
- Let the user correct the agent by editing the object directly when practical.
- Do not force a workflow restart after misunderstanding.
- Keep approvals editable when possible: approve, reject, or approve with edits.
- Make current scope and assumptions visible when they affect the outcome.
- Expose progress for long-running work without leaking private chain-of-thought.
- Show tool/action status, not hidden “done” claims.
- Provide cancel/interrupt for long-running or consequential work where technically possible.

## Voice and Multimodal Rules

Voice is an intent channel, not a replacement for visual state.

For voice-capable designs:

- maintain one task state across voice, text, and GUI
- show important values visually when users may need verification
- do not require users to remember long option lists from speech
- use voice for command, refinement, hands-busy interaction, and conversational exploration
- use UI for exact values, comparison, persistent context, and confirmations
- support interruption and modality switching without losing the task

## Protocol Selection

Do not select protocols by hype or name similarity. Read `references/protocol-stack.md`.

Use the conceptual split:

- **MCP**: agent/model ↔ tools/data/capabilities
- **A2A**: agent ↔ agent
- **AG-UI**: application/front end ↔ agent runtime, including events/shared state/tool lifecycle/HITL
- **A2UI**: declarative generative UI payload/spec rendered by trusted host components
- **MCP Apps**: MCP tools/resources delivering sandboxed interactive UI to compatible hosts

These can be combined. They are not mutually exclusive.

## Existing App Audit Workflow

When asked to audit or transform an app:

1. Inventory current user outcomes and high-frequency workflows.
2. Map navigation steps to underlying capabilities.
3. Identify friction caused by users needing to know information architecture.
4. Identify places where chat would increase articulative effort instead of reducing it.
5. Classify each current screen:
   - keep fixed
   - make context-aware
   - expose as capability
   - convert to generated/composed surface
   - move into persistent workspace
   - remove/redundant
6. Build a shared-state model.
7. Define approval boundaries.
8. Design representative before/after journeys.
9. Select protocols/runtime.
10. Produce phased migration plan; avoid “rewrite everything” unless justified.
11. Define evals before implementation.

Score with `references/evaluation-and-maturity.md` or run `scripts/score_audit.py` with a completed score JSON.

## Greenfield Design Workflow

When asked to design a new product:

1. Capture user jobs/outcomes and constraints.
2. Derive capability graph.
3. Define domain objects and state transitions.
4. Mark risky mutations and approval gates.
5. Decide what users should not need to navigate manually.
6. Define stable/repeated surfaces that deserve fixed UI.
7. Define variable/long-tail surfaces that benefit from generated composition.
8. Define persistent artifacts/workspaces.
9. Define background monitoring or asynchronous runs if the product needs them.
10. Map voice/text/visual modality by step.
11. Select protocols and implementation patterns.
12. Create eval scenarios including failures, ambiguity, interruption, and user correction.

## Evaluation

Never evaluate only the “golden path.” Read `references/evaluation-and-maturity.md` and `evals/scenarios.yaml`.

At minimum test:

- intent success without knowledge of app navigation
- number of conversational turns to task completion
- user articulation burden
- state visibility
- correction without restart
- UI consistency/predictability
- latency and progressive rendering
- approval correctness
- undo/recovery
- error handling
- modality switching
- accessibility
- hallucinated capabilities
- permission boundary violations
- generated UI outside the allowed catalog

Compare agent-native flow against the best conventional GUI baseline for recurring tasks. Do not assume conversation wins.

## Anti-Patterns

Reject or explicitly flag:

- chatbot bolted onto unchanged SaaS with no shared state
- “everything is chat”
- natural language required for simple repeated actions that are faster with direct manipulation
- sequential interrogation for structured fields that should be a form
- enormous text response where comparison/visualization is needed
- random per-user UI layout that destroys learned conventions
- generated executable UI without isolation or validation
- hidden mutations and invisible agent state
- irreversible actions without appropriate review
- separate voice/chat/UI states
- full app recreation inside an inline widget
- deep tabs/navigation inside a chat card
- duplicated content in prose and UI
- agent claiming success without verifiable system state
- workflow restart after a correctable misunderstanding

## Implementation Resources

Load only what is relevant:

- `references/source-index.md` — live official sources, research, community evidence, videos
- `references/paradigm-and-principles.md` — conceptual model and design doctrine
- `references/existing-app-transformation.md` — migration/audit playbook
- `references/greenfield-design.md` — new app design playbook
- `references/surface-selection.md` — modality and UI decision matrix
- `references/state-and-human-control.md` — state, interrupts, approvals, recoverability
- `references/protocol-stack.md` — A2UI/MCP Apps/AG-UI/MCP/A2A selection
- `references/security-trust-and-permissions.md` — sandboxing, permissions, action boundaries
- `references/voice-and-multimodal.md` — voice/text/visual continuity
- `references/evaluation-and-maturity.md` — scorecard and eval design
- `references/user-research-and-feedback.md` — research findings and anecdotal user objections
- `references/visual-and-video-gallery.md` — curated visual demos and videos
- `references/code-patterns.md` — what each code sample demonstrates
- `references/platform-implementation-notes.md` — implementation choices by target platform/runtime
- `examples/` — worked transformations and greenfield examples
- `code/` — compact protocol/pattern examples
- `templates/` — reusable audit and architecture outputs
- `schemas/` — machine-readable intent/surface contract schemas
- `scripts/validate_skill.py` — local package validation
- `scripts/score_audit.py` — deterministic maturity scoring

## Output Standard

For architecture work, clearly separate:

- verified facts about the existing product or source material
- design recommendations
- assumptions requiring validation
- protocol/version-dependent implementation details

When proposing a transformation, show the actual before/after interaction model rather than merely saying “add an AI copilot.”

End major design outputs with:

1. proposed intent/capability/state architecture
2. surface strategy
3. human-control model
4. implementation/protocol choice
5. migration/build phases
6. eval plan
7. unresolved assumptions
