# Structured Representation Playbook

Structured representation is a consistency layer, not a substitute for page content.

## General rules

1. Use the most specific applicable type supported by the target platform.
2. Values must correspond to visible, truthful business information.
3. Use stable identifiers.
4. Connect variants and parent products correctly.
5. Keep volatile offer fields synchronized.
6. Validate syntax and platform eligibility separately.
7. Do not assume schema.org vocabulary automatically creates a search feature.

## Organization

Useful properties can include canonical name, legal name where appropriate, URL, logo, contact points, sameAs profiles, address, identifiers, and founding/people information when genuinely relevant.

## Product / Offer

Common decision-critical representation:
- product name,
- brand,
- SKU/GTIN/MPN where applicable,
- material/color/size,
- images,
- offer price/currency,
- availability,
- seller,
- shipping/returns where supported,
- product groups/variants.

Never mark a generic category page as a single purchasable product merely to obtain a feature.

## Reviews

Only publish structured review/rating data when:
- reviews are genuine,
- the page/business qualifies under current platform rules,
- aggregates are computed accurately,
- visible content supports the markup.

## Feeds

A feed is a separate operational source of truth. Build monitoring for mismatch between:
- page,
- JSON-LD,
- merchant feed,
- inventory system,
- checkout.

A stale feed can undermine qualification even when the page is good.
