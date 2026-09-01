# JavaScript and Main-Thread Performance

Optimization hierarchy:

1. do not ship/run work the user does not need;
2. do necessary work later if it is not critical;
3. do necessary work in smaller chunks;
4. do appropriate CPU work off-main-thread;
5. make the remaining work cheaper.

Inspect both transfer and execution. A small compressed bundle can still be expensive to parse/evaluate; a larger bundle may be cheap if mostly unused until later, but unused transfer is still waste.

Common high-impact fixes:

- remove duplicate/heavy dependencies;
- route-level and feature-level dynamic import;
- reduce hydration islands/client component scope;
- move static rendering to server/build;
- avoid eager initialization of editors/maps/charts below fold;
- replace repeated full-list computation with indexed/incremental logic;
- yield long tasks;
- lazy-load third-party SDKs at correct trigger.

Do not blindly memoize or code-split every component. Measure resulting request overhead, complexity, and actual TBT/INP effect.
