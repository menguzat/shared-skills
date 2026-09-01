---
name: turkey-ecommerce-compliance-skill
description: Audit Turkey-facing e-commerce websites for consumer law, advertising, privacy/cookies, product safety, and payment-provider compliance.
---

# Turkey E-Commerce Compliance Auditor

## Purpose

Audit a Turkey-facing e-commerce website for regulatory, product-classification, advertising, privacy, product-safety, and payment-provider readiness issues, with special depth for natural products, food, cosmetics, hemp/cannabis-derived products, essential oils, herbal teas, textiles, detergents, biocides, and artisan goods.

This skill is an **auditor and triage system**, not a substitute for a lawyer, competent authority, laboratory, notified body, responsible technical person, or licensing authority. It must distinguish:

1. facts directly visible on the website,
2. facts supplied by the operator,
3. facts verified from current authoritative sources,
4. documents that must exist but are not necessarily public,
5. legal classification uncertainty,
6. payment-provider policy risk that is separate from law.

## Scope

Primary jurisdiction: **Türkiye**.

Primary surfaces:
- own-store e-commerce sites,
- marketplaces and multi-brand stores,
- product pages,
- category pages,
- homepage banners,
- blog/editorial content used commercially,
- checkout and order flow,
- policies and contracts,
- cookies and tracking behavior,
- reviews/testimonials,
- metadata, schema markup and hidden SEO copy,
- influencer/affiliate and advertising claims when accessible.

Product modules included in v1:
- general e-commerce,
- distance sales / consumer law,
- online product-safety listings,
- advertising and commercial practices,
- reviews and discount claims,
- privacy/cookies,
- food and herbal beverages,
- cosmetics,
- hemp/cannabis-derived products,
- aromatherapeutic products,
- medicinal herbal teas,
- textiles,
- detergents,
- biocides,
- environmental / organic / natural claims,
- PayTR readiness.

## Non-goals

Do not:
- declare a product lawful merely because no prohibited word is visible;
- declare a product unlawful merely because the site lacks a non-public document;
- treat PayTR policy as legislation;
- infer cannabinoid content from the word “hemp/kenevir” alone;
- infer medicinal status from the word “herbal/bitkisel” alone;
- infer aromatherapeutic status from “essential oil/uçucu yağ” alone;
- rewrite claims to conceal a regulated intended use;
- give a final legal opinion where classification depends on formula, analysis, manufacturing method, intended use, plant part, or competent-authority interpretation.

## Source authority hierarchy

Use sources in this order and record the source tier in every material finding.

1. **Tier A — Primary law**: Resmî Gazete, mevzuat.gov.tr, official consolidated legislation.
2. **Tier B — Official implementation**: Ticaret Bakanlığı, TİTCK, Tarım ve Orman Bakanlığı, Sağlık Bakanlığı, KVKK, Türkiye Ürün Kuralları Veri Tabanı.
3. **Tier C — Official enforcement / decisions**: Reklam Kurulu decisions, KVKK Board decisions, GÜBİS/recalls, official inspection guidance.
4. **Tier D — Professional bodies reproducing official text**: TEB, chambers and professional bodies, only when they faithfully reproduce or link to the official instrument.
5. **Tier E — Commercial policy**: PayTR and other payment/acquiring rules.
6. **Tier F — Commentary**: law firms, consultants, blogs. Use only to discover an issue; never as the sole basis of a blocker finding.

Before a substantive audit, read `references/source-registry.md`. For current or recently changed law, verify freshness on the web before treating a rule as current.

## Freshness requirements

For every audit:
- record audit date;
- record each legal source's `last_verified` date;
- re-check sources marked `volatile` or changed in the last 18 months;
- specifically re-check advertising, hemp, aromatherapeutic products, medicinal herbal teas, product-safety e-commerce rules, food labeling transitions and payment-provider rules;
- distinguish publication date, effective date and transition deadline.

Never use a draft as if it were in force.

## Evidence rules

### Visible-site evidence
A finding may state `PASS_VISIBLE`, `INFO_MISSING` or `LIKELY_VIOLATION` only for information that can reasonably be checked on the website.

### Non-public-document evidence
If compliance depends on a document that is normally kept in the operator/manufacturer file, use `DOCUMENT_REQUIRED` or `VERIFY_DOCUMENT`. Do not say the document does not exist unless the operator confirms this or a competent source proves it.

### Classification evidence
When classification depends on formula or technical facts, request the minimum decisive evidence, for example:
- full INCI,
- full ingredient list,
- intended use,
- product label images,
- plant part,
- extraction method,
- cannabinoid panel,
- food-business registration,
- cosmetic notification evidence,
- product safety file,
- test report,
- biocidal registration/authorization,
- certificate supporting “organic” or environmental claims.

## Status vocabulary

Use only these statuses:
- `PASS_VISIBLE`
- `INFO_MISSING`
- `DOCUMENT_REQUIRED`
- `CLAIM_EVIDENCE_REQUIRED`
- `LIKELY_VIOLATION`
- `GRAY_ZONE`
- `HUMAN_REVIEW_REQUIRED`
- `PHARMACY_ONLY`
- `PAYTR_RISK`
- `OUT_OF_SCOPE`

Severity:
- `blocker`
- `high`
- `medium`
- `low`

Confidence:
- `high`
- `medium`
- `low`

## Audit workflow

### 1. Determine business model
Classify the site as one or more of:
- own-brand seller,
- reseller,
- marketplace/aracı hizmet sağlayıcı,
- mixed marketplace + own brand,
- B2B catalogue,
- direct-to-consumer shop.

Record whether the business imports products, manufactures, private-labels, fulfils orders, or merely intermediates.

### 2. Discover compliance surfaces
Crawl or inspect:
- homepage,
- all product/category pages,
- brand pages,
- cart,
- checkout,
- contact/company-info pages,
- terms,
- pre-information form,
- distance-sales contract,
- return/refund/cancellation policy,
- delivery policy,
- privacy notice,
- cookie notice and consent banner,
- campaign/discount pages,
- review widgets,
- blog posts linked to product conversion,
- metadata and structured data,
- sitemap where available.

Do not limit claim scanning to visible product body text. Include titles, subtitles, badges, alt text, metadata, schema, FAQs, testimonials and banners.

### 3. Build product inventory
For every SKU capture:
- URL,
- product name,
- brand,
- category,
- price and displayed former price,
- quantity/size,
- intended use,
- directions,
- ingredient/INCI list,
- warnings,
- origin/manufacturer/importer/responsible operator shown,
- claims,
- reviews,
- set/bundle components.

### 4. Classify each product before auditing claims
Use `schemas/product-classification-schema.yaml`.

Never classify by product name alone. Route using intended use + composition + presentation + claims + legal definitions.

Primary routing categories:
- FOOD
- FOOD_SUPPLEMENT
- COSMETIC
- HEMP_REGULATED_PRODUCT
- AROMATHERAPEUTIC_PRODUCT
- MEDICINAL_HERBAL_TEA
- TEXTILE
- DETERGENT
- BIOCIDAL_PRODUCT
- ROOM_FRAGRANCE_OR_CHEMICAL
- GENERAL_CONSUMER_PRODUCT
- UNKNOWN

### 5. Run decision trees
Read the relevant reference module and, when applicable, the gray-zone examples.

#### Hemp routing
Do not trigger the special hemp regime from `Cannabis sativa` wording alone.
Ask:
1. What plant part/material is used?
2. Is it seed, seed oil, fibre, hurd, stalk, paper or textile?
3. Does it contain cannabinoids or cannabinoid combinations?
4. Does the product meet the 2026 regulation’s definitions of medical, health, personal-care or support products?
5. Is it a food under food law rather than a regulated health/support product?

If cannabinoid content or extract type is unknown and decisive: `HUMAN_REVIEW_REQUIRED` + request full formula and cannabinoid analysis.

If the product falls within the 31 Jan 2026 regulation’s medical/health/personal-care/support categories: flag `PHARMACY_ONLY` for normal online retail because the regulation provides pharmacy-only sale for products within its scope.

See `references/hemp.md`.

#### Essential-oil routing
Do not classify every essential oil as aromatherapeutic.
Determine intended use:
- health/therapy/wellbeing effect -> assess aromatherapeutic regime;
- cosmetic application -> cosmetics module;
- food flavouring -> food/aroma rules;
- room fragrance -> chemical/general product rules.

See `references/aromatherapy-herbal-tea.md`.

#### Herbal tea routing
Distinguish ordinary food tea from medicinal herbal tea. Health-protective/therapeutic presentation plus regulated medicinal-tea characteristics may trigger the pharmacy-only route. Ordinary food herbal tea remains under food law.

#### Soap routing
- human body cleansing -> cosmetic route;
- laundry/surface cleaning -> detergent route;
- antimicrobial/disinfecting/pest-repellent primary function or claim -> biocide trigger review.

### 6. Extract and classify claims
Classify claims as:
- MEDICAL
- HEALTH
- PHYSIOLOGICAL
- ANTIMICROBIAL
- REPELLENT
- COSMETIC
- NUTRITION
- ORGANIC
- NATURAL
- ENVIRONMENTAL
- ORIGIN
- QUALITY
- COMPARATIVE
- DISCOUNT
- SCARCITY
- TESTIMONIAL

Do not treat synonymous or implied claims as safe merely because regulated words were removed.

Examples:
- “immune shield” may still imply an immunity claim;
- “sleep ritual” may be neutral in context, but “helps you sleep” is a functional/health claim;
- “chemical-free” is often technically misleading;
- “100% sustainable” requires substantiation and scope clarity;
- “organic” requires applicable certification, not merely natural sourcing.

See `references/advertising-claims.md`.

### 7. Audit site-wide e-commerce and consumer-law requirements
Read:
- `references/ecommerce-core.md`
- `references/consumer-distance-sales.md`

Check business identity, communication information, required pre-contract information, order-button clarity, total price/cost disclosure, delivery and withdrawal/cancellation information, returns and refund process, applicable exceptions and electronic communications.

### 8. Audit online product-safety listing information
Read `references/product-safety-online.md`.

For products in scope, inspect whether the online offer provides the required economic-operator/product-identification and warning information applicable to the product.

Distinguish:
- information legally required to be shown in the offer,
- documents merely held in the technical file.

### 9. Audit product-specific modules
Use the applicable references:
- `food.md`
- `cosmetics.md`
- `hemp.md`
- `aromatherapy-herbal-tea.md`
- `textiles.md`
- `detergents-biocides.md`

### 10. Audit privacy and cookies
Read `references/privacy-cookies.md`.

If technical inspection is available, test the site in a fresh session before consent. Record whether analytics/advertising trackers fire before valid consent where consent is the lawful basis.

A cookie-policy page alone is not sufficient evidence of compliant consent behavior.

### 11. Audit advertising, pricing and reviews
Read `references/advertising-claims.md`.

Check:
- medical/health implications,
- unsupported “natural/organic/green” statements,
- environmental claims,
- discount reference pricing,
- scarcity claims,
- review integrity,
- imported or unverifiable reviews,
- influencer disclosure when visible,
- AI-generated advertising disclosures/rules where relevant under current law.

### 12. Run PayTR readiness separately
Read `references/paytr.md`.

Produce two outputs:
- `LEGAL_COMPLIANCE`
- `PAYTR_READINESS`

A legally sellable product can still be `PAYTR_RISK` or require sector documents.

### 13. Produce report
At minimum output:
1. executive summary,
2. blockers,
3. high/medium/low findings,
4. product classification table,
5. required-document list,
6. gray-zone list,
7. pharmacy-only / remove-from-normal-online-sale list,
8. PayTR readiness list,
9. remediation actions,
10. source list with verification date.

## Finding format

Use `schemas/finding-schema.yaml`. Every blocker/high finding should include:
- exact URL,
- exact detected text or observed behavior,
- classification,
- status/severity/confidence,
- legal or policy basis,
- why the rule applies,
- what evidence could change the conclusion,
- recommended action.

## Remediation rules

When suggesting fixes:
- preserve truthful product identity;
- do not replace one prohibited claim with a euphemism that communicates the same prohibited effect;
- prefer objective, measurable, sourceable statements;
- separate product copy changes from licensing/document remedies;
- if the product itself belongs to a pharmacy-only regime, do not propose copy changes as a workaround;
- if a product is in a gray zone, recommend the precise classification evidence or authority opinion required.

## Citation rules

Every material legal proposition must cite a source from `source-registry.md` or a newly verified authoritative source.

For rapidly changing law, add:
- source title,
- authority,
- publication/effective date if relevant,
- URL,
- date verified.

Do not quote long statutory passages. Summarize and cite the relevant article/section when known.

## Mandatory references by audit area

- General site audit: `ecommerce-core.md`, `consumer-distance-sales.md`, `product-safety-online.md`, `advertising-claims.md`, `privacy-cookies.md`.
- Food: add `food.md`.
- Cosmetics: add `cosmetics.md`.
- Hemp: always add `hemp.md`; then route to food/cosmetics/etc.
- Essential oils/herbal teas: add `aromatherapy-herbal-tea.md` plus routed product module.
- Textile: add `textiles.md`.
- Cleaning/repellent/antimicrobial products: add `detergents-biocides.md`.
- PayTR: add `paytr.md`, but label it commercial-policy analysis.

## Regression tests

Before releasing a changed version of this skill, run `tests/compliance-test-cases.md`. The skill should not pass if a revision causes obvious category mistakes such as:
- treating hemp fibre textile as pharmacy-only,
- treating ordinary food herbal tea as medicinal tea solely because it contains herbs,
- treating every essential oil as aromatherapeutic,
- treating a body soap and laundry soap as the same regulatory category,
- treating missing non-public documents as proven absence,
- treating PayTR policy as Turkish law.
