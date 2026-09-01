# Caching and Compression

Static hashed assets generally benefit from long-lived immutable caching. Mutable HTML/API data requires a correct freshness/invalidation policy.

Check:

- Brotli/gzip for text assets;
- immutable cache for content-hashed assets;
- CDN edge behavior;
- HTML freshness;
- revalidation strategy;
- image CDN cache;
- duplicated downloads caused by changing URLs/query strings;
- service-worker interaction.

Never apply a long immutable cache to mutable content without an invalidation/versioning model.
