---
name: publication-designer
description: >-
  Design, build, audit, and release distribution-ready fixed-page publications
  from Markdown or other editorial sources. Use for books, handbooks, reports,
  magazines, workbooks, and print PDFs when typography, spacing, page rhythm,
  image–text relationships, content integrity, browser/PDF parity, screenshots,
  professional visual QA, and release evidence matter.
---

# Publication Designer

Produce a publication as an authored editorial system, not as a Markdown export.
Treat the canonical source, structured content, HTML pages, rendered PDF, and
release evidence as separate artifacts with explicit contracts.

## Start with evidence

1. Read the complete source and inventory every supplied image, font, reference
   PDF, and existing output.
2. If a reference publication exists, inspect its PDF raster page by page. Use
   it to establish a quality bar, not as a template to imitate.
3. Determine audience, language, reading context, trim size, bleed, binding,
   target page count, accessibility needs, and whether the deliverable is
   fixed-page or reflowable.
4. Ask only for decisions that cannot be recovered from the supplied material.
   Make and record safe assumptions so work can continue.

For any multi-page, distribution-ready PDF, use the fixed-page workflow below.
For a simple reflowing ebook, adapt the contracts without forcing artificial
page composition.

**Note on Automated PDF Generation:** If generating PDFs automatically, leverage the `puppeteer-pdf` skill for headless HTML-to-PDF rendering, or the `pandoc-typesetting` skill for Markdown-to-PDF automated typesetting.

## Establish project-local contracts

Before styling, create:

- `publication.json`: format, page count, fonts, assets, QA thresholds, release
  filename, exact link contract, executable type/spacing constraints, PDF
  preflight policy, AI-usage ledger, source-to-page/text-presence mappings, and
  any domain-specific content mappings.
- `asset-manifest.json` (Generative Save State): A persistent ledger required for any project using generated visuals/assets. It must map every asset path to the exact prompt, seed, model parameters, reference images, and generation tool used. This ensures future editability without losing production context.
- Structured content such as `content.js` or JSON: explicit page/template
  assignments and stable content IDs. Keep the original source canonical.
- `docs/art-direction.md`: audience, concept, typography, grid, spacing system,
  palette, image treatment, and deliberate non-goals.
- `docs/content-map.md`: source-to-page mapping, image assignment, omissions,
  repetitions, and approved editorial exceptions.

Read [references/publication-contract.md](references/publication-contract.md)
when defining these files. Content and asset mappings belong in the publication
project, never hard-coded into this skill.

## Track AI calls

Enable `aiUsage` when AI is used in the publication workflow or the project
requires usage accounting. After each visible AI operation,
append one event with `record-ai-call.mjs`:

- record the main skill-active user turn as `agent-turn`/`observable`;
- record a completed delegated task as `subagent-task`/`aggregate`;
- record every image generation or edit attempt, including rejected and failed
  attempts, as an `exact` call;
- record a vision call separately only when it is a distinct provider call, not
  when visual input is already part of the recorded agent turn.

Copy token counts, request IDs, and cost only from provider evidence. Leave
unavailable values `null`; never estimate or enter missing values as zero. Do not
record prompts, source copy, credentials, or personal data. Read
[references/ai-usage.md](references/ai-usage.md) before beginning tracked work.

## Design the page system

1. Define a small family of page templates: cover, opener, single feature,
   sequence/flow, long-form prose, utility, and back matter as needed.
2. Render each physical page as an explicit `.page` component with fixed trim
   dimensions. Do not depend on accidental browser pagination for an authored
   handbook or book.
3. Use local, licensed fonts and deterministic assets. Wait for font loading and
   image decoding before capture or PDF generation. Declare the edition's
   required locale glyphs and verify them in every font/weight that can render
   visible text; a loaded font can still be missing `ğ`, `İ`, or another needed
   character.
4. Specify:
   - grid and safe areas;
   - spacing scale and vertical rhythm;
   - display/body/caption measures and line heights;
   - hierarchy, heading-wrap policy, and minimum eyebrow/kicker-to-title gaps;
   - image aspect ratios, focal points, crops, and caption behavior;
   - running elements, folios, links, and print color behavior.
5. Preserve meaning and source order unless an editorial change is approved.
   Rendering success does not approve altered copy, claims, or generated images.

Avoid template sameness. A mature publication needs recurring rules plus
meaningful variation; it does not need every section forced into cards, equal
columns, centered titles, or the same hero composition.

Before layout, classify every visual as `editorial`, `background`, `diagram`, or
`data`. A background is atmospheric and may never be the only meaning-bearing
visual on a content page. The default text mode is `separate`: body copy does
not sit on raster artwork. A text-on-art exception requires a declared,
deterministic safe zone, an explicit copy selector, and contrast approval in the
final PDF raster.

Use project-local `data-visual-role`, `data-text-mode`, `data-copy`, and
`data-visual-safe-zone` attributes so the intent remains inspectable. Give every
dense or template-exception page:

- an ordered spacing sequence based on the edition's spacing scale;
- explicit text and editorial-visual layout areas;
- mandatory no-overlap pairs;
- a layout budget for type, images, and deliberate whitespace.

Do not use absolute positioning and padding-bottom reserves as the primary
layout system for article figures. Place meaning-bearing editorial images and
information graphics in normal grid/flow. Reserve absolute positioning for
atmospheric backgrounds, running furniture, and explicitly declared overlays.

## Deterministic editorial layout

For a new fixed-page edition, create a `designSystem` contract before composing
pages. Declare a base unit, finite spacing scale, grid, type scale, page
budgets, and headline rules. Do not substitute one-off CSS values for a missing
system. Use the tokens in CSS and declare the selectors that are release-gated.

Read [references/deterministic-layout.md](references/deterministic-layout.md)
before defining the project contract. At minimum, gate body measure and leading,
headline line count and silhouette, required gaps, no-overlap pairs, and
text-on-art exceptions. A page may break a grid intentionally only when its
`approved-exception` records the visual reason and its reading surface remains
safe.

## Art direction decision

Before generating layouts, pages, or CSS, infer the most suitable Art Direction
mode from the brief, audience, references, and established art direction. Record
the inference in the project art-direction file and tell the user. Ask before
waiting only when the unresolved choice would materially change the visual
language, audience, or production method.

All modes share a non-negotiable reading baseline:

- Body copy, captions, sources, accessibility text, safety/legal copy, and
  essential labels must obey the declared minimum type sizes, line height,
  measure, contrast, safe areas, and no-overlap rules.
- Experimental treatments may affect headings, display type, pull quotes,
  folios, dividers, decorative lettering, and other supplementary typographic
  elements. They must not make the main reading text harder to understand.
- A design movement changes the visual language; it does not waive content
  integrity, accessibility, print geometry, or release QA.

### Mode A: classic / institutional
Use this mode when the primary goal is legibility, academic trust, and clear hierarchy.
- Use a deliberate type scale, baseline and whitespace system.
- Use proximity, contrast and reading order as tools; do not force a ratio or
  scanning pattern that does not fit the content.
- Enforce the reading baseline and declared contrast targets.

### Mode B: experimental editorial
Use this mode to surprise the audience with editorial, high-fashion aesthetics.
- Break the grid, scale display type, or introduce controlled overlap only with
  a declared exception and a preserved reading surface.
- Experiment may affect display and atmosphere; body readability is never
  secondary.

### Mode C: named movement
Use a named movement only when the brief, reference material, or user specifies
one. Treat these as optional lenses, not presets:
- **Swiss Style:** Asymmetric grids, strict Helvetica/Inter, extreme whitespace, monochrome with a single vibrant accent.
- **Neo-Brutalism:** Harsh black borders, offset hard shadows, garish RGB colors, oversized clashing fonts.
- **David Carson / Grunge:** Chaotic tracking, tightly stacked line-heights, text bleeding off the page edge.

Do not require confirmation merely to proceed; record the inferred mode and
invite correction. Require a choice only when competing modes would produce
materially different work.

## Görüntü Yönetmeni (Cinematography & Image Prompting)

When generating visuals (using tools like `generate_image` or `mengu-image-gen`), act as an Art Director and Cinematographer. 
- **Her karenin teknik detayını belirle:** Do not write generic prompts. Explicitly specify the lighting (e.g., "warm studio lighting", "dramatic chiaroscuro", "golden hour"), color grading (e.g., "muted tones", "Kodak Portra 400"), lens choice / focal length (e.g., "50mm lens", "macro photography", "wide angle"), and camera style.
- **Gerçekçilik Şartı:** Unless the brief specifically asks for a 3D render, diagram, or illustration, all generated images MUST be photorealistic ("gerçek fotoğraf"). Avoid overly polished 3D or "AI-looking" digital art styles.

## Metin Yazarlığı ve Editoryal Çerçeve (Copywriting Decision Tree)

When the brief explicitly requires generating new copy or substantially rewriting
source material, infer and record an Editorial Mode. Ask the user only when the
choice would materially change the promise, evidence standard, or voice.

### Mod 1: İkna ve Dönüşüm (Conversion & Sales)
Use this mode for marketing materials, landing pages, and calls to action (CTAs).
- **Framework:** Use PAS (Problem-Agitation-Solution) or The Conversion Spine (Hook → Problem → Agitation → Value Frame → Proof → CTA).
- **Kurallar:** Avoid long paragraphs. Focus on Features vs Benefits (FAB). Use urgent, punchy CTAs.
- **Ethical Persuasion:** Avoid cheap manipulation. Build trust by being transparent and even acknowledging product limitations. Ensure CTA microcopy reduces friction.

### Mod 2: Eğitici ve Otorite İnşası (Educational & Authority)
Use this mode for whitepapers, academic reports, and deep-dive articles.
- **Framework:** Data-driven logic. State the thesis, present verifiable evidence, and draw neutral conclusions.
- **Kurallar:** "Specificity over Fluff." Never use hype adjectives (revolutionary, best, super). Use specific numbers, case studies, and citations. 

### Mod 3: Empati ve Topluluk (Community & Storytelling)
Use this mode for newsletters, about pages, and community-building content.
- **Framework:** Narrative arc. Hook with a relatable human experience, share the struggle, and connect to shared values.
- **Kurallar:** Warm, conversational tone. Avoid corporate jargon. Focus on long-term relationship building rather than immediate conversion.

**Anti-Slop Kuralı:** Regardless of the mode, strictly forbid AI cliches (delve, unlock, tapestry, seamless, revolutionary). Leverage the `stop-slop` skill's philosophy to filter out artificial-sounding prose.

**Execution:** State the inferred mode in the editorial outline and invite a
correction. Do not pause a well-specified production task for a ceremonial mode
confirmation.

## Build canonical HTML

- Serve the edition over localhost; do not validate ES modules or relative
  assets through `file://`.
- Make screen and print views use the same page DOM. Keep print-only differences
  deliberate and small.
- Declare page size with both `.page` dimensions and `@page`.
- Use semantic HTML and tagged PDF output where Chromium supports it.
- Add explicit `data-safe` wrappers or project QA selectors for printable
  content. Full-bleed decoration should be excluded from safe-area checks.
- Keep the renderer project-local when the publication needs custom behavior.
  Do not force the legacy Markdown-injection renderer onto a fixed-page design.
- Keep exact labels, arrows, scales, and data marks in deterministic HTML/SVG
  overlays. Use generated raster artwork for editorial atmosphere or mature
  scientific illustration only when that medium fits the job.
- **WARNING for PDF Rendering:** Avoid using `z-index: -1` on absolute positioned elements (like background images) inside a container that has a `background-color` (such as the main `.page` wrapper). Headless browsers (like Puppeteer) will render the `z-index: -1` element *behind* the parent's background color, making it invisible. Always rely on natural DOM order stacking for backgrounds instead.

The bundled scripts are a generic reference implementation, not an art-direction
engine:

```sh
node <skill>/scripts/full-qa.mjs \
  --input /absolute/path/to/index.html \
  --config /absolute/path/to/publication.json \
  --out /absolute/path/to/runs/review-01

node <skill>/scripts/preflight-pdf.mjs \
  --run /absolute/path/to/runs/review-01 \
  --config /absolute/path/to/publication.json
```

For rendering carousel images directly from HTML:
```sh
node <skill>/scripts/render_goksen_carousel.mjs \
  --input /absolute/path/to/index.html \
  --config /absolute/path/to/publication.json \
  --out /absolute/path/to/runs/carousel-01
```

Run `npm ci` in `<skill>/scripts/` first. Use project-local QA when additional
content or domain contracts are required. Run `npm test` there after modifying
the skill itself; its black-box fixtures exercise public CLIs and failure paths.

Do not call a publication release-ready merely because browser geometry, PDF
preflight, and parity pass. Add `content.requiredSourcePlacements` for all
planned source modules, and encode page-specific no-overlap, footer-clearance,
bottom-clearance, and solid-surface contrast rules where applicable. Then
perform the PDF-raster review described in
[references/design-review.md](references/design-review.md): missing, faint,
over-art, crowded, or merely fitting text is a blocker.

## Validate in independent layers

Never accept a PDF merely because Chromium produced a file.

1. **Browser preflight**
   - expected page count and trim dimensions;
   - loaded fonts at required weights;
   - decoded images and valid assets;
   - no JS errors, failed requests, overflow, or safe-area violations.
   - exact visible-link labels and targets, stable content IDs, asset mappings,
     declared type roles, semantic collisions, heading wraps, and minimum gaps.
   - automated checks enforce only declared, measurable constraints. They report
     violations; they do not infer that a page is balanced, readable, or
     editorially appropriate.
2. **Canonical print capture**
   - capture every page under print media at a fixed DPI;
   - keep screen captures separately when screen CSS differs.
3. **PDF render**
   - Use the project’s declared renderer. `full-qa.mjs` is the supported
     renderer for the bundled HTML/CSS workflow. Use `puppeteer-pdf` only when
     the project needs a different HTML/PDF renderer, and `pandoc-typesetting`
     for Markdown-first typesetting.
   - enable backgrounds, CSS page size, tagging, and zero implicit margins;
   - verify PDF page count, MediaBox, embedded fonts, and link annotations.
   - compare the exact normalized PDF annotation multiset with the HTML contract;
     do not infer target correctness from visible link text.
4. **Independent PDF raster**
   - rasterize the PDF with PDFKit, Poppler, MuPDF, or another engine independent
     of the browser screenshot path.
5. **Parity**
   - compare like-numbered print and PDF pages;
   - gate on page count and geometry;
   - retain raw pixel metrics for diagnosis;
   - use a normalized structural metric to avoid mistaking antialiasing or color
     management differences for layout drift.
   - if metrics pass but the difference sheet shows a coherent edge, text, crop,
     or color shift, record a visual-parity finding and inspect it at 100%.
6. **Visual design review**
   - inspect HTML, PDF, and difference contact sheets;
   - inspect critical and dense pages at 100%;
   - inspect every cover and section opener for hierarchy breathing room:
     eyebrow, display title and deck must read as distinct tiers rather than a
     compressed typographic lump;
   - review every page for hierarchy, spacing, rhythm, measure, contrast, crop,
     repetition, awkward whitespace, and image–text relationships.
     **CRITICAL:** Evaluate the page against its recorded Art Direction mode and
     the non-negotiable reading baseline. Creative display treatments cannot
     excuse body-text, contrast, safe-area, or overlap failures.
   - make this a release gate. Give every page or spread a `pass`, `revise`, or
     `approved exception` disposition tied to reviewer, date, run, and PDF
     checksum. Do not promote unresolved `revise` findings.

### Gemini Fast visual critique (when configured)

For a second, image-native opinion, run the optional Gemini Fast visual review
after deterministic QA and before closing manual review. It sends the PDF
contact sheet plus every independent PDF raster together with the project art
direction and spatial invariants, then writes run-bound JSON evidence:

```sh
node <skill>/scripts/gemini-visual-review.mjs \
  --run /absolute/path/to/runs/review-01 \
  --config /absolute/path/to/publication.json \
  --brief /absolute/path/to/docs/art-direction.md
```

The script loads `GEMINI_API_KEY` and `GEMINI_MODEL_FAST` from the
**repository-root** `.env` (i.e. `<skill>/../.env`); `GEMINI_FAST_MODEL` and `GEMINI_MODEL` are
accepted compatibility fallbacks. Copy `<skill>/../.env.example` to `<skill>/../.env` and
keep the real `.env` ignored. Never place credentials, prompts, or API URLs
with keys in project evidence or the AI-usage ledger.

Treat Gemini as an independent visual critic, not an automatic release signer:
resolve every `revise` or `blocked` finding, then have a responsible reviewer
close `manual-review.json` against the exact final PDF checksum. Record the
Gemini request separately as a `vision-call` with provider/model evidence.

Optional live DNS/HTTP checks are a fourth link layer after source text, HTML
target, and PDF annotation. Run them explicitly with `probe-links.mjs` or
`full-qa.mjs --probe-links`; network health is not deterministic release
evidence and never substitutes for annotation inspection.

Read [references/qa-and-release.md](references/qa-and-release.md) for the release
gates and [references/design-review.md](references/design-review.md) for the
page-by-page design rubric. Read
[references/typography-and-glyphs.md](references/typography-and-glyphs.md) when
the edition contains localized text, and
[references/generated-visuals.md](references/generated-visuals.md) when using
generated or composited artwork. For production work, also read
[references/preflight-editorial-review.md](references/preflight-editorial-review.md)
and [references/rebuild-capsule.md](references/rebuild-capsule.md).

## Iterate surgically

Diagnose each problem from evidence: a named page, selector, bounding box,
content mapping, or visual-review finding. Change the smallest responsible
rule, then rerun the relevant checks. After changes that affect fonts, page
geometry, pagination, shared templates, or assets, rerun full QA and inspect the
new contact sheets.

When the brief says only named pages may change, declare `revisionScope` in the
publication contract and compare every other print raster with the accepted
baseline run. Exact untouched-page equality is a release condition, not a
memory-based visual judgment.

Do not confuse “no overflow” with readability. A narrow prose column, tiny type,
weak contrast, repeated copy, or a poor crop can pass geometric checks and still
block release.

Use independent subagents when available for:

- content/source reconciliation;
- art-direction and page-system critique;
- technical HTML/PDF QA;
- a final page-by-page design review without being shown the intended fixes.

## Release

Keep named QA runs immutable. Promote only a verified run to `release/`. Include:

- final PDF with a stable distribution filename;
- HTML, PDF, and difference contact sheets;
- machine-readable diagnostics and parity reports;
- checksum, page count, embedded-font/link status, and the verified run name.

Use `promote-release.mjs` to verify current evidence, bind manual review to the
exact run/checksum, refuse accidental overwrite, and write `provenance.json`.
When `release.rebuildCapsule.required` is true, promotion also creates and
verifies the configured self-contained rebuild capsule before replacing release.
When `aiUsage` is enabled, promotion also snapshots `ai-calls.jsonl`, writes
`ai-usage-summary.json`, and binds the summary to provenance.
Distribution mode cannot disable manual design review. Only deterministic
self-test fixtures may use `release.mode: "test"`.

Automated parity proves that PDF geometry reflects canonical HTML. It does not
prove design quality, editorial correctness, accessibility, medical/legal
accuracy, or printer color compliance; those require explicit review.

After successfully running `promote-release.mjs` and moving the necessary provenance and evidence files into the `release/` directory, you **MUST** ask the user if they want to clean up the workspace to save disk space and reduce clutter. Bu temizlik sorusunu hem "run" klasörleri hem de kod/script dosyaları için sorun. Temizlik adımında şunları silmeyi teklif edin:
1. `runs/` dizini ve içindeki her şey.
2. Süreç sırasında proje klasöründe oluşturulan geçici kod dosyaları, test scriptleri, yerel `node_modules` klasörleri veya yedek konfigurasyonlar.

Eğer kullanıcı onaylarsa, geriye sadece **`release/` dizinini,
`asset-manifest.json` (save state) dosyasını ve yayını gelecekte baştan
oluşturabilmek için gereken en minimal kaynak dosyaları (orijinal Markdown,
`content.js`, `styles.css`, `publication.json`, fontlar ve görseller vb.)**
bırakacak şekilde temizliği yapın. Asla `release/` dizinini, üretimsel kayıt
durumu olan `asset-manifest.json`'u veya bu minimal kaynak dosyalarını silmeyin.
