# Decision Tree — FCP / Speed Index / Critical Rendering

```text
FCP/SI poor
│
├─ TTFB high? → network-ttfb path
│
├─ Render-blocking CSS/JS?
│  ├─ critical and required → deliver earlier/smaller
│  └─ noncritical → defer
│
├─ Font blocks text? → font path
│
├─ App waits for client JS/data before any useful content?
│  └─ SSR/SSG/skeleton that preserves truth / remove waterfall
│
├─ excessive initial DOM/paint?
│  └─ reduce first-view work
│
└─ above-fold media competing?
   └─ prioritize one critical path, lazy/defer the rest
```
