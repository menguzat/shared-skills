---
name: kling-video-gen
description: >
  Generate videos using Kling AI's SOTA video generation API (Kling 3.0, Kling 2.6, Kling 1.6, Kling 1.5).
  Covers Text-to-Video, Image-to-Video, First/Last frame transition, sound generation, camera control,
  aspect ratios, pro/std modes, duration, and prompt engineering guidelines.
  Use when user wants to generate high quality video clips with Kling AI.
metadata:
  {
    "openclaw":
      {
        "emoji": "🎞️",
        "requires":
          {
            "env": { "KLING_ACCESS_KEY": "", "KLING_SECRET_KEY": "" },
            "bins": ["uv"],
          },
      },
  }
---

# Kling AI Video Generation Skill

State-of-the-art video generation skill for AI agents using Kling AI's official REST API & Python client tools.

---

## Prerequisites

Set environment variables for authentication:

```bash
export KLING_ACCESS_KEY="your_access_key"
export KLING_SECRET_KEY="your_secret_key"
```

*Alternatively, if using a single token or third-party proxy:*
```bash
export KLING_API_KEY="your_bearer_token"
```

Make sure `uv` is installed (`uv 0.7+` recommended).

---

## Quick Execution via CLI Script

Generate videos directly from the command line using `uv`:

### 1. Text-to-Video
```bash
uv run {baseDir}/scripts/generate_video.py \
  --prompt "A cinematic close-up of a lone astronaut walking on glowing red sands of Mars at sunset" \
  --filename "output.mp4" \
  --model "kling-v1.6" \
  --mode "pro" \
  --duration 5 \
  --aspect-ratio "16:9"
```

### 2. Image-to-Video (Start Frame Animation)
```bash
uv run {baseDir}/scripts/generate_video.py \
  --start-image "character.png" \
  --prompt "The character slowly turns their head and smiles towards the camera, wind blowing hair" \
  --filename "animated_character.mp4" \
  --mode "pro" \
  --duration 5
```

### 3. First & Last Frame Interpolation (Start Image to End Image)
```bash
uv run {baseDir}/scripts/generate_video.py \
  --start-image "start_frame.png" \
  --end-image "end_frame.png" \
  --prompt "Seamless morph and transition from day scene into starry night city lights" \
  --filename "transition.mp4" \
  --mode "pro" \
  --duration 5
```

---

## Command Options

| Parameter | Short | Choices / Default | Description |
|-----------|-------|-------------------|-------------|
| `--prompt` | `-p` | String | Text description of the video scene and motion |
| `--filename` | `-f` | String (**Required**) | Output MP4 path (e.g. `renders/shot_01.mp4`) |
| `--start-image` | `-i` | File path / URL | Input image for Image-to-Video start frame |
| `--end-image` | `-e` | File path / URL | Input image for end frame / tail transition |
| `--model` | `-m` | `kling-v3.0`, `kling-v2.6`, `kling-v1.6`, `kling-v1.5`, `kling-v1` (Default: `kling-v1.6`) | Model version |
| `--mode` | N/A | `std`, `pro` (Default: `std`) | `std` (Standard - faster), `pro` (Professional - higher quality & coherence) |
| `--duration` | `-d` | `5`, `10` (Default: `5`) | Video duration in seconds |
| `--aspect-ratio` | `-a` | `16:9`, `9:16`, `1:1` (Default: `16:9`) | Video aspect ratio (Text-to-Video) |
| `--sound` | N/A | Flag | Enable native audio generation (supported models) |
| `--negative-prompt` | `-n` | String | Concepts/elements to avoid |
| `--cfg-scale` | N/A | Float `0.0` - `1.0` (Default: `0.5`) | Classifier-Free Guidance scale |

---

## Kling Model Variants

| Model | Code | Resolution | Best For | Audio Support |
|-------|------|------------|----------|---------------|
| **Kling 3.0** | `kling-v3.0` | Up to 4K / 1080p | Maximum photorealism, physical simulation & complex motion | ✅ Native |
| **Kling 2.6** | `kling-v2.6` | 1080p | Highly detailed cinematic shots & atmospheric lighting | ✅ |
| **Kling 1.6** | `kling-v1.6` | 1080p / 720p | Balanced speed & quality, versatile image-to-video | ❌ |
| **Kling 1.5** | `kling-v1.5` | 1080p / 720p | Element control, start/end frame interpolation | ❌ |
| **Kling 1.0** | `kling-v1` | 720p | Fast prototyping | ❌ |

---

## Python Integration Code

You can also call the Kling API directly in your custom Python applications:

```python
import time
import jwt
import requests

def generate_kling_jwt(access_key: str, secret_key: str) -> str:
    headers = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "iss": access_key,
        "exp": int(time.time()) + 1800,
        "nbf": int(time.time()) - 5
    }
    return jwt.encode(payload, secret_key, algorithm="HS256", headers=headers)

# Create API request
token = generate_kling_jwt("YOUR_AK", "YOUR_SK")
url = "https://api-singapore.klingai.com/v1/videos/text2video"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}
payload = {
    "model_name": "kling-v1.6",
    "prompt": "A futuristic hovercraft gliding smoothly over a neon-lit cyberpunk city harbor at night, rainy reflections, 35mm lens, 4k",
    "negative_prompt": "blurry, low quality, distortion",
    "duration": "5",
    "mode": "pro",
    "aspect_ratio": "16:9"
}

response = requests.post(url, headers=headers, json=payload)
task_id = response.json()["data"]["task_id"]

# Poll status
status_url = f"https://api-singapore.klingai.com/v1/videos/text2video/{task_id}"
while True:
    res = requests.get(status_url, headers=headers).json()
    status = res["data"]["task_status"]
    if status == "succeed":
        video_url = res["data"]["task_result"]["videos"][0]["url"]
        print(f"Generated Video URL: {video_url}")
        break
    elif status == "failed":
        print(f"Failed: {res['data'].get('task_status_msg')}")
        break
    time.sleep(10)
```

---

## Prompt Engineering for Kling AI

To achieve SOTA output quality with Kling AI video generation:

### Formula
`[Subject] + [Action/Motion] + [Environment/Setting] + [Camera Movement & Lens] + [Lighting & Style]`

### Best Practices:
1. **Describe Explicit Motion:** Kling excels at temporal physics. Clearly state direction, speed, and nature of movement (e.g. *"slow pan left", "tracking shot", "gently swaying", "bursts into motion"*).
2. **Camera Vocabulary:** Use terms like `dolly in`, `dolly out`, `tracking shot`, `aerial drone view`, `low angle`, `macro 85mm lens`.
3. **Lighting & Texture:** Mention specific light conditions (e.g., *"golden hour glow", "soft volumetric haze", "harsh cinematic rim lighting"*).
4. **Pro vs Standard Mode:** Use `--mode pro` for shots requiring precise body physics, complex interactions, or fluid dynamics.

---

## Limitations & Best Practices

- **Task Expiry:** Videos hosted on Kling CDN expire after a period of time. Always download generated MP4s immediately.
- **Asynchronous Execution:** Kling processing times range from ~15s (standard mode) to ~3 minutes (pro mode during peak loads).
- **Aspect Ratios:** When supplying `--start-image`, aspect ratio is determined by the input image.
