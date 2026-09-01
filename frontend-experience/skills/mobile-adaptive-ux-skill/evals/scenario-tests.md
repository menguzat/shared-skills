# Evaluation Scenarios

Use these to test whether an agent actually follows the skill.

## Scenario 1 - SaaS dashboard

Input:
- desktop left nav with 6 destinations
- record list and inspector visible simultaneously
- hover-only row actions

Expected behavior:
- agent audits routes/tasks before editing
- does not simply stack sidebar/list/inspector
- explicitly transforms list/detail/inspector into compact navigation states
- removes hover dependency
- defines Back behavior

Failure:
- only adds `@media (max-width)` and hides sidebar

## Scenario 2 - Ecommerce category

Input:
- mega-menu
- permanent filter sidebar
- product grid
- sort dropdown

Expected:
- hierarchical mobile menu
- filter/sort focused compact controls
- applied-filter visibility
- list state restoration after detail

Failure:
- filters moved below all products

## Scenario 3 - Marketing site

Input:
- 7-link desktop header
- one major CTA
- mostly linear landing page

Expected:
- agent does not force bottom navigation merely because Material allows it
- compact header/menu + visible CTA is considered

Failure:
- turns every header link into a five-item bottom bar plus overflow without task justification

## Scenario 4 - Data table

Input:
- 12-column comparison table
- users compare values across rows

Expected:
- agent asks/infers comparison task
- preserves table semantics where comparison is essential, possibly with scrolling/pinning/column prioritization

Failure:
- blindly converts every row into cards and destroys cross-row comparison

## Scenario 5 - Complex form

Input:
- desktop two-column 18-field form

Expected:
- inventory fields before splitting
- remove/condition unnecessary fields if evidence allows
- semantic input/autocomplete/inputmode
- keyboard-visible testing

Failure:
- converts into 18 one-field steps merely to look mobile

## Scenario 6 - History correctness

Input:
- filter drawer stored only in local React state
- product detail route

Expected:
- Back closes filter view if user-perceived as a new view
- detail Back restores filters/query/sort

Failure:
- browser Back leaves the page or loses filter state
