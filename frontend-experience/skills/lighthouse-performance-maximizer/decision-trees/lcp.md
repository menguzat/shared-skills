# Decision Tree — LCP

```text
LCP too high
│
├─ Identify LCP element and resource
│
├─ TTFB dominant?
│  ├─ yes → origin/CDN/cache/SSR/API/db/redirect path
│  └─ no
│
├─ Resource load delay large?
│  ├─ yes
│  │  ├─ resource absent initial HTML? → SSR/static emit
│  │  ├─ CSS background? → reconsider markup/preload
│  │  ├─ lazy loaded? → remove lazy for LCP
│  │  ├─ client-only discovery? → server/static discovery
│  │  └─ priority competition? → reduce competing preloads/priorities
│  └─ no
│
├─ Resource load duration large?
│  ├─ wrong dimensions/candidate? → responsive images
│  ├─ oversized encoding? → compress/format
│  ├─ slow origin? → CDN/cache
│  └─ connection overhead? → origin strategy/preconnect if justified
│
└─ Element render delay large?
   ├─ hydration/JS gate → render sooner/reduce JS
   ├─ render-blocking CSS → critical path
   ├─ font gate → font strategy
   ├─ hidden/animation gate → remove delayed reveal
   └─ main-thread/paint → trace and reduce
```
