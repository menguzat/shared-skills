# Workflow — SPA / Long-Lived Application Performance

Lighthouse initial load is only one state.

Also test:

- direct route load;
- client-side route transition;
- first major interaction;
- repeated navigation;
- large list/filter/editor interaction;
- memory/resource growth during long session;
- post-hydration main-thread tasks.

Use Performance traces and field INP/RUM. A 100 initial Lighthouse score can coexist with poor interaction performance later in a session.
