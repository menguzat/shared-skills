# Playbook - History, Back, and State Restoration

## Classify every compact state

### Type 1 - ephemeral UI
Examples: tooltip, transient toast.
Normally does not need history.

### Type 2 - dismissible contextual view
Examples: full-screen menu, filter sheet, item action sheet.
If users perceive it as a new view, Back SHOULD dismiss it before leaving the page.

### Type 3 - meaningful subview
Examples: detail panel, selected tab with shareable meaning, search result scope.
Prefer URL/router representation when deep-linking or refresh matters.

### Type 4 - workflow step
Examples: checkout step, onboarding step, editor stage.
Back semantics must be explicitly defined; do not let browser Back silently abandon the whole workflow if the user reasonably expects the previous step.

## State ownership priority

Prefer a single source of truth:
1. URL/query/path for shareable/recoverable state
2. router history state for navigation-specific transient context
3. application store for cross-route domain state
4. local component state for truly local ephemeral UI

Avoid storing the same filter/tab/open-state independently in multiple layers without synchronization.

## List restoration

When returning from a detail page:
- preserve query/filter/sort
- preserve pagination/cursor where feasible
- restore scroll position where feasible and expected

If exact restoration is technically impossible due to live-changing data, explain the limitation rather than faking certainty.

## Overlay Back implementation concept

For an overlay that should participate in Back:
- opening creates history/router state
- closing via UI consumes/replaces that state appropriately
- `popstate`/router navigation closes the overlay
- do not create infinite reopen/close loops
- deep loading the base URL does not fabricate a phantom history entry

See `examples/code/history-aware-sheet.tsx`.
