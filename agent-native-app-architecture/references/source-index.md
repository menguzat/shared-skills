# Source Index and Freshness Policy

Research snapshot: **2026-08-08**.

This file is a navigation map, not a frozen truth source. Protocols and product APIs in this field move quickly. For implementation work, open the current official page first and record the version/date used.

## Priority order

Use sources in this order when claims conflict:

1. Current normative specification / official API docs
2. Current official reference implementation / official repository
3. Current official design guidance
4. Peer-reviewed or preprint HCI research for interaction evidence
5. Official product demos for emerging patterns
6. Community discussion for qualitative objections and practitioner signals

Do not treat Reddit, blog commentary, or a demo as normative protocol documentation.

---

## Skill-format references

### OpenAI Skill Creator

- OpenAI skills repository — Skill Creator
  - https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md
  - Defines `SKILL.md`, YAML frontmatter, progressive disclosure, `agents/openai.yaml`, `references/`, `scripts/`, and `assets/` conventions.
- `agents/openai.yaml` field reference
  - https://github.com/openai/skills/blob/main/skills/.system/skill-creator/references/openai_yaml.md
- OpenAI curated ChatGPT Apps skill, useful as a current example of a docs-first implementation skill
  - https://github.com/openai/skills/blob/main/skills/.curated/chatgpt-apps/SKILL.md

---

## A2UI — declarative generative UI

### Current official docs

- Home / version status
  - https://a2ui.org/
- Roadmap
  - https://a2ui.org/roadmap/
- Concepts overview
  - https://a2ui.org/concepts/overview/
- Quickstart
  - https://a2ui.org/quickstart/
- Renderer development
  - https://a2ui.org/guides/renderer-development/
- Current repository
  - https://github.com/a2ui-project/a2ui

### Version snapshot on 2026-08-08

- v0.9.1 — current production release
- v1.0 — release candidate
- v0.9 — prior stable family
- v0.8 — legacy

Re-check before production work.

### Design value

A2UI is useful when an agent should describe a UI using a constrained, declarative component model while the host keeps control of rendering, design system, accessibility, and code execution.

### Useful demos

- A2UI Composer / Widget Builder: linked from https://a2ui.org/
- A2UI Theater: linked from https://a2ui.org/
- Restaurant Finder sample and other examples: https://github.com/a2ui-project/a2ui/tree/main/samples

### Historical official announcement

- Google Developers Blog, A2UI v0.9
  - https://developers.googleblog.com/en/a2ui-v0-9-generative-ui/

---

## MCP Apps — interactive UI delivered by MCP tools/resources

### Normative / official

- MCP Apps overview
  - https://apps.extensions.modelcontextprotocol.io/api/documents/overview.html
- Official repo
  - https://github.com/modelcontextprotocol/ext-apps
- Stable 2026-01-26 specification
  - https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx
- Quickstart
  - https://github.com/modelcontextprotocol/ext-apps/blob/main/docs/quickstart.md
- Official announcement
  - https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/

### Upstream agent skills

- Create MCP App skill
  - https://github.com/modelcontextprotocol/ext-apps/blob/main/plugins/mcp-apps/skills/create-mcp-app/SKILL.md
- Migration skill references are in the same `plugins/mcp-apps/skills/` tree.

### Key architecture signal

MCP Apps standardizes how a tool can associate an interactive UI resource with its capability and render it in an isolated host environment with bidirectional communication. Use it when a capability itself needs a specialized interactive view.

---

## AG-UI — runtime agent ↔ user-facing application protocol

### Official

- Overview
  - https://docs.ag-ui.com/
- Introduction / building blocks
  - https://docs.ag-ui.com/introduction
- Architecture
  - https://docs.ag-ui.com/concepts/architecture
- State management
  - https://docs.ag-ui.com/concepts/state
- Tools / human-in-the-loop
  - https://docs.ag-ui.com/concepts/tools
- Interrupts
  - https://docs.ag-ui.com/concepts/interrupts
- Capabilities
  - https://docs.ag-ui.com/concepts/capabilities
- Relationship to generative UI specs
  - https://docs.ag-ui.com/concepts/generative-ui-specs
- MCP/A2A/AG-UI relationship
  - https://docs.ag-ui.com/agentic-protocols
- Repository
  - https://github.com/ag-ui-protocol/ag-ui

### Key architecture signal

AG-UI is not itself a generative-UI schema. It standardizes a bidirectional, event-driven runtime connection between a frontend and an agent backend, including streaming, tool lifecycle, state synchronization, interrupts, and related interaction events.

---

## OpenAI Apps / ChatGPT interactive apps

### Official

- Build with the Apps SDK (current Help Center entry)
  - https://help.openai.com/en/articles/12515353-build-with-the-apps-sdk
- OpenAI curated ChatGPT Apps skill
  - https://github.com/openai/skills/blob/main/skills/.curated/chatgpt-apps/SKILL.md
- OpenAI developer home / current docs discovery
  - https://developers.openai.com/

### Official videos

- Build Hour: Apps in ChatGPT
  - https://www.youtube.com/watch?v=mFG-4vUJ0kI
- Apps in ChatGPT product introduction
  - https://www.youtube.com/watch?v=2C4Cs6503gw

### Design signal

Current OpenAI app tooling uses MCP as a foundation and allows applications to combine conversational behavior with interactive UI. For code, always use current OpenAI developer docs rather than copying stale SDK examples.

---

## Microsoft Copilot agent / MCP app UX

### Official UX guidance

- MCP apps UX guidelines for Microsoft 365 Copilot
  - https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps-ui-guidelines
- Add MCP apps to declarative agents
  - https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps
- Human-centered design for agents
  - https://learn.microsoft.com/en-us/agents/design-guidelines/human-centered-design
- Microsoft Design — UX design for agents
  - https://microsoft.design/articles/ux-design-for-agents/

### High-value principles from these sources

- Conversation remains the primary intent surface in Copilot contexts.
- Inline UI should stay lightweight and task-focused.
- Expand to a larger side-by-side surface for editing, dense tables, or complex work.
- UI and model text should complement rather than duplicate each other.
- Loading, success, disabled, error, and recovery states must be visible.
- Do not reproduce an entire application inside a small widget.
- Preserve user ownership, correction, and recoverability.

---

## Google Gemini — product examples of generative interfaces

### Official examples

- Gemini 3 generative interfaces: Visual Layout and Dynamic View
  - https://blog.google/products-and-platforms/products/gemini/gemini-3-gemini-app/
- Interactive simulations / 3D models and charts generated in chat
  - https://blog.google/innovation-and-ai/products/gemini-app/3d-models-charts/
- Gemini becoming more proactive / agentic
  - https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/

### Design signal

These are product examples of an assistant selecting or generating an interaction surface based on the request instead of returning only text. They are useful visual references, not portable protocol specifications.

---

## Anthropic Claude Artifacts — persistent conversation-adjacent workspace pattern

- What are artifacts and how do I use them?
  - https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
- Interactive AI-powered artifacts
  - https://www.anthropic.com/news/build-artifacts

### Design signal

Artifacts demonstrate the pattern where conversation remains the orchestration layer while substantial, editable, reusable output becomes a persistent working object in an adjacent workspace.

---

## HCI / research evidence

### Generative Interfaces for Language Models

- Jiaqi Chen et al., 2025
- https://arxiv.org/abs/2508.19227
- Reports that generative interfaces can outperform linear conversational interfaces on studied tasks; humans preferred them in over 70% of cases in the reported evaluation.
- Use as evidence that task-specific UI can improve interaction; do not generalize the percentage to all products/tasks.

### Rethinking the UI of GenUI: A Tale of Two Designs

- Xiang “Anthony” Chen et al., 2026
- https://arxiv.org/abs/2606.13843
- 24 UX designers/product managers compared unstructured depth-first high-fidelity GenUI with a structured breadth-first alternative.
- Useful for early-stage product/design exploration: structure exposes facets but increases entry cost; breadth reveals alternatives; fidelity expectations remain high.

### Towards a Working Definition of Designing Generative User Interfaces

- Kyungho Lee, 2025
- https://arxiv.org/abs/2505.15049
- Literature review + expert interviews + case analysis; useful conceptual background for GenUI as iterative/co-creative rather than one-shot screen generation.

### Framework of UX Principles for Human-AI Agent Interaction in the Workplace

- Paimann, Valarini, Juhl, 2026
- https://arxiv.org/abs/2607.19941
- Multi-method study proposing eight UX principles for human-agent interaction in workplace settings.
- Use for evaluation and enterprise design guardrails.

---

## Practitioner / user discussion — anecdotal, not representative research

Use these to discover objections and failure modes, never as population-level evidence.

- “Generative UI feels like the next ‘voice will replace screens’”
  - https://www.reddit.com/r/UXDesign/comments/1shew6h/generative_ui_feels_like_the_next_voice_will/
  - Recurring concerns: muscle memory, support/documentation, inconsistent UI, natural-language articulation cost.
- “Is chat actually the right interface for AI-native software?”
  - https://www.reddit.com/r/UXDesign/comments/1tne1zm/is_chat_actually_the_right_interface_for_ainative/
- “What am I missing about UI + AI?”
  - https://www.reddit.com/r/UXDesign/comments/1rqsovy/what_am_i_missing_about_ui_ai/
  - Concerns about generic output and missing intent/detail.
- “Are you comfortable with UIs Made by AI?”
  - https://www.reddit.com/r/UXDesign/comments/1v57key/are_you_comfortable_with_uis_made_by_ai/
  - Trust concerns when generated UI appears generic/inconsistent.
- “Designing for AI agents”
  - https://www.reddit.com/r/UXDesign/comments/1vhr3nj/designing_for_ai_agents/
  - Practitioner question about indeterminism, edge cases, and testing dynamic behavior.

---

## Visual / video references

See `visual-and-video-gallery.md` for a curated, task-oriented list.

## License / reuse note

This skill links to external examples rather than bundling third-party screenshots or large code copies. When adapting source code from an upstream repository, inspect and preserve its license/notice requirements. The compact code examples bundled in this skill are original instructional patterns and intentionally avoid reproducing large upstream implementations.
