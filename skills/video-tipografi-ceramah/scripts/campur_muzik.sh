#!/usr/bin/env bash
# Campur muzik latar (perlahan, diratakan, 'ducking' bila naratif bercakap) ke video yang sudah dirender.
# Guna: scripts/campur_muzik.sh <muzik.mp3> [mula_saat=6]
set -e
cd "$(dirname "$0")/.."
M="$1"; S="${2:-6}"
T=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/_mentah.mp4)
ffmpeg -y -loglevel error -ss "$S" -t "$T" -i "$M" -af "dynaudnorm=f=750:g=41:m=4,loudnorm=I=-23:LRA=5:TP=-6,aresample=48000,afade=t=in:d=2.5,afade=t=out:st=$(python3 -c "print($T-3.5)"):d=3.5" -ac 2 out/bed.wav
ffmpeg -y -loglevel error -i out/_mentah.mp4 -i out/bed.wav -filter_complex "[0:a]asplit=2[v][k];[1:a][k]sidechaincompress=threshold=0.02:ratio=2.2:attack=150:release=1500:makeup=1[md];[v][md]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89:attack=3:release=80:level=disabled,aresample=48000[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart out/Racun_Yang_Halus_Murjiah.mp4
echo siap
