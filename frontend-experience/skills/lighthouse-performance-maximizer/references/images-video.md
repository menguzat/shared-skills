# Images and Video

## Images

- reserve intrinsic dimensions/aspect ratio;
- serve the rendered size rather than one universal giant asset;
- use `srcset`/`sizes` correctly;
- use modern efficient formats when appropriate;
- do not lazy-load the LCP image;
- lazy-load genuinely offscreen media;
- prioritize the actual LCP image rather than multiple candidates;
- use CDN/image transformations when available;
- inspect decode/render cost for extremely large images.

## Video

- avoid autoplaying large video on constrained mobile unless product-critical;
- use an optimized poster;
- choose `preload` intentionally;
- delay player SDKs when the user has not expressed intent;
- consider lighter facade components for embedded players.

Performance optimizations must preserve the visual quality level established as a product invariant.

### Battle-Tested Image & Video Maximization Lessons

1. **Gallery Thumbnail Micro-Asset Trap (Above-the-Fold):**
   - *Problem:* On PDPs, thumbnail selector buttons are rendered above the fold in the initial viewport. Even with `loading="lazy"`, rendering full-resolution image URLs inside `width="80"` tags causes the browser to download all 4–6 full-res gallery images (~2–3 MB) in parallel with the hero image, causing extreme bandwidth contention.
   - *Solution:* Pre-generate dedicated 160px micro-thumbnails (`*_thumb.webp`, 3–8 KB each) specifically for thumbnail buttons. Reduces thumbnail payload by 98%.

2. **Mobile Throttled Bandwidth Calibration:**
   - *Problem:* Lighthouse mobile emulation uses a 1.6 Mbps transfer rate (200 KB/sec). A 350 KB hero image takes 1.75 seconds solely in raw TCP data transfer.
   - *Solution:* Calibrate hero WebP images to 720x1080 or 800x1200 at `-q 60-70` so that compressed file size stays under 40–80 KB. The LCP transfer completes in < 0.35s.

3. **Product Video Loop Optimization:**
   - *Problem:* Autoplaying background/motion videos on PDP mount downloads 2–10 MB MP4 streams during initial paint.
   - *Solution:*
     - Compress video loops with `ffmpeg -vcodec libx264 -crf 28 -preset slow -an -movflags +faststart` (reduces size by 80–90% to ~500 KB–1.2 MB).
     - Default PDP to high-resolution static WebP poster (`fetchPriority="high"`), and stream/play video only upon user interaction (click or hover intent).
