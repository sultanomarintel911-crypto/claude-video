#!/usr/bin/env bash
# Render still separuh saiz untuk semakan. Guna: stills.sh <projek_dir> <frame>...
# (bundle dahulu: npx remotion bundle src/index.ts --out-dir=out/bundle)
cd "$1"; shift; mkdir -p out/stills
for f in "$@"; do npx remotion still out/bundle VideoTipografi out/stills/s_$f.jpg --frame=$f --scale=0.5 --log=error >/dev/null 2>&1 || echo "gagal $f"; done
