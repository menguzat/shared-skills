# Core Web Vitals Operating Model

- **LCP** measures loading of the main viewport content. Diagnose via TTFB + resource load delay + resource load duration + element render delay.
- **INP** measures interaction responsiveness in the field. Diagnose input delay, event processing, and presentation delay.
- **CLS** measures unexpected visual instability over the page lifecycle.

Supporting diagnostics:

- **TTFB** helps explain server/network contribution to LCP/FCP.
- **FCP** helps explain initial render readiness.
- **TBT** helps diagnose main-thread blocking in lab and often correlates with INP risk, but is not INP.
- **Speed Index** reflects visual progression under Lighthouse's synthetic model.

Optimization principle: make the bottleneck smaller without shifting the same delay into another subpart.
