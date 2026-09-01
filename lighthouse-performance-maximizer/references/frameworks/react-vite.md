# React + Vite Notes

Inspect:

- route-level lazy boundaries;
- eager imports of editors/charts/maps;
- large icon libraries imported wholesale;
- client data waterfalls;
- heavy context/provider initialization;
- unnecessary rerender cascades;
- source-map/bundle analysis output;
- CSS framework generation;
- preload/modulepreload behavior.

High-value patterns:

- `React.lazy` / dynamic imports at route or genuinely heavy feature boundaries;
- load below-fold feature modules on intent/viewport;
- keep the first render simple and data-ready;
- precompute static content at build time where possible;
- use `manualChunks` only with measured rationale—bad chunking can add waterfalls.

### Battle-Tested React + Vite Maximization Lessons

1. **Static Initial State Hydration (Client SWR Pattern):**
   - *Problem:* Initializing Context / Stores with `[]` and `loading: true` waiting for a client-side API (`/api/catalog`) adds 400–600ms of blank delay before FCP/LCP.
   - *Solution:* Bundle a static JSON snapshot (`default-catalog.json`) as the initial state in `useState(defaultCatalog || [])` with `loading: false`. The page renders immediately on frame 0 (0ms latency), while `useEffect` silently refreshes live stock/pricing in the background.

2. **Core Route vs. Editorial Route Splitting:**
   - *Problem:* Aggressive `React.lazy()` on every route creates a secondary chunk download waterfall (`index.js` -> `Product.js` -> hero image) on direct landing.
   - *Solution:* Keep high-traffic entry routes (`Home`, `Shop`, `Product`) statically imported in the primary bundle, and use `React.lazy()` for secondary editorial routes (`Story`, `Atelier`, `Bespoke`, `Philosophy`, `Journal`).

3. **`content-visibility: auto` for Speed Index:**
   - *Problem:* Deep DOM trees below the fold (product descriptions, DPP accordions, reviews, related carousels, footers) stall the browser's filmstrip progression and increase Speed Index to > 4.5s.
   - *Solution:* Apply `content-visibility: auto; contain-intrinsic-size: 1px 600px;` to all major below-the-fold container sections. The browser skips styling/layout for off-screen nodes until user scroll.

4. **HTTP Basic Auth Staging Pitfall:**
   - *Problem:* In password-protected staging (`https://user:pass@domain.com`), relative `fetch('/api/...')` throws `TypeError: Request cannot be constructed from a URL that includes credentials`.
   - *Solution:* Ensure API endpoints are constructed cleanly without inheriting credentialed origins.
