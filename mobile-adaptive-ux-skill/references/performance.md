# Mobile Performance Reference

Current Core Web Vitals targets documented by web.dev:
- LCP: good <= 2.5 s
- INP: good <= 200 ms
- CLS: good <= 0.1

Field evaluation uses the 75th percentile.

Sources:
- https://web.dev/articles/vitals
- https://web.dev/articles/inp
- https://web.dev/articles/top-cwv

## Mobile redesign performance traps

### Duplicate desktop + mobile DOM

Avoid rendering two complete implementations and toggling one with CSS unless there is a strong reason. Costs can include:
- duplicate images/media requests
- larger DOM
- duplicate React/component work
- duplicate event listeners
- accessibility confusion when hiding is incomplete

Prefer shared data/semantics with adaptive components.

### Over-animated navigation

Navigation transition work must not delay interaction. Prefer compositor-friendly transitions and respect reduced-motion preference.

### Heavy drawers/filter panels

Do not mount large data-heavy trees repeatedly if they can be loaded/virtualized/partitioned more efficiently.

### Responsive media

Use appropriate `srcset`/`sizes` or framework image tooling. Do not send desktop hero assets unchanged to narrow screens merely because CSS crops them.

### Layout stability

Reserve dimensions/aspect ratios for images and dynamic media. Sticky bars appearing late must not unexpectedly push content.

### JavaScript breakpoint branching

Avoid attaching resize listeners that continuously trigger expensive application-level rerenders when CSS layout/capability rules can do the job.
