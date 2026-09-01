# Compliance Regression Test Cases

Each test contains input facts and the minimum acceptable routing/result. The agent may add findings but must not contradict the expected core outcome.

## T01 — Hemp hearts
Input: `Soyulmuş Kenevir Tohumu / Hemp Hearts 200 g`, ordinary food, no cannabinoid extract, no health claim.
Expected: `FOOD`; do **not** mark pharmacy-only merely due to hemp wording. Request food documentation/analysis as appropriate.

## T02 — CBD cream
Input: cosmetic cream, INCI explicitly contains cannabidiol, personal-care use.
Expected: special hemp review; if within 2026 definition, `PHARMACY_ONLY` blocker for ordinary e-commerce.

## T03 — Hemp textile
Input: tote, 55% hemp / 45% cotton.
Expected: `TEXTILE`; no pharmacy-only finding. Verify fibre-composition claim.

## T04 — Neutral essential oil room fragrance
Input: eucalyptus essential oil sold only for room-fragrance device; no health/cosmetic/food use.
Expected: do not automatically classify as aromatherapeutic; route to room-fragrance/chemical/general product rules.

## T05 — Therapeutic essential oil
Input: “helps anxiety and sleep; inhale 3 drops nightly”.
Expected: aromatherapeutic/health classification trigger; high/blocker depending on documented product status.

## T06 — Ordinary herbal tea
Input: lemongrass fruit tea, ingredient list and brewing instructions, no health effect.
Expected: `FOOD`, not medicinal herbal tea.

## T07 — Medicinal herbal tea
Input: pharmacopoeial tea marketed for therapeutic effect and identified as medicinal herbal tea.
Expected: `MEDICINAL_HERBAL_TEA`, pharmacy-channel review/`PHARMACY_ONLY` according to current regulation.

## T08 — Body soap
Input: olive-oil soap for hands/body, no antimicrobial claim.
Expected: cosmetic route.

## T09 — Laundry soap
Input: olive-oil soap for laundry and stain cleaning.
Expected: detergent/cleaning route, not cosmetic merely because same base material.

## T10 — Mosquito-repellent spray
Input: citronella/eucalyptus spray, “repels mosquitoes for 4 hours”.
Expected: biocide trigger; request authorization/registration evidence.

## T11 — Environmental claim
Input: “100% sustainable hemp fabric” with no explanation.
Expected: `CLAIM_EVIDENCE_REQUIRED` under green-claims guidance.

## T12 — Organic claim
Input: “certified organic olive oil”; certificate not supplied.
Expected: `DOCUMENT_REQUIRED`; do not assume certificate absent, but verify applicable certification and label.

## T13 — Cookie banner
Input: Meta Pixel and Google Ads fire on first load before any choice; banner offers accept/reject.
Expected: high privacy/cookie finding; written banner alone does not cure pre-consent tracking where consent is required.

## T14 — Discount history unknown
Input: “999 TL → 499 TL, 50% off”, no historical-price evidence available.
Expected: `DOCUMENT_REQUIRED` for price-history verification; do not declare compliant.

## T15 — Imported unverified reviews
Input: site displays 500 reviews imported from a social channel where purchase cannot be verified.
Expected: review-integrity/high finding under current advertising rules.

## T16 — PIF not visible
Input: compliant-looking cosmetic page; no PIF downloadable.
Expected: do **not** mark violation solely because PIF is not public. Request document.

## T17 — PayTR versus law
Input: lawful product but PayTR policy requires extra underwriting documents.
Expected: legal result and `PAYTR_RISK` kept separate.

## T18 — Pharmacy-only product with claims removed
Input: product documentation establishes that item is within the 2026 hemp personal-care regulation; website has no medical claims.
Expected: still `PHARMACY_ONLY`; do not propose claim deletion as workaround.

## T19 — Spam review
Input: review on olive oil contains cryptocurrency promotion and no product experience.
Expected: review-integrity finding and removal recommendation.

## T20 — Bundle
Input: gift set contains ordinary tea + cosmetic cream + pharmacy-only regulated hemp personal-care product.
Expected: audit each component; ordinary e-commerce sale of whole set blocked by pharmacy-only component.
