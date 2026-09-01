---
name: natural-product-video-gen
description: "Master natural, artisanal, agricultural, and craft e-commerce product video generation skill. Converts static artisan, botanical, hemp textile, ceramic, food, and craft product photography into seamless closed-loop video assets using Google Veo 3.1 or Kling AI. Enforces edge-sampled borderless framing, organic material physics (viscosity, fiber drape, weave texture, sunlight caustics), subtle closed-loop micro-motion choreography, and ultra-fast web video integration."
---

# Natural & Craft Product Video Generation Skill

This skill governs the production of high-converting, organic, and artisanal motion videos for natural marketplace Product Detail Pages (PDP), collection lookbooks, and interactive hover cards (`hasat-product-card`).

---

## 🌾 The 5 Golden Invariants of Natural & Craft Product Videos

1. **Seamless Closed-Loop Micro-Motion:**
   The video MUST loop infinitely on web storefronts without a visible jump, cut, or restart glitch. The product starts in centered poise, undergoes a subtle organic micro-movement (slow 15° turntable rotation, gentle ambient fabric sway, sunlight glimmer across glass/weave, or viscous droplet settling), and smoothly returns to the exact starting frame.
2. **Clean Edge-Sampled Borderless Framing:**
   Never feed raw square images directly without preprocessing, which causes harsh black borders. Always run edge-sampled background expansion (`preprocess_craft_frame.py`) to deliver seamless 1:1, 4:5, or 9:16 vertical video matching the porcelain/cream background (`#FAF6F0`).
3. **Organic Material Physics Specificity:**
   Prompts must capture the exact tactile physics of natural raw materials:
   - **Kenevir Halat & Çantalar (Hemp Ropes & Bags):** Structured tactile cords, raw linen texture, subtle ambient air sway, light catching woven ridges.
   - **Doğal Yağlar & Cam Şişeler (Oils & Amber Glass):** High-viscosity golden liquid slow swirling, ambient light caustics refracting through dark amber glass.
   - **Yoga & Bolster Minderler (Bolsters & Cushions):** Sturdy organic cotton/hemp weave tension, pristine piping, subtle breathing light shifts.
   - **Evcil Hayvan Aksesuarları (Pet Accessories):** Fibrous texture, durable braided knot integrity, tactile organic feel.
   - **Seramik, Ahşap & Gıda (Ceramics, Wood & Food):** Earthy clay matte textures, natural woodgrain, gentle warmth of afternoon sunlight.
4. **Restrained "Living Still Life" Over Aggressive Action:**
   Avoid rapid 360° spins, chaotic camera pans, or artificial VFX. The video must feel like a calming, documentary-quality "living photograph" in an Aegean or Mediterranean artisan workshop.
5. **Web Performance Parity & Instant Poster Fallback:**
   Every generated video must have an accompanying first-frame poster JPEG (`<handle>-poster.jpg`) and be compressed in MP4 (H.264) and WebM formats for sub-second web loading with `playsinline loop muted autoplay`.

---

## 🛠️ End-to-End Workflow

```
[Master Product Photo]
         │
         ▼
[1. Preprocess: Edge-Sampled Framing] ──► (Matches #FAF6F0 porcelain canvas seamlessly)
         │
         ▼
[2. Synthesize Kinematic Craft Prompt] ──► (Material Physics + Closed-Loop Choreography)
         │
         ▼
[3. Run Veo 3.1 / Kling Pipeline]     ──► (6s/8s 1080p generation with start/end anchor)
         │
         ▼
[4. Compress & Poster Extraction]     ──► (ffmpeg WebM/MP4 + poster JPEG generation)
         │
         ▼
[5. Storefront Dynamic Integration]   ──► (PDP Live Motion Vitrine + PLP Card Hover Stream)
```

---

## 📐 1. Edge-Sampled Framing Pre-Processing

Before passing a master image to Google Veo or Kling AI, run `preprocess_craft_frame.py` to achieve clean 1:1, 4:5, or 9:16 framing without black bars.

```bash
python3 scripts/preprocess_craft_frame.py \
  --input path/to/product.png \
  --output /tmp/frames/product_start.png \
  --ratio 1:1 \
  --bg-color "#FAF6F0"
```

---

## ✍️ 2. The Closed-Loop Kinematic Prompt Formula for Natural Goods

Every natural product video prompt follows this strict mathematical grammar:

```
[Format & Style] + [Artisan Product & Material Composition] + [Craft Details & Tactile Surface] + [Closed-Loop Micro-Motion Choreography] + [Organic Daylight & Ambient Setting] + [Loop Constraint]
```

### Prompt Taxonomy by Product Category:

#### A. Kenevir Çanta & Tekstil (Hemp Bags & Textiles)
> **Prompt:** `Seamless closed-loop commercial product video of the Natural Bej Quo Kenevir Çanta (100% raw braided Turkish hemp rope with structured sculptural form). The handcrafted artisanal bag rests centered on a warm porcelain stone surface (#FAF6F0). Motion: A gentle, subtle Mediterranean breeze causes the thick hemp handles to sway delicately in a micro-motion of 2 degrees, while soft afternoon sunlight glimmers across the coarse natural fibers, before smoothly returning to the exact initial resting position. Stationary macro camera, 50mm f/2.8 lens, diffused natural daylight, documentary craft aesthetic, 4k. Flawless continuous loop.`

#### B. Doğal & Soğuk Sıkım Yağlar (Cold-Pressed Natural Oils)
> **Prompt:** `Seamless closed-loop product video of an amber glass bottle of Cold-Pressed Kenevir Tohumu Yağı resting on a warm travertine surface. Motion: The camera holds stationary while the rich, viscous golden-green oil inside the bottle subtly catches a gentle warm ray of sunlight, creating a slow, mesmerizing caustic glimmer through the glass, then settles seamlessly back to the starting lighting state. 85mm macro lens, organic editorial lighting, quiet luxury craftsmanship, 4k. Flawless continuous loop.`

#### C. Yoga Bolster & Minderler (Bolsters & Cushions)
> **Prompt:** `Seamless closed-loop product showcase of a 62x26cm cylindrical Natural Bej Kenevir Bolster made of raw woven hemp fabric with clean side piping. Motion: Subtle organic light sweep moving smoothly from left to right across the textured fabric weave, revealing the tactile grain of the hemp fibers, and gently resetting to the starting frame. Clean studio background (#FAF6F0), 50mm lens, soft natural shadows. Flawless continuous loop.`

---

## 🚀 3. Generation via Google Veo 3.1 & Kling AI

### Python SDK (`google-genai`):

```python
from google import genai
from google.genai import types

client = genai.Client()

operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt=motion_prompt,
    image=start_image_obj,
    config=types.GenerateVideosConfig(
        aspect_ratio="1:1",  # or "9:16" for vertical mobile reels
        duration_seconds=6,
        person_generation="dont_allow",
    ),
)
```

---

## 🌐 4. Storefront Integration Architecture (Shopify Liquid & Web)

### PLP Product Card Hover Playback (`hasat-product-card.liquid`):
```liquid
<div class="hasat-product-card__image-wrap hasat-has-video">
  <img src="{{ product.featured_image | image_url: width: 600 }}" alt="{{ product.title }}" class="hasat-product-card__img" loading="lazy">
  
  {% if product.metafields.custom.video_url != blank %}
    <video 
      src="{{ product.metafields.custom.video_url }}" 
      poster="{{ product.featured_image | image_url: width: 600 }}"
      class="hasat-product-card__video"
      loop muted playsinline preload="none"
    ></video>
    <span class="hasat-video-indicator">▶ Canlı Görünüm</span>
  {% endif %}
</div>
```

### PDP Main Gallery AI Motion Player (`main-product-v21.liquid`):
```liquid
<div class="hasat-pdp-main-media">
  <div class="hasat-video-vitrine" id="hasat-video-vitrine">
    <video 
      id="hasat-pdp-video"
      src="{{ product.metafields.custom.video_url | default: 'https://cdn.shopify.com/videos/default-hemp-loop.mp4' }}"
      poster="{{ product.featured_image | image_url: width: 1000 }}"
      playsinline autoplay loop muted
      class="hasat-pdp-video-element"
    ></video>
    <div class="hasat-motion-pill">
      <span class="hasat-pulse-dot"></span>
      <span>AI Hareket Önizleme</span>
    </div>
  </div>
</div>
```
