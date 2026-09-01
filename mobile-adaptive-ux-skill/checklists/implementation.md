# Implementation Checklist

## Architecture
- [ ] Route/task inventory completed.
- [ ] Mobile navigation chosen by task topology.
- [ ] Transformation Matrix completed for substantial pages.
- [ ] Compact state/history behavior defined.

## Layout
- [ ] No fixed desktop min-width blocks compact rendering.
- [ ] No accidental page-level horizontal scroll.
- [ ] Full-height compact surfaces use an appropriate modern viewport strategy.
- [ ] Edge-pinned controls consider safe-area insets.
- [ ] Component-local responsiveness uses container queries where useful.

## Input
- [ ] Critical actions do not require hover.
- [ ] Pointer/hover enhancements use capability queries where useful.
- [ ] Primary targets are comfortably tappable.
- [ ] Icon-only controls have accessible names.
- [ ] Drag/swipe has alternative control where required.

## Navigation/state
- [ ] Back closes user-perceived overlays correctly.
- [ ] Detail return preserves relevant list/search/filter context.
- [ ] Meaningful state has deliberate URL/router representation.
- [ ] Refresh behavior is deliberate.

## Forms
- [ ] Semantic input types.
- [ ] Appropriate autocomplete.
- [ ] Appropriate inputmode.
- [ ] Persistent labels.
- [ ] Keyboard-open layout tested.
- [ ] Values preserved on validation.

## Performance
- [ ] Mobile and desktop variants are not unnecessarily duplicated.
- [ ] Responsive media reviewed.
- [ ] Major mobile UI does not introduce heavy long tasks.
- [ ] Layout shift from sticky/nav UI reviewed.
