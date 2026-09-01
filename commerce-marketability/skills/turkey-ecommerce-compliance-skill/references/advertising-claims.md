# Advertising, Claims, Discounts and Reviews

## Main sources

- 6502, especially advertising/unfair-commercial-practice provisions.
- Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği.
- `TR-ADS-2026` — amendments effective 01.08.2026.
- `TR-GREEN-CLAIMS` — environmental-claims guide.

## Claim scanner

Scan product names, categories, banners, descriptions, metadata, FAQs, blogs, reviews and influencer content for explicit and implied claims.

### Medical / health triggers
Examples requiring routed legal review:
- treats, prevents, cures, relieves disease;
- “anti-inflammatory” when used as a disease/physiological treatment claim;
- “boosts immunity”, “detoxes liver”, “balances hormones”;
- “helps insomnia/anxiety”;
- “kills 99.9% of bacteria” or “repels mosquitoes” where this may trigger biocidal regulation.

Do not fix a prohibited claim by euphemism if the overall message remains the same.

### Environmental claims
The official guide states that broad expressions such as “green”, “sustainable”, “eco”, “nature-friendly”, “environmentally friendly”, “zero waste”, “carbon neutral” and similar general concepts should not be used without explanation or in a way that creates ambiguity about the actual environmental effect.

Audit:
- scope of claim,
- lifecycle stage,
- measurement method,
- substantiation,
- certification basis,
- whether the claim applies to whole product or one component/packaging element.

`100% sustainable hemp` -> normally `CLAIM_EVIDENCE_REQUIRED` unless scope/method/certificate are clear.

### Organic claims
“Natural”, “village-made”, “pure”, “traditional” and similar descriptions are not equivalent to certified organic status. If the product is marketed as organic, request applicable certification and labeling evidence. See `TR-ORGANIC`.

### Discount claims
Under the advertising-rule changes effective 01.08.2026, current discount-reference rules must be checked using the applicable historical-price period. The Ministry’s 27.07.2026 announcement states that the reference price for discount advertising is the lowest price in the ten days before the discount begins.

If the auditor has no price history:
- do not assert compliance;
- output `DOCUMENT_REQUIRED` or `VERIFY_PRICE_HISTORY` in reasoning, with finding status `DOCUMENT_REQUIRED`.

### Reviews
The 2026 amendments include new review criteria. The Ministry states that consumer reviews imported from channels where purchase verification is not possible cannot be published as consumer reviews under the new rule.

Audit:
- whether “verified purchase” is genuine,
- source of imported reviews,
- whether unrelated/spam reviews exist,
- whether seller/product/delivery reviews are clearly distinguished where presented separately,
- whether material negative reviews appear to be selectively suppressed,
- health endorsements or professional titles used deceptively.

Spam or unrelated review content may be `LIKELY_VIOLATION` / `high` where it materially misleads consumers, and at minimum a review-integrity finding.

### Scarcity / urgency
Flag unsupported “last 2”, fake countdowns, perpetual “today only”, or unavailable stock-pressure statements as potentially misleading commercial practices.
