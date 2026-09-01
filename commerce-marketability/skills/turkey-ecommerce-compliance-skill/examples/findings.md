# Example Findings

## Example 1 — Missing online product information

```yaml
finding_id: OPS-001
url: https://example.com/product/abc
product: "Imported textile accessory"
status: INFO_MISSING
severity: medium
confidence: high
finding_type: ONLINE_PRODUCT_INFORMATION
observed: "Product page identifies brand and model but no importer/responsible economic-operator contact information is visible."
legal_basis:
  - source_id: TR-PRODUCT-ONLINE
reason: "The online-offer rules require applicable economic-operator/product-safety information to be available in the distance offer."
evidence_that_could_change_result:
  - "Proof that the relevant product/category is exempt from the cited disclosure"
recommended_action: "Add the applicable manufacturer/importer/responsible-operator information to the online offer."
```

## Example 2 — Cosmetic document not public

```yaml
finding_id: COS-017
url: https://example.com/hemp-shampoo
product: "Hemp Seed Oil Shampoo"
status: DOCUMENT_REQUIRED
severity: high
confidence: high
finding_type: NON_PUBLIC_COMPLIANCE_FILE
observed: "The page identifies a cosmetic shampoo. Safety report/PIF evidence was not supplied to the auditor."
legal_basis:
  - source_id: TR-COSMETIC
reason: "Cosmetics require the relevant safety/product-information documentation, but these files are not necessarily public webpage disclosures."
recommended_action: "Request Product Information File, Cosmetic Product Safety Report, notification evidence and claim substantiation."
```

## Example 3 — Pharmacy-only hemp product

```yaml
finding_id: HEMP-034
url: https://example.com/cbd-cream
product: "CBD Personal Care Cream"
status: PHARMACY_ONLY
severity: blocker
confidence: high
finding_type: SALES_CHANNEL
observed: "INCI/technical file states cannabidiol and product is marketed for personal care."
legal_basis:
  - source_id: TR-HEMP-2026
    article: "4, 24, 34"
reason: "The product facts place it within the regulation's cannabinoid-containing hemp personal-care category; Article 34 restricts products within scope to pharmacy sale."
recommended_action: "Remove from ordinary e-commerce checkout; manage under the legally permitted pharmacy channel."
```

## Example 4 — Environmental claim

```yaml
finding_id: ADS-GREEN-008
url: https://example.com/hemp-tote
product: "Hemp Tote"
status: CLAIM_EVIDENCE_REQUIRED
severity: medium
confidence: high
finding_type: ENVIRONMENTAL_CLAIM
observed: "Banner states '100% sustainable'. No scope, methodology or substantiation is provided."
legal_basis:
  - source_id: TR-GREEN-CLAIMS
recommended_action: "Replace with a specific, substantiated claim or provide clear scope/method/evidence."
```
