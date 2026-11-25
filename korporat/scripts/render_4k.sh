#!/usr/bin/env bash
# Render penuh 4K (3840x2160): komposisi 1080p dirender pada skala 2
# (teks, grafik dan adegan 3D tajam; klip sumber 1080p dinaikkan skala).
set -euo pipefail
cd "$(dirname "$0")/.."
npx remotion render src/index.ts KorporatSKeSO out/_mentah_4k.mp4 --scale=2 --crf=17 --concurrency=4 --log=error
ffmpeg -y -loglevel error -i out/_mentah_4k.mp4 -c:v copy \
  -af "alimiter=limit=0.85:attack=3:release=80:level=disabled,aresample=48000" -c:a aac -b:a 256k \
  -movflags +faststart out/korporat_skeso_2026_4k.mp4
ffprobe -v error -show_entries stream=width,height:format=duration,size -of compact out/korporat_skeso_2026_4k.mp4
echo SIAP
