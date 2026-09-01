# Turkey E-Commerce Compliance Skill Package

This folder contains an agent skill for auditing Turkey-facing e-commerce websites, especially natural-product and hemp-oriented stores.

## Structure

- `SKILL.md` — operational agent instructions.
- `references/` — current legal/policy modules and source registry.
- `schemas/` — structured finding and product-classification schemas.
- `examples/` — sample findings and gray-zone analyses.
- `tests/` — regression cases.

## Design principle

The package separates **law**, **visible website evidence**, **non-public documents**, **classification uncertainty**, and **payment-provider policy**. A missing public reference to a technical file is not proof the file does not exist; a product with a required licence is not automatically non-compliant if the site does not display the licence unless display is legally required.

## Currency

Initial source review date: **2026-08-07**.

High-volatility modules should be re-verified at each material audit: advertising rules, hemp-derived products, aromatherapeutic products, medicinal herbal teas, food-label transition rules, online product-safety rules and PayTR policies.

## Intended use

Use this package as an audit/triage tool. It is not a legal opinion and should escalate genuine classification gray zones to qualified counsel or the competent authority.
