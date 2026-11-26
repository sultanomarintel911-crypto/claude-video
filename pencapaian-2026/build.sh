#!/bin/sh
# Bina semula video pencapaian (1920×1080, 30 fps): sh build.sh
# Perlu: node (three dari npm i), Playwright + Chromium, python3 (numpy, soundfile), ffmpeg.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); cd "$HERE"
[ -d node_modules/three ] || npm i
python3 mix.py
FR=$(node -e "import('./content.js').then(m=>console.log(Math.round(m.DUR*30)))")
J=${J:-4}; STEP=$(( (FR + J - 1) / J ))
for i in $(seq 0 $((J-1))); do node tools/render.mjs $((i*STEP)) $(( (i+1)*STEP < FR ? (i+1)*STEP : FR )) > out/render$i.log 2>&1 & done
wait
ffmpeg -y -v error -framerate 30 -i out/frames/f_%05d.jpg -i out/mix.wav -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart pencapaian-terafecta.mp4
echo siap: pencapaian-terafecta.mp4
