# Page-by-page design review

Review the PDF raster, not only the live HTML. Start with a contact sheet to see
rhythm and repetition, then inspect every page at readable scale.

## QA-before-QA layout gate

Before full technical QA, record two preliminary dispositions:

- `visual-selection: pass|revise` for every generated asset, based on its target
  crop, subject legibility, editorial job, maturity, and relationship to copy;
- `layout-balance: pass|revise` for every dense page, based on separation of
  copy and art, grouping, ordered spacing, and the absence of arbitrary dead
  space.

Do not begin full QA while either preliminary disposition remains `revise`.

Also record `content-readability: pass|revise` for every page. Verify that each
planned source module is visibly rendered on its mapped page, body/caption text
has sufficient contrast at final size, copy does not collide with meaning-
bearing art, and the final copy block clears the footer and bottom safe area by
the declared spacing token. A technically valid page with missing, faint, or
crowded text is `revise`.

## Publication rhythm

- Does the cover establish a clear promise and distinct visual world?
- Do openers, dense pages, quiet pages, and back matter create a deliberate pace?
- Are repeated templates consistent without becoming mechanical?
- Are large empty areas intentional and compositionally balanced?
- Do facing-page or consecutive-page transitions feel coherent?
- Review intended reading sequences and spreads, not only isolated pages. Flag
  accidental same-template runs, repeated visual weight, unmotivated
  alternation, blank-feeling pages, and turns where a continuation loses setup.

## Typography

- Are display lines broken for meaning and silhouette rather than convenience?
- Does each eyebrow/kicker read as a distinct navigation tier, with enough
  visible distance before the display title begins? Reject a lockup where the
  two levels visually fuse, even if their bounding boxes do not overlap.
- Are widows, orphans, stranded headings, and near-collisions resolved?
- Is body measure comfortable, with appropriate size and leading?
- Are captions, folios, kickers, labels, and utility text visibly subordinate
  without becoming faint or tiny?
- Are Turkish or other localized characters, punctuation, hyphenation, and
  emphasis rendered correctly?
- Check locale sentinels in the browser raster and an independent PDF raster;
  font loading alone can conceal fallback or a missing glyph.
- Inspect body, captions, legal/safety copy, folios, and links at final physical
  size or a calibrated 100% raster. Record whether size, leading, weight, and
  contrast remain comfortable for the intended reader; correct rendering and
  absence of clipping do not establish readability.

## Spacing and geometry

- Do top positions and vertical intervals follow a recognizable rhythm?
- Is the relationship between heading, intro, image, caption, and body copy
  consistent with their semantic relationship?
- Are gutters large enough to separate units and small enough to preserve
  grouping?
- Do rules, edges, baselines, and image frames align intentionally?
- Does any element merely fit, rather than sit comfortably?
- Does every footer, folio, and final text block have deliberate breathing room
  from both each other and the trim? Reject a page where the last line merely
  avoids clipping.

## Image–text relationship

- Does each image depict the adjacent content and correct sequence?
- Is the crop intentional at print size, with faces, hands, joints, products, or
  other important anatomy/content preserved?
- Does the image carry hierarchy, or is it generic decoration?
- Are repeated images editorially justified?
- Are contrast and text overlays reliable in the PDF, not just the browser?
- If an illustration was generated or composited, does it look publication-ready
  at final size rather than like a raw prompt result or an unfinished schematic?
- Are exact labels, arrows, scales, legends, and warnings crisp, correct, and
  deterministic instead of baked unreliably into raster artwork?
- Verify the intended subject or action against the content map, not visual
  plausibility alone. Record asset/content IDs for instructional images. Reject
  crops that obscure the body part, direction, starting position, or safety cue
  required to understand the instruction.

## Content and usability

- Is copy missing, duplicated, clipped, or assigned to the wrong image?
- Are instructions readable at 100% and scannable in their intended order?
- Are links, page numbers, navigation, legal/safety copy, and contact details
  accurate and functional?
- Are disclaimers and domain review requirements visually present without
  implying that layout QA validated their substance?

Record findings with page number, severity, evidence, responsible selector or
content ID, and a concrete acceptance condition. Recheck the fixed page and the
contact sheet after every shared-template change.

## Optional Gemini Fast second opinion

When the skill-local Gemini credentials are configured, run
`scripts/gemini-visual-review.mjs` after deterministic QA. Give it the
run-bound PDF contact sheet, every PDF page raster, the publication contract,
and `docs/art-direction.md`; do not send only a contact sheet or only raw
source copy. The output must name its model, run, config checksum, PDF checksum
and every reviewed page/spread.

This is evidence for a human/agent reviewer, not a substitute for manual
release review. A Gemini `revise` or `blocked` result blocks release until it is
resolved and a new run is reviewed. A Gemini `pass` does not automatically
close `manual-review.json`.

Give every page or spread a `pass`, `revise`, or `approved exception`
disposition. Bind the report to reviewer, date, named run, and exact PDF
checksum. Manual review is incomplete while any `revise` finding remains open.
