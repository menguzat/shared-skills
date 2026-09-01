---
id: custom
displayName: Custom Prompt Wrapper
description: Wraps a user-supplied prompt in the shared provenance and output envelope.
expectedMediaTypes:
  - audio
  - video
  - image
  - text
outputSchemaId: custom
defaultModelTier: pro
formatter: generic
version: 1
---

Use the user-supplied custom prompt as the analysis instruction, but always return the shared output envelope.

Requirements:
- Preserve `metadata`, `analysis`, `transcription`, `evidence`, `openQuestions`, and `telemetry`.
- Include a faithful transcript when the source is audio or video unless the custom prompt explicitly excludes transcription.
- Keep claims source-grounded with timecodes or media references where possible.
- Mark uncertainty and missing evidence.
- Return only valid JSON matching the selected response schema.
