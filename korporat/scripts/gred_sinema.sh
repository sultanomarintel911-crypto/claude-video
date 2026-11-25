#!/usr/bin/env bash
# Gred warna "Hollywood" (teal & orange) untuk klip pemanduan GB.
# Guna: scripts/gred_sinema.sh <input> <output.mp4>  (1080p30, gred dibakar)
set -euo pipefail
GRED="scale=1920:1080:flags=lanczos,fps=30,\
eq=contrast=1.07:saturation=1.12:gamma=1.04,\
colorbalance=rs=-0.07:gs=-0.01:bs=0.09:rm=0.02:bm=-0.02:rh=0.08:gh=0.02:bh=-0.08,\
curves=all='0/0.035 0.15/0.13 0.50/0.53 0.90/0.94 1/0.985',\
unsharp=5:5:0.55,vignette=PI/5.5,noise=alls=4:allf=t"
if [ "${3:-}" = "--gambar" ]; then
  ffmpeg -y -loglevel error -ss "$4" -i "$1" -frames:v 1 -vf "$GRED" "$2"
else
  ffmpeg -y -loglevel error -i "$1" -vf "$GRED" -an -c:v libx264 -preset slow -crf 14 -pix_fmt yuv420p -movflags +faststart "$2"
fi
