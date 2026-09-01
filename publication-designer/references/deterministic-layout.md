# Deterministic editorial layout

Use this reference for fixed-page publications that need reliable first-pass
composition. It is a guardrail system, not a style prescription.

## Contract

Add a project-local `designSystem` object to `publication.json`:

```json
{
  "designSystem": {
    "baseUnitPx": 4,
    "spacingScale": [1, 2, 3, 5, 8, 13],
    "grid": { "columns": 12, "minGutterPx": 16, "baselinePx": 4 },
    "pageBudgets": {
      "minPurposefulWhitespaceRatio": 0.18,
      "maxDominantFocalAreas": 2
    },
    "headlines": [
      {
        "selector": ".display-title",
        "minLines": 2,
        "maxLines": 4,
        "minLastLineRatio": 0.38,
        "maxLineWidthRatio": 2.2
      }
    ]
  }
}
```

Set values deliberately for the edition; do not copy them blindly. A modular
spacing scale can use Fibonacci-like steps (`1, 2, 3, 5, 8, 13`), but the base
unit and grid must follow the trim and intended typography.

## CSS discipline

- Define `--u` once and derive spacing from it: `calc(var(--u) * 5)`.
- Define column, gutter and safe-area tokens once. Use a template grid before
  page-specific overrides.
- Keep meaning-bearing art and copy in normal grid/flow. Use absolute position
  only for declared atmospheric backgrounds and running furniture.
- Keep body copy on an opaque surface. Treat image-backed copy as an explicit
  exception with a safe zone and final PDF-raster contrast review.
- Use no more than two dominant focal areas per page unless a spread explicitly
  requires a sequence.

### Hierarchy breathing room

An eyebrow, kicker or section marker is not a small first line of the display
heading. It is a separate navigational tier and must be given visible air before
the title begins. Declare the gap in the project contract and derive it from the
spacing scale.

- For an eyebrow directly above a display title, start at **5–8 base units**.
- When the eyebrow is 12 px or smaller and the title is 48 px or larger, use at
  least **5 base units** and review the final raster at reading scale. Large
  title size alone does not justify a wider gap; use a larger interval only when
  the page’s actual composition needs it.
- Evaluate the gap from the eyebrow’s visual bounds to the title’s first glyph,
  not merely from CSS margins. Letterspacing and line-height can make a nominal
  gap look much smaller.
- Treat the eyebrow–title pair as a `min-gap` release rule whenever both appear
  in a fixed template. The same test should be declared separately for a
  title–deck pair when present.

## Release-gated checks

Declare the following in `typeRoles`, `semanticRules`, or `nonOverlapPairs`:

1. `min-font-size`, leading and maximum measure for body, caption and utility
   roles.
2. `heading-balance` for every display-heading family. It rejects too many or
   too few lines, a stranded short final line, and a wildly uneven silhouette.
3. `min-gap` between eyebrow, heading, deck, caption, body and running
   furniture where their order is fixed; an eyebrow–display-title pair must
   meet the hierarchy breathing-room floor above.
4. `no-overlap` for named page-specific pairs and `no-text-art-overlap` for all
   meaning-bearing art/copy pairs.
5. `min-footer-gap`, `min-bottom-clearance` and deterministic solid-surface
   `min-contrast` for all reading text.

Do not encode subjective balance as a fake pixel metric. Use page budgets and
the independent PDF-raster review for hierarchy, deliberate whitespace, crop
quality and rhythm. A technical pass is not a visual pass.

## Headline silhouette

Use `heading-balance` as a release floor, not an automatic line-breaker:

- `minLines` / `maxLines`: intended line-count band.
- `minLastLineRatio`: width of final line divided by widest line. `0.38–0.50`
  is usually a useful lower bound; use a lower value only deliberately.
- `maxLineWidthRatio`: widest line divided by narrowest non-empty line. Start
  around `2.2`; loosen it for intentionally asymmetric display typography.

Control the actual break with editorial copy, max-width and font size. Never
insert arbitrary `<br>` tags merely to satisfy the metric.

## Review sequence

1. Check the grid and reading surfaces in the browser.
2. Fail deterministic rules before visual polish.
3. Inspect the PDF contact sheet for rhythm and page density.
4. Inspect dense and exceptional pages at readable scale.
5. Record approved exceptions with their boundary and acceptance condition.
