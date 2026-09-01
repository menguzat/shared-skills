# Research Synthesis - Mobile Web UX, 2026

Checked: 2026-08-14

This document summarizes the evidence used by the skill. It is not a replacement for the linked primary sources.

## 1. Adaptive is broader than responsive

**PLATFORM** Material Design 3 now frames layout in terms of adaptive design and breakpoints: a breakpoint is where layout changes to match available space, conventions, and ergonomics. Its navigation guidance explicitly changes navigation components across compact and larger contexts.

Skill consequence: do not assume one navigation component must survive all widths.

Sources:
- https://m3.material.io/foundations/layout/layout-overview
- https://m3.material.io/foundations/layout/breakpoints
- https://m3.material.io/components/navigation-bar/guidelines
- https://m3.material.io/components/navigation-rail/guidelines
- https://m3.material.io/components/navigation-drawer/guidelines

## 2. Persistent navigation is appropriate only when topology fits

**PLATFORM** Material 3 positions bottom navigation bars as compact-window navigation for approximately three to five primary destinations; navigation rails support more destinations on mid-sized layouts.

**RESEARCH** Nielsen Norman Group's 2025 review says hamburger menus are more familiar than they were a decade ago, while maintaining the usability principle that hiding navigation reduces discoverability relative to exposing important choices.

Skill consequence: a hamburger is an overflow/hierarchy mechanism, not the default mobile architecture. Stable peer destinations can justify persistent navigation; deep hierarchical sites often need drill-down navigation instead.

Sources:
- https://m3.material.io/components/navigation-bar/guidelines
- https://m3.material.io/components/navigation-rail/guidelines
- https://www.nngroup.com/articles/hamburger-menu-icon-recognizability/
- https://www.nngroup.com/articles/menu-design/

## 3. Mobile often converts spatial hierarchy into navigational hierarchy

**RESEARCH** Progressive disclosure research supports deferring secondary/advanced options until needed. Bottom sheets are described as contextual overlays suited to temporary information/actions rather than always-needed tools.

Skill consequence: desktop sidebars, inspectors, and secondary panels often become explicit compact states rather than a tall stack of every desktop region.

Sources:
- https://www.nngroup.com/articles/progressive-disclosure/
- https://www.nngroup.com/articles/bottom-sheet/

## 4. Browser Back behavior is UX behavior

**PLATFORM** The browser History API exposes session history manipulation and scroll restoration.

**RESEARCH** Baymard usability testing documents common mobile failures when users expect Back to close overlays, step back through filter state, or return from detail without losing context.

Skill consequence: model user-perceived views in history; do not keep every overlay/filter/subview exclusively in ephemeral local state.

Sources:
- https://developer.mozilla.org/en-US/docs/Web/API/History_API
- https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
- https://developer.mozilla.org/en-US/docs/Web/API/History
- https://baymard.com/blog/back-button-expectations
- https://baymard.com/learn/ecommerce-filter-ui

## 5. Input capability is not screen width

**PLATFORM** CSS supports `hover`, `any-hover`, `pointer`, and `any-pointer` media features.

Skill consequence: remove critical hover-only behavior. Use actual capability queries for enhancements instead of assuming all narrow screens are touch-only or all wide screens have a mouse.

Sources:
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/hover
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/any-hover
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/pointer
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/any-pointer

## 6. Touch target requirements have a standards floor

**STANDARD** WCAG 2.2 Success Criterion 2.5.8 defines a minimum pointer-target size of 24x24 CSS px with specified exceptions. WCAG 2.5.5 Enhanced uses 44x44 CSS px with exceptions.

Skill consequence: treat 24px as a compliance floor, not a target design size; aim around 44-48px for common primary controls where feasible.

Sources:
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced

## 7. Gestures must not trap users

**STANDARD** WCAG includes Pointer Gestures and Dragging Movements criteria. Path-based/multipoint interactions and dragging require alternatives in the circumstances defined by the criteria.

Skill consequence: swipe and drag can be accelerators, but critical interactions need accessible simple-pointer alternatives unless exempt.

Sources:
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html

## 8. Modern mobile viewport height is dynamic

**PLATFORM** CSS defines small, large, and dynamic viewport units (`svh`, `lvh`, `dvh` and related units). MDN documents safe-area environment variables and visual/layout viewport differences. The viewport meta element also has modern virtual-keyboard interaction behavior.

Skill consequence: avoid blindly using `100vh` for full-screen compact surfaces; verify keyboard, browser chrome, and safe areas.

Sources:
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/CSSOM_view/Viewport_concepts
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport

## 9. Container queries improve component-level adaptation

**PLATFORM** Container queries allow descendants to adapt to their containing element instead of only to the viewport.

Skill consequence: reusable cards, toolbars, result rows, and panels should often adapt to their own available width. Use viewport breakpoints for shell/architecture changes and container queries for component-local behavior.

Sources:
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40container
- https://web.dev/articles/baseline-in-action-container-queries

## 10. Search becomes structurally important in large information spaces

**RESEARCH** Baymard's 2026 search benchmark reports that users split between search-oriented and navigation-oriented product finding, while many mobile search experiences remain mediocre.

Skill consequence: on large sites, do not make search a tiny utility hidden inside navigation. Evaluate it as a first-class route/task.

Sources:
- https://baymard.com/blog/ecommerce-search-query-types

## 11. Product-list/filter patterns demonstrate general mobile state principles

**RESEARCH** Baymard's current mobile/product-list research repeatedly emphasizes applied-filter visibility, state persistence, and efficient refinement.

Skill consequence beyond ecommerce: whenever a compact experience temporarily hides control state behind another view, surface the active state back in the parent context.

Sources:
- https://baymard.com/blog/mobile-ux-ecommerce
- https://baymard.com/blog/current-state-product-list-and-filtering
- https://baymard.com/blog/how-to-design-applied-filters

## 12. Current mobile UX quality is not a safe source of truth

**RESEARCH** Baymard's 2025-2026 benchmark summaries report a large share of leading mobile ecommerce implementations as mediocre or worse in major areas.

Skill consequence: do not justify a pattern only because many large sites use it. Prefer standards, direct platform behavior, and observed usability evidence.

Sources:
- https://baymard.com/blog/mobile-ux-ecommerce
- https://baymard.com/blog/mobile-app-ux-trends
- https://baymard.com/blog/current-state-product-list-and-filtering
- https://baymard.com/blog/current-state-ecommerce-product-page-ux

## 13. Performance is interaction quality

**PLATFORM** Current Core Web Vitals guidance uses LCP, INP, and CLS, with good thresholds of <=2.5s, <=200ms, and <=0.1 respectively, evaluated at the 75th percentile in field data.

Skill consequence: compact navigation, drawers, animation, and conditional rendering must not create substantial JavaScript/main-thread regressions.

Sources:
- https://web.dev/articles/vitals
- https://web.dev/articles/inp
- https://web.dev/articles/top-cwv

## 14. Automated mobile emulation is necessary but incomplete

**PLATFORM** Playwright supports mobile device emulation including viewport, screen size, user agent, and touch. Lighthouse audits performance/accessibility and related quality concerns.

Skill consequence: automate repeatable compact journeys, but do not confuse emulation with complete real-device validation.

Sources:
- https://playwright.dev/docs/emulation
- https://playwright.dev/docs/codegen
- https://developer.chrome.com/docs/lighthouse/overview

## 15. Motion preference belongs in responsive behavior

**STANDARD/PLATFORM** CSS `prefers-reduced-motion` exposes the user's preference to reduce nonessential motion.

Skill consequence: mobile transitions MAY add spatial continuity, but must degrade safely when reduced motion is requested.

Source:
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
