# Source Registry — verified 2026-08-14

## Primary / authoritative

1. Chrome for Developers — Lighthouse performance scoring  
   https://developer.chrome.com/docs/lighthouse/performance/performance-scoring  
   Key use: Performance score is derived from weighted metric scores; Opportunities/Diagnostics do not directly form the score; score variability and diminishing returns; documented Lighthouse 10 weights.

2. Chrome for Developers — Lighthouse overview  
   https://developer.chrome.com/docs/lighthouse/overview  
   Key use: Lighthouse scope and execution model.

3. web.dev — Web Vitals  
   https://web.dev/articles/vitals  
   Key use: current Core Web Vitals, 75th percentile, lab vs field distinction, TBT as lab proxy rather than INP.

4. web.dev — Optimize LCP  
   https://web.dev/articles/optimize-lcp  
   Key use: four-part LCP decomposition: TTFB, resource load delay, resource load duration, element render delay.

5. web.dev — Optimize INP  
   https://web.dev/articles/optimize-inp  
   Key use: input delay, processing duration, presentation delay, long tasks and yielding.

6. web.dev — Optimize CLS  
   https://web.dev/articles/optimize-cls  
   Key use: layout-shift diagnostics and prevention.

7. Chrome DevTools — Performance tools  
   https://developer.chrome.com/docs/devtools/performance  
   Key use: runtime trace attribution.

8. Chrome for Developers — Automate Lighthouse audits with AI agents  
   https://developer.chrome.com/docs/devtools/agents/use-cases/lighthouse-audit  
   Key use: targeted runtime auditing for coding agents rather than blind source scanning.

9. Chrome for Developers — Lighthouse Agentic Browsing scoring  
   https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring  
   Key use: experimental agentic category is deterministic checks and not a weighted 0–100 score; preserve separately.

## Public skill references / workflow inspiration

10. Addy Osmani — web-quality-skills  
    https://github.com/addyosmani/web-quality-skills  
    Unofficial stack-agnostic collection covering Lighthouse/Web Vitals.

11. HenryYannis — lighthouse-performance-skills  
    https://github.com/HenryYannis/lighthouse-performance-skills  
    Closed-loop Lighthouse skill with helper scripts and 95+ score objective.

12. Addy Osmani — agent-skills / performance optimization  
    https://github.com/addyosmani/agent-skills  
    General production engineering skill patterns, gates, verification.

## Policy

This package paraphrases and synthesizes. It does not copy substantial source text. Verify current official docs when platform behavior is material to a decision.
