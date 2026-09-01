# Deterministic layout test plan

This plan keeps deterministic-layout gates honest. It is written for the
existing Node self-test harness, whose public fixture lives at
`scripts/test/fixture/`. The aim is to prove both acceptance and rejection:
a gate that has no deliberate failing fixture is not yet a release gate.

## Test structure

Keep one compact, visually stable **base fixture** and derive test cases by
copying it to a temporary directory, exactly as `self-test.mjs` already does.
Avoid checking raster byte equality for these cases: browser layout engines and
font rasterisation can change harmless pixels. Assert the typed violation in
`diagnostics.json` instead.

Add three small HTML fixture variants only where a config mutation cannot
produce the geometry required by the case:

- `repeat-components.html`: two pages with an identical `.component` wrapper,
  each containing `.component-heading` and `.component-copy`.
- `text-on-art.html`: a page with one meaning-bearing `<img>` and two text
  blocks, one plain and one declared exception.
- `headline-lines.html`: predictable title widths and explicit line breaks
  used only to make line-count and line-width assertions stable.

The fixture must use the bundled Manrope file and fixed dimensions. Do not use
remote images, system fonts, animations, container-query branching, or random
content. Every test run should write to its own temporary output directory.

## Schema-contract tests

These tests call `full-qa.mjs` (or `loadConfig` when rendering is immaterial)
and expect a `config-schema` failure before rendering.

| Case | Mutation | Expected result |
|---|---|---|
| Missing design system in fixed-page distribution mode | remove `designSystem` | fail; design system is required unless `layoutMode: legacy` |
| Legacy opt-out remains explicit | set `layoutMode: legacy`, omit `designSystem` | pass schema; emit no deterministic-layout rules |
| Unknown layout mode | `layoutMode: loose` | fail |
| Invalid base unit | `baseUnitPx: 0` | fail |
| Invalid spacing scale | `[1, 1, 2]`, `[1, 0, 2]`, or unordered values | fail (or renderer contract failure if monotonicity is not expressible in JSON Schema) |
| Incomplete grid | omit `columns`, `minGutterPx`, or `baselinePx` from a fixed-page design system | fail |
| Invalid page budget | whitespace ratio outside `0..1`; focal count `0` | fail |
| Incomplete headline rule | `selector` only in a required headline family | fail when the final schema defines required balance fields |
| Impossible headline band | `minLines: 4`, `maxLines: 2` | fail |
| Invalid semantic rule payload | `{ kind: 'min-gap' }`, `{ kind: 'no-text-art-overlap', selector: '.copy' }` | fail via `oneOf` branches |
| Invalid exception payload | missing page, copy selector, art selector, safe-zone selector, rationale, or review evidence | fail |

If a cross-field invariant cannot be represented cleanly in draft-2020 JSON
Schema, add an explicit post-schema contract validation and test its typed
error. Do not silently allow it.

## Renderer acceptance/rejection matrix

Each rejection must assert `result.status !== 0`, `diagnostics.passed ===
false`, and the exact `audit.violations[].kind`. Each acceptance must assert
zero violations of the relevant kind.

### Heading balance

| Case | Fixture/config setup | Expected typed result |
|---|---|---|
| Balanced two-line title | two lines with final-line ratio above threshold | pass |
| Too few lines | title resolves to one line, `minLines: 2` | `heading-min-lines` |
| Too many lines | narrow title width, `maxLines: 2` | `heading-max-lines` |
| Stranded final line | last line below `minLastLineRatio` | `heading-last-line-ratio` |
| Uneven silhouette | shortest line makes widest/shortest exceed max | `heading-line-width-ratio` |
| Multiple headings | one balanced, one stranded | fail and report the bad page, not only the first node |
| Inline-markup heading | `<em>` / `<span>` inside a two-line title | deterministic line aggregation; no duplicate phantom lines |
| `line-height: normal` | apply to heading | explicit `heading-balance-unmeasurable` or a documented stable measurement policy; never accidental pass |

### Repeated, scoped `min-gap`

The current implementation uses `document.querySelector`, so this is the
regression that matters most.

| Case | Fixture/config setup | Expected typed result |
|---|---|---|
| Both component gaps valid | two `.component` instances, pair strategy `closest-container` | pass |
| First valid, second too tight | second copy moved upward only | `min-gap` on page 2 / instance 2 |
| First too tight, second valid | first copy moved upward only | `min-gap` on page 1 / instance 1 |
| Unequal component counts | extra heading without copy | selector/pairing violation, not an arbitrary cross-page comparison |
| Cross-page pairs | heading on page 1, copy on page 2 | ignored only when rule scope says `same-page`; otherwise clear contract failure |
| Named pairing | `data-layout-pair="alpha"` and `beta` are reordered in DOM | pairs still resolve by key, not DOM index |

The renderer result should include `page`, `pairKey` or `instance`, `actual`,
and `expectedMin`, so an author can fix the correct component.

### Text-on-art

| Case | Fixture/config setup | Expected typed result |
|---|---|---|
| Plain copy overlaps art | `.copy` intersects `.art` on same page | `no-text-art-overlap` |
| Plain copy is adjacent | bounding boxes do not intersect | pass |
| Different pages | same selectors occur on two pages but do not overlap per page | pass |
| Undeclared data escape | `data-allow-text-over-art="true"` with no contract exception | `text-on-art-exception-undeclared` |
| Declared exception, no safe zone | exception exists but no safe-zone selector resolves | `text-on-art-safe-zone-missing` |
| Declared exception, copy outside safe zone | copy overlaps art but escapes its safe zone | `text-on-art-safe-zone-violation` |
| Declared exception, non-opaque surface | a required opaque reading surface is transparent | `text-on-art-reading-surface-invalid` (or documented contrast gate) |
| Complete, approved exception | page, art/copy selectors, safe zone, rationale, approval evidence and sufficient contrast all resolve | pass |
| Exception scope leak | page 1 exception cannot exempt similarly named copy on page 2 | page 2 fails |

No `data-allow-text-over-art` attribute may by itself bypass a rule.

## Deterministic design-system enforcement

Where the implementation exposes measurable checks, prove the boundary
conditions. Keep the subjective portions in the manual review fixture rather
than inventing dubious pseudo-metrics.

| Area | Pass boundary | Fail boundary / evidence |
|---|---|---|
| Base spacing | declared gaps are exact multiples of `baseUnitPx` | off-scale declared/observed gap returns a typed layout-token violation, if CSS-value inspection is implemented |
| Grid gutter | calculated gutter equals/exceeds `minGutterPx` | narrower declared grid yields a grid violation |
| Safe area | all meaningful children remain inside | existing `safe-descendant-overflow` regression retained |
| Footer clearance | exact threshold passes | threshold plus epsilon fails (existing family of test; add exact-boundary check) |
| Purposeful whitespace and focal areas | documented in `preflight-editorial-review.json` | `revise` status blocks full QA/release; do not pretend pixel occupancy measures intentional whitespace |

## Editorial-preflight and release capsule tests

When those features land, add end-to-end tests to `self-test.mjs`:

1. A valid run with a run-bound `preflight-editorial-review.json`, every page
   and required spread `pass`, proceeds to full QA/release.
2. A `revise` page blocks the next gate and names the page.
3. Missing required page or spread coverage blocks it.
4. A review whose `configSha256` or PDF hash belongs to a different run blocks
   it.
5. Release promotion writes a rebuild capsule containing config, asset
   manifest, prompt files, art-direction/content map, source checksums and
   renderer/lockfile identity.
6. Delete the working run only in a temporary test after verifying the capsule
   checksum manifest can still be read and every retained file matches.

## Helper recommendations

- Add `assertFailure(name, result, report, kind)` and
  `assertPass(name, result, report, forbiddenKinds)` to keep `self-test.mjs`
  readable.
- Add a `renderFixture({ html, config, slug })` helper that writes isolated
  mutated copies and returns `{ result, diagnostics }`.
- Read violations by `{ kind, page, selector }`; do not rely on array order.
- Run the browser cases serially. Puppeteer plus a local font is stable enough
  here and parallel runs make failures harder to reproduce.
- Keep schema-only cases separate from raster/PDF pipeline tests so a failed
  schema does not leave misleading partial render evidence.

## Risks and mitigation

- **Font/layout drift:** browser or Manrope updates can alter exact wrapping.
  Use threshold margins and fixture-controlled widths; avoid a boundary that
  depends on less than two CSS pixels.
- **Range-client-rect fragmentation:** nested inline markup, ligatures and
  bidi text can produce multiple rects. Keep a dedicated inline-markup case;
  later add Arabic/Turkish/RTL fixtures if those languages are supported.
- **Geometry is not visual quality:** overlap and gap gates cannot assess crop
  quality, intentional asymmetry or editorial rhythm. Preserve the
  independent PDF-raster review and make its `revise` result release-blocking.
- **Selector ambiguity:** generic selectors create accidental cross-page
  comparisons. Require explicit rule scope and pair strategy for repeated
  components.
- **Escape hatches:** any HTML attribute that skips QA will be copied. Route
  all exceptions through the contract and require run-bound evidence.
