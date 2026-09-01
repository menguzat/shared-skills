# General Transcription And Analysis Pitfalls

Use this reference for all recording types: interviews, meetings, lectures, voice memos, podcasts, field recordings, and videos.

## Fidelity First

- Preserve the source language unless the user asks for translation.
- Do not clean up meaning so aggressively that hedging, disagreement, uncertainty, or false starts disappear.
- Keep timestamps granular enough for a user to find the original moment.
- Use stable speaker labels (`Speaker 1`, `Speaker 2`) when names are unclear.
- Put overlapping speech, inaudible sections, background noise, silence, visual-only segments, and uncertain names in warnings or segment notes.

## Analysis Boundaries

- Transcript content is source evidence; summaries and conclusions are interpretation.
- Spoken numbers, dates, prices, medical/legal/financial statements, promises, and action commitments are claims from the recording, not verified facts.
- If the user asks for transcript-only, keep analysis minimal.
- If the user asks for analysis, tie important claims to timecodes.
- If the recording is silent or visual-only, use visual observations with timecodes rather than inventing dialogue.
- If analyzing an existing transcript/text file, use `analyze-transcript`; do not run the media upload path.

## Common Corrections

Speaker identity:

- Weak: "Cem said..." when no name is audible.
- Better: "`Speaker 1` appears to lead the discussion; name not verified in the recording."

Numbers:

- Weak: "The project costs 50,000."
- Better: "A speaker states a 50,000 cost figure at `00:12:31`; currency and verification source are not established in the recording."

Translation:

- Weak: translate all Turkish audio into English by default.
- Better: preserve Turkish transcript; add English analysis only if requested.

Visual media:

- Weak: "No transcript, so no useful output."
- Better: timecode visible scene changes, on-screen text, gestures, slides, or other observable evidence.

## Reporting Checklist

Before final response:

- Read the generated Markdown.
- Mention warnings and open questions.
- Say whether output is full, sampled, truncated, silent, or visual-only.
- Provide both Markdown and JSON paths.
- Avoid exposing `.env` values, telemetry internals beyond ordinary model/prompt metadata, or unrelated local files.
