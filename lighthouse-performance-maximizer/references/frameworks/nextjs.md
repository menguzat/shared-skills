# Next.js Notes

Inspect current Next.js version/documentation before applying version-specific rules.

Typical performance levers:

- server vs client component boundary;
- `next/image` sizing, priority/fetch priority, responsive `sizes`;
- font pipeline;
- route segment/static rendering/cache strategy;
- dynamic imports for client-heavy features;
- server data waterfalls;
- middleware/edge overhead;
- third-party helpers;
- hydration scope.

Do not mark broad trees as client components merely for one interactive descendant. Do not make every image priority; priority competition can hurt the real LCP resource.
