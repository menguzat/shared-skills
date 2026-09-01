# Cache Header Patterns

Hashed static asset:

```http
Cache-Control: public, max-age=31536000, immutable
```

Mutable HTML often needs revalidation or a shorter freshness model, for example:

```http
Cache-Control: public, max-age=0, must-revalidate
```

These are examples, not universal configuration. CDN, SSR, personalization, and invalidation design determine the correct policy.
