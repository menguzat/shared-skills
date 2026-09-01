# General Examples And Output Patterns

Use these examples to choose prompts and evaluate outputs.

## Prompt Selection Examples

- User asks: "transcribe this MP3 faithfully" -> `transcript-only`.
- User asks: "summarize this interview and pull out themes" -> first `transcript-only`, then `analyze-transcript <transcript> --style meeting-analysis`.
- User asks: "turn this voice memo into tasks, risks, and open questions" -> first `transcript-only`, then `analyze-transcript <transcript> --style meeting-analysis`.
- User asks: "analyze this lecture/podcast and extract concepts, entities, and unresolved questions" -> first `transcript-only`, then `analyze-transcript <transcript> --style meeting-analysis`.
- User asks: "describe what happens in this silent video" -> `transcript-only` with an extra visual-observation instruction, or `meeting-analysis` if the user wants interpretation.
- User asks: "compare this transcript with the previous summary and correct it" -> `reconciliation-report`.
- User gives an existing transcript or notes file and asks for analysis only -> `analyze-transcript <file> --style meeting-analysis`.
- User asks: "analyze this Oldskool conversation for runway, legal issues, founder economics, proof calendar" -> first `transcript-only`, then `analyze-transcript <transcript> --style oldskool-operational-analysis` and read `oldskool.md`.
- User supplies a domain-specific extraction contract -> `--prompt-file`; add `--schema-file` when there is a JSON schema.

## Existing Output Patterns

Transcript-only intermediate output:

- `.transcripts/<source>/v0001.transcript.md`
- Pattern: source metadata, warnings, language evidence, timecoded source-language transcript, and internal JSON.
- Never expose transcript-only, smoke-test, or deliberately truncated output beside the source media.

Generated visual/video output:

- `apps/lyflab-web-new/public/assets/conn_1.analysis.md`
- Pattern: no spoken transcript, `Visual` as speaker label, evidence claims for visual transitions, `language: zxx`.
- Use this pattern when video has no dialogue but still contains visual information worth timecoding.

Domain-specific Oldskool examples:

- `oldskool/conversations/2026-06-25-cem-mengu-2.md`
- `oldskool/conversations/2026-06-25-cem-mengu-2-reconciliation-report.md`
- Pattern: Turkish source transcript, structured operational sections, explicit timecode references, and a separate interpretation rule for budget/legal claims. Use these only as domain examples, not as the default skill behavior.

## Reporting Completion

After running the CLI, report:

- Published Markdown path.
- Internal JSON path when operationally useful.
- Prompt id/style.
- Any warnings or open questions.
- Whether the output is full or intentionally truncated.

Example:

```text
Generated the visible `.../recording-analiz.md` and internal `.transcripts/recording/published/recording-analiz.json` using `meeting-analysis`.
Warnings: speaker labels are inferred; two sections have overlapping speech.
Open questions: one referenced date and one organization name need external verification.
```
