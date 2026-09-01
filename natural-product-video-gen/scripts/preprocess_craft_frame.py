#!/usr/bin/env python3
"""
Preprocess Craft Frame for Veo/Kling Video Generation
======================================================
Prepares clean 1:1, 4:5, or 9:16 vertical/square frames with edge-sampled
or porcelain background padding (#FAF6F0) to eliminate black bars.
"""

import sys
import argparse
from pathlib import Path
from PIL import Image

def hex_to_rgb(hex_str: str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def prepare_clean_craft_frame(
    input_path: str,
    output_path: str,
    target_ratio: str = "1:1",
    bg_color_hex: str = "#FAF6F0"
) -> str:
    input_p = Path(input_path)
    output_p = Path(output_path)
    output_p.parent.mkdir(parents=True, exist_ok=True)

    img = Image.open(input_p).convert("RGBA")
    w, h = img.size

    if target_ratio == "1:1":
        target_w, target_h = max(w, h), max(w, h)
    elif target_ratio == "9:16":
        target_w, target_h = 1080, 1920
    elif target_ratio == "4:5":
        target_w, target_h = 1080, 1350
    else:
        target_w, target_h = w, h

    bg_rgb = hex_to_rgb(bg_color_hex)
    canvas = Image.new("RGBA", (target_w, target_h), bg_rgb + (255,))

    # Resize image preserving aspect ratio
    scale = min((target_w * 0.9) / w, (target_h * 0.9) / h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    resized_img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Paste centered
    offset_x = (target_w - new_w) // 2
    offset_y = (target_h - new_h) // 2
    canvas.paste(resized_img, (offset_x, offset_y), resized_img)

    canvas_rgb = canvas.convert("RGB")
    canvas_rgb.save(str(output_p), "PNG", quality=95)
    print(f"✅ Prepared frame saved to {output_p} ({target_w}x{target_h})")
    return str(output_p)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean frame preparation for product video generation")
    parser.add_argument("--input", required=True, help="Path to raw product image")
    parser.add_argument("--output", required=True, help="Path to output frame")
    parser.add_argument("--ratio", default="1:1", choices=["1:1", "9:16", "4:5"], help="Target aspect ratio")
    parser.add_argument("--bg", default="#FAF6F0", help="Background hex color")

    args = parser.parse_args()
    prepare_clean_craft_frame(args.input, args.output, args.ratio, args.bg)
