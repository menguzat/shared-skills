# PayTR Readiness — Commercial Policy, Not Legislation

## Sources

- `PAYTR-APPLICATION`
- `PAYTR-CONDITIONS`
- `PAYTR-RISK-SECTORS`

## Separation rule

Never write “illegal because PayTR rejects it.”
Use:
- `LEGAL_COMPLIANCE`: based on law;
- `PAYTR_READINESS`: based on PayTR commercial/onboarding policy.

## Current application checks

PayTR’s 2026 application page states that applications involve commercial identity verification and documents such as, depending on entity type:
- identity documents,
- trade registry/company registration information,
- tax information/levha,
- signature circular/declaration,
- bank/IBAN confirmation,
- business/sector information.

The same page says a ready website, SSL and legal texts such as distance-sales and return conditions support review, and that products/services should have required sector documents/licences.

PayTR conditions list excluded/high-risk categories such as prescribed medicines/drugs, alcohol, tobacco and other categories in its policy. Always re-check the live list before an audit.

## Site readiness checklist

- active, usable site,
- product catalogue consistent with declared activity,
- SSL,
- clear business identity,
- distance-sales/pre-information content,
- return/refund policy,
- delivery terms,
- sector licences/documents ready for regulated products,
- no pharmacy-only or prohibited-policy products in ordinary checkout.

## Finding examples

- lawful ordinary food with required operator documents ready -> `PASS_VISIBLE` legally; PayTR may still ask documents but not necessarily a risk.
- pharmacy-only regulated hemp personal-care product in normal checkout -> legal `PHARMACY_ONLY`, and PayTR `PAYTR_RISK`.
- product is lawful but licence cannot be supplied during underwriting -> `PAYTR_RISK` / blocker for onboarding, separate from legal sale analysis.
