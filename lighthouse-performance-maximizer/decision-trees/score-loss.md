# Decision Tree — Performance Score Loss

```text
Performance below target
│
├─ Is result reproducible across >=3–5 runs?
│  ├─ no → stabilize environment / increase runs
│  └─ yes
│
├─ Which score metric has the largest useful opportunity?
│  ├─ LCP → lcp.md
│  ├─ TBT → tbt-inp.md
│  ├─ CLS → cls.md
│  ├─ FCP / SI → critical-rendering.md
│  └─ multiple → choose highest impact × confidence × route reach
│
├─ Can Diagnostics explain the metric loss?
│  ├─ yes → trace to resource/code
│  └─ no → capture DevTools trace / inspect waterfall
│
└─ Create one falsifiable patch hypothesis
```

Do not sort solely by Lighthouse audit severity labels.
