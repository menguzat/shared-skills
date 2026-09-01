#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <url> <mobile|desktop> <output-dir> [runs=5]" >&2
  exit 2
fi

URL="$1"; DEVICE="$2"; OUT="$3"; RUNS="${4:-5}"
mkdir -p "$OUT"

# Determinism rule: never auto-install an unpinned Lighthouse version during an experiment.
if [ -n "${LIGHTHOUSE_BIN:-}" ]; then
  LH=("$LIGHTHOUSE_BIN")
elif [ -x "./node_modules/.bin/lighthouse" ]; then
  LH=(./node_modules/.bin/lighthouse)
elif command -v lighthouse >/dev/null 2>&1; then
  LH=(lighthouse)
else
  echo "No Lighthouse binary found. Install/pin Lighthouse in the project (for example as a devDependency) or set LIGHTHOUSE_BIN." >&2
  exit 3
fi

"${LH[@]}" --version | tee "$OUT/lighthouse-version.txt"

COMMON=("$URL" --quiet --output=json --chrome-flags="--headless --no-sandbox")
if [ "$DEVICE" = "desktop" ]; then
  COMMON+=(--preset=desktop)
elif [ "$DEVICE" != "mobile" ]; then
  echo "device must be mobile or desktop" >&2; exit 2
fi

for i in $(seq 1 "$RUNS"); do
  printf -v N "%02d" "$i"
  echo "[$DEVICE] run $i/$RUNS: $URL"
  "${LH[@]}" "${COMMON[@]}" --output-path="$OUT/run-$N.report.json"
done
