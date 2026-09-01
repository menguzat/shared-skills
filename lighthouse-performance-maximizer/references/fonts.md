# Font Performance

Questions:

- How many font files/weights/styles are requested before initial render?
- Which are actually used above fold?
- Is text blocked waiting for fonts?
- Does swap cause meaningful layout shift?
- Are font files subset appropriately?
- Are origins/preloads configured correctly?

Strategies:

- reduce unnecessary weights/styles;
- subset when practical;
- preload only truly critical font resources;
- use an appropriate `font-display` policy;
- use metric-compatible fallbacks/size-adjust where helpful;
- self-host only when it improves operational/performance characteristics, not as dogma.

Do not replace brand typography with generic system fonts solely to gain points unless the user approves the product change.

### Battle-Tested Font Maximization Lessons

1. **Eliminating External Font CDN Roundtrips (Self-Hosted WOFF2):**
   - *Problem:* Google Fonts CDN (`fonts.googleapis.com` + `fonts.gstatic.com`) requires external DNS lookup, TLS handshake, and CSSOM render-blocking roundtrips. Under 150ms RTT mobile throttling, this alone introduces a 1.2s–1.6s delay to First Contentful Paint (FCP).
   - *Solution:*
     - Download primary WOFF2 font files locally to `/assets/fonts/`.
     - Add `<link rel="preload" href="/assets/fonts/*.woff2" as="font" type="font/woff2" crossorigin>` in `index.html`.
     - Zero external third-party network connections; fonts arrive over the existing HTTP/2 connection with 1-year immutable caching.
