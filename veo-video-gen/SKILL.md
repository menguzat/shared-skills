---
name: veo-video-gen
description: >
  Generate videos using Google's Veo 3.1 API via the google-genai Python SDK.
  Covers text-to-video, image-to-video, video extension, reference images,
  first/last frame interpolation, aspect ratios, resolutions, and prompt engineering.
  Use when user wants to generate video clips, animate images, extend videos,
  or build video generation pipelines with the Gemini API.
---

# Veo 3.1 Video Generation Skill

> [!NOTE]
> For a detailed reference guide on using Veo 3.1, including JavaScript, Go, Java, and REST code samples, see the companion [reference.md](reference.md).

## Prerequisites

```bash
pip install google-genai pillow
```

Set `GEMINI_API_KEY` environment variable or pass it to the client constructor.

---

## Model Variants

| Model | Code | Speed | Audio | Extension | Ref Images | Max Resolution |
|-------|------|-------|-------|-----------|------------|----------------|
| **Veo 3.1** | `veo-3.1-generate-preview` | Standard | ✅ Native | ✅ | ✅ (up to 3) | 4k |
| **Veo 3.1 Fast** | `veo-3.1-fast-generate-preview` | Fast | ✅ Native | ✅ | ✅ (up to 3) | 4k |
| **Veo 3.1 Lite** | `veo-3.1-lite-generate-preview` | Fastest | ✅ Native | ❌ | ❌ | 1080p |
| **Veo 3** | `veo-3.0-generate-001` | Standard | ✅ Native | ❌ | ❌ | 4k |
| **Veo 3 Fast** | `veo-3.0-fast-generate-001` | Fast | ✅ Native | ❌ | ❌ | 4k |
| **Veo 2** | `veo-2.0-generate-001` | Standard | ❌ Silent | ❌ | ❌ | 720p |

---

## CRITICAL: Image Input Format

> **The `image` parameter on `generate_videos()` MUST be a `types.Image` object, NOT a PIL Image.**
>
> Passing a raw PIL Image causes: `400 INVALID_ARGUMENT: Input instance with 'image' should contain both 'bytesBase64Encoded' and 'mimeType'`

### Correct way to load an image for Veo:

```python
from google.genai import types
import base64

# Option A: Load from file path (recommended)
def load_image_for_veo(image_path: str) -> types.Image:
    """Load an image file as a types.Image for Veo API."""
    import mimetypes
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        mime_type = "image/png"
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    return types.Image(
        image_bytes=image_bytes,
        mime_type=mime_type,
    )

# Option B: From a Gemini-generated image (e.g., from Imagen/Nano Banana)
# result.parts[0].as_image() already returns a types.Image — use it directly
image = result.parts[0].as_image()
```

### WRONG — Do NOT do this:

```python
from PIL import Image
start_img = Image.open("start.png")
# ❌ This will fail with INVALID_ARGUMENT
operation = client.models.generate_videos(image=start_img, ...)
```

---

## 1. Text-to-Video (Simplest)

```python
import time
from google import genai
from google.genai import types

client = genai.Client()

operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="A close up of two people staring at a cryptic drawing on a wall, torchlight flickering.",
)

# Poll until done
while not operation.done:
    print("Waiting for video generation...")
    time.sleep(10)
    operation = client.operations.get(operation)

# Download and save
generated_video = operation.response.generated_videos[0]
client.files.download(file=generated_video.video)
generated_video.video.save("output.mp4")
```

---

## 2. Image-to-Video (Start Frame)

```python
import time
from google import genai
from google.genai import types

client = genai.Client()

# Load image correctly as types.Image
image = load_image_for_veo("start_frame.png")

operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="Camera slowly pans across this scene as wind rustles the leaves.",
    image=image,  # types.Image, NOT PIL Image
)

while not operation.done:
    time.sleep(10)
    operation = client.operations.get(operation)

generated_video = operation.response.generated_videos[0]
client.files.download(file=generated_video.video)
generated_video.video.save("animated_scene.mp4")
```

---

## 3. First & Last Frame Interpolation (Veo 3.1 only)

```python
import time
from google import genai
from google.genai import types

client = genai.Client()

first_image = load_image_for_veo("first_frame.png")
last_image = load_image_for_veo("last_frame.png")

operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="A ghostly woman fades away from a swing in eerie moonlit fog.",
    image=first_image,          # Start frame as primary input
    config=types.GenerateVideosConfig(
        last_frame=last_image,  # End frame in config
    ),
)

while not operation.done:
    time.sleep(10)
    operation = client.operations.get(operation)

generated_video = operation.response.generated_videos[0]
client.files.download(file=generated_video.video)
generated_video.video.save("interpolation.mp4")
```

---

## 4. Reference Images (Veo 3.1 only, up to 3)

Use reference images to preserve a subject's appearance (person, character, product).

```python
import time
from google import genai
from google.genai import types

client = genai.Client()

dress_image = load_image_for_veo("dress.png")
woman_image = load_image_for_veo("woman.png")
glasses_image = load_image_for_veo("glasses.png")

dress_ref = types.VideoGenerationReferenceImage(
    image=dress_image,
    reference_type="asset",
)
woman_ref = types.VideoGenerationReferenceImage(
    image=woman_image,
    reference_type="asset",
)
glasses_ref = types.VideoGenerationReferenceImage(
    image=glasses_image,
    reference_type="asset",
)

operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="A woman in a flamingo dress walks through turquoise water at a lagoon.",
    config=types.GenerateVideosConfig(
        reference_images=[dress_ref, woman_ref, glasses_ref],
    ),
)

while not operation.done:
    time.sleep(10)
    operation = client.operations.get(operation)

generated_video = operation.response.generated_videos[0]
client.files.download(file=generated_video.video)
generated_video.video.save("reference_output.mp4")
```

---

## 5. Video Extension (Veo 3.1 & Veo 3.1 Fast only)

Extend a previously generated Veo video by ~7 seconds, up to 20 times (max 148s total).

**Constraints:**
- Input must be a Veo-generated video (from `operation.response.generated_videos[0].video`)
- Resolution must be `720p`
- Duration must be `8` seconds
- Max input video length: 141 seconds
- Videos are stored for 2 days; referencing for extension resets the timer

```python
import time
from google import genai
from google.genai import types

client = genai.Client()

# First: generate the initial video
op1 = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="An origami butterfly flies out of french doors into a garden.",
)
while not op1.done:
    time.sleep(10)
    op1 = client.operations.get(op1)

original_video = op1.response.generated_videos[0].video

# Then: extend it
op2 = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="The butterfly lands on an orange origami flower. A white puppy pats the flower.",
    video=original_video,  # Must be from a previous Veo generation
    config=types.GenerateVideosConfig(
        number_of_videos=1,
        resolution="720p",
    ),
)
while not op2.done:
    time.sleep(10)
    op2 = client.operations.get(op2)

extended_video = op2.response.generated_videos[0]
client.files.download(file=extended_video.video)
extended_video.video.save("extended_output.mp4")
```

---

## 6. Config Parameters Reference

```python
types.GenerateVideosConfig(
    aspect_ratio="16:9",        # "16:9" (default) or "9:16" (portrait)
    duration_seconds=8,         # 4, 6, or 8 seconds (Veo 2: 5, 6, or 8)
    resolution="720p",          # "720p" (default), "1080p", "4k"
    person_generation="allow_all",  # See table below
    number_of_videos=1,         # 1 (Veo 3.x) or 1-2 (Veo 2)
    last_frame=types.Image(...),           # Veo 3.1 only: end frame for interpolation
    reference_images=[...],                # Veo 3.1 only: up to 3 reference images
    seed=42,                               # Veo 3.x only: slightly improves determinism
)
```

### Duration constraints
- `1080p` and `4k` resolution → must use `duration_seconds=8`
- Video extension → must use `duration_seconds=8`
- Reference images → must use `duration_seconds=8`

### Person generation values

| Context | Veo 3.1 | Veo 3 | Veo 2 |
|---------|---------|-------|-------|
| Text-to-video | `allow_all` only | `allow_all` only | `allow_all`, `allow_adult`, `dont_allow` |
| Image-to-video | `allow_adult` only | `allow_adult` only | `allow_adult`, `dont_allow` |
| Extension | `allow_all` only | n/a | n/a |
| Reference images | `allow_adult` only | n/a | n/a |

**EU/UK/CH/MENA regions:** Veo 3/3.1 → `allow_adult` only. Veo 2 → default is `dont_allow`.

---

## 7. Async Operation Handling

All video generation returns a long-running operation. You must poll it:

```python
# Start generation
operation = client.models.generate_videos(...)

# You can persist the operation name and resume later
operation_name = operation.name

# Resume from a stored operation name
from google.genai import types
operation = types.GenerateVideosOperation(name=operation_name)

# Poll loop
while not operation.done:
    time.sleep(10)
    operation = client.operations.get(operation)

# Access result
video = operation.response.generated_videos[0]
client.files.download(file=video.video)
video.video.save("output.mp4")
```

**Latency:** Min ~11 seconds, Max ~6 minutes (peak hours). Higher resolution = higher latency. 4k is also more expensive.

---

## 8. Prompt Engineering Guide

### RULES — Always follow when writing Veo prompts

1. **Always include Subject + Action + Style.** These three are mandatory in every prompt.
2. **Be specific, not vague.** "A woman walks on the beach" → "A woman in a white sundress walks barefoot along the shoreline at golden hour, her hair blowing in the breeze."
3. **More detail = more control.** Veo responds proportionally to prompt specificity.
4. **Use cinematic vocabulary.** Film terminology (dolly, crane, rack focus) produces better results than casual descriptions.
5. **Describe motion explicitly.** Veo doesn't infer motion well from static descriptions. Say "slowly pans left" not just "shows the landscape."
6. **Specify lens and focal length.** "35mm lens", "macro lens", "wide-angle" directly influence composition.
7. **Describe lighting and color palette.** "Cool blue tones", "warm golden afternoon light", "muted desaturated palette" — ambiance is a strong lever.
8. **For audio: be explicit.** Veo 3.x generates audio natively. Use quotes for dialogue, describe SFX and ambient sound directly in the prompt.
9. **Don't overload.** Keep under ~1024 tokens. Focus on one clear scene per prompt.
10. **Match person_generation to your mode.** See the gotcha below — wrong values crash the request.

### Prompt Structure Formula

Use this structure to build prompts systematically:

```
[Composition] [Camera motion] of [Subject] [Action] in [Context/Setting],
[Style/aesthetic keywords], [Lens/focus], [Ambiance/lighting], [Audio cues].
```

**Example applying formula:**
```
Close-up dolly shot of weathered hands carefully planting a hemp seedling
into dark organic soil in a sun-drenched garden, documentary realism,
35mm lens shallow focus, warm golden afternoon light with long shadows,
birds chirping and wind rustling through leaves.
```

### Core Prompt Elements

| Element | Required | Description | Examples |
|---------|----------|-------------|----------|
| **Subject** | ✅ | Main focus of the video | "a calico kitten", "rusted iron gears", "a woman in a trench coat" |
| **Action** | ✅ | What the subject does | "walking slowly", "melting", "flying through", "turning their head" |
| **Style** | ✅ | Visual aesthetic | "cinematic", "sci-fi", "film noir", "3D cartoon", "documentary", "hyperrealistic" |
| **Camera motion** | Optional | How camera moves | "dolly shot", "crane down", "tracking drone view", "POV shot", "slow pan left-to-right" |
| **Composition** | Optional | How the shot is framed | "wide shot", "close-up", "extreme close-up", "medium shot", "two-shot" |
| **Lens/focus** | Optional | Optical characteristics | "35mm lens", "macro lens", "wide-angle", "shallow focus", "deep focus", "soft focus" |
| **Ambiance** | Optional | Mood via light and color | "blue tones", "warm tones", "golden hour", "night", "overcast", "muted earthy palette" |
| **Audio** | Optional | Sound design cues | dialogue in quotes, "engine roaring", "eerie hum in background" |

### Camera Motion Vocabulary

| Term | Effect |
|------|--------|
| `dolly shot` | Camera moves toward/away from subject on a track |
| `crane shot` / `crane down` | Camera moves vertically on a crane arm |
| `tracking shot` | Camera follows the subject laterally |
| `pan left/right` | Camera rotates horizontally on a fixed axis |
| `tilt up/down` | Camera rotates vertically on a fixed axis |
| `zoom in/out` | Focal length changes (not camera movement) |
| `POV shot` | First-person perspective |
| `aerial view` / `drone shot` | Bird's-eye perspective |
| `worm's eye` | Looking up from ground level |
| `handheld` | Slightly shaky, organic feel |
| `steadicam` | Smooth, floating camera movement |

### Composition Keywords

| Term | Effect |
|------|--------|
| `extreme close-up` (ECU) | Fills frame with small detail (eye, texture) |
| `close-up` (CU) | Head and shoulders, product detail |
| `medium shot` (MS) | Waist up |
| `wide shot` (WS) | Full body + environment |
| `establishing shot` | Sets the scene location |
| `over-the-shoulder` (OTS) | From behind one subject toward another |
| `single-shot` | One subject |
| `two-shot` | Two subjects in frame |

### Audio Prompting (Veo 3.x only)

Veo 3.x natively generates synchronized audio. Three types of audio cues:

**Dialogue** — Use quotation marks with speaker attribution:
```
A man murmurs, "This must be it. That's the secret code."
The woman looks at him and whispers excitedly, "What did you find?"
```

**Sound Effects (SFX)** — Describe sounds explicitly:
```
tires screeching loudly, engine roaring
glass shattering, metallic clang echoing through the corridor
```

**Ambient Noise** — Describe the environment's soundscape:
```
A faint, eerie hum resonates in the background.
Steppe wind howling, distant rumble of thunder.
Birds chirping, water flowing over smooth stones.
```

**Audio prompting tips:**
- Combine all three types for rich scenes
- More audio detail → better synchronization
- For video extension: audio continues from the last 1 second of input. If no voice in the last second, voice won't extend well.

### Prompting for Extension

When extending a Veo-generated video:
- The extension prompt describes what happens **next**, not a recap of the original
- Extension finalizes the last 1 second (24 frames) of the input and continues
- Voice won't extend well if not present in the last 1 second of video
- Keep stylistic consistency with the original prompt

**Example:**
- Original: "A paraglider takes off from a mountain overlooking flower-covered valleys."
- Extension: "The paraglider slowly descends toward the valley, revealing wildflowers below."

### Prompting with Reference Images

When using `reference_images` to preserve subject appearance:
- Describe the reference subject clearly in the prompt
- The prompt should mention what the subject is wearing/looks like to anchor the reference
- Up to 3 reference images, each set to `reference_type="asset"`
- Works for: people, characters, products, costumes, accessories

### Prompting with First/Last Frames

When specifying start and end frames:
- Describe the transition between the two states
- The prompt is optional but improves quality
- Veo interpolates the motion between frames
- Works for: metamorphosis, transitions, time-lapses, character movement

### Do vs. Don't

| ❌ Don't | ✅ Do |
|----------|-------|
| "A video of a city" | "A sweeping aerial drone shot of Tokyo at night, neon lights reflecting on wet streets, cyberpunk atmosphere, 35mm lens" |
| "Show a flower" | "Extreme close-up time-lapse of a red rose blooming, macro lens, soft morning sunlight, shallow depth of field" |
| "A man talks" | "Close-up of a weathered detective in a dim office, cigarette smoke curling. He mutters, 'The case goes deeper than I thought.' Film noir, 1940s aesthetic." |
| "Nice sunset" | "Golden hour over the Aegean sea, warm orange and pink tones, slow crane shot descending toward a lone sailboat, cinematic, anamorphic lens flare" |
| "Fast car" | "POV shot from a vintage red convertible driving through rain-slicked streets, 1970s Palm Springs, engine purring, windshield wipers beating rhythmically" |

---

## 9. Limitations & Gotchas

| Item | Detail |
|------|--------|
| **Video retention** | Generated videos stored for 2 days, then deleted. Download promptly. |
| **Watermarking** | All videos watermarked with SynthID |
| **Safety filters** | May block generation. Not charged if blocked. |
| **Audio errors** | Audio safety filters can block a video. Not charged. |
| **Extension input** | Must be Veo-generated video, ≤141s, 720p only |
| **Frame rate** | Always 24fps |
| **Videos per request** | 1 (Veo 3.x), 1 or 2 (Veo 2) |
| **Text input limit** | 1,024 tokens |
| **Latency** | Min ~11s, Max ~6 min (peak hours). 4k is slowest and most expensive. |

### CRITICAL GOTCHA: `person_generation` values

`dont_allow` is **NOT supported** on Veo 3.x. Using it causes `400 INVALID_ARGUMENT`.

**Safe defaults by mode (Veo 3.1):**

| Mode | Use this value |
|------|---------------|
| Text-to-video | `allow_all` |
| Image-to-video | `allow_adult` |
| Video extension | `allow_all` |
| Reference images | `allow_adult` |
| Interpolation (first/last frame) | `allow_adult` |

**Only Veo 2** supports `dont_allow`. If you don't want people, omit the parameter and avoid people in your prompt instead.

### CRITICAL GOTCHA: Image input type

The `image` parameter MUST be a `types.Image(image_bytes=..., mime_type=...)`.
**Do NOT pass a PIL Image object.** It causes: `400 INVALID_ARGUMENT: Input instance with 'image' should contain both 'bytesBase64Encoded' and 'mimeType'`

---

## 10. Complete Pipeline Example

A full pipeline that generates a video from a start frame image:

```python
#!/usr/bin/env python3
"""Generate a video clip from a start frame image using Veo 3.1."""

import time
import mimetypes
from google import genai
from google.genai import types

client = genai.Client()


def load_image_for_veo(image_path: str) -> types.Image:
    """Load an image file into a types.Image for the Veo API."""
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        mime_type = "image/png"
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    return types.Image(image_bytes=image_bytes, mime_type=mime_type)


def generate_video(
    prompt: str,
    output_path: str,
    start_frame_path: str = None,
    last_frame_path: str = None,
    aspect_ratio: str = "16:9",
    duration: int = 8,
    resolution: str = "720p",
    model: str = "veo-3.1-generate-preview",
):
    """Generate a video with Veo 3.1, handling all input combinations."""
    kwargs = {"model": model, "prompt": prompt}
    config_kwargs = {
        "aspect_ratio": aspect_ratio,
        "duration_seconds": duration,
    }

    if resolution != "720p":
        config_kwargs["resolution"] = resolution

    if start_frame_path:
        kwargs["image"] = load_image_for_veo(start_frame_path)

    if last_frame_path:
        config_kwargs["last_frame"] = load_image_for_veo(last_frame_path)

    kwargs["config"] = types.GenerateVideosConfig(**config_kwargs)

    operation = client.models.generate_videos(**kwargs)

    while not operation.done:
        print(f"  Polling... (operation: {operation.name})")
        time.sleep(10)
        operation = client.operations.get(operation)

    generated_video = operation.response.generated_videos[0]
    client.files.download(file=generated_video.video)
    generated_video.video.save(output_path)
    print(f"  Saved: {output_path}")

    return generated_video.video  # Return for chaining/extension


# Usage:
# generate_video(
#     prompt="A cinematic drone shot over mountains at sunset.",
#     output_path="mountains.mp4",
#     start_frame_path="mountain_frame.png",
#     aspect_ratio="9:16",
#     duration=8,
# )
```

---

## 11. REST API (cURL)

For non-Python usage, the REST endpoint is:

```bash
BASE_URL="https://generativelanguage.googleapis.com/v1beta"

# Text-to-video
operation_name=$(curl -s "${BASE_URL}/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "instances": [{"prompt": "Your prompt here"}],
    "parameters": {"aspectRatio": "9:16"}
  }' | jq -r .name)

# Poll
while true; do
  status=$(curl -s -H "x-goog-api-key: $GEMINI_API_KEY" "${BASE_URL}/${operation_name}")
  is_done=$(echo "$status" | jq .done)
  if [ "$is_done" = "true" ]; then
    video_uri=$(echo "$status" | jq -r '.response.generateVideoResponse.generatedSamples[0].video.uri')
    curl -L -o output.mp4 -H "x-goog-api-key: $GEMINI_API_KEY" "$video_uri"
    break
  fi
  sleep 10
done
```

### REST with image input

```bash
# Base64-encode the image
IMAGE_B64=$(base64 -i start_frame.png)

curl -s "${BASE_URL}/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "instances": [{
      "prompt": "Your prompt here",
      "image": {"inlineData": {"mimeType": "image/png", "data": "'"$IMAGE_B64"'"}}
    }]
  }'
```

### REST with reference images

```bash
curl -s "${BASE_URL}/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "instances": [{
      "prompt": "Your prompt here",
      "referenceImages": [
        {"image": {"inlineData": {"mimeType": "image/png", "data": "'"$ref1_b64"'"}}, "referenceType": "asset"},
        {"image": {"inlineData": {"mimeType": "image/png", "data": "'"$ref2_b64"'"}}, "referenceType": "asset"}
      ]
    }]
  }'
```

---

## References

*   [Veo 3.1 API Reference Guide](reference.md)
