# Transcript-First Quality Framework

Every media-derived workflow begins with one canonical, certified transcript. Analysis is downstream interpretation and must never be used to repair, replace, or silently extend the transcript.

## Stage 0: Source Identity

The source media is the authority for duration and content.

- Keep the original media path and Gemini File API cache identity.
- Measure duration independently with `ffprobe`; never trust model-provided duration.
- Preserve one absolute media timeline. In a user-authorized chunk fallback, excerpt-relative timecodes are converted locally with manifest offsets before the merged candidate is evaluated.
- Do not split media unless the user explicitly authorizes chunk fallback or output.

## Stage 1: Transcript Candidate

Generate only `transcript-only` output from media. A candidate is not canonical yet.

- Use canonical absolute `HH:MM:SS` or `HH:MM:SS.sss` start and end timecodes for every segment.
- Represent meaningful silence, inaudible spans, background-only spans, and non-speech instead of leaving unexplained timeline gaps.
- Preserve the source language.
- Use stable anonymous speaker labels until identity is supported by the media or confirmed by a person.

## Gate 1: Structural Completeness

Implemented in `transcriptQuality.ts`.

The gate independently checks:

- timed-media MIME and measurable source duration;
- non-empty segments and required end timecodes;
- canonical, in-bounds, chronological ranges;
- beginning and end coverage;
- unexplained internal gaps and excessive overlap;
- oversized or implausibly dense segments;
- repeated long transcript blocks.

Failure writes rejected Markdown and JSON under `.transcripts/<source>/rejected/`, records the failed checks, exits non-zero, and does not update the published `<source>-analiz.md`.

## Gate 2: Semantic Fidelity

Implemented in `transcriptVerifier.ts`.

Only structurally complete candidates proceed to an independent Pro comparison. Unchunked candidates use the full media. Chunked candidates verify every complete sequential excerpt independently, offset discrepancy timecodes back to the absolute timeline, and require all excerpt reports to pass. The verifier reports concrete discrepancies:

- missing source content;
- meaning-changing words, names, numbers, dates, negation, or commitments;
- invented transcript content;
- incorrect stable speaker attribution;
- incorrect source language representation.

Fidelity discrepancies reduce a 0-100 quality score. Speaker attribution errors never reject a structurally complete transcript. Minor substitutions and local interpretation errors may pass. Rejection is reserved for critical discrepancies and major findings marked as materially changing a decision, commitment, intent, negation, important name/number/date, or the overall meaning of the discussion. A passed transcript receives a SHA-256 fingerprint over its ordered segments.

Verifier output is checked semantically as well as structurally. Claims that media/audio/video was missing or inaccessible reject the report even when `reviewedEntireMedia` or `status` claims success.

By default the CLI allows two complete transcript-generation attempts. A failed attempt is stored unchanged. Its structural and fidelity findings may be supplied to the next attempt only as an audit checklist; the next candidate must be regenerated from the complete media. The policy is bounded at three attempts and never applies edits from the verifier directly.

## Canonical Transcript Boundary

Only a transcript with both gates passed is canonical.

Canonical outputs are immutable versions under the media directory's `.transcripts/<media-name>/` folder. `manifest.json` binds each version to the source-media SHA-256, size, mtime, measured duration, prompt hash, model, transcript fingerprint, and optional correction/supersession reason. An identical fingerprint reuses the existing version; changed content creates a new version.

`analyze-transcript` loads the certified JSON sidecar, validates segment count and fingerprint, and constructs analysis input from those segments. It ignores editable Markdown content. Notes and ordinary documents remain supported only through explicit `--source-kind text`; they are not represented as verified media transcripts.

## Stage 2: Purpose-Specific Analysis

Each analysis is a separate derivative of the same canonical transcript. Analysis contracts record:

- source transcript fingerprint;
- analysis purpose and prompt version;
- target app namespace and candidate resource types;
- source segment references for every important claim;
- modality such as observation, proposal, decision, commitment, disagreement, assumption, or analyst recommendation;
- entity-resolution status rather than unverified string ownership;
- review state and supersession links.

Oldskool operational extraction, DPP production extraction, general meeting synthesis, reconciliation, and community summaries must remain separate derivatives. App context may help map entities, prevent duplicate records, and select relevant resource schemas, but it must not contaminate or rewrite the canonical transcript.

## Gate 3: Analysis And App Readiness

Implemented in `analysisQuality.ts`. Before an analysis can be accepted or create app drafts, it must prove:

- every decision, task, amount, date, owner, and legal/financial claim has segment evidence;
- proposals and analyst recommendations are not presented as commitments;
- app resource candidates satisfy the target schema;
- writes remain reviewable drafts until explicit confirmation;
- sensitive visibility and community correction rules are preserved.

Each derivative stores `analysis-provenance-v1` with source transcript fingerprint, canonical sidecar, source media, purpose, prompt id/hash, and optional target app. Important claims carry one explicit modality: observation, proposal, decision, commitment, disagreement, assumption, or analyst recommendation.

When a target app is requested, `resourceCandidates` must use operation `propose`, review state `draft`, and valid certified transcript timecodes. Gate 3 rejects direct-write operations.

## Persistent Regression Runs

Real media is registered in `regression/fixtures/manifest.json` without duplicating large binaries. Every live transcript attempt, final status, fixture expectation, and output path is retained under `data/regression-runs/<fixture-id>/<run-id>/`; `latest.json` points to the newest result.

Community corrections should create a new transcript or analysis version linked to the prior fingerprint. They must never silently mutate certified evidence.
