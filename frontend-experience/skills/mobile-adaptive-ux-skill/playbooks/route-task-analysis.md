# Playbook - Route and Task Analysis

## Step 1 - Discover routes

Inspect:
- router configuration
- navigation definitions
- sitemap if present
- page/layout directories
- redirects and aliases
- authenticated vs public branches

## Step 2 - Identify tasks from observable evidence

Use:
- page titles/headings
- primary CTA prominence
- form submission actions
- navigation ordering
- business copy
- existing analytics only if supplied/accessible

Do not invent analytics.

## Step 3 - Score task criticality

Suggested deterministic score:

`task score = business criticality (0-3) + frequency evidence (0-3) + navigation prominence (0-2) + dependency weight (0-2)`

Map:
- 8-10 -> P0
- 5-7 -> P1
- 2-4 -> P2
- 0-1 -> P3

If business criticality/frequency are inferred rather than known, mark HEURISTIC and show the evidence.

## Step 4 - Record mobile friction

For each route identify:
- hover dependencies
- wide tables
- multi-column density
- sidebars
- fixed pixel width
- nested dialogs
- tiny controls
- persistent desktop chrome
- scroll traps
- complex forms
- drag-only interactions
- state that disappears on reload/back

## Step 5 - Define compact entry and completion

For every P0/P1 task answer:
- fastest likely entry point
- minimum number of conceptual transitions
- primary action placement
- success state
- return path

Do not optimize exclusively for tap count. Clarity and error avoidance can justify an additional explicit step.
