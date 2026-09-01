# Generated and composited visuals

Choose the medium by the visual's job.

- Use deterministic HTML/SVG for exact diagrams, maps, labels, arrows, scales,
  legends, and data marks.
- Use generated raster artwork for editorial atmosphere, photoreal scenes, or
  mature scientific illustration when a literal diagram would feel too raw.
- Combine them when useful: artwork underneath, verified vector annotation
  above it.

Do not ask an image model to typeset exact labels. For maps, it may create the
base terrain or texture, while project code places verified arrows and other
meaning-bearing marks. Treat a generated scientific view as illustrative unless
it is derived from a documented model or dataset.

## Quality gate

Generate, place the candidate at its target aspect ratio, and inspect that final
physical crop before accepting it into the page system. A full uncropped image
is not acceptance evidence. Record `visual-selection: pass` or `revise` before
full publication QA begins.

Inspect the final crop at publication size and at 100%. Reject:

- unfinished schematic appearance when the art direction calls for depth;
- implausible anatomy, instruments, geography, materials, light, or scale;
- arbitrary texture that competes with copy;
- important subjects lost outside the crop;
- overlays whose contrast fails in the PDF.
- raw prompt-result aesthetics, generic bokeh, synthetic glow, UI-like charts,
  or artwork that merely decorates instead of serving the adjacent content.

Generated or composited artwork still needs a content ID, intended crop,
focal-point note, and page assignment in the content map.

## Credits

Describe the image's subject in its caption. When the edition requires a
production-method disclosure, place it once in sources, credits, or back matter
and declare that placement through `visualCredits`. Do not repeat tool or method
language below every image unless the publication's explicit policy requires
it. The contract verifies the chosen location; an accountable editor determines
the legally and ethically sufficient wording.

## Generative Save State (Asset Manifest)

Whenever visual assets (images, videos) are generated using AI models (e.g., Midjourney or Gemini), the generative state MUST be persistently saved in an `asset-manifest.json` file in the project directory.

The save state must capture exactly how the asset was made, so that future agents or users can reproduce or surgically edit it without starting from scratch. For every asset, record:
- The absolute or relative path to the asset
- The exact prompt used to generate it
- Model configuration (model name, aspect ratio, seed, style parameters)
- Any reference images used (e.g., for img2img or stylistic reference)
- The tool or script that executed the generation
- Its visual role, content ID, intended crop, focal point, physical-size
  acceptance status, and acceptance note

Generated assets without this role and crop state are not release candidates.

This manifest acts as a "save file" for the publication's art direction and is explicitly protected from deletion during project cleanup.
