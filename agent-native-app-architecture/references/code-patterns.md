# Code Pattern Guide

The files under `code/` are compact instructional patterns, not a replacement for current framework documentation.

## `code/a2ui/sample-v0.9.1.jsonl`

Demonstrates:

- explicit v0.9.1 version
- `createSurface`
- separate component and data updates
- action event
- declarative UI rather than executable code

Before use: verify the latest A2UI production version and schema at https://a2ui.org/.

## `code/universal/surface-selector.ts`

Demonstrates a deterministic policy function that maps task characteristics to candidate surfaces. The point is to keep the model from freely inventing presentation type without constraints.

## `code/universal/approval-policy.ts`

Demonstrates consequence-based approval rules. Real products should replace the example thresholds with domain policy and server-side authorization.

## `code/universal/shared-state.ts`

Demonstrates one task state object shared by chat and UI, including proposal and lifecycle state.

## `code/ag-ui/frontend-events.ts`

Demonstrates the event-driven mindset for text, tool, state, and run events. Exact SDK imports and event names can change; verify with current AG-UI docs.

## `code/mcp-apps/pattern-server.ts`

Demonstrates the conceptual “tool + UI resource” pairing and separation between structured result and interactive view. It is intentionally compact rather than a pinned dependency scaffold.

For runnable production examples, start from the upstream official examples:

- MCP Apps: https://github.com/modelcontextprotocol/ext-apps/tree/main/examples
- A2UI: https://github.com/a2ui-project/a2ui/tree/main/samples
- AG-UI: https://github.com/ag-ui-protocol/ag-ui
- OpenAI ChatGPT apps: consult current developers.openai.com docs and the OpenAI curated `chatgpt-apps` skill.
