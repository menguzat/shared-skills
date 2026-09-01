#!/usr/bin/env python3
"""
Production Natural & Craft Product Video Generator (Google Veo 3.1)
===================================================================
Consumes structured natural product catalog data, applies clean edge-sampled
framing, synthesizes closed-loop kinematic prompts, submits to Google Veo 3.1,
and saves production-ready MP4s and poster JPEGs.
"""

import os
import sys
import time
import json
import argparse
import mimetypes
from pathlib import Path
from dotenv import load_dotenv

# Ensure unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# Load environment
for env_path in [
    Path("shared-skills/.env"),
    Path("apps/oldskool/.env"),
    Path("apps/dpp/.env"),
    Path(".env"),
    Path.home() / ".env"
]:
    if env_path.exists() and not os.environ.get("GEMINI_API_KEY"):
        load_dotenv(env_path)

from google import genai
from google.genai import types
from preprocess_craft_frame import prepare_clean_craft_frame

def load_image_for_veo(image_path: str) -> types.Image:
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        mime_type = "image/png"
    with open(image_path, "rb") as f:
        return types.Image(image_bytes=f.read(), mime_type=mime_type)

def generate_video_for_craft_product(
    client: genai.Client,
    slug: str,
    product_data: dict,
    out_dir: Path,
    tmp_dir: Path,
    aspect_ratio: str = "9:16",
    duration: int = 6
) -> bool:
    print(f"\n==================================================")
    print(f"🌾 Processing: {product_data.get('name', slug)} ({slug})")
    print(f"==================================================")

    out_dir.mkdir(parents=True, exist_ok=True)

    # 2. Configure Veo 3.1 for Direct Realistic Scene Generation
    # Supported aspect ratios for Veo 3.1: "16:9", "9:16"
    veo_ratio = aspect_ratio if aspect_ratio in ["16:9", "9:16"] else "9:16"
    config = types.GenerateVideosConfig(
        aspect_ratio=veo_ratio,
        duration_seconds=duration,
    )

    prompt = product_data.get("motion_prompt", "")
    print(f"\n📝 Realistic Scene Prompt:\n{prompt}\n")
    print(f"🚀 Submitting direct scene generation to Google Veo 3.1 (veo-3.1-generate-preview)...")

    try:
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt=prompt,
            config=config,
        )

        print(f"Operation ID: {operation.name}. Polling status...")
        start_time = time.time()
        while not operation.done:
            elapsed = int(time.time() - start_time)
            print(f"  ⏳ Generating video... ({elapsed}s elapsed)")
            time.sleep(10)
            operation = client.operations.get(operation)

        if operation.error:
            print(f"❌ Veo Error for {slug}: {operation.error}", file=sys.stderr)
            return False

        generated_videos = operation.response.generated_videos
        if not generated_videos:
            print(f"❌ No videos returned for {slug}", file=sys.stderr)
            return False

        video_obj = generated_videos[0]
        output_file = out_dir / f"{slug}.mp4"

        client.files.download(file=video_obj.video)
        video_obj.video.save(str(output_file))

        print(f"🎉 SUCCESS: Video saved to {output_file}")

        # 3. Extract high quality poster
        poster_file = out_dir / f"{slug}-poster.jpg"
        os.system(f"ffmpeg -y -i {output_file} -vframes 1 -q:v 2 {poster_file} 2>/dev/null")
        print(f"📸 Extracted poster to {poster_file}")

        return True

    except Exception as e:
        print(f"❌ Exception occurred for {slug}: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Batch video generator for natural and craft products")
    parser.add_argument("--config", required=True, help="Path to products JSON config")
    parser.add_argument("--output-dir", default="hasat-kooperatifi/hasat.market/media_assets/videos", help="Directory to save generated MP4s")
    parser.add_argument("--slug", help="Process only a specific product slug")
    parser.add_argument("--ratio", default="9:16", choices=["1:1", "9:16", "16:9"], help="Video aspect ratio")
    parser.add_argument("--duration", type=int, default=6, help="Duration in seconds")

    args = parser.parse_args()

    config_path = Path(args.config)
    if not config_path.exists():
        print(f"❌ Error: Config file not found at {config_path}", file=sys.stderr)
        sys.exit(1)

    with open(config_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir = Path("/tmp/hasat_video_frames")
    tmp_dir.mkdir(parents=True, exist_ok=True)

    client = genai.Client()

    products = catalog if isinstance(catalog, list) else catalog.get("products", [])
    if args.slug:
        products = [p for p in products if p.get("slug") == args.slug]

    print(f"🎬 Starting batch video generation for {len(products)} products...")
    success_count = 0

    for p in products:
        slug = p.get("slug")
        res = generate_video_for_craft_product(
            client=client,
            slug=slug,
            product_data=p,
            out_dir=out_dir,
            tmp_dir=tmp_dir,
            aspect_ratio=args.ratio,
            duration=args.duration
        )
        if res:
            success_count += 1

    print(f"\n==================================================")
    print(f"🏁 Batch complete: {success_count}/{len(products)} videos generated successfully.")
    print(f"==================================================")

if __name__ == "__main__":
    main()
