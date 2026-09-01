# Lighthouse Agentic Browsing Guard

**Evidence: OFFICIAL, EXPERIMENTAL CATEGORY**

Chrome introduced an experimental Lighthouse Agentic Browsing category in 2026. It currently reports deterministic checks rather than a weighted 0–100 score. WebMCP-related checks are experimental/proposed.

The Performance Maximizer should not optimize for this category at the expense of performance or product behavior, but it should avoid degrading machine-interaction semantics while refactoring markup, controls, or loading behavior.

Examples of regressions to avoid:

- removing accessible names to simplify DOM;
- changing stable interactive semantics to visually-only click targets;
- causing layout instability that makes automated interaction unreliable;
- hiding necessary controls behind nonsemantic event surfaces.
