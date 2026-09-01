# Lab vs Field Performance

**Evidence: OFFICIAL**

Core Web Vitals are field metrics. Evaluate LCP, INP, and CLS at the 75th percentile, separately for mobile and desktop.

Current good thresholds:

- LCP <= 2.5 s
- INP <= 200 ms
- CLS <= 0.1

Lighthouse is synthetic. It can measure LCP and CLS under its test load, but it cannot directly measure INP because there is no real user interaction sequence. Lighthouse uses TBT as a lab diagnostic proxy for interactivity risk.

Use:

- Lighthouse for reproducible pre-release diagnosis and regression detection;
- CrUX for aggregate real-user Core Web Vitals where sufficient traffic exists;
- first-party RUM for route, geography, device, session, interaction, and business-segment diagnostics.

Never claim field CWV passes based only on Lighthouse.

When lab and field disagree, the disagreement is information. Look for real-device CPU, geography, personalized content, ads, consent, logged-in state, interaction patterns, cache state, SPA transitions, and long-session effects.
