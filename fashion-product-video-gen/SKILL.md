---
name: fashion-product-video-gen
description: "Master fashion and luxury e-commerce product video generation skill. Turns static model and garment photos into seamless closed-loop 9:16 video assets using Google Veo 3.1 or Kling AI. Enforces edge-sampled borderless framing, tactile textile physics, subtle closed-loop micro-sway choreography, and web performance optimization."
---

# Fashion Product Video Generation Skill

This skill governs the production of high-converting, luxury fashion and apparel motion videos for e-commerce Product Detail Pages (PDP), collection lookbooks, and interactive hover cards (`<ProductCardMedia>`).

---

## 💎 The 5 Golden Invariants of Luxury Fashion Videos

1. **Seamless Closed-Loop Motion:**
   The video MUST loop infinitely on web storefronts without a visible jump, cut, or restart glitch. The model begins in a poised standing posture, executes a subtle micro-movement, and returns precisely to the original position.
2. **Clean 9:16 Borderless Framing:**
   Never feed square or wide images directly to video models without preprocessing, which causes ugly black letterboxes. Always run edge-sampled background expansion to deliver full-bleed 9:16 or 4:5 vertical video.
3. **Restrained Micro-Sway Over Runway Walking:**
   Avoid aggressive walking, spinning, or turning away from the camera. The video must feel like a "living photograph" (subtle breathing, gentle weight shift, fabric light catch).
4. **Tactile Fabric Physics Specificity:**
   Prompts must describe the exact physical behavior of the textile (liquid cupro ripples, crisp tencel pleats, heavy raw linen drape, swaying modular cords, reflective bead trails).
5. **Web Performance Parity:**
   Every generated video must have an accompanying first-frame poster JPEG (`<slug>-poster.jpg`) and be compressed for sub-second web delivery.

---

## 🛠️ End-to-End Workflow

```
[Master Garment Image]
         │
         ▼
[1. Preprocess: 9:16 Edge-Sampling] ──► (No black letterbox bars)
         │
         ▼
[2. Synthesize Kinematic Prompt]   ──► (Fabric Physics + Closed-Loop Choreography)
         │
         ▼
[3. Run Veo 3.1 / Kling Pipeline]  ──► (6s/8s 1080p generation with start/end anchor)
         │
         ▼
[4. Post-Process & Posters]        ──► (ffmpeg poster extraction & web compression)
         │
         ▼
[5. Storefront Integration]        ──► (PDP & ProductCardMedia live stream)
```

---

## 📐 1. Edge-Sampled Framing Pre-Processing

Before passing a master image to Google Veo or Kling AI, run `preprocess_916_frame.py` to achieve a clean 9:16 vertical ratio without artificial black bars.

```bash
python3 scripts/preprocess_916_frame.py \
  --input path/to/primary_image.png \
  --output /tmp/frames/garment_start_916.png \
  --ratio 9:16
```

**How it works:**
- Samples the 4 corner pixels of the image: `bg_color = (TL + TR + BL + BR) // 4`.
- If the image is wider than 9:16: crops width centered on the model.
- If the image is narrower than 9:16: pads width seamlessly using `bg_color`.

---

## ✍️ 2. The Closed-Loop Kinematic Prompt Formula

Every fashion video prompt follows this strict mathematical grammar:

```
[Format & Style] + [Subject & Garment Specifics with Fabric Composition] + [Construction Details & Accents] + [Closed-Loop Micro-Motion Choreography] + [Studio Lighting & Camera Direction] + [Loop Constraint]
```

### Formula Elements:

| Element | Specification | Example |
| :--- | :--- | :--- |
| **Format** | `Seamless closed-loop fashion editorial video of a model wearing...` | Mandatory opening |
| **Garment & Fabric** | Name + Exact textile blend + tactile finish | `...the dark charcoal grey DERVISH FLOW Asymmetric Set (70% Cupro, 30% Cotton with liquid silk sheen)...` |
| **Construction** | Key tailoring elements | `...diagonal placket with handmade frog closures and asymmetric cascading hemline over wide-leg trousers...` |
| **Choreography** | Standing poise ➔ subtle breath/sway ➔ fabric movement ➔ exact return | `Motion: The model stands centered in quiet poise, gently inhales and performs a very subtle, graceful micro-sway, allowing the fluid cupro fabric to ripple softly, then smoothly and effortlessly returns to the exact starting standing posture.` |
| **Camera & Light** | Studio environment, optics | `Stationary camera, 35mm lens, warm soft studio lighting, quiet luxury aesthetic, 4k.` |
| **Loop Constraint** | Strict closing command | `Flawless continuous loop.` |

---

## 🚀 3. Generation via Google Veo 3.1

Run the production generation script:

```bash
python3 scripts/generate_fashion_video.py --config config/products.json
```

Or execute directly via Python with `google-genai`:

```python
from google import genai
from google.genai import types

client = genai.Client()

operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt=motion_prompt,
    image=start_image_obj,
    config=types.GenerateVideosConfig(
        aspect_ratio="9:16",
        duration_seconds=6,
        person_generation="allow_adult",
    ),
)
```

---

## 🎬 4. Automated Poster & Web Optimization

Run `extract_posters.sh` on the output directory:

```bash
bash scripts/extract_posters.sh public/assets/videos
```

This generates `<slug>-poster.jpg` with high-quality JPEG compression for immediate storefront loading.

---

## 🌐 5. Storefront Component Architecture

Render video in React / HTML5 with low-power background looping:

```tsx
<div className="product-media-wrapper">
  <video
    src={`/assets/videos/${slug}.mp4`}
    poster={`/assets/videos/${slug}-poster.jpg`}
    playsInline
    autoPlay
    loop
    muted
    preload="metadata"
    className="product-video"
  />
  <span className="motion-badge">
    <span className="dot" /> Motion Preview
  </span>
</div>
```

---

## 📋 Quality Assurance Checklist

- [ ] Video loops continuously with 0 visible frame jumps.
- [ ] No black letterbox bars or artificial borders.
- [ ] Garment colors match the physical product / brand palette.
- [ ] Model anatomy, facial features, and proportions remain 100% stable throughout the clip.
- [ ] Fabric physics feel natural (e.g. linen holds shape, cupro flows, pleats expand crisply).
- [ ] First-frame poster image exists and matches the video start frame.
