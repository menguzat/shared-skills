# AUDIT-ONLY Example — Condensed

This is illustrative only; the numbers are fictional.

## P0 Quick Wins

| Order | Finding | Impact | Effort | Confidence | Risk | Why first |
|---:|---|---:|---:|---:|---:|---|
| 1 | LCP hero is lazy-loaded | 5 | 1 | 5 | 1 | Directly delays the dominant mobile LCP resource across all product pages |
| 2 | Two unused critical font weights are preloaded | 4 | 1 | 5 | 1 | Adds early contention on most routes with trivial implementation cost |

## P1 High Value

| Order | Finding | Impact | Effort | Confidence | Risk |
|---:|---|---:|---:|---:|---:|
| 3 | 380 KB editor library ships in initial app shell | 5 | 3 | 5 | 2 |

## P2 Structural

| Order | Finding | Impact | Effort | Confidence | Risk |
|---:|---|---:|---:|---:|---:|
| 4 | Personalized SSR blocks HTML on two serial APIs | 5 | 5 | 4 | 4 |

## Do not bother yet

- Converting a 9 KB decorative PNG to AVIF: negligible compared with the LCP discovery delay.
- Removing 1.8 KB of unused CSS: measurable diagnostic, unlikely to affect the current limiting metrics.

## Handoff

1. Remove lazy loading from the verified LCP image and expose it in initial HTML; rerun product/mobile baseline.
2. Remove the two noncritical font preloads; rerun home + product/mobile.
3. Only after re-baselining, decide whether editor route-splitting remains the dominant TBT opportunity.
