# Publication contract

Use a project-local `publication.json` to make rendering and release assumptions
machine-readable. Extend it for the publication; do not edit the skill to add
domain-specific content.

```json
{
  "title": "Publication title",
  "format": {
    "widthMm": 210,
    "heightMm": 297,
    "bleedMm": 0
  },
  "pageSelector": ".page",
  "expectedPages": 32,
  "rasterDpi": 150,
  "requiredFonts": [
    { "family": "Manrope", "weights": [400, 700] },
    { "family": "Newsreader", "weights": [400, 600] }
  ],
  "requiredGlyphSets": {
    "tr-Latn": "ÇĞİÖŞÜçğıöşü"
  },
  "aiUsage": {
    "enabled": true,
    "ledger": "usage/ai-calls.jsonl",
    "requirePriced": false
  },
  "links": {
    "required": [
      { "href": "https://example.com/", "text": "example.com", "count": 1 }
    ],
    "forbiddenTargets": ["https://wrong.example/"],
    "probe": ["https://example.com/"]
  },
  "content": {
    "requiredIds": ["cover", "chapter-01"],
    "requiredSourcePlacements": [
      { "id": "opening-copy", "page": 1, "minVisibleCharacters": 120 },
      { "id": "method-copy", "page": 2, "minVisibleCharacters": 120 }
    ],
    "requireUniqueIds": true
  },
  "assets": [
    {
      "id": "cover-figure",
      "selector": "[data-asset-id=\"cover-figure\"]",
      "src": "/assets/cover.png",
      "count": 1,
      "minEffectiveDpi": 180
    }
  ],
  "typeRoles": [
    {
      "name": "body",
      "selector": ".prose",
      "minFontSizePx": 11,
      "minLineHeight": 1.35,
      "maxMeasureCh": 75
    }
  ],
  "semanticRules": [
    { "kind": "max-lines", "selector": "h1", "value": 3 },
    { "kind": "no-overlap", "a": ".heading", "b": ".figure" },
    { "kind": "no-text-art-overlap", "selector": "[data-copy]", "b": "[data-visual-role='editorial']" },
    { "kind": "min-footer-gap", "selector": ".last-copy-block", "b": ".folio", "value": 18 },
    { "kind": "min-bottom-clearance", "selector": ".folio", "value": 24 },
    { "kind": "min-contrast", "selector": ".prose-on-solid", "value": 4.5 }
  ],
  "nonOverlapPairs": [
    [".figure-copy", ".figure-art"]
  ],
  "qa": {
    "dimensionToleranceCssPx": 0.5,
    "geometryDeltaPx": 2,
    "structuralSsim": 0.98,
    "requireSafeArea": true,
    "checkSafeDescendants": true,
    "requireImageAlt": true
  },
  "pdf": {
    "mediaBoxTolerancePt": 0.5,
    "requireTagged": true,
    "requireSubsetFonts": true,
    "nativeCrosscheck": true
  },
  "release": {
    "mode": "distribution",
    "requireManualReview": true,
    "reviewSpreads": ["2-3", "4-5"]
  },
  "releaseFilename": "publication-v1.pdf"
}
```

Validate this file against
[`publication-contract.schema.json`](publication-contract.schema.json). The
schema catches shape errors; the renderer enforces browser-visible contracts
and the PDF preflight enforces the resulting file.

## Content contract

Keep the canonical editorial source unchanged. Normalize it into structured data
only to support deterministic page composition. Give every content unit a stable
ID and map it to:

- its source heading or source range;
- its page/template assignment;
- its exact image or figure;
- any approved shortening, repetition, or relocation.

For each module that must survive composition, add a
`content.requiredSourcePlacements` record and render exactly one visible
`data-source-id` node on the stated page. Set `minVisibleCharacters` to a real
floor for that module, not `1` by habit. This catches a common false pass: all
pages render and have the right dimensions, but source copy is empty, hidden,
or assigned to the wrong template.

For repeated exercises, products, people, figures, or other domain entities,
store an explicit asset mapping in `publication.json` or a companion manifest.
Validate uniqueness, expected count, exact basename, file existence, and actual
rendered use. Do not encode a particular book's count or filenames in the skill.

## Link contract

Treat visible label, HTML target, resulting PDF annotation, and optional live
destination health as four separate facts:

- `links.required` gates exact normalized HTML targets and visible labels.
- PDF preflight independently gates the exact link-target multiset in the PDF.
- `forbiddenTargets` catches known truncations or redirects accidentally baked
  into the source.
- `links.probe` is opt-in network evidence. It never replaces exact HTML/PDF
  annotation checks and is not part of deterministic offline self-tests.

For visible domain labels, normally require `text` to match the complete domain.
This prevents a visually correct `doulabodrum.com` label from silently linking
to a truncated target.

## Executable design constraints

For deterministic fixed-page work, add `designSystem` with a base unit, finite
spacing scale, grid, page budgets and headline policies. See
[`deterministic-layout.md`](deterministic-layout.md). The renderer turns every
declared `designSystem.headlines` entry into a `heading-balance` rule, so the
headline family is checked without repeating the rule in `semanticRules`.

Declare objective floors as `typeRoles` and `semanticRules`. Use these to catch
tiny body copy, excessive measure, broken heading wraps, collisions, copy over
meaning-bearing art, insufficient footer/bottom clearance, measurable
solid-surface contrast, and accidental repeated text. These are safety rails,
not an automatic design score. Hierarchy, whitespace quality, photographic
overlay contrast, crop choice, pacing, and page rhythm still require page-by-page
human or independent-agent review.

`no-text-art-overlap` treats copy/art overlap as a failure unless the copy node
has `data-allow-text-over-art="true"` **and** it matches a
`textOnArtExceptions` entry for that page. Each exception must declare the copy,
art and safe-zone selectors, a reason and final-review evidence. The renderer
rejects the attribute on its own. `min-footer-gap`
checks copy above footer/running furniture on each page, while
`min-bottom-clearance` checks a running item against trim. `min-contrast` only
certifies text whose ancestor chain has a solid opaque CSS background; it fails
as unmeasurable for transparent or image-backed text so a raster review cannot
be skipped.

Use `nonOverlapPairs` for important selector pairs whose boxes must never
collide. Unlike a visual reminder in art-direction notes, this fails browser QA
if either selector is missing or any matching boxes overlap.

For repeated modules, `min-gap` pairs every visible selector match within the
same page in reading order. It fails on a missing or unequal count instead of
silently checking the first page only. Use a component-specific selector when
two unrelated modules would otherwise share the same class.

## Locale and glyph contract

`requiredGlyphSets` declares characters the edition must render reliably. The
renderer checks every declared family and weight, not just the body face. A
successful font load is insufficient because fallback can hide a missing glyph.
Keep the set small and language-driven; see
[typography-and-glyphs.md](typography-and-glyphs.md).

## AI-usage contract

Set `aiUsage.enabled` for every new publication. Resolve a relative `ledger`
path from the directory containing `publication.json`. Promotion requires at
least one valid event and includes a ledger snapshot and summary in the release.

Keep `requirePriced` false when the provider does not expose reliable cost
evidence. Set it true only when every event has an evidenced USD cost; promotion
then rejects any unpriced event. See [ai-usage.md](ai-usage.md).

## Surgical revision contract

For a revision that may alter only named pages, add:

```json
{
  "revisionScope": {
    "allowedPages": [5, 6],
    "unchangedPagesMustMatch": true,
    "baselineRun": "../runs/accepted-01"
  }
}
```

`baselineRun` may be absolute or relative to `publication.json`; the CLI
`--baseline-run` value overrides it. Full QA compares SHA-256 checksums of every
untouched `print-pages/page-N.png`. Any missing or changed raster blocks
promotion. The baseline must be a different named run with a passing
`release-decision.json`; the current output directory cannot certify itself.

## Visual-credit contract

Keep production-method disclosures out of figure captions when captions should
describe only what the reader sees. Put the disclosure once in a declared
back-matter or sources block:

```json
{
  "visualCredits": {
    "inCaptions": "forbidden",
    "backMatter": "required",
    "captionSelector": "figcaption, .caption",
    "backMatterSelector": ".visual-production-note",
    "disclosureTextIncludes": "Visual production note"
  }
}
```

Localize the disclosure phrase to the edition. The renderer checks placement,
not legal sufficiency; see [generated-visuals.md](generated-visuals.md).

## Art-direction contract

Record:

- concept and emotional register;
- audience and reading environment;
- trim, bleed, binding, and output medium;
- type families, roles, weights, sizes, leading, and measure;
- grid, margins, safe areas, baseline/spacing scale;
- palette and contrast rules;
- image crop/focal-point policy;
- template family and intentional variations;
- reference qualities to match and visual traits not to imitate.

References establish maturity, density, and craft. They do not authorize copying
their compositions or decorative vocabulary.
