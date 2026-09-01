# AI-call accounting

Track only AI activity initiated or observed by the publication workflow. Do not
mix local Chromium, PDF, filesystem, HTTP, storage, or human-review costs into
this ledger.

## Measurement types

- `exact`: one known provider call, such as an image-generation attempt.
- `aggregate`: one task whose provider may have used several internal calls,
  such as a completed subagent assignment.
- `observable`: one workflow boundary visible to the agent, such as a
  skill-active user turn. It is not claimed to equal a backend request.

Keep these categories separate in pricing and reporting. Never present
`observable` or `aggregate` counts as exact API-call counts.

## Recording

Record an event immediately after its result is known:

```sh
node <skill>/scripts/record-ai-call.mjs \
  --config /absolute/path/to/publication.json \
  --operation image-generation \
  --measurement exact \
  --provider provider-name \
  --model model-name \
  --request-id provider-request-id \
  --images 1 \
  --status succeeded \
  --disposition accepted \
  --input-tokens 120 \
  --output-tokens 40 \
  --cost-usd 0.04 \
  --pricing-ref provider-rate-2026-07
```

Supported operations are `agent-turn`, `vision-call`, `subagent-task`,
`image-generation`, `image-edit`, and `other-ai`. Use a stable `--call-id` when
retrying the recorder; duplicate IDs are rejected. Record rejected and failed
image attempts because they may still be billable.

For a main agent turn whose provider usage is hidden, use:

```sh
node <skill>/scripts/record-ai-call.mjs \
  --config /absolute/path/to/publication.json \
  --operation agent-turn \
  --provider codex-host \
  --model unknown \
  --status succeeded
```

This produces an `observable` event with null usage and cost. Do not convert it
to an exact call later unless provider evidence proves that mapping.

## Summaries

```sh
node <skill>/scripts/summarize-ai-usage.mjs \
  --config /absolute/path/to/publication.json
```

The summary reports counts by operation, measurement, status, and
provider/model; token coverage; image count; priced and unpriced events; total
known USD cost; and the ledger checksum. Missing values remain visible through
coverage counts and never become fabricated zero-usage claims.

The ledger is append-only. Do not store prompts, source copy, credentials,
personal data, or hidden reasoning. Correct a bad event by adding a documented
replacement event in a future schema rather than silently rewriting released
accounting evidence.
