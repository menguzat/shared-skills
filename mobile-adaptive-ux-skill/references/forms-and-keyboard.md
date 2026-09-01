# Forms and Virtual Keyboard

## Field inventory first

Before changing layout, classify each field:
- required for the transaction
- required only in a particular branch
- derivable from existing data
- optional but useful
- unnecessary legacy field

Reducing fields usually has more value than cosmetically splitting the same burden into many screens.

## Semantic input

Use the correct data semantics:
- `type="email"` for email
- `type="tel"` for telephone
- `type="url"` for URLs
- `inputmode="numeric"` for numeric keypad hints when the underlying value is not semantically a number (e.g. some codes)
- correct `autocomplete` tokens for known personal/payment/address fields

Do not use `type="number"` for arbitrary digit strings that can contain leading zeros or are not mathematically numeric.

## Labels

- use persistent labels
- placeholder may provide an example, not the only label
- connect help/error text semantically
- keep required/optional status consistent

## Compact layout

Default to one column.

Side-by-side fields are acceptable when their relationship is obvious and widths remain comfortable, e.g. month/year or city/postal code in some contexts. Validate at 320px.

## Keyboard visibility

Test:
- first field near top
- field near bottom
- sticky CTA with keyboard open
- autocomplete suggestions
- validation error expansion

The focused field and the action needed to proceed must not become inaccessible under the software keyboard.

## Multi-step forms

Use when steps reflect meaningful cognitive groups, not merely to make the screen look shorter.

Requirements:
- progress/context
- Back does not unexpectedly discard values
- refresh/re-entry behavior is defined
- errors do not trap the user on another step without explanation

## Error handling

On submit:
1. provide a clear summary when useful
2. move focus to the first relevant error or summary according to the form architecture
3. place error text next to the field
4. preserve valid input
5. use programmatic relationships and status semantics
