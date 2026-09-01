# Technical SEO Foundation

AI discovery does not remove the need for conventional crawl/index hygiene. For engines that ground generative features in search indexes, these are upstream gates.

## URL behavior

For every canonical public page, verify:
- one stable preferred URL,
- successful HTTP response,
- no accidental authentication/interstitial dependency,
- coherent redirect behavior,
- canonical target is index-eligible,
- internal links point primarily to canonical URLs,
- parameters/facets do not create uncontrolled duplicate spaces.

## Crawling versus indexing

Keep distinct:
- a bot being allowed to request a URL,
- the engine choosing to crawl it,
- the engine rendering it,
- the engine indexing it,
- the page being eligible for snippets/features,
- the page being retrieved for a particular query.

Do not report “indexed” merely because a page is crawlable.

## Rendering

Critical meaning should not depend on user gestures or opaque client-side behavior before it exists in the rendered document. Inspect:
- headings,
- product names/prices/availability,
- main body text,
- canonical/meta tags,
- structured data,
- internal links,
- variant states.

Progressive enhancement is preferable for core discovery paths.

## Sitemaps

Use sitemaps to enumerate canonical valuable URLs and maintain realistic `lastmod` values. Do not update timestamps mechanically when content did not materially change. Segment large or operationally distinct URL classes when useful for monitoring.

## Internal linking

Link architecture should communicate real relationships:
- category → product,
- product → material/provenance/care,
- article → relevant entity/product,
- organization → locations/people/policies,
- comparison → referenced products/entities.

Avoid orphan evidence pages that no meaningful page references.

## Internationalization

When localized pages exist, verify:
- language-specific content is genuinely localized,
- canonical stays within the appropriate language version,
- hreflang is reciprocal and valid where used,
- currencies/shipping/policies match the market,
- auto-redirect behavior does not prevent crawlers/users from accessing variants.

## Performance and UX

Poor performance is not an “AI-only” issue but can affect search/user outcomes. Prevent speculative AI additions from bloating JS, blocking rendering, or degrading Core Web Vitals.
