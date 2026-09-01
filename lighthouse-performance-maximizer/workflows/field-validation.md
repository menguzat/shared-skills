# Workflow — Field Validation

1. Obtain CrUX and/or first-party RUM.
2. Segment mobile/desktop.
3. Segment by route/template when RUM permits.
4. Inspect p75 LCP/INP/CLS.
5. Compare lab vs field.
6. Reproduce failing cohorts: slower CPU/network, authenticated state, consent, geographic backend, ad state, long SPA session.
7. Instrument Web Vitals attribution in RUM when possible.
8. Optimize the real failing cause.
9. Track field movement over an appropriate reporting window; do not expect CrUX aggregate data to change immediately after deploy.
