# CSS and Rendering

Investigate:

- render-blocking stylesheets;
- CSS import chains;
- huge unused framework CSS;
- expensive selectors only when profiler evidence indicates style cost;
- forced synchronous layout caused by JS read/write interleaving;
- large DOM/layout trees;
- paint-heavy effects;
- offscreen rendering work.

Strategies:

- ensure critical initial CSS is available early;
- avoid `@import` chains on critical CSS;
- purge truly unused generated CSS through the build system;
- batch DOM writes/reads;
- use `content-visibility` carefully for large offscreen sections when semantics/UX remain correct;
- prefer transform/opacity animation when equivalent.

Do not inline enormous CSS indiscriminately: it can bloat HTML and reduce cache reuse.
