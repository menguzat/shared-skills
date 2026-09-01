---
name: transcribe-media
description: Transcribe, reconcile, or extract evidence-backed project, entity, relation, and opportunity intelligence from local audio/video recordings using the LYF.lab media analyzer. Use for interviews, meetings, voice memos, media evidence review, speaker identification, and the workspace conversation corpus.
---

# Transcribe Media Skill

Use the media analyzer package bundled inside this skill at `media-analyzer/`. It wraps Gemini media upload/inline handling, prompt files, JSON response schemas, Markdown formatting, transcript/text-only analysis, and SQLite telemetry.

The skill is self-contained: prompts live in `analysis-prompts/`, the CLI lives in `media-analyzer/`, runtime telemetry lives in `data/`, and the runtime `.env` belongs at the skill root.

## Workflow

1. Identify the input file path and the user’s desired outcome: faithful transcript, summary, meeting notes, scene/audio observations, topic extraction, translation, reconciliation, or custom schema extraction.
2. Inspect prompt availability unless the user explicitly names a style. The available prompt files are in this skill’s `analysis-prompts/` folder; use the CLI to list the active registry:

   ```bash
   cd .agents/skills/transcribe-media/media-analyzer
   npx tsx cli.ts list-prompts
   ```

3. Pick the narrowest prompt style:

   - `transcript-only`: faithful timecoded transcript or visual/audio observation with minimal interpretation.
   - `meeting-analysis`: general-purpose structured analysis for recordings with discussion, decisions, tasks, risks, money mentions, entities, themes, or follow-up questions. Use it for ordinary meetings, interviews, lectures, podcasts, research calls, and voice memos unless a narrower prompt fits.
   - `conversation-knowledge`: evidence-backed project, entity, relation, claim, decision, action, contradiction, and opportunity extraction from a certified canonical transcript. Until voice samples establish speaker identities, keep `people` empty and do not create person graph edges.
   - `oldskool-operational-analysis`: only for Oldskool planning conversations or when the user explicitly asks for that domain extraction. Run it on a completed transcript/text source, not directly on media.
   - `reconciliation-report`: compare multiple recordings, transcripts, summaries, analyses, or planning documents; separate evidence, conflicts, corrected assumptions, and revised plan.
   - `--prompt-file`: user-supplied prompt; add `--schema-file` when they require a custom JSON contract.

4. For media files, always produce the complete `transcript-only` artifact before analysis. Transcription uses Pro by default. The `transcribe` command automatically detects long media (over 15 minutes) and switches to 15-minute sequential excerpts to stay inside a reliable output budget. It combines them locally into one absolute timeline. A completed response containing a summary, representative excerpt, simulated output, or placeholder is incomplete and must not be treated as a successful full response. Full-media and per-excerpt content generation are each capped at two attempts.
   Runtime model policy is strict: only `gemini-3.1-pro-preview` and `gemini-flash-latest` are allowed. Live/realtime/native-audio models and other Gemini models are prohibited. `generateContentStream` may be used only to receive an ordinary model response incrementally; it is not the Live API.
5. The transcript quality gate must pass before media-derived analysis. It first measures source duration independently and validates complete canonical timecodes, boundaries, chronology, gaps, overlap, segment shape, and repetition. Fidelity verification uses Pro against the same media scope: full media for an unchunked candidate, or every sequential excerpt independently for a chunked candidate. Speaker attribution, minor substitutions, and local misinterpretations reduce the quality score but do not reject. Reject only critical discrepancies or major findings that materially change a decision, commitment, intent, important fact, or the overall discussion. A contradictory verifier claim such as “media was not provided” always fails. A rejected complete candidate may be regenerated using verifier findings only as an audit checklist; stream/parse failures still stop immediately. Each completed candidate is written immediately under `<media-directory>/.transcripts/<media-name>/`; every attempt is persisted in the media-local run directory.
6. Only a transcript that passes both gates is written as an immutable version under `<media-directory>/.transcripts/<media-name>/`. The manifest records source SHA-256, transcript fingerprint, prompt/model, supersession, and correction history. Never analyze `.analysis.rejected.*` or an uncertified legacy sidecar.
7. For analysis, run `analyze-transcript` on the canonical `.transcript.md` or `.transcript.json` with the selected analysis style. The command loads the certified JSON and ignores editable Markdown as evidence. Use `--source-kind text` only for notes/documents that are not claimed to be verified media transcripts. Unless the user explicitly asks for another language, write the analysis in the same language as the media/transcript.
   For workspace conversations, read `.conversations/catalog.json` and `.conversations/relationships.md` first. Use them only to resolve known aliases and candidate project/person context; transcript evidence remains authoritative. Do not paste the whole catalog into a model prompt.
   Include `conversation-knowledge` in the workflow for recordings stored in `.conversations/`. Before its first live run for a recording or batch, obtain explicit authorization to send the specified certified transcript content to Gemini. Without that authorization, rebuild the local catalog with filename/provenance hints and leave deep person/relation extraction pending.
8. Gate 3 binds every transcript-derived analysis to the source fingerprint and rejects unsupported decisions, tasks, owners, amounts, dates, legal/financial claims, oversized fields, and repeated passages. Use `--target-app oldskool` or `--target-app dpp` only when app drafts are requested; candidates must remain `propose`/`draft` records with transcript evidence.
9. Read the generated internal analysis JSON and published `<source>-analiz.md` before reporting completion.
10. A passed transcript-derived analysis must be published beside the source media as the single human-readable file `<source>-analiz.md`, containing both analysis and the complete certified transcript. Keep its structured JSON companion under `<media-directory>/.transcripts/<source>/published/`; never expose transcript snapshots, rejected candidates, raw responses, or JSON sidecars in the media directory.
11. Report canonical version/manifest paths, regression report, selected prompt id, all quality statuses, warnings, and unresolved verification gaps.
12. After a workspace conversation is moved into `.conversations/YYYY-MM-DD/`, rebuild the deterministic catalog with `node .conversations/build-catalog.mjs`. This refreshes search and graph data without retranscribing unchanged media.
13. To identify speakers in an existing canonical transcript, use `identify-speakers` with the current source audio path. It runs pyannote Community-1 diarization and SpeechBrain embeddings locally; it neither uploads audio nor calls Gemini. Install `requirements-speaker-attribution.txt` in Python 3.12 and set `HF_TOKEN` after accepting the pyannote model terms. It writes a fingerprint-bound sidecar beside the canonical transcript. Only assignments above both similarity thresholds are promoted to person/speaker graph edges; all others stay unknown or in review.

## Commands

```bash
cd .agents/skills/transcribe-media/media-analyzer

# Enroll speakers with role, gender, and optional reference voice sample audio
npx tsx cli.ts enroll-speaker "Mengü" --role "Kurucu/Altyapı" --gender "male" --audio /path/to/mengu_ref.wav
npx tsx cli.ts enroll-speaker "Cem" --role "Kurucu/Tasarım" --gender "male" --audio /path/to/cem_ref.wav
npx tsx cli.ts list-speakers

# Transcribe with speaker identification using enrolled profiles and voice samples
npx tsx cli.ts transcribe /path/to/media.mp3 --style transcript-only --speakers Mengü,Cem

# Or place three-second samples at data/speakers/<speaker_id>.wav; they are auto-discovered
npx tsx cli.ts transcribe /path/to/media.mp3 --style transcript-only

# Launch the interactive Conversation Intelligence React Studio
npx tsx cli.ts studio --port 3030

# Add speaker identities to an already certified transcript without retranscribing it.
# This runs only local pyannote diarization + local SpeechBrain reference matching.
npx tsx cli.ts identify-speakers /path/to/v0001.transcript.json --source-file /path/to/media.mp3

# User-authorized explicit long-media chunking (automatically happens for >15m files)
npx tsx cli.ts transcribe-chunked /path/to/media.mp3 --chunk-seconds 900

# Re-certify an existing candidate against the complete media
npx tsx cli.ts verify-transcript /path/to/candidate.transcript.json

# Supply the relocated media path when consolidation made the stored absolute path stale
npx tsx cli.ts verify-transcript /path/to/candidate.transcript.json --source-file /current/path/to/media.mp3

# Explicitly authorized sequential verification fallback
npx tsx cli.ts verify-transcript /path/to/candidate.transcript.json --chunk-seconds 900
```

Then analyze the completed transcript/text:

```bash
cd .agents/skills/transcribe-media/media-analyzer
npx tsx cli.ts analyze-transcript /path/to/.transcripts/media/v0001.transcript.md --style meeting-analysis

# Build the cached, evidence-backed project/entity/relation derivative
npx tsx cli.ts analyze-transcript /path/to/.transcripts/media/v0001.transcript.json --style conversation-knowledge

# Require evidence-grounded Oldskool draft candidates
npx tsx cli.ts analyze-transcript /path/to/.transcripts/media/v0001.transcript.json --style oldskool-operational-analysis --target-app oldskool
```

Analyze notes or another unverified text file without claiming media-transcript verification:

```bash
cd .agents/skills/transcribe-media/media-analyzer
npx tsx cli.ts analyze-transcript /path/to/notes.md --source-kind text --style meeting-analysis
```

Use a custom prompt:

```bash
cd .agents/skills/transcribe-media/media-analyzer
npx tsx cli.ts transcribe /path/to/media.mp3 --prompt-file /path/to/prompt.md
```

Use a custom prompt and Gemini response schema:

```bash
cd .agents/skills/transcribe-media/media-analyzer
npx tsx cli.ts transcribe /path/to/media.mp3 --prompt-file /path/to/prompt.md --schema-file /path/to/schema.json
```

## Environment

`GEMINI_API_KEY` must be set in the skill root `.env` for live analysis:

```bash
GEMINI_API_KEY=...
```

The CLI loads `.env` from the skill root first, then `media-analyzer/.env`, then the current working directory. Do not commit real secrets.

Canonical transcripts are versioned in the hidden media-state directory:

- `<media-directory>/.transcripts/<source>/v0001.transcript.md`
- `<media-directory>/.transcripts/<source>/v0001.transcript.json`
- `<media-directory>/.transcripts/<source>/manifest.json`

Current transcript state is retained internally:

- `.transcripts/<source>/snapshots/latest.transcript.md|json`: most recently completed candidate, accepted or rejected.
- `.transcripts/<source>/snapshots/rejected.transcript.md|json`: most recently rejected complete candidate.
- `.transcripts/<source>/snapshots/accepted.transcript.md|json`: most recently accepted transcript; rejection never overwrites this pointer.

Immutable transcript attempts and run status are retained under `<media-directory>/.transcripts/<source>/runs/<run-id>/`. Analysis attempts are retained under `<transcript-directory>/analyses/<style>/<run-id>/`.

Passed transcript-derived analyses use this layout:

- `<source>-analiz.md`: human-readable analysis followed by the complete certified transcript.
- `.transcripts/<source>/published/<source>-analiz.json`: structured analysis and complete certified `transcription` array in one internal envelope.
- `.transcripts/<source>/snapshots/`: accepted, rejected, and latest transcript pointers.
- `.transcripts/<source>/rejected/`: rejected outputs and raw model responses.

Telemetry is recorded in `data/telemetry.sqlite` inside the skill folder.

Speaker reference samples live in `data/speakers/`. A file named `<speaker_id>.wav` is usable without a JSON profile; an enrolled `<speaker_id>.json` adds the display name and role while reusing the matching WAV. Reference audio is a clue, not proof: uncertain matches must keep a generic speaker label and be surfaced for review.

`conversation-knowledge` uses the fast model tier and a cache key made from the certified transcript fingerprint plus prompt hash. Reuse that derivative when both are unchanged. The canonical transcript remains immutable and continues to use the transcription/fidelity model policy above.

## Output Contract

The tool writes a Markdown report and JSON sidecar using this envelope:

- `metadata`: source file, generated time, model, analysis style, language, duration, warnings.
- `metadata.transcriptQuality`: independent source duration, gate checks, timeline coverage, segment count, fingerprint, and passed/failed status for media transcripts.
- `analysis`: style-specific structure.
- `transcription`: timecoded segments with speaker labels, confidence, content, and notes.
- `evidence`: source-grounded claims with timecodes and confidence.
- `openQuestions`: unresolved questions or missing verification.
- `telemetry`: prompt/schema/model timing and parse details.

Always treat `metadata.warnings`, `openQuestions`, and low-confidence speaker labels as part of the answer, not noise.

## Reference Loading

Load only the reference needed for the task:

- For examples of good output shape, timecoded evidence, and style selection: read `references/examples.md`.
- To inspect or add prompt text, use the files in `analysis-prompts/`.
- For general transcription and analysis pitfalls: read `references/pitfalls.md`.
- For transcript certification and downstream analysis quality boundaries: read `references/quality-gates.md`.
- For Oldskool-specific domain interpretation, read `references/oldskool.md` only when the recording or user request is explicitly about that domain.

## Pitfalls

- Do not invent speaker names. Use stable labels unless the media makes names clear.
- Do not translate unless asked. Preserve source language by default.
- Do not switch analysis language unless asked. If the media/transcript is Turkish, the analysis should be Turkish; if it is English, the analysis should be English.
- Do not over-analyze when the user asked for a transcript only.
- Do not treat spoken numbers, dates, legal/medical/financial statements, or commitments as verified facts. Mark them as claims from the recording unless separately verified.
- Do not collapse different speakers, organizations, locations, or roles into one actor.
- Do not treat filename person names as speaker proof. Catalog them as `name_hint` until transcript or reviewed voice evidence supports promotion.
- Do not skip reading the output. The CLI can succeed while warning that output is truncated, silent, visually-only, or missing expected analysis fields.
- Do not overwrite a user’s existing analysis file without noticing that the output path is adjacent to the source and deterministic.
- If a response stream fails, reaches `MAX_TOKENS`, or produces malformed structured output, stop. Persist the partial raw response and report the last complete timecode; do not silently start another response stream.
- Do not paste secrets from `.env` or telemetry into the response.
