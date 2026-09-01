# Workflow — Staging vs Production

Local/staging is good for code-level causality. Production is necessary when performance depends on:

- CDN/edge caching;
- image optimization service;
- server cold starts;
- real origin geography;
- production third parties;
- consent/ad systems;
- production data/API latency.

Use staging/local for fast iteration, then validate retained patches against a production-like or actual production environment before final claims.
