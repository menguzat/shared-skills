# Mobile Pattern Reference

## Bottom navigation

Use when:
- 3-5 stable peer destinations dominate recurring use
- users switch laterally between them
- labels/icons can remain clear

Avoid when:
- hierarchy is the primary model
- destinations are numerous or volatile
- a persistent bottom CTA is more important and vertical space is constrained
- the website is primarily a short linear marketing journey

## Hamburger / menu button

Use as:
- a container for secondary destinations
- entry to a deep hierarchical navigation system
- overflow when visible primary navigation cannot hold the long tail

Do not treat it as proof of mobile optimization.

## Sequential/drill-down navigation

Useful for:
- large catalogs
- settings trees
- documentation sections
- hierarchical information architecture

Requirements:
- clear parent/back context
- current scope visible
- direct "view all"/landing option where the parent itself is meaningful

## Bottom sheet

Good candidates:
- sort options
- short selectors
- contextual item actions
- sharing controls
- compact filters

Prefer full page for:
- long forms
- content requiring a shareable URL
- workflows with multiple nested steps
- complex editors

## Sticky primary action

Use if one action dominates the current screen, such as:
- Add to cart
- Continue
- Save
- Send

Audit cumulative persistent chrome. Avoid turning the visible viewport into a narrow strip between fixed headers and fixed footers.

## Applied-state summary

When filters/settings move into a hidden compact view, the parent screen should expose enough state to answer:
- Is anything active?
- What is active?
- Can I remove/change it quickly?

Pattern examples:
- chips
- compact summary row
- count badge plus clear-all

## Search

Make search prominent when:
- information space is large
- users can name what they want
- hierarchy is deep or unfamiliar
- repeated lookup is a primary task

Search results must preserve query/filter/sort context when moving to detail and back.

## Modals and full-screen compact dialogs

A desktop modal does not imply a mobile modal.

Choose by task:
- tiny confirmation -> modal/dialog
- contextual short choices -> sheet/popover
- multi-step/long content -> route/full-screen surface

## Tabs

Use for a small set of peer subviews with frequent switching.

If labels do not fit:
- allow a clearly scrollable tab strip
- shorten labels only if meaning remains clear
- reconsider whether the items are actually peers

Do not compress labels into ambiguous icons merely to preserve the desktop tab count.
