# INP and TBT

**Evidence: OFFICIAL + ESTABLISHED**

INP is a field responsiveness metric. Lighthouse TBT is a synthetic lab proxy for main-thread blocking, not a substitute measurement.

Interaction latency can be reasoned about as:

- input delay before handlers can run;
- processing duration of handlers/work;
- presentation delay until the next frame is painted.

## Root-cause classes

- large startup/hydration tasks;
- bundle parse/compile/evaluation;
- expensive event handlers;
- synchronous state fan-out/re-render;
- forced layout/style recalculation;
- long JSON/data transforms;
- excessive DOM;
- third-party scripts;
- long tasks scheduled at poor times.

## Remediation classes

- delete unused work;
- defer noncritical work;
- split long tasks and yield;
- reduce rendering scope;
- code split routes/features;
- precompute on server/build;
- move CPU work to worker when suitable;
- avoid layout thrashing;
- prioritize the user's interaction over background work.

Do not use arbitrary `setTimeout` chains without understanding scheduling and correctness.
