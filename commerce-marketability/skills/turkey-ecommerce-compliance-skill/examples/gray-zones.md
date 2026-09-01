# Gray-Zone Examples

## 1. Hemp-seed-oil cosmetic

**Input:** Body cream contains `Cannabis Sativa Seed Oil`; no CBD/THC/cannabinoid extract is listed.

**Do not conclude:** pharmacy-only solely from “hemp”.

**Action:** classify as cosmetic first. Request full INCI and, if composition/source creates uncertainty, supplier specification or cannabinoid analysis. Apply `HEMP_REGULATED_PRODUCT` only if the facts meet the 2026 regulation’s definitions.

## 2. “Hemp honey”

Possible meanings:
- honey botanically associated with hemp fields/pollen,
- ordinary honey blended with hemp seed material,
- honey containing hemp extract/cannabinoids.

These are not legally equivalent. Request recipe/specification, botanical-origin evidence when claimed, and cannabinoid analysis where relevant. Do not infer CBD from the name.

## 3. Essential oil with neutral product page

**Input:** “Geranium Essential Oil 10 ml”; product page says only “for room fragrance”, but supplier licence says it is an aromatherapeutic medicinal/wellbeing product.

**Rule:** actual regulated product identity controls. Neutral website copy does not convert a regulated aromatherapeutic product into an unregulated room fragrance.

## 4. Herbal tea named “Immunitas” with no explicit claim

The name may imply a health effect. Context matters. Compare brand presentation, category, imagery, metadata and ingredient marketing. Use `HUMAN_REVIEW_REQUIRED` / claim review if the implied message is material; do not automatically classify as medicinal herbal tea without the product-definition facts.

## 5. “Natural mosquito repellent”

Natural essential oils do not remove a product from biocidal regulation. Repellent function is a biocide trigger. Request product-type authorization/registration evidence.

## 6. Soap labelled both body and laundry soap

One SKU presented for two distinct principal uses can create classification and labeling problems. Determine actual formulation/market-placement status and separate SKUs/routes if necessary.

## 7. “Organic” versus “natural”

A product can be natural without being certified organic. “Organic” should be supported by the applicable organic-certification regime; “natural” remains an advertising claim that must not mislead.

## 8. Made-to-order textile returns

Do not assume every made-to-order item loses the withdrawal right. Determine whether it is genuinely produced according to the consumer’s specifications or clearly personalized under the applicable distance-sales exception.
