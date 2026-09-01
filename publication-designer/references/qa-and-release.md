# QA and release gates

## Required automated evidence

A named QA run should preserve:

- browser screen page rasters;
- schema-validated publication contract and its checksum;
- browser print-media page rasters;
- rendered PDF;
- independently rasterized PDF pages;
- page-by-page difference images;
- HTML, print, PDF, and difference contact sheets;
- browser/layout diagnostics;
- PDF structure, font, MediaBox, and annotation preflight;
- parity metrics.
- `revision-scope.json` whenever only declared pages may change.

Continue far enough after a failed browser gate to preserve diagnostic artifacts
when safe. Return a non-zero status at the end.

Every manual review report must name the exact run or PDF checksum it inspected
and carry a status such as `open`, `superseded`, or `closed after verification`.
Never treat findings from an older raster as the current release decision.

## Browser and layout gates

- Exact expected page count and trim dimensions.
- No horizontal or vertical page overflow.
- Required font families and weights loaded from deterministic sources.
- Every required locale glyph renders in every declared font/weight.
- Every image loaded and decoded at non-zero natural dimensions.
- No page exceptions, failed requests, or relevant console errors.
- Printable content remains inside declared safe areas.
- Project semantic checks pass: heading/content collisions, minimum readable
  type, prose measure, duplicated visible text, source-placement/content-text
  contracts, contrast, footer clearance, and domain asset mappings.
- Declared non-overlap pairs and visual-credit placement rules pass.

For source-driven publications, `content.requiredSourcePlacements` must map
every required source module to one rendered page and set a meaningful
`minVisibleCharacters` threshold. This is a semantic-rendering gate: a page
shell, empty placeholder, hidden source node, or wrong-page source fails even
when page count and PDF geometry pass.

Use semantic rules for the layout facts that matter in the edition:

- `no-text-art-overlap` for body/caption selectors and meaning-bearing art;
- `min-footer-gap` for the last copy block above running furniture;
- `min-bottom-clearance` for folios, footers, and other bottom-running items;
- `min-contrast` for text on a deterministic solid surface.

Do not use a contrast rule to certify text over photographic or generated art.
Keep reading copy separate by default; any intentional overlay needs a declared
safe zone and a manual PDF-raster contrast finding.

## PDF and parity gates

- PDF page count equals the canonical print capture.
- MediaBox matches the declared trim.
- Fonts are embedded/subset and required links remain annotations.
- Independent PDF raster dimensions differ by no more than the configured
  tolerance; `2 px` at `150 dpi` is a practical A4 default.
- Compare raw SSIM/MAE for diagnosis, but gate layout on normalized grayscale
  structural similarity. A `620 × 877` canonical raster, small Gaussian blur,
  and SSIM `>= 0.980` is a useful A4 default, not a universal law.
- Treat color-profile and subpixel antialiasing differences separately from
  geometry drift. Never loosen a geometry gate merely to make raw SSIM pass.

## Manual release gates

- Review all contact sheets and every page at readable scale.
- Inspect cover, contents, section openers, densest templates, longest prose,
  smallest type, image crops, tables/forms, links, and back matter at 100%.
- Resolve hierarchy, contrast, spacing, crop, repetition, readability, and
  content-integrity blockers.
- Treat the following as release blockers even if every automated stage passes:
  missing or near-invisible source copy; copy over art without an approved safe
  zone; footer/copy crowding; copy ending on or beyond the safe boundary; text
  that is technically present but too faint to read; and arbitrary spacing that
  does not follow the declared scale. Inspect these at final physical size in
  the independent PDF raster, not only in the browser capture.
- Obtain domain approval for medical, legal, financial, safety, accessibility,
  or printer-specific requirements.

Promote only from a named verified run. Record the final filename, run name,
page count, checksum, font/link status, QA summary, and any consciously accepted
exceptions.

When `aiUsage.enabled` is true, promotion also requires a non-empty valid
AI-call ledger and snapshots it as `ai-calls.jsonl` with
`ai-usage-summary.json`. These are accounting evidence, not design QA gates.
`aiUsage.requirePriced: true` blocks release while any event lacks evidenced
cost.

## Evidence commands

```sh
node <skill>/scripts/full-qa.mjs \
  --input /absolute/path/to/index.html \
  --config /absolute/path/to/publication.json \
  --out /absolute/path/to/runs/review-01

# For a contract with revisionScope:
node <skill>/scripts/full-qa.mjs \
  --input /absolute/path/to/index.html \
  --config /absolute/path/to/publication.json \
  --out /absolute/path/to/runs/revision-02 \
  --baseline-run /absolute/path/to/runs/accepted-01

# Optional and intentionally separate from deterministic QA:
node <skill>/scripts/probe-links.mjs \
  --config /absolute/path/to/publication.json \
  --run /absolute/path/to/runs/review-01

node <skill>/scripts/promote-release.mjs \
  --config /absolute/path/to/publication.json \
  --run /absolute/path/to/runs/review-01 \
  --release /absolute/path/to/release
```

`full-qa.mjs` writes `release-decision.json` and fails unless browser QA, PDF
preflight, and independent raster parity all have current passing evidence.
When `revisionScope.unchangedPagesMustMatch` is true, it also requires exact
SHA-256 equality for every untouched print raster and records the result in
`revision-scope.json`.
The config, browser, PDF, and parity reports must agree on the exact config and
PDF checksums; changing either artifact after QA invalidates promotion.
Promotion refuses stale or failing evidence and, by default, requires
`manual-review.json` with:

```json
{
  "status": "closed-after-verification",
  "run": "/absolute/path/to/runs/review-01",
  "reviewer": "Name",
  "reviewedAt": "2026-07-29T12:00:00Z",
  "pdfSha256": "exact SHA-256 of that run's output.pdf",
  "pages": [
    { "page": 1, "status": "pass" },
    {
      "page": 2,
      "status": "approved-exception",
      "note": "Documented and intentional exception",
      "approvedBy": "Art director",
      "acceptanceCondition": "Rationale and boundary of the accepted exception"
    }
  ],
  "spreads": [
    { "id": "2-3", "status": "pass" }
  ]
}
```

The `pages` array must cover every page exactly once. `revise`, missing, or
duplicate dispositions block promotion. Every spread declared by
`release.reviewSpreads` must also be covered exactly once. An
`approved-exception` requires a note, accountable approver, and acceptance
condition; an empty exception is not a bypass.

Distribution mode always requires manual review. Only a contract explicitly
marked `release.mode: "test"` may disable it, and provenance records that mode.
Do not distribute a test-mode promotion.

The optional link probe resolves every redirect hop, rejects private/local and
special-use addresses, and binds the connection to the validated address set.
It uses a single bounded deadline and reads headers only. Keep it opt-in: live
network health remains contextual evidence, not deterministic layout proof.

The promoted `provenance.json` records the exact run, checksum, page count,
fonts, links, gate status, and AI-usage summary. Existing release PDFs are not
replaced unless `--replace` is supplied deliberately.
