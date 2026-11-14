#!/usr/bin/env bash
# Render satu komposisi ke 4K + fail penghantaran. Guna: scripts/render.sh <KomposisiId> <NAMA_OUTPUT>
set -euo pipefail
cd "$(dirname "$0")/.."
comp=$1; name=$2
npx remotion render src/index.ts "$comp" "out/_mentah_$comp.mp4" --scale=2 --crf=16 --concurrency=4
ffmpeg -y -loglevel error -i "out/_mentah_$comp.mp4" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -movflags +faststart \
  -af "alimiter=limit=0.89:level=disabled,aresample=48000" -c:a aac -b:a 256k "out/$name.mp4"
rm -f "out/_mentah_$comp.mp4"
echo "SIAP out/$name.mp4"
