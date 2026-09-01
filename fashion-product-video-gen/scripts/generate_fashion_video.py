#!/usr/bin/env python3
"""
Production Fashion Product Video Generator (Google Veo 3.1)
===========================================================
Consumes structured product data, applies clean 9:16 preprocessing,
submits closed-loop prompts to Veo 3.1, and saves ready-to-serve MP4s.
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
from preprocess_916_frame import prepare_clean_916_frame

def load_image_for_veo(image_path: str) -> types.Image:
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type is None:
        mime_type = "image/png"
    with open(image_path, "rb") as f:
        return types.Image(image_bytes=f.read(), mime_type=mime_type)

def generate_video_for_product(client: genai.Client, slug: str, product_data: dict, out_dir: Path, tmp_dir: Path) -> bool:
    print(f"\n==================================================")
    print(f"🎬 Processing: {product_data.get('name', slug)} ({slug})")
    print(f"==================================================")

    primary_img_path = Path(product_data["primary_image"])
    if not primary_img_path.exists():
        print(f"❌ Error: Primary image not found: {primary_img_path}", file=sys.stderr)
        return False

    # 1. Preprocess clean 9:16 start frame
    start_frame_path = tmp_dir / f"{slug}_start_916.png"
    prepare_clean_916_frame(str(primary_img_path), str(start_frame_path))
    start_image_obj = load_image_for_veo(str(start_frame_path))

    # 2. Configure Veo 3.1
    duration = product_data.get("duration", 6)
    config = types.GenerateVideosConfig(
        aspect_ratio="9:16",
        duration_seconds=duration,
        person_generation="allow_adult",
    )

    print(f"\n📝 Synthesized Prompt:\n{product_data['motion_prompt']}\n")
    print(f"🚀 Submitting to Veo 3.1 (veo-3.1-generate-preview)...")

    try:
        operation = client.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt=product_data["motion_prompt"],
            image=start_image_obj,
            config=config,
        )

        print(f"Operation ID: {operation.name}. Polling status...")
        start_time = time.time()
        while not operation.done:
            elapsed = int(time.time() - start_time)
            print(f"  ⏳ Generating... ({elapsed}s elapsed)")
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

        file_size_mb = output_file.stat().st_size / (1024 * 1024)
        print(f"✅ Success! Video saved to: {output_file} ({file_size_mb:.2f} MB)")
        return True

    except Exception as e:
        print(f"❌ Exception during generation for {slug}: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Fashion Product Video Generator")
    parser.add_argument("--config", "-c", required=True, help="Path to JSON config mapping slugs to prompt/image data")
    parser.add_argument("--output-dir", "-o", default="public/assets/videos", help="Directory to save generated MP4s")
    parser.add_argument("--slug", "-s", help="Optional specific slug to generate")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in environment", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    with open(args.config, "r", encoding="utf-8") as f:
        products_dict = json.load(f)

    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    tmp_dir = Path("/tmp/veo_pipeline_frames")
    tmp_dir.mkdir(parents=True, exist_ok=True)

    targets = [args.slug] if args.slug else list(products_dict.keys())
    print(f"🎯 Target Products: {', '.join(targets)}")

    for slug in targets:
        if slug in products_dict:
            generate_video_for_product(client, slug, products_dict[slug], out_dir, tmp_dir)
        else:
            print(f"⚠️ Slug '{slug}' not found in {args.config}")

if __name__ == "__main__":
    main()
