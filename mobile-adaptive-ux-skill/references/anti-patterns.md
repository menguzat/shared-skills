# Anti-Patterns

## 1. Stack-and-pray
Desktop columns become one long vertical page with no task redesign.

Signal:
- sidebar appears before content
- detail/inspector appears hundreds of pixels below selected item

Fix:
- convert spatial regions into deliberate compact states.

## 2. Hamburger absolution
Every desktop navigation item disappears behind one menu button.

Signal:
- high-frequency destinations lose direct visibility
- search becomes nested inside the menu

Fix:
- select navigation from task topology.

## 3. Hide-the-hard-parts
Desktop-only complex functionality gets `display:none` on small screens without product authorization.

Fix:
- transform or explicitly document an approved capability difference.

## 4. Hover evaporation
Controls/actions only appear on desktop hover and silently disappear on touch.

Fix:
- visible/direct control or explicit contextual menu.

## 5. CSS masking
`overflow-x:hidden` hides a broken fixed-width child.

Fix:
- remove the width constraint or intentionally contain/scroll the intrinsically wide component.

## 6. Modal nesting
Desktop modal inside modal becomes sheet inside sheet on mobile.

Fix:
- promote longer nested tasks to routes/full-screen surfaces.

## 7. Bottom-bar pileup
Bottom nav + sticky CTA + cookie banner + chat launcher all compete for the same area.

Fix:
- prioritize one persistent system and collapse/defer the others.

## 8. Duplicate application
Complete desktop and mobile trees render simultaneously and CSS hides one.

Fix:
- share semantics/data and adapt presentation; conditionally mount heavy variants when necessary.

## 9. Breakpoint soup
Numerous device-specific widths fix screenshots one by one.

Fix:
- architecture breakpoints based on content pressure; container queries for local components.

## 10. Back-button betrayal
Opening a filter/menu or entering a subview does not correspond to user expectations when pressing browser Back.

Fix:
- model perceived navigation states using router/history.
