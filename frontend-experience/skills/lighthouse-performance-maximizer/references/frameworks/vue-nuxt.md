# Vue / Nuxt Notes

Inspect current framework version first.

Typical levers:

- async components and route splitting;
- SSR/SSG/hydration boundaries;
- client-only components;
- payload/data fetching;
- image module configuration;
- font preload;
- plugin initialization;
- third-party modules.

Avoid broad client-only rendering when only one subtree requires browser APIs.
