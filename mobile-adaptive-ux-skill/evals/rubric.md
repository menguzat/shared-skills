# Evaluation Rubric - 100 points

## 1. Task/IA analysis - 20
- 0: no task model
- 10: basic route audit
- 20: prioritized tasks, mobile risks, transformation rationale

## 2. Navigation architecture - 15
- 0: hamburger by default
- 8: plausible pattern without evidence
- 15: pattern selected from topology with alternatives documented

## 3. Transformation quality - 15
- 0: CSS reflow only
- 8: some component substitutions
- 15: explicit KEEP/REFLOW/COMPRESS/DISCLOSE/SUBSTITUTE/SEQUENCE/REMOVE model

## 4. State/history - 15
- 0: ignored
- 8: routes work but overlay/filter restoration incomplete
- 15: deterministic Back/deep-link/restoration model

## 5. Accessibility/input - 15
- 0: touch-only visual redesign
- 8: target sizes and labels addressed
- 15: pointer/hover, target size, gestures, focus, zoom, reduced motion covered

## 6. Viewport/forms - 10
- 0: fixed widths/100vh/keyboard ignored
- 10: dynamic viewport, safe area, forms, keyboard tested as applicable

## 7. Performance/regression - 5
- 0: ignored
- 5: mobile performance and desktop regressions checked

## 8. Verification - 5
- 0: no repeatable tests
- 5: compact width matrix + primary journey tests + report

Passing score: 85
Automatic fail regardless of score:
- critical hover-only functionality remains
- zoom disabled
- P0 mobile task removed without authorization
- browser Back broken by the redesign
