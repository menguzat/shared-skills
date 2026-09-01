# Paradigm and Design Principles

## The architectural inversion

Traditional software often asks users to translate intent into the application’s information architecture:

`goal -> navigation -> page -> form -> button -> result`

A basic chatbot reduces navigation but remains linear:

`goal -> prompt -> text answer -> prompt -> text answer`

An agent-native system instead aims for:

`goal -> intent resolution -> capability orchestration -> state update -> appropriate surface -> user manipulation/approval -> continuation`

The important inversion is not “replace GUI with chat.” It is:

- make conversation/voice the **intent and coordination layer** when natural language is efficient,
- make UI a **task-specific representation and manipulation layer**,
- make capabilities/tools the **operational layer**,
- make shared state the **continuity layer**.

## Four primitives

### 1. Intent

What outcome does the user want, independent of current navigation?

### 2. Capability

What can the system read, compute, create, mutate, send, schedule, purchase, delete, or monitor?

### 3. State

What is true now about the domain object, task, agent run, approval, artifact, and UI?

### 4. Surface

What representation/manipulation mechanism best helps the user understand or influence the next state transition?

A screen is one possible surface. So are a card, table, map, slider, editor, voice answer, notification, or persistent artifact.

## Why chat-only fails

Natural language is powerful for ambiguous and long-tail intent, but it can impose high articulation cost on repeated or precise operations.

Examples:

- Saying “set quantity to 42” is reasonable once; dragging/typing into a persistent numeric control is often better during repeated tuning.
- Asking “compare these 15 suppliers across six metrics” is a good conversational command; consuming the result as paragraphs is poor. A sortable comparison surface is better.
- Voice is efficient while hands are occupied, but a user should not have to remember 12 spoken options.

Therefore measure **interaction cost**, not novelty.

## The interface becomes conditional

Instead of prebuilding every possible workflow screen, design a stable grammar of surfaces and rules for when they appear.

Example:

- quick approval -> inline card
- structured missing fields -> compact form
- many alternatives -> table/grid
- geospatial task -> map
- temporal planning -> calendar/timeline
- parameter sensitivity -> controls + visualization
- editing a persistent deliverable -> workspace/artifact
- specialized rich interaction -> sandboxed app

The agent should choose from this grammar based on task shape.

## Bounded generative UI as default

Generated composition is usually safer and more predictable than generated executable UI.

Preferred pipeline:

`intent -> semantic UI spec -> schema validation -> trusted component catalog -> native rendering`

Benefits:

- design-system consistency
- accessibility control
- type/schema validation
- lower code-execution risk
- platform portability
- easier telemetry and QA
- predictable user mental models

Use generated code when the task genuinely requires interaction outside the catalog and can run in an appropriately isolated environment.

## Stable conventions, adaptive composition

Generative UI should adapt to the **task**, not arbitrarily mutate conventions per user.

Keep stable when possible:

- control semantics
- destructive-action placement and styling
- terminology
- keyboard behavior
- accessibility labels
- undo patterns
- approval language
- loading/error conventions

Adapt:

- which components appear
- which fields are necessary
- content density
- ordering based on task relevance
- visualization choice
- grouping and disclosure level

## Progressive complexity

Start with the smallest adequate representation and expand only when the user needs more workspace.

A useful progression:

`text -> action/chip -> card -> structured surface -> workspace -> persistent artifact -> specialized app`

This protects conversational flow from becoming a collection of miniature legacy applications.

## State-centered design

In fixed UI design, screens can accidentally become the unit of architecture. In agent-native design, **state transitions** should be the unit.

For each important task, document:

- initial state
- user intent
- agent/system action
- intermediate state
- uncertainty/assumptions
- required human decision
- final state
- failure/recovery state

Then choose surfaces to expose the state transitions users must see or manipulate.

## Persistent objects

Not every answer belongs in a message bubble.

Create a persistent object/workspace when:

- the user will edit it repeatedly
- it has its own identity/lifecycle
- it outlives the current message
- it needs versions/history
- it benefits from side-by-side chat
- it becomes input to future actions

Examples: proposal, itinerary, code patch, product configuration, report, dashboard, contract draft, design, plan.

## Agent as operator, not narrator

An agent-native system should distinguish between:

- discussing what could happen
- preparing a change
- executing a change
- verifying the actual result

Never equate generated prose with system state. A claim such as “the invoice was sent” must correspond to a verified tool/system result.

## Just-in-time interface

A useful long-term model is that UI is materialized when human attention is needed:

- a decision is required
- an exception occurs
- verification is necessary
- a parameter needs tuning
- a result benefits from visual perception
- a persistent object is being edited

Background agent work should not force the user to stay inside a chat thread to observe every step.
