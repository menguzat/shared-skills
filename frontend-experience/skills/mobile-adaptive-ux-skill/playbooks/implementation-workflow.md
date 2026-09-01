# Implementation Workflow

## 1. Stabilize shell primitives

Create or identify shared primitives for:
- compact header
- primary navigation
- page container
- safe-area aware bottom region
- sheet/dialog
- overflow menu
- responsive content section

Do not rewrite every page independently if a shared shell solves the same problem.

## 2. Implement architecture before polish

Order:
1. route/nav behavior
2. state/history
3. primary layout
4. touch accessibility
5. forms/keyboard
6. media/content adaptation
7. animation/polish

## 3. Prefer shared semantics

The same destination/action should have one semantic definition even if presentation differs by layout.

Example: one navigation data model rendered as bottom nav in compact mode and rail/sidebar at larger widths.

## 4. Avoid CSS-only hiding of inaccessible duplicate controls

If two render variants are necessary, ensure the inactive one is truly removed from interaction/accessibility flow or conditionally rendered appropriately.

## 5. Keep desktop stable

After each shell-level change:
- run desktop smoke test
- verify large-layout navigation
- verify keyboard/focus behavior

## 6. Test incrementally

After each P0 route:
- 320/390/430 width snapshots
- primary journey
- Back
- keyboard if applicable
- no horizontal page overflow

Do not wait until every route is converted before verifying the architecture.
