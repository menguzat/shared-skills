---
name: mobile-adaptive-ux
version: 1.0.0
description: Deterministic workflow for converting an existing desktop-first website or web application into a genuinely mobile-adaptive experience. Audits user tasks, information architecture, navigation, interaction state, accessibility, viewport behavior, performance, and code before redesigning and implementing mobile UX. Prevents the common anti-pattern of merely stacking desktop components or hiding them behind a hamburger menu.
---

# Mobile Adaptive UX Skill

Use this skill when asked to make an existing website or web application work well on mobile, especially when the current product was designed desktop-first.

The objective is **not** to make desktop UI fit a narrow viewport. The objective is to preserve product intent while redesigning the interaction architecture for compact, touch-first, interruption-prone use.

## Operating doctrine

Treat mobile as a different interaction context over the same product model.

Preserve when valid:
- brand identity
- content and data model
- business rules
- permissions
- URLs and deep-link semantics
- desktop behavior unless the user asks to change it

Allow to change on compact layouts:
- navigation mechanism
- page hierarchy
- information density
- disclosure order
- action placement
- toolbar composition
- list/detail relationships
- filter and sort UX
- modal vs sheet vs full-page presentation
- task sequencing
- visible labels and contextual cues
- touch interaction model

Do not equate "mobile" with a fixed pixel width. Use viewport size, container size, pointer accuracy, hover capability, orientation, safe areas, and actual content pressure as relevant inputs.

## Reliability vocabulary

Every recommendation in plans and reports MUST carry one of these evidence classes when the distinction matters:

- **STANDARD** - required or directly supported by a formal or platform standard, e.g. WCAG or browser semantics.
- **PLATFORM** - documented behavior or guidance from browser/framework/platform documentation.
- **RESEARCH** - supported by published usability research.
- **HEURISTIC** - design judgment inferred from the product and must be validated.

Use normative language consistently:
- **MUST** = acceptance gate or standards requirement.
- **SHOULD** = strong default; deviation needs a reason.
- **MAY** = optional enhancement.

## Non-negotiable principle

Never begin by adding breakpoints to the existing desktop layout.

First perform this sequence:

**repository reconnaissance -> task model -> information architecture -> navigation model -> state/history model -> transformation matrix -> implementation -> mobile test matrix -> regression verification**

If a repository is available, inspect it before asking questions that the code can answer.

---

# Phase 0 - Preflight

1. Identify framework, router, styling system, component library, state management, test setup, and build commands.
2. Identify the global shell: header, sidebar, footer, navigation, modals, drawers, portals, layout containers.
3. Identify existing breakpoints and mobile-specific branches.
4. Identify the highest-value routes and repeated interaction patterns.
5. Run `tools/mobile-ux-static-audit.mjs` if Node.js is available.
6. Record findings in `templates/MOBILE_UX_AUDIT.md` format.

Do not modify code yet unless the user explicitly requested a tiny isolated fix.

## Blocking vs non-blocking unknowns

Ask the user only when an unknown materially changes product intent and cannot be inferred from the repository or current UI, such as:
- which of several equally plausible workflows is commercially primary
- whether mobile may intentionally expose fewer capabilities
- whether a mobile-only navigation model is acceptable when it changes route prominence

Do not ask about implementation details that can be discovered from code.

---

# Phase 1 - Build the mobile task model

For every major route, create a row in a Route-Task Matrix:

| Route / view | User goal | Primary action | Secondary actions | Entry points | Exit paths | State to preserve | Desktop assumptions | Mobile risk |
|---|---|---|---|---|---|---|---|---|

Then rank tasks:
- **P0** - essential task; failure makes the mobile product unusable.
- **P1** - frequent/high-value task.
- **P2** - useful secondary task.
- **P3** - rare administrative/advanced task.

Rules:
- P0/P1 actions SHOULD be directly discoverable.
- Do not bury a P0 action solely because desktop currently locates it inside a sidebar or hover menu.
- Do not keep a desktop control visible solely because it exists.
- If a task ranking is inferred, label it HEURISTIC and include the basis.

Read `playbooks/route-task-analysis.md`.

---

# Phase 2 - Choose the compact navigation architecture

Use `playbooks/navigation-decision-tree.md`.

Do not default to a hamburger menu.

Evaluate:
1. number of stable peer destinations
2. lateral switching frequency
3. hierarchy depth
4. whether users know the destination name in advance
5. importance of search
6. whether the product is task-centric, content-centric, catalog-centric, or workspace-centric
7. whether a persistent primary action competes with persistent navigation

Strong defaults:
- 3-5 stable high-frequency peer destinations -> consider persistent bottom navigation on compact layouts.
- deep hierarchical site/catalog -> use a clear top-level menu plus drill-down or sequential subnavigation.
- large searchable corpus -> make search a first-class finding mechanism, not an afterthought.
- dense workspace -> convert spatial panes into navigable states, not a vertically stacked replica.
- marketing/editorial site with few major sections -> visible high-priority links plus menu for long-tail destinations may outperform an app-like bottom bar.

If primary destinations do not fit the chosen navigation without truncation or ambiguity, reconsider the architecture instead of shrinking labels.

For each navigation decision, write:
- selected pattern
- rejected alternatives
- evidence class
- route mapping
- back-button behavior
- deep-link behavior

---

# Phase 3 - Create the Transformation Matrix

Every desktop-only pattern MUST be explicitly transformed.

Use `templates/TRANSFORMATION_MATRIX.md`.

Classify each major component as one of:
- **KEEP** - same interaction model, fluid layout only.
- **REFLOW** - same semantics, new spatial arrangement.
- **COMPRESS** - same task, reduced chrome/content density.
- **DISCLOSE** - secondary information moves behind explicit progressive disclosure.
- **SUBSTITUTE** - different mobile component performs the same job.
- **SEQUENCE** - simultaneous desktop regions become a mobile navigation/state sequence.
- **REMOVE** - nonessential or duplicate mobile content.

Examples:
- mega-menu -> compact top-level entry + drill-down menu
- permanent filter sidebar -> filter action + focused filter view/sheet + applied-filter summary
- list + detail + inspector -> list -> detail -> contextual inspector
- hover toolbar -> explicit visible action or contextual overflow
- dense tabular dashboard -> prioritized cards + detail views, or horizontally meaningful table with explicit affordance if tabular comparison is essential
- desktop modal -> bottom sheet for short contextual tasks OR full page for long/complex workflows
- multi-column form -> single-column form or deliberate multi-step flow

A Transformation Matrix is required before implementation for any substantial redesign.

---

# Phase 4 - Model mobile interaction state and browser history

Browser history is part of the mobile interface.

For each of these, decide whether opening/changing it creates a user-perceived view:
- modal
- drawer
- bottom sheet
- full-screen menu
- filter panel
- sort panel
- tab/subview
- search state
- list-detail transition
- multi-step form

If users would reasonably expect Back to undo/close that state, the implementation SHOULD integrate with the router/history rather than trap the state only in local component memory.

MUST verify:
- Back closes an overlay before leaving the underlying page when the overlay is perceived as a view.
- Returning from detail restores list context where technically appropriate.
- filter/sort state survives detail -> Back.
- deep links to meaningful subviews work.
- reload behavior is defined for URL-addressable state.
- state is not duplicated inconsistently between URL, router, and component state.

Read `playbooks/history-state.md`.

---

# Phase 5 - Implement adaptive layout, not device-specific layout

## Breakpoints

Use breakpoints where content or interaction architecture needs to change. Do not target phone model names in production CSS.

Prefer:
- mobile/compact base styles
- `min-width` enhancements for larger contexts when practical
- container queries for reusable components whose behavior depends on their own available width
- capability queries for hover/pointer behavior

Avoid:
- dozens of arbitrary device widths
- JavaScript layout branching when CSS can express the same adaptation reliably
- hiding overflow to conceal broken layout

## Viewport

MUST:
- include a correct viewport meta tag
- preserve user zoom; never disable scaling
- avoid relying on legacy `100vh` for full-screen mobile surfaces when browser UI/keyboard behavior matters
- use dynamic/small viewport units where appropriate
- account for `env(safe-area-inset-*)` for edge-pinned controls on devices with cutouts/home indicators

## Hover and pointer

MUST NOT make critical functionality hover-only.

Use capability queries such as:
- `(hover: hover)`
- `(any-hover: hover)`
- `(pointer: coarse)`
- `(any-pointer: fine)`

A touch device can also have a mouse or trackpad. Do not infer input capability only from screen width.

## Touch targets

STANDARD floor:
- satisfy WCAG 2.2 target-size requirements.

Skill default:
- aim for approximately 44-48 CSS px effective primary tap targets when layout permits.
- use spacing to reduce accidental activation.
- icon-only controls MUST have accessible names.

## Gestures

Gestures MAY accelerate interaction but MUST NOT be the sole method for a nonessential path-based or multipoint operation when accessibility requires a simple pointer alternative.

Any swipe action with meaningful consequences SHOULD have a visible alternative.

## Bottom sheets

Use for short, contextual, transient tasks that benefit from retaining background context.

Do not use bottom sheets for:
- long forms
- nested workflows
- content that users need to deep-link/bookmark independently
- multiple stacked sheets
- primary navigation simply because the screen is small

## Sticky chrome

Count every persistent region:
- browser chrome
- site header
- bottom navigation
- sticky CTA
- cookie/consent layer
- chat widget
- install prompt

If persistent UI meaningfully crowds content, reduce or conditionally collapse it.

Read `references/adaptive-layout-and-input.md` and `references/mobile-patterns.md`.

---

# Phase 6 - Forms, keyboard, and data entry

MUST:
- use semantic input types where valid
- use `autocomplete` intentionally
- use `inputmode` where it improves the soft keyboard without changing data semantics
- keep labels available; do not rely on placeholder-only labeling
- keep focused fields and critical actions visible when the virtual keyboard is present
- provide errors adjacent to the relevant field and in an accessible form
- avoid preventable re-entry of already known data

SHOULD:
- reduce unnecessary fields before splitting a form into more screens
- use one column on compact layouts unless side-by-side inputs are genuinely easier to understand together
- preserve entered values during validation and navigation
- make destructive resets explicit

Read `references/forms-and-keyboard.md`.

---

# Phase 7 - Performance is part of mobile UX

Do not create an "app-like" mobile redesign by shipping disproportionate JavaScript.

MUST verify important routes against current Core Web Vitals targets and regressions where tooling is available.

Priorities:
- avoid unnecessary client-side work on initial load
- size responsive images appropriately
- reserve media dimensions to avoid layout shift
- lazy-load below-the-fold media when appropriate
- avoid long main-thread tasks caused by menus, filters, animation, or hydration
- avoid rendering hidden desktop and mobile versions of large subtrees simultaneously unless justified

Read `references/performance.md`.

---

# Phase 8 - Mobile test matrix

Implementation is incomplete until tested.

Minimum compact widths:
- 320 CSS px
- 360 CSS px
- 390 CSS px
- 430 CSS px

Also test:
- at least one medium/tablet width
- landscape on at least one small device profile
- zoom/text enlargement where applicable
- coarse pointer/touch
- keyboard-visible form state
- reduced motion
- long content and unusually long labels
- logged-out / logged-in states if both exist
- empty, loading, error, and dense-data states

For browser automation, prefer Playwright device emulation plus explicit viewport tests. Emulation does not replace at least some real-device/manual verification when the environment permits.

MUST test these journeys:
1. cold entry to each P0 task
2. primary navigation switching
3. menu open/close and Back behavior
4. filter/sort/search flows if present
5. list -> detail -> Back with state restoration
6. form focus with software keyboard
7. rotation/resize where applicable
8. deep link to important nested routes
9. refresh on meaningful state
10. no accidental horizontal page scrolling

Read `checklists/qa.md` and `examples/code/playwright-mobile.spec.ts`.

---

# Acceptance gates

Do not declare completion until all applicable gates pass.

## Gate A - Task architecture
- [ ] Every P0/P1 task is represented in the mobile architecture.
- [ ] No critical task depends on hover.
- [ ] The mobile IA is documented.
- [ ] Navigation choice is justified.

## Gate B - Interaction correctness
- [ ] Back behavior matches user-perceived views.
- [ ] list/filter/search state restoration is verified where relevant.
- [ ] overlays have deterministic dismissal behavior.
- [ ] keyboard does not make active controls unusable.

## Gate C - Accessibility
- [ ] no zoom disabling.
- [ ] target sizes/spacing meet the applicable WCAG requirement.
- [ ] keyboard/focus semantics remain valid.
- [ ] reduced-motion preference is respected for nonessential motion.
- [ ] icon-only actions have accessible names.
- [ ] gesture-only critical actions are avoided.

## Gate D - Layout robustness
- [ ] no unintended horizontal page scroll at test widths.
- [ ] long labels/content do not break navigation.
- [ ] safe-area padding works for edge-pinned UI.
- [ ] full-height surfaces handle dynamic viewport behavior.
- [ ] no clipped content at 320px unless a component intentionally scrolls.

## Gate E - Performance
- [ ] no obvious mobile-only bundle/render regression.
- [ ] important media is responsive.
- [ ] hidden duplicate DOM is not creating unjustified cost.
- [ ] Core Web Vitals diagnostics are reviewed when tooling exists.

## Gate F - Desktop regression
- [ ] desktop navigation still works.
- [ ] desktop layout has not silently inherited compact-only semantics.
- [ ] shared components remain usable across breakpoints.

---

# Required deliverables for a substantial project

Create/update these artifacts in the project or report them directly to the user:

1. `MOBILE_UX_AUDIT.md`
2. `MOBILE_UX_PLAN.md`
3. `TRANSFORMATION_MATRIX.md`
4. implementation changes
5. `MOBILE_QA_REPORT.md`

Use templates in `templates/`.

For small scopes, combine documents but do not skip the underlying reasoning.

---

# Stop conditions

Stop and report rather than silently inventing product behavior when:
- a mobile redesign would remove a business-critical capability and there is no evidence that removal is acceptable
- authorization/permissions differ by route and cannot be determined
- navigation labels or route intent are genuinely ambiguous
- test data required to exercise a P0 journey is unavailable

Otherwise, make the least-destructive evidence-backed choice and continue.

---

# Package map

- `references/` - research synthesis, standards, platform references, and pattern notes
- `playbooks/` - deterministic decision workflows
- `templates/` - audit, plan, transformation, and QA report templates
- `checklists/` - implementation and acceptance checklists
- `examples/` - original redesign case studies and code examples
- `evals/` - scenario tests and scoring rubric for evaluating agent output
- `tools/` - static source audit helper
- `fixtures/` - intentionally problematic sample used to verify the audit helper
- `manifest.txt` - package file list

Start with `references/research-synthesis.md`, then follow the phases above.
