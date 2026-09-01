# Typography and glyph coverage

Choose type by editorial role, language, and reading conditions. Do not replace
an otherwise sound type system with one universal fallback merely because a
localized character failed.

## Contract

- Declare each family and weight that may render visible text.
- Add a compact `requiredGlyphSets` entry for every edition language or script.
- Include uppercase, lowercase, punctuation, numerals, and symbols that are
  easy to miss. Turkish editions should at least test
  `ÇĞİÖŞÜçğıöşü`.
- Keep fonts local, licensed, and deterministic.

The browser renderer tests each required glyph in every declared family/weight.
`document.fonts.check()` alone is not evidence of coverage: the browser may
silently substitute a fallback glyph.

## Review

Inspect a locale sentinel in both the canonical browser capture and an
independent PDF raster. Check body, display, captions, folios, labels, and
back matter because they may use different faces or weights. Confirm that:

- characters are present and not tofu boxes;
- dotted and dotless forms are distinct where required;
- weight, baseline, spacing, and punctuation remain coherent;
- PDF embedding/subsetting did not change the result.

If a face lacks coverage, use a project-local fallback only for the affected
role or replace that face deliberately. Rerun full QA after any font change.
