#!/bin/sh
# Adun: loudnorm dua laluan ke −14 LUFS (had puncak −1 dBTP), AAC 256k, H.264 untuk media sosial.
# (Ganti core/render/mux.sh kerana mesin ini ada ffmpeg 6, yang dilaporkan salah oleh mux.sh.)
set -e
V=$1; A=$2; OUT=$3
J=$(ffmpeg -hide_banner -i "$A" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | sed -n "s/.*\"$1\" : \"\([^\"]*\)\".*/\1/p"; }
ffmpeg -y -v error -i "$V" -i "$A" -map 0:v -map 1:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 24 \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
