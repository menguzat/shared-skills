# Web-sourced imagery

An alternative to [generated-visuals.md](generated-visuals.md) for slots
classified `editorial` or `background` where a real photograph serves the
content better than generated artwork, or the brief supplies ready copy and
only needs matching imagery. Diagram and data visuals still follow the
deterministic HTML/SVG path, never this one.

## 0. Search the pool first

Before touching the web, check whether a fitting image already exists:

```sh
node <repo-root>/image-pool/scripts/search-pool.mjs "<slot subject, mood, keywords>"
```

A pool hit still needs a fit check against this slot's actual requirement
(subject, composition, aspect ratio, safe zone) — a keyword match is not an
approval. If nothing fits, proceed to sourcing.

## 1. Turn the slot into a query

Each image slot in the content map already carries a content ID, visual
role, and intended crop/focal point. Derive 2-3 concrete search queries from
that (subject + setting + style, e.g. "hemp fiber macro close-up daylight"),
not the abstract page topic.

## 2. Find and download candidates

Three complementary search paths. Try (A) first, add (B) whenever the slot is
historical or scientific/technical, and fall back to (C) whenever text
search doesn't surface a candidate that's genuinely on-subject (not just a
page that mentions the right words) — a text search over-indexes on pages
that *talk about* the topic, not pages that *show* it well.

**(A) Text search + page fetch** — no dedicated image-search API is wired
into this environment, so this path is two tool calls per candidate:

1. `WebSearch` for the query, unrestricted to any single domain — this finds
   candidate *pages* (stock sites, Wikimedia Commons, press/editorial pages,
   institutional sites), not raw images.
2. `WebFetch` each promising result page with a prompt asking specifically
   for: the direct image URL, the photographer/author name, the exact
   license or usage terms stated on the page, and **whether the page labels
   the image AI-generated**. Discard a page if the direct URL, author, or
   license can't be pinned down.

**(B) Archival and open-access scientific sources** — for a historical or
scientific-illustration slot specifically, stock photography (free or paid)
often can't cover it at all, but a primary source can:

- **Historical events/apparatus**: search the actual paper or record the
  slot is illustrating (author names, year, publication) on the Internet
  Archive. A pre-1928 or US-federal-government-authored work is public
  domain outright; render the relevant PDF page (e.g. with PyMuPDF at
  ~250dpi) and crop the plate — this can be a genuine upgrade over a
  generated "interpretive reconstruction," since it's the real thing,
  correctly captioned as archival, not a stand-in for it.
- **Molecular/microscopy slots**: search for a CC-BY-licensed figure from an
  open-access journal (PLOS, Frontiers, MDPI, etc.) via WebSearch, and
  confirm the license on the article page itself, not just the word "open
  access" (open access is not the same grant as CC-BY — a paper can be free
  to read and still not licensed for reuse; check the actual terms). A real
  figure crop from a paper can be more honest than a generated illustration,
  but only for what it actually shows — don't caption a generic real
  micrograph as if it depicted a more specific mechanism than it does; that
  substitutes one kind of misrepresentation for another.

**(C) Visual search via the browser** — use the `claude-in-chrome` tools
(`navigate` + `computer` screenshot/click) to drive a real image-search
engine and *look at* results before committing to one, which a text search
can't do:

1. Navigate to `https://duckduckgo.com/?ia=images&iax=images&q=<query>`
   (or Google Images). Screenshot the grid.
2. DuckDuckGo exposes a real "Licenses" filter (`Free to Modify, Share, and
   Use Commercially`, etc.) — but applying it typically collapses relevance
   hard (topical results vanish, replaced by unrelated CC-tagged content).
   Treat the filter as a fast first pass only; when it guts relevance, drop
   it and vet license per-candidate on the source page instead (same as
   path A step 2).
3. Click a promising thumbnail to open the lightbox, read the source
   domain/title shown there, then open that source page (`WebFetch` or
   `navigate`) to confirm the direct URL, author, license, and AI-generation
   status before downloading anything.

All paths converge on the same next step:

3. `curl -o` (via Bash) the direct image URL into a scratch/run directory
   (e.g. `runs/image-candidates/<slot-id>/`) to get real bytes for
   inspection — neither WebFetch nor a screenshot gives you the actual file.

Pull 3-5 candidates per slot before judging any of them; picking the first
hit skips the comparison that catches a bad crop, wrong subject, or an
AI-generated fake.

## 3. Vet each candidate

Read each downloaded candidate directly and judge it against the slot's
actual requirement, the same rejection bar as generated artwork in
[generated-visuals.md](generated-visuals.md#quality-gate), plus one more
that is non-negotiable for this path specifically:

- **it must be a real capture, not AI-generated.** The entire point of
  sourcing from the web instead of generating is to get an authentic
  photograph (or microscopy/scan/etc.) — an AI-generated image found online
  is worthless here even though it wasn't generated *by this session*.
  Major stock platforms (Vecteezy, Dreamstime, Freepik, iStock and others)
  now mix large amounts of AI-generated content into ordinary search
  results, sometimes visually indistinguishable and sometimes explicitly
  labeled ("AI Generated: true") only on the item's own page — check that
  page, don't infer from the thumbnail. Positive evidence of a real capture:
  visible camera EXIF/metadata on the source page (make/model/lens), a
  photographer profile with a varied, consistent real-world portfolio (spot
  check it), natural imperfections inconsistent with generation (sensor
  noise, incidental clutter, asymmetric imperfect framing). A description
  like "AI Generated," "digital art," or "illustration" is an automatic
  reject regardless of how well it fits the brief visually — it will
  usually fit *better* than a real photo precisely because it was
  optimized to, which is the tell, not the endorsement.
- subject and setting genuinely match the copy next to it, not just the
  query terms;
- composition leaves room for the slot's intended crop and any text-safe
  zone;
- no watermark, stock-site logo, or embedded caption;
- resolution holds up at the slot's physical print/screen size;
- license/usage terms from step 2 actually permit this use (editorial vs.
  commercial, attribution requirement, no-derivatives restrictions, and not
  a Pro/paid-only asset unless the user has explicitly approved a purchase).

Record `pass` or `reject` per candidate with a one-line reason, same as any
other visual-selection gate — the AI-generation and license checks belong in
that reason whenever they're why a candidate was rejected. Zero passing
candidates means new queries, not lowering the bar.

## 4. Place and record

On a `pass`:

1. Place the image in the page per the slot's declared aspect ratio and safe
   zone.
2. Record the slot in a project-local `image-sources.json` (sibling to
   `asset-manifest.json`, same directory) — one entry per web-sourced slot:
   `contentId`, `path`, `slotRequirement`, `source` (`site`, `url`, `author`,
   `license`), `downloadedAt`, `vetting` (`pass`/`reject` notes for every
   candidate considered, not just the winner).
3. Add the visible-use citation in sources/credits/back matter per the
   edition's `visualCredits` policy. **The moment an edition mixes
   web-sourced images with generated ones, a single blanket "made with AI
   tools" line is no longer accurate and must not be used.** Enumerate every
   raster image actually rendered (number them in reading/page order — "Resim
   1", "Resim 2", ... or the edition's language equivalent), state which are
   AI-generated and which are real, and for each real one give
   photographer/author, source site, URL, and license. Build this list from
   the actual render order (see step 5 below), not from a content-map table
   that may have drifted from what the code renders.

`asset-manifest.json` stays scoped to AI-generated assets exactly as
[generated-visuals.md](generated-visuals.md) defines it; do not mix
web-sourced entries into it.

## 5. Wire the replacement into the actual render path

A publication's `publication.json` asset list is often QA/preflight
metadata only (DPI floors, selectors) — it does not necessarily drive what
the page actually renders. Before trusting a path change, find where the
live page builds each `<img src>` (grep the app/render script for the
asset id or for how it constructs image URLs) and confirm *that* code reads
the new file, not just the config. Verify by actually running the rendered
page, not by editing config and assuming:

- If the project's dev server is a plain `vite dev` / `npm run start` and
  its render code uses `new URL(name, import.meta.url)` to build asset
  paths, Vite's dev-time handling of that pattern can flatten nested asset
  subdirectories (e.g. `assets/web-sourced/foo.jpg` gets requested as
  `/assets/foo.jpg` and silently 404s into an SPA fallback, which an
  `onerror` handler then quietly removes from the DOM — no console error,
  just a blank box). Don't debug this by staring at the JS; confirm it by
  serving the project through the skill's own static server instead
  (`full-qa.mjs`/`render-publication.mjs`, or a plain `python3 -m
  http.server` from the project root for a quick check) — those serve files
  at their real relative path and sidestep the dev-server transform
  entirely.
- Screenshot the actual changed page after the fix, at the same crop the
  reader will see (browser automation tools, e.g. `claude-in-chrome`).
  "The file exists at the right path" is not the same claim as "the page
  shows it."

## 6. Add the winner to the shared pool

```sh
node <repo-root>/image-pool/scripts/add-to-pool.mjs \
  --file /path/to/accepted-candidate.jpg \
  --description "<what it depicts>" \
  --tags "<comma,separated,keywords>" \
  --category <slot category, e.g. textile, landscape, portrait> \
  --source-site "<site>" --source-url "<url>" \
  --author "<author>" --license "<license>" \
  --used-in "<publication-id>"
```

Only the accepted candidate goes into the pool — rejected candidates are not
pool material and should be deleted from the run's scratch directory once the
slot is resolved. See `image-pool/README.md` for the full schema and search
usage.
