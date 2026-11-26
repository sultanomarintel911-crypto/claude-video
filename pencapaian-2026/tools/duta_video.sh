#!/bin/sh
# Stabilkan video DUTA (pegang tangan) dengan vid.stab dua laluan, kekalkan pan kamera, zum optimum (tiada tepi hitam),
# kemudian ekstrak bingkai JPEG + audio untuk bab filem.  Guna: sh tools/duta_video.sh bahan/duta_asal.mov
set -e
IN=${1:-bahan/duta_asal.mov}; cd "$(dirname "$0")/.."; mkdir -p bahan/duta_vid
ffmpeg -v error -y -i "$IN" -vf vidstabdetect=shakiness=8:accuracy=15:stepsize=6:result=bahan/tf.trf -f null -
ffmpeg -v error -y -i "$IN" -vf "vidstabtransform=input=bahan/tf.trf:smoothing=40:optzoom=1:zoomspeed=0.1:interpol=bicubic,unsharp=5:5:0.6:3:3:0.3" \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 192k bahan/duta_stabil.mp4
ffmpeg -v error -y -i bahan/duta_stabil.mp4 -q:v 2 bahan/duta_vid/%03d.jpg
ffmpeg -v error -y -i bahan/duta_stabil.mp4 -vn -ac 2 -ar 44100 bahan/duta_audio.wav
