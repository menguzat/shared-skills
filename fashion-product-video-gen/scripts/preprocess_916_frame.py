#!/usr/bin/env python3
"""
Clean 9:16 Aspect Ratio Frame Preprocessor
==========================================
Crops or expands an image to exact 9:16 vertical ratio without adding artificial black letterboxes.
Samples the 4 corner pixels of the studio background to smoothly pad narrow images, or center-crops wide images.
"""

import sys
import argparse
from pathlib import Path
from PIL import Image

def prepare_clean_916_frame(image_path: str, out_path: str, target_ratio: float = 9.0 / 16.0) -> str:
    im = Image.open(image_path).convert("RGB")
    w, h = im.size
    current_ratio = w / float(h)

    # Sample edge background color
    p_tl = im.getpixel((5, 5))
    p_tr = im.getpixel((w - 6, 5))
    p_bl = im.getpixel((5, h - 6))
    p_br = im.getpixel((w - 6, h - 6))
    bg_color = (
        (p_tl[0] + p_tr[0] + p_bl[0] + p_br[0]) // 4,
        (p_tl[1] + p_tr[1] + p_bl[1] + p_br[1]) // 4,
        (p_tl[2] + p_tr[2] + p_bl[2] + p_br[2]) // 4,
    )

    if current_ratio > target_ratio:
        # Wider: crop width centered on the model
        target_w = int(h * target_ratio)
        left = (w - target_w) // 2
        res = im.crop((left, 0, left + target_w, h))
    else:
        # Narrower: expand width using edge background color
        target_w = int(h * target_ratio)
        target_h = h
        res = Image.new("RGB", (target_w, target_h), bg_color)
        offset_x = (target_w - w) // 2
        res.paste(im, (offset_x, 0))

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    res.save(out_path, "PNG", optimize=True)
    print(f"✓ Clean {target_ratio:.2f} frame saved to: {out_path} ({res.width}x{res.height})")
    return out_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean 9:16 Aspect Ratio Frame Preprocessor")
    parser.add_argument("--input", "-i", required=True, help="Path to input image")
    parser.add_argument("--output", "-o", required=True, help="Path to output image")
    parser.add_argument("--ratio", "-r", default="9:16", help="Target aspect ratio (default 9:16)")
    args = parser.parse_args()

    parts = args.ratio.split(":")
    ratio_val = float(parts[0]) / float(parts[1]) if len(parts) == 2 else float(args.ratio)

    prepare_clean_916_frame(args.input, args.output, ratio_val)
