# KVKK, Privacy and Cookies

## Main sources

- 6698 sayılı Kişisel Verilerin Korunması Kanunu.
- `TR-KVKK-COOKIE-229`: KVKK Board decision 10.03.2022, No. 2022/229.
- Current KVKK cookie guidance and Board decisions should be re-verified at audit time.

## Audit layers

### 1. Notice layer
Check for:
- privacy/illumination notice,
- controller identity,
- processing purposes,
- legal bases where described,
- recipients/transfers,
- data-subject rights and application route,
- cookie categories and purposes.

### 2. Consent layer
For cookies/tracking requiring consent, inspect whether consent is genuinely optional and informed.

Red flags:
- advertising/analytics cookies active before consent where consent is relied on;
- “accept” prominent with no equivalent reject path where required;
- pre-ticked optional categories;
- bundled marketing consent as condition of purchase without valid basis;
- consent withdrawal materially harder than giving consent.

### 3. Technical behavior
When browser/network tools are available:
1. open fresh session;
2. do not interact with banner;
3. inspect Google Analytics, Google Ads, Meta, TikTok, Hotjar and other trackers;
4. reject optional cookies;
5. verify that relevant trackers remain blocked or are removed;
6. accept and verify expected state change.

A written cookie policy is not proof of compliant runtime behavior.

## Status guidance

- policy missing -> `INFO_MISSING`;
- optional ad tracker fires before consent in a context where consent is required -> `LIKELY_VIOLATION`, normally high;
- purpose/legal-basis ambiguity requiring controller facts -> `HUMAN_REVIEW_REQUIRED`.
