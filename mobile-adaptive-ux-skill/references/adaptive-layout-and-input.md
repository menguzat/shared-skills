# Adaptive Layout and Input Reference

## Shell changes vs component changes

Use viewport/breakpoint logic for changes to the global product shell:
- top navigation -> bottom navigation
- sidebar -> modal drawer
- two-pane workspace -> single-pane navigation sequence
- persistent inspector -> dedicated compact subview

Use container queries for local component changes:
- card horizontal -> vertical
- action row -> overflow
- metadata grid -> stacked metadata
- result row density
- media/object arrangement

This reduces coupling between a component and a particular page width.

## Breakpoint rule

A breakpoint exists because something becomes hard to use or understand, not because a named device exists.

Document the pressure that triggers each architectural breakpoint:
- navigation labels no longer fit
- a secondary pane crowds the primary task
- a table loses essential comparability
- touch controls become too dense
- content line length becomes poor

## Capability rule

Never use width as a proxy for hover or pointer precision.

Example:

```css
/* Base: works without hover. */
.card-actions { opacity: 1; }

/* Enhancement only when primary pointer can hover. */
@media (hover: hover) and (pointer: fine) {
  .card-actions { opacity: 0; }
  .card:hover .card-actions,
  .card:focus-within .card-actions { opacity: 1; }
}
```

The base experience remains operable with touch and keyboard.

## Dynamic viewport

For a full-height compact shell:

```css
.mobile-shell {
  min-block-size: 100svh;
  min-block-size: 100dvh;
}
```

Use `svh` where stable minimum visible space is desirable. Use `dvh` when the surface should track dynamic browser UI. Verify behavior; do not mechanically replace every `vh`.

## Safe-area padding

```css
.bottom-actions {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
}
```

Edge-pinned navigation/actions need safe-area checks on notched/rounded devices.

## Horizontal scrolling

Horizontal scroll is acceptable only when the content is intrinsically horizontal or comparison benefits from retaining the axis, e.g.:
- time-based chart
- tab strip
- chip/filter row
- data table where column relationships are essential

Requirements:
- visible cue that more content exists
- keyboard-accessible scrolling/controls where necessary
- no page-level accidental horizontal scroll
- do not use horizontal scrolling to avoid redesigning an ordinary card/list layout

## Dense data

Do not automatically convert every table into cards. Ask what users compare.

Choose among:
1. preserve table with horizontal viewport if cross-row/column comparison is primary
2. pin critical columns
3. reduce nonessential columns with explicit detail access
4. convert row to card only when scanning individual records is more important than comparing columns

This choice is HEURISTIC and should be validated against the task model.
