# Editorial preflight review

`preflight-editorial-review.json` is the gate between editorial planning and
page composition. It answers a different question from browser/PDF QA:
**is there a deliberate, reviewable design decision to render?**

Write it before the first production render and keep it with the project
sources (for example `docs/preflight-editorial-review.json`). A new content,
art-direction, asset-selection, or template decision invalidates it and
requires a new review. This is not a substitute for the run-bound
`manual-review.json`, which reviews the final PDF raster.

## Required shape

```json
{
  "schemaVersion": 1,
  "status": "pass",
  "reviewer": "Art director",
  "reviewedAt": "2026-07-30T12:00:00Z",
  "config": "/absolute/path/to/publication.json",
  "configSha256": "exact config checksum",
  "edition": {
    "pageCount": 6,
    "language": "tr",
    "artDirection": "Warm material-led editorial retail publication"
  },
  "pages": [
    {
      "page": 1,
      "template": "cover",
      "status": "pass",
      "visualRole": "hero",
      "dominantFocalAreas": 1,
      "textMode": "separate",
      "checks": {
        "visualSelection": "pass",
        "layoutBalance": "pass",
        "contentReadability": "pass"
      },
      "notes": "Single image, title on an opaque surface."
    }
  ],
  "spreads": [
    { "id": "2-3", "status": "pass", "note": "Archive to present-day rhythm." }
  ],
  "findings": []
}
```

Every expected page must appear exactly once. A page with `textMode:
"overlay"` must name a safe zone and use an approved text-on-art exception in
the publication contract; otherwise it is a `revise`, not a creative choice.

## Status rules

- Root and page status: `pass`, `revise`, or `approved-exception`.
- Root status may be `pass` only when every page and required spread is `pass`
  or a fully accountable `approved-exception`, and no open finding remains.
- An approved exception must include `note`, `approvedBy`, and
  `acceptanceCondition`.
- A `revise` page must carry at least one finding with an owner and next action.
- `layoutBalance` is a structured decision: check the declared grid, spacing
  scale, whitespace budget, focal-area limit, headline silhouette, and reading
  order. Do not mark it pass merely because elements fit.

## Commands

Create a complete, deliberately failing review template from the contract:

```sh
node <skill>/scripts/create-editorial-preflight.mjs \
  --config /absolute/path/to/publication.json \
  --out /absolute/path/to/docs/preflight-editorial-review.json
```

After accountable review, validate it:

```sh
node <skill>/scripts/validate-editorial-preflight.mjs \
  --config /absolute/path/to/publication.json \
  --review /absolute/path/to/docs/preflight-editorial-review.json
```

These scripts are intentionally standalone during the migration: they do not
yet alter `full-qa.mjs` or `promote-release.mjs`. Once adopted, the main
workflow should require a passing preflight before composition begins and
snapshot it inside the rebuild capsule at release.
