# LCP Reference

**Evidence: OFFICIAL — web.dev Optimize LCP**

Break each LCP into four contiguous subparts:

1. TTFB
2. Resource load delay
3. Resource load duration
4. Element render delay

The web.dev guidance suggests, as a diagnostic shape rather than a hard law, that well-optimized resource-based LCP tends to spend most unavoidable time in HTML response and actual resource transfer, while the two delay terms should approach zero.

## Resource discovery checklist

- Is the LCP element present in initial HTML?
- Is the resource URL visible to the preload scanner?
- Is it a CSS background image discovered only after stylesheet fetch/parse?
- Is it inserted after hydration/data fetch?
- Is it marked `loading="lazy"`?
- Does `srcset`/`sizes` cause an unexpectedly large candidate?
- Is an appropriate priority/preload missing?
- Is the hero hidden until JS/animation completes?

## Important trap

Compressing an already-fast LCP image may not improve LCP if JavaScript still prevents the element from rendering. Always verify which subpart shrinks.
