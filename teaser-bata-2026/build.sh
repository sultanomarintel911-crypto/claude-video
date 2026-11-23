#!/bin/sh
# Bina semula teaser "Kepingan Terakhir" (gaya Mainan Bata, 2160×3840): sh build.sh
# Tanpa GPU, render 4K ~15 s sebingkai: dipecah kepada 6 bahagian (?t0=…&len=7.5) yang dijalankan 3 serentak, kemudian dicantum.
set -e
LIB=${LIB:-/root/lemo-opuscar}; export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
[ -f "$LIB/core/render/video.mjs" ] || { echo "tetapkan LIB kepada folder pustaka Lemo-Opuscar"; exit 1; }
cd "$LIB"
[ -f core/assets/polyhaven/photo_studio_loft_hall_2k.hdr ] || sh tools/fetch.sh hdri
node core/render/events.mjs "$HERE" --size 540x960
"$LIB/.venv/bin/python" "$HERE/mix.py"
for w in "0 1 2" "3 4 5"; do
  for i in $w; do node core/render/video.mjs "$HERE" --fps 24 --workers 1 --size 2160x3840 --q "t0=$(echo "$i*7.5" | bc)&len=7.5" --out "$HERE/out/c$i.mp4" & done
  wait
done
for i in 0 1 2 3 4 5; do echo "file 'c$i.mp4'"; done > "$HERE/out/senarai.txt"
ffmpeg -y -v error -f concat -safe 0 -i "$HERE/out/senarai.txt" -c copy "$HERE/out/video.mp4"
sh "$HERE/tools/master.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/tokoh-murid-2026-bata-4k.mp4"
