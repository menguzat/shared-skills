#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pyjwt>=2.8.0",
#     "requests>=2.31.0",
#     "pillow>=10.0.0",
# ]
# ///
"""
Generate videos using Kling AI Video Generation API.

Usage:
    uv run generate_video.py --prompt "A cinematic sunset over ocean" --filename "output.mp4" [options]
    uv run generate_video.py --prompt "Animate this scene" --start-image "start.png" --filename "output.mp4" [options]
"""

import argparse
import base64
import json
import os
import sys
import time
from pathlib import Path
import jwt
import requests

BASE_URL = os.getenv("KLING_BASE_URL", "https://api-singapore.klingai.com")

def get_auth_token(access_key: str = None, secret_key: str = None) -> str:
    """Generate JWT authorization token or use explicit API bearer token."""
    ak = access_key or os.getenv("KLING_ACCESS_KEY") or os.getenv("KLING_AK")
    sk = secret_key or os.getenv("KLING_SECRET_KEY") or os.getenv("KLING_SK")
    raw_token = os.getenv("KLING_API_KEY")

    if raw_token and not (ak and sk):
        return raw_token

    if not ak or not sk:
        print("Error: Missing Kling API credentials. Set KLING_ACCESS_KEY and KLING_SECRET_KEY (or KLING_API_KEY) environment variables.", file=sys.stderr)
        sys.exit(1)

    headers = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "iss": ak,
        "exp": int(time.time()) + 1800,
        "nbf": int(time.time()) - 5
    }
    return jwt.encode(payload, sk, algorithm="HS256", headers=headers)

def encode_image_to_base64(image_input: str) -> str:
    """Encode local image file to base64 or return URL as-is."""
    if image_input.startswith("http://") or image_input.startswith("https://"):
        return image_input
    
    img_path = Path(image_input)
    if not img_path.exists():
        print(f"Error: Image file not found at {image_input}", file=sys.stderr)
        sys.exit(1)
        
    with open(img_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def submit_task(token: str, is_image2video: bool, payload: dict) -> str:
    """Submit text2video or image2video generation task."""
    endpoint = f"{BASE_URL}/v1/videos/image2video" if is_image2video else f"{BASE_URL}/v1/videos/text2video"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    response = requests.post(endpoint, headers=headers, json=payload, timeout=30)
    if response.status_code != 200:
        print(f"API Error ({response.status_code}): {response.text}", file=sys.stderr)
        sys.exit(1)

    res_json = response.json()
    if res_json.get("code") != 0:
        print(f"Kling API Error [{res_json.get('code')}]: {res_json.get('message')}", file=sys.stderr)
        sys.exit(1)

    task_id = res_json.get("data", {}).get("task_id")
    if not task_id:
        print(f"Error: No task_id returned in API response: {res_json}", file=sys.stderr)
        sys.exit(1)

    return task_id

def poll_task_status(token: str, is_image2video: bool, task_id: str, poll_interval: int = 10, max_attempts: int = 60) -> str:
    """Poll task status until succeed or failed."""
    task_type = "image2video" if is_image2video else "text2video"
    endpoint = f"{BASE_URL}/v1/videos/{task_type}/{task_id}"
    fallback_endpoint = f"{BASE_URL}/v1/videos/task/{task_id}"

    headers = {
        "Authorization": f"Bearer {token}"
    }

    print(f"Task submitted successfully. Task ID: {task_id}")
    print("Polling for task completion...")

    for attempt in range(1, max_attempts + 1):
        time.sleep(poll_interval)
        
        # Try primary status endpoint, fallback if 404
        response = requests.get(endpoint, headers=headers, timeout=30)
        if response.status_code == 404:
            response = requests.get(fallback_endpoint, headers=headers, timeout=30)

        if response.status_code != 200:
            print(f"  Attempt {attempt}/{max_attempts}: Status check HTTP {response.status_code}...")
            continue

        res_json = response.json()
        data = res_json.get("data", {})
        status = data.get("task_status") or data.get("status")

        print(f"  Attempt {attempt}/{max_attempts}: Task status = {status}")

        if status == "succeed":
            videos = data.get("task_result", {}).get("videos", [])
            if videos and videos[0].get("url"):
                return videos[0]["url"]
            print("Error: Task succeeded but no video URL found.", file=sys.stderr)
            sys.exit(1)
        elif status == "failed":
            errMsg = data.get("task_status_msg") or res_json.get("message") or "Unknown error"
            print(f"Error: Video generation task failed: {errMsg}", file=sys.stderr)
            sys.exit(1)

    print("Error: Video generation timed out waiting for completion.", file=sys.stderr)
    sys.exit(1)

def download_video(video_url: str, output_path: str):
    """Download the generated MP4 video to local disk."""
    print(f"Downloading video from {video_url}...")
    res = requests.get(video_url, stream=True, timeout=60)
    if res.status_code != 200:
        print(f"Error downloading video ({res.status_code}): {res.text}", file=sys.stderr)
        sys.exit(1)

    out_p = Path(output_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    
    with open(out_p, "wb") as f:
        for chunk in res.iter_content(chunk_size=8192):
            f.write(chunk)

    size_mb = out_p.stat().st_size / (1024 * 1024)
    print(f"\nSuccessfully generated and saved video!")
    print(f"File: {out_p.resolve()} ({size_mb:.2f} MB)")
    print(f"MEDIA: {out_p.resolve()}")

def main():
    parser = argparse.ArgumentParser(description="Generate video using Kling AI API")
    parser.add_argument("--prompt", "-p", help="Text description of the video to generate")
    parser.add_argument("--filename", "-f", required=True, help="Output file path (e.g. output.mp4)")
    parser.add_argument("--start-image", "-i", help="Path or URL of start image for Image-to-Video")
    parser.add_argument("--end-image", "-e", help="Path or URL of end image for Image-to-Video transition")
    parser.add_argument("--model", "-m", default="kling-v1.6", help="Kling model name (kling-v3.0, kling-v2.6, kling-v1.6, kling-v1.5, kling-v1)")
    parser.add_argument("--duration", "-d", choices=["5", "10"], default="5", help="Video duration in seconds (5 or 10)")
    parser.add_argument("--aspect-ratio", "-a", choices=["16:9", "9:16", "1:1"], default="16:9", help="Aspect ratio (16:9, 9:16, 1:1)")
    parser.add_argument("--mode", choices=["std", "pro"], default="std", help="Generation mode: std (standard) or pro (professional)")
    parser.add_argument("--negative-prompt", "-n", help="Negative prompt for things to avoid")
    parser.add_argument("--sound", action="store_true", help="Enable audio/sound generation (supported models)")
    parser.add_argument("--cfg-scale", type=float, default=0.5, help="Guidance scale (0.0 to 1.0)")
    parser.add_argument("--access-key", help="Kling API Access Key")
    parser.add_argument("--secret-key", help="Kling API Secret Key")

    args = parser.parse_args()

    if not args.prompt and not args.start_image:
        parser.error("At least one of --prompt or --start-image must be provided.")

    is_image2video = bool(args.start_image)
    token = get_auth_token(args.access_key, args.secret_key)

    payload = {
        "model_name": args.model,
        "duration": str(args.duration),
        "mode": args.mode,
        "cfg_scale": args.cfg_scale,
    }

    if args.prompt:
        payload["prompt"] = args.prompt

    if args.negative_prompt:
        payload["negative_prompt"] = args.negative_prompt

    if args.sound:
        payload["sound"] = "on"

    if is_image2video:
        payload["image"] = encode_image_to_base64(args.start_image)
        if args.end_image:
            payload["image_tail"] = encode_image_to_base64(args.end_image)
    else:
        payload["aspect_ratio"] = args.aspect_ratio

    print(f"Submitting Kling API task ({'Image-to-Video' if is_image2video else 'Text-to-Video'})...")
    print(f"  Model: {args.model}")
    print(f"  Mode: {args.mode}")
    print(f"  Duration: {args.duration}s")
    if args.prompt:
        print(f"  Prompt: {args.prompt}")

    task_id = submit_task(token, is_image2video, payload)
    video_url = poll_task_status(token, is_image2video, task_id)
    download_video(video_url, args.filename)

if __name__ == "__main__":
    main()
