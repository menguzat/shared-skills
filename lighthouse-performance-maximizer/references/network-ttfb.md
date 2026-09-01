# Network, TTFB, and Critical Request Chains

Diagnose the waterfall before reducing arbitrary bytes.

## TTFB contributors

- redirect chain;
- DNS/TLS/connection setup;
- CDN/edge miss;
- origin compute;
- database/API dependency;
- server rendering;
- cold start;
- cache policy;
- geographic distance.

## Critical-path questions

- What is the earliest request preventing useful paint?
- What request waits for another request unnecessarily?
- Does HTML discover the LCP resource immediately?
- Are CSS/JS resources blocking paint?
- Are preloads actually used early?
- Is a preconnect justified by an unavoidable cross-origin critical request?

Avoid speculative preloading of many assets: it can compete with truly critical requests.
