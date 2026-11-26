#!/bin/sh
# Bina semula video pencapaian (1920×1080, 30 fps): sh build.sh
# Perlu: node (npm i), Playwright + Chromium, python3 (numpy, soundfile), ffmpeg.
# Bingkai sedia ada dalam out/frames_all dilangkau (boleh sambung semula / guna semula).
set -e
HERE=$(cd "$(dirname "$0")" && pwd); cd "$HERE"
[ -d node_modules/three ] || npm i
node tools/timeline.mjs
python3 mix.py
FR=$(node -e "import('./timeline.js').then(m=>console.log(Math.round(m.buildTimeline().DUR*30)))")
F0=${F0:-0}; J=${J:-4}; STEP=$(( (FR - F0 + J - 1) / J ))
for i in $(seq 0 $((J-1))); do
  A=$((F0 + i*STEP)); B=$((F0 + (i+1)*STEP)); [ $B -gt $FR ] && B=$FR
  node tools/render.mjs $A $B --dir out/frames_all > out/render$i.log 2>&1 &
done
wait
ffmpeg -y -v error -framerate 30 -i out/frames_all/f_%05d.jpg -i out/mix.wav -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart pencapaian-sk-sultan-omar.mp4
echo siap: pencapaian-sk-sultan-omar.mp4
