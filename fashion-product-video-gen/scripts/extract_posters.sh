#!/usr/bin/env bash
# Extract first-frame JPEG poster from all MP4 files in directory

DIR="${1:-.}"

if [ ! -d "$DIR" ]; then
  echo "Directory $DIR does not exist."
  exit 1
fi

echo "Extracting posters in $DIR..."
for video in "$DIR"/*.mp4; do
  [ -e "$video" ] || continue
  base="${video%.mp4}"
  poster="${base}-poster.jpg"
  echo "Extracting: $poster"
  ffmpeg -y -i "$video" -vframes 1 -q:v 2 "$poster" -loglevel error
done

echo "✓ Poster extraction complete."
