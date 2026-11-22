#!/bin/sh
# Bina semula teaser "Fail Sulit" dari kosong: sh build.sh  (perlukan pustaka Lemo-Opuscar dan pakej teras)
set -e
LIB=${LIB:-/root/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
[ -f "$LIB/core/render/video.mjs" ] || { echo "tetapkan LIB kepada folder pustaka Lemo-Opuscar"; exit 1; }
sh "$HERE/tools/fonts.sh"                                              # fon OFL → fonts/
node "$HERE/models/gen_piala.mjs" > "$HERE/models/piala.json"          # 1. model wireframe piala
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920                   # 2. peristiwa bunyi → events.json
"$LIB/.venv/bin/python" "$HERE/mix.py"                                 # 3. skor + foley + dengung → out/mix.wav
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"   # 4. gambar
sh "$HERE/tools/master.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/tokoh-murid-2026-teaser.mp4"  # 5. adun −14 LUFS
node core/render/still.mjs "$HERE" 36 --size 1080x1920 --out "$HERE/out" --prefix po_ && cp "$HERE/out/po_36.jpg" "$HERE/poster.jpg"
