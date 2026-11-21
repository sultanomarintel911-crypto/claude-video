#!/usr/bin/env bash
# Naik taraf suara ceramah: buang hingar (RNNoise + FFT), kurangkan 'mud', tambah kejelasan, mampatan, normalkan.
# Guna: suara_jelas.sh <sumber> <out.wav> <mula> <akhir>
set -e
M="$(dirname "$0")/../assets/sh.rnnn"
[ -f "$M" ] || curl -sL -o "$M" https://raw.githubusercontent.com/GregorR/rnnoise-models/master/somnolent-hogwash-2018-09-01/sh.rnnn
ffmpeg -y -loglevel error -ss "$3" -to "$4" -i "$1" -af "highpass=f=80,lowpass=f=11000,arnndn=m=$M:mix=0.9,afftdn=nf=-30:tn=1,equalizer=f=250:t=q:w=1:g=-2.5,equalizer=f=3000:t=q:w=1.2:g=3.5,equalizer=f=6500:t=q:w=1:g=1.5,acompressor=threshold=-22dB:ratio=3:attack=5:release=150:makeup=2,loudnorm=I=-15:TP=-1.5:LRA=7,aresample=48000" -ac 2 "$2"
echo "siap $2"
